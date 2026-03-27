import assert from "assert";
import UserService from "../app/api/user/user.service";
import { Log, TestNotAroute } from "../tools/Logger";
import os from "os";
import { Database } from "../model/Database";
import { UserDto } from "../app/api/user/create/User.dto";
import { UserEntity } from "../app/api/user/entites/user.entity";
import { HttpError } from "@/tools/CatchError";

const serviceUser = new UserService();
export const SeedUserEmail = "fred@fred.fr";
export const SeedUserPassword = "fred"; // => Fred123*

export const SeedUsers = async (): Promise<number> => {
    const route0 = TestNotAroute(0, "seed");
    Log.log(route0, "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓");
    Log.log(route0, "┃ Part 🅰️ : 👤 Seed - Users            ┃");
    Log.log(route0, "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛");
    Log.log(route0, "🚸 WORK IN PROGRESS...");
    const userInfo = os.userInfo();
    const domain = os.hostname();

    const users: UserDto[] = [
        {
            email: `${userInfo.username}@${domain}`,
            password: "cannotLogin",
            profile: "sys"
        },
        {
            email: process.env.SEED_ADMIN_NAME ?? "",
            password: process.env.SEED_ADMIN_PASS ?? "",
            profile: "admin"
        },
        {
            email: SeedUserEmail,
            password: SeedUserPassword,
            desc: "Test user, password: " + SeedUserPassword,
            profile: "user-view"
        }
    ];
    let sysUser;
    let adminUser;
    let route = route0;
    for (const user of users) {
        Log.log(route, `✨ 👤 ${user.email}`);
        try {
            const userInfo = user.profile === "admin"
                ? await serviceUser.createAdmin(route, user)
                : await serviceUser.createUser(route, user);
            if (!userInfo) {
                assert.fail(`create user: ${user.email}`);
            }
            else {
                Log.log(route, `✅ 👤 ${user.email} created`);

                if (userInfo.profile === "sys" && userInfo.id) {
                    sysUser = userInfo;
                    route = TestNotAroute(sysUser.id as number, "seed")
                }
                if (userInfo.profile === "admin" && userInfo.id) {
                    adminUser = userInfo;
                }
            }
        } catch (err: unknown) {
            Log.error(route, err);
            if ((err as HttpError).status===409) {
                Log.log(route, `✅ 👤 ${user.email} exist`);
            }
        }
    }
    if (sysUser) {
        await Database.User.forget(route, sysUser as UserEntity);
    }
    if (!adminUser) {
        const admin = await Database.User.selectOne(route, "WHERE profile='admin'");
        if (admin) {
            adminUser = admin;
        }
        else {
            throw Error("cannot find user with profile: admin");
        }
    }
    Log.log(route, "");
    return adminUser.id as number;
};
