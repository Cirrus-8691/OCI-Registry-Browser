import { UserInfo } from "@/app/api/user/entites/user.entity";
import { SchemaTables } from "./SchemaTables";

type UserAbility = "list" | "select" | "insert" | "update" | "delete" | "forget";

export type Abilities = UserAbility[];
type ClassName = string;
type ClassAbilities = Map<ClassName, Abilities>;

export const AdminAbilities: ClassAbilities = new Map<ClassName, Abilities>([
    [SchemaTables.Registry, ["list", "select", "insert", "update", "delete"]],
    [SchemaTables.Repository, ["list", "select", "insert", "update", "delete"]],
    [SchemaTables.User, ["list", "select", "insert", "update", "forget"]],
    [SchemaTables.UserRegistry, ["list", "insert", "delete"]],
    [SchemaTables.Trace, ["list", "select"]],
]);

export const UserViewAbilities: ClassAbilities = new Map<ClassName, Abilities>([
    [SchemaTables.User, ["select", "update", "forget"]],
    [SchemaTables.UserRegistry, ["list"]],
    [SchemaTables.Registry, ["list", "select"]],
    [SchemaTables.Repository, ["list", "select"]],
]);
export const UserDeleteAbilities: ClassAbilities = new Map<ClassName, Abilities>([
    [SchemaTables.User, ["select", "update", "forget"]],
    [SchemaTables.UserRegistry, ["list"]],
    [SchemaTables.Registry, ["list", "select"]],
    [SchemaTables.Repository, ["list", "select", "delete"]],
    [SchemaTables.Trace, ["select"]],
]);
export const UserAdmRegistryAbilities: ClassAbilities = new Map<ClassName, Abilities>([
    [SchemaTables.User, ["select", "update", "forget"]],
    [SchemaTables.UserRegistry, ["list"]],
    [SchemaTables.Registry, ["list", "select", "update"]],
    [SchemaTables.Repository, ["list", "select", "delete"]],
    [SchemaTables.Trace, ["select"]],
]);

export const UserHaveAbility = (user: UserInfo, action: UserAbility, tableName: SchemaTables): boolean => {
    let abilities: Abilities | undefined = undefined;
    if (user.profile === "admin") {
        abilities = AdminAbilities.get(tableName);
    }
    if (user.profile === "user-view") {
        abilities = UserViewAbilities.get(tableName);
    }
    if (user.profile === "user-del-tag") {
        abilities = UserDeleteAbilities.get(tableName);
    }
    if (user.profile === "user-adm-reg") {
        abilities = UserAdmRegistryAbilities.get(tableName);
    }
    if (user.profile === "sys") {
        abilities = undefined;  // sys has no abilities, except SEED database
    }
    if (abilities) {
        return abilities.includes(action);
    }
    return false;
}

export default UserAbility;
