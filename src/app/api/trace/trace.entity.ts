import { DbRow } from "@/tools/Database/PostgreSql";
import { RegistryNameLenght } from "../registry/registry.entity";

export type Action = "insert" | "update" | "delete" | "forget";
export type Type = "html" | "sql";

export const TraceFunctionLenght = 64;
export const TraceTableLenght = 10 + RegistryNameLenght; // `Registry: ${image.registry.name}`
export const TraceItemIdLenght  = 72; // sha256:f40780af26fbd710b86da1058a92985402e14d0eb4e4b9c1d24d1085eb971090
export const TraceChangeLenght = 1024;

export interface TraceEntity extends DbRow {
    id?: number;
    date?: Date;
    userId?: number;
    function: string;
    action: Action;
    type: Type;
    table: string;
    itemId: string;
    change: string;
}
