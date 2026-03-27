import { UserRegistryEntity } from "../app/api/user/entites/userRegistry.entity";
import { Database } from "../model/Database";
import { Log, MergingObject, TestNotAroute } from "../tools/Logger";
import { SeedUserEmail } from "./SeedUsers";
import { UserEntity } from "../app/api/user/entites/user.entity";
import { RegistryEntity } from "../app/api/registry/registry.entity";
import { RegistryUrl } from "./SeedRegistries";

const setUserHasRegistry = async (route: MergingObject, user: UserEntity | undefined, registry: RegistryEntity) => {
    if (user && user.id && registry.id) {
        Log.log(route, `✨ 👤-🗂️  ${user.email}-${registry.name}`);
        const userRegistry: UserRegistryEntity = {
            userId: user.id,
            registryId: registry.id,
        };
        const alreadyExist = await Database.UserRegistry.selectOne(route,
            `WHERE "userId"=$1 AND "registryId"=$2`,
            [userRegistry.userId, userRegistry.registryId]);
        if (alreadyExist) {
            Log.log(route, `✅ 👤 ${user.email} 🗂️  ${registry.name} exist`);
        }
        else {
            await Database.UserRegistry.insert(route, userRegistry);
            Log.log(route, `✅ 👤 ${user.email} 🗂️  ${registry.name} created`);
        }
    }
}


export const SeedUserRegistries = async (adminUserId: number): Promise<void> => {
    const route = TestNotAroute(adminUserId, "seed");
    Log.log(route, "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓");
    Log.log(route, "┃ Part 🅱️ : 👤🗂️  Seed User Registries  ┃");
    Log.log(route, "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛");
    Log.log(route, "🚸 WORK IN PROGRESS...");

    const user = await Database.User.selectOne(route, "WHERE email=$1", [SeedUserEmail]);
    if (!user || !user.id) {
        throw new Error(`Cannot find User: ${SeedUserEmail}`);
    }
    if (!user || !user.id) {
        throw new Error(`Cannot find User: ${SeedUserEmail}`);
    }

    const fredOnlyLinkTo1Registry = true;
    if (fredOnlyLinkTo1Registry) {
        let registry = await Database.Registry.selectOne(route, "WHERE url=$1", [RegistryUrl]);
        if (!registry || !registry.id) {
            registry = await Database.Registry.selectOne(route, `WHERE "gnUrl"=$1`, [RegistryUrl]);
        }
        if (!registry || !registry.id) {
            throw new Error(`Cannot find Registry: ${RegistryUrl}`);
        }
        await setUserHasRegistry(route, user, registry);
    }
    else {
        const registries = await Database.Registry.selectMany(route);
        try {
            for (const registry of registries) {
                await setUserHasRegistry(route, user, registry);
            }
        } catch (err: unknown) {
            console.error(err);
        }
    }
    Log.log(route, "");
};
