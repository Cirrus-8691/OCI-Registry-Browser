/**
 * Route pour se connecter et accèder aux trads "payantes"...
 */
import { SigninDto } from "./signin/signin.dto";
import { Active, Tokens, UserConnected, UserEntity, UserInfo } from "./entites/user.entity";
import * as jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { Log, MergingObject } from "../../../tools/Logger";
import { Database } from "../../../model/Database";
import Redis from "../../../tools/Database/Redis";
import { Tedis } from "tedis";
import { UserDto } from "./create/User.dto";
import { RegistryEntity } from "../registry/registry.entity";
import { PoolClient } from "pg";
import PostreSql from "../../../tools/Database/PostgreSql";
import { UserRegistryEntity } from "./entites/userRegistry.entity";
import { SignupDto } from "./signup/signup.dto";
import RegistryService from "../registry/registry.service";
import { ErrorBadRequest, ErrorConflict, ErrorForbidden, ErrorUnauthorized } from "../../../tools/CatchError";
import { ActivateDto } from "./activation/activate.dto";
import { ActivationDto } from "./activation/activation.dto";

const JWT_SECRET_KEY = () => {
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
        throw new Error("undefined JWT_SECRET_KEY");
    }
    return secret;
};
const JWT_AUTH_TIMEOUT = "10Minutes";
const JWT_RENEW_TIMEOUT = "30Minutes";
const REDIS_TIMEOUT_SEC = 30 * 60; // JWT_RENEW_TIMEOUT
const HASH_SALT_ROUNDS = 10;

const JWT_ACTIVATION_TIMEOUT = "3Minutes";

export default class UserService {

    private async hash(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(HASH_SALT_ROUNDS);
        const hashPwd = await bcrypt.hash(password, salt);
        return hashPwd;
    }
    private async auth(signin: SigninDto, user: UserEntity): Promise<boolean> {
        return await bcrypt.compare(signin.password, user.hashPwd);
    }

    async signin(
        route: MergingObject,
        signin: SigninDto
    ): Promise<UserInfo | undefined> {
        Log.log({ ...route, email: signin.email as string }, `signIn`);
        let userInfo: UserInfo | undefined = undefined;
        if (signin && signin.email && signin.password) {
            const entity = await Database.User.selectOne(route, "WHERE email=$1", [signin.email]);
            if (entity) {
                const authorized = await this.auth(signin, entity);
                if (authorized) {
                    Log.log({ ...route, email: signin.email as string }, `signIn: Ok ✅`);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    userInfo = (({ hashPwd, ...infoData }) => infoData)(entity);
                }
            }
        }
        return userInfo;
    }

    async createTokens(route: MergingObject, user: UserInfo): Promise<Tokens> {
        const auth = jwt.sign({ data: user }, JWT_SECRET_KEY(), {
            expiresIn: JWT_AUTH_TIMEOUT
        });
        const uuid = randomUUID();
        await Redis.instance(route).using(async (tedis: Tedis) => {
            const key = `session:${uuid}`;
            await tedis.set(key, JSON.stringify(user));
            await tedis.expire(key, REDIS_TIMEOUT_SEC);
        });
        const renew = jwt.sign({ data: uuid }, JWT_SECRET_KEY(), {
            expiresIn: JWT_RENEW_TIMEOUT
        });
        return {
            auth,
            renew
        };
    }

    private static extractData<T>(token: string, ignoreExpiration = false): T | undefined {
        let data: T | undefined = undefined;
        try {
            const payload = jwt.verify(
                token,
                JWT_SECRET_KEY(),
                { ignoreExpiration }
            ) as { data: T };
            data = payload.data;
        } catch {
            data = undefined;
        }
        return data;
    }

    static extractUserFromToken(authToken: string, ignoreExpiration = false): UserInfo | undefined {
        return this.extractData<UserInfo>(authToken, ignoreExpiration);
    }

    async newToken(route: MergingObject, user: UserInfo): Promise<UserConnected> {
        const userConnected: UserConnected = {
            tokens: await this.createTokens(route, user),
            user
        };
        return userConnected;
    }

