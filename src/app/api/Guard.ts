import { DbTableClass } from "./Roles";
import { UserInfo } from "./user/entites/user.entity";
import UserRegistry from "@/model/UserRegistry.table";
import { Database } from "@/model/Database";
import { MergingObject } from "@/tools/Logger";
import { BadRequestResponse } from "@/tools/Response/BadRequestResponse";
import User from "@/model/User.table";
import { DbRow } from "@/tools/Database/PostgreSql";

/**
 * Permet de valider qu'un item à le droit d'accès à un autre item
 */
export default class Guard {

    static async userHas<T>(route: MergingObject, user: UserInfo, itemId: string | number, classType: DbTableClass): Promise<T | undefined> {
        let item: DbRow | undefined = undefined;
        if (classType === UserRegistry) {
            const id = typeof (itemId) === "number" ? itemId : Number.parseInt(itemId);
            if (isNaN(id)) {
                throw BadRequestResponse();
            }
            // user has Registry itemId
            item = await Database.Registry.selectOne(route,
                `JOIN "${Database.UserRegistry.Name}" ON "registryId"="${Database.Registry.Name}".id WHERE "userId"=$1 AND "registryId"=$2`,
                [user.id, id]);
        }
        if (classType === User) {
            // user (with is admin) has any Registry who has itemId
            let where = "";
            if (typeof (itemId) === "number") {
                where = `WHERE "${Database.User.Name}".id=$2`;
            }
            else if (typeof (itemId) === "string") {
                where = `WHERE "${Database.User.Name}".email=$2`
            }
            const userRegistries = await Database.UserRegistry.selectMany(route, `WHERE "userId"=$1`, [user.id]);
            const ids = userRegistries.map((ur) => ur.registryId);
            item = await Database.User.selectOne(route,
                `JOIN "${Database.UserRegistry.Name}" ON "userId"="${Database.User.Name}".id and "registryId"=ANY($1::int[])
                ${where}`,
                [ids, itemId]);
        }
        /*******************
         * Add other classType
         *******************/
        // ...
        return item as T | undefined;
    }

}