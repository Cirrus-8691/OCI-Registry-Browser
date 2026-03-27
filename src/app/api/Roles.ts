import { DbTable } from "@/tools/Database/PostgreSql/DbTable";

import { UserInfo } from "./user/entites/user.entity";
import UserAbility, { UserHaveAbility } from "@/model/UserAbility";
import { DbRow } from "@/tools/Database/PostgreSql";
import { SchemaTables } from "@/model/SchemaTables";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DbTableClass<ReturnType extends DbTable<DbRow> = DbTable<DbRow>> = new (...args: any[]) => ReturnType;

export default class Roles {

    static userCan(user: UserInfo, action: UserAbility, tableName: SchemaTables): boolean {
        return UserHaveAbility(user, action, tableName);
    }

}