    async renewToken(route: MergingObject, renewToken: string): Promise<UserConnected> {
        const uuid = UserService.extractData<string>(renewToken);
        if (!uuid) {
            throw new ErrorUnauthorized();
        }
        const user: UserInfo | undefined = await this.loadUser(route, uuid);
        if (!user) {
            throw new ErrorUnauthorized();
        }
        return await this.newToken(route, user);
    }

    private async loadUser(route: MergingObject, uuid: string): Promise<UserInfo | undefined> {
        const user = await Redis.instance(route).using<UserInfo>(async (tedis: Tedis) => {
            const result = await tedis.get(
                `session:${uuid}`
            );
            if (typeof result === "string") {
                return JSON.parse(result);
            }
            return undefined;
        });
        return user;
    }

    async signout(route: MergingObject, renewToken: string, userSignout: UserInfo): Promise<void> {
        const uuid = UserService.extractData<string>(renewToken);
        if (!uuid) {
            throw new ErrorUnauthorized();
        }
        const user: UserInfo | undefined = await this.loadUser(route, uuid);
        if (!user) {
            throw new ErrorUnauthorized();
        }
        if (userSignout.email !== user.email) {
            throw new ErrorUnauthorized();
        }
        await Redis.instance(route).using(async (tedis: Tedis) => {
            await tedis.del(`session:${uuid}`);
        });
    }

    async list(route: MergingObject, user: UserInfo): Promise<UserInfo[]> {
        const userRegistries = await Database.UserRegistry.selectMany(route, `WHERE "userId"=$1`, [user.id]);
        const ids = userRegistries.map((ur) => ur.registryId);
        const entities: UserEntity[] = await Database.User.selectDistinct(route,
            `JOIN "${Database.UserRegistry.Name}" ON "userId"="${Database.User.Name}".id and "registryId"=ANY($1::int[])`,
            [ids]);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return entities.map((entity) => (({ hashPwd, ...infoData }) => infoData)(entity));
    }

