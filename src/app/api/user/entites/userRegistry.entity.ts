import { DbRow } from "@/tools/Database/PostgreSql";

export interface UserRegistryEntity extends DbRow {
    userId: number;
    registryId: number;
}