    private async _createUser(route: MergingObject, userToCreate: UserDto, active: Active, transactionPoolClient?: PoolClient): Promise<UserInfo | undefined> {
        const hashPwd = await this.hash(userToCreate.password as string);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, mustChangePassword, ...user } = userToCreate;
        const userEntity: UserEntity = {
            ...user,
            hashPwd,
            active
        };
        return await Database.User.insert(route, userEntity, transactionPoolClient);
    }

    async createUser(route: MergingObject, userToCreate: UserDto, active: Active = "changePassword", transactionPoolClient?: PoolClient): Promise<UserInfo | undefined> {
        if (userToCreate.email && userToCreate.password) {
            const entity = await Database.User.selectOne(route, "WHERE email=$1", [userToCreate.email]);
            if (entity) {
                throw new ErrorConflict();
            } else {
                return await this._createUser(route, userToCreate, active, transactionPoolClient);
            }
        }
        return undefined;
    }

    async createAdmin(route: MergingObject, user: UserDto, transactionPoolClient?: PoolClient): Promise<UserInfo | undefined> {
        return await this.createUser(route, { ...user, profile: "admin" }, "awaitActivation", transactionPoolClient)
    }

    async update(route: MergingObject, userToUpdate: UserEntity, newValues: UserDto): Promise<UserInfo | undefined> {
        const user = {
            ...userToUpdate,
            profile: newValues.profile,
            desc: newValues.desc,
        };
        if (newValues.password) {
            const hashPwd = await this.hash(newValues.password);
            if (route.userId === userToUpdate.id?.toString() && userToUpdate.active === "changePassword") {
                // Expecting new password
                const samePassword = await this.auth({ email: userToUpdate.email, password: newValues.password }, userToUpdate);
                if (samePassword) {
                    throw new ErrorBadRequest();
                }
                user.active = "activated";
            }
            user.hashPwd = hashPwd;
        }
        if (userToUpdate.active === "awaitActivation" && newValues.profile !== "admin") {
            user.active = "changePassword";
        }
        if(newValues.mustChangePassword) {
            user.active = "changePassword";
        }
        return await Database.User.update(route, user);
    }

    async forget(route: MergingObject, userToDelete: UserEntity, user: UserInfo): Promise<void> {
        if (user.id !== userToDelete.id && (user.profile as string).startsWith("user-")) {
            // profile user can only forget itself
            throw new ErrorForbidden()
        }
        await Database.User.forget(route, userToDelete);
    }

    private async _addRegistry(route: MergingObject, user: UserInfo, registry: RegistryEntity, transactionPoolClient?: PoolClient): Promise<UserRegistryEntity | undefined> {
        if (user.id && registry.id) {
            return await Database.UserRegistry.insert(route, {
                userId: user.id as number,
                registryId: registry.id,
            }, transactionPoolClient);
        }
        return undefined;
    }
    async createUserToRegistry(route: MergingObject, user: UserDto, registry: RegistryEntity): Promise<UserInfo | undefined> {
        const userExist = await Database.User.selectOne(route, `WHERE "email"=$1`, [user.email]);
        if (userExist) {
            throw new ErrorConflict();
        }
        return await PostreSql.instance(route).transaction<UserInfo>(async (client: PoolClient) => {
            const adminToCreate: UserDto = {
                ...user,
                password: user.password as string
            };
            const adminCreated = await this.createAdmin(route, adminToCreate, client);
            if (!adminCreated) {
                return undefined;
            }
            await this._addRegistry(route, adminCreated, registry, client);
            return adminCreated;
        }) as UserInfo | undefined;
    }

    async addRegistry(route: MergingObject, user: UserInfo, registry: RegistryEntity): Promise<UserRegistryEntity | undefined> {
        const entity = await Database.UserRegistry.selectOne(route, `WHERE "userId"=$1 and "registryId"=$2`, [user.id, registry.id]);
        if (entity) {
            throw new ErrorConflict();
        } else {
            return await this._addRegistry(route, user, registry);
        }
    }

    async removeRegistry(route: MergingObject, user: UserInfo, registry: RegistryEntity): Promise<void> {
        // Do not delete all UserRegistry
        const data = await Database.UserRegistry.selectMany(route, `WHERE "userId"=$1`, [user.id]);
        if (data && data.length > 1) {
            await Database.UserRegistry.deletedWhere(route, `WHERE "userId"=$1 and "registryId"=$2`, [user.id, registry.id]);
        }
        else {
            throw new ErrorBadRequest();
        }
    }

    async signup(route: MergingObject, body: SignupDto, registryService: RegistryService): Promise<UserInfo> {
        const user = await PostreSql.instance(route).transaction<UserInfo>(async (client: PoolClient) => {
            const user: UserInfo | undefined = await this.createAdmin(route, {
                ...body.user,
                profile: "admin"
            }, client);
            if (!user || !user.id) {
                throw new ErrorBadRequest();
            }
            route.function = `signup Registry`;
            route.userId = user.id.toString();
            const registry = await registryService.create(route, body.registry, client);
            if (!registry) {
                throw new ErrorBadRequest();
            }
            return user;
        });
        return user as UserInfo;
    }

    /**
    * Get Admin public key (jwt) used to identify user
    */
    async getActivation(route: MergingObject, email: string) {
        const user = await Database.User.selectOne(route, "WHERE email=$1", [email]);
        if (!user) {
            throw new ErrorForbidden();
        }
        const data = { id: user.id, code: randomUUID().substring(0, 7) };
        return jwt.sign({ data }, JWT_SECRET_KEY(), {
            expiresIn: JWT_ACTIVATION_TIMEOUT
        });
    }
    /**
    * Set Admin public key (jwt) to get an activation code
    */
    async setActivation(route: MergingObject, activate: ActivateDto) {
        const data = UserService.extractData<{ id: number, code: string }>(activate.pubkey);
        if (!data) {
            throw new ErrorForbidden();
        }
        return data.code;
    }
    /**
    * Patch Admin user to activate her account
    */
    async activate(route: MergingObject, activation: ActivationDto) {
        const data = UserService.extractData<{ id: number, code: string }>(activation.pubkey);
        if (!data) {
            throw new ErrorForbidden();
        }
        const user = await Database.User.selectOne(route, "WHERE email=$1", [activation.email]);
        if (!user) {
            throw new ErrorForbidden();
        }
        if (data.id !== user.id) {
            // code not for this email
            throw new ErrorForbidden();
        }
        if (data.code !== activation.code) {
            // bad code
            throw new ErrorForbidden();
        }

        user.active = "activated";
        return await Database.User.update(route, user);
    }
}
