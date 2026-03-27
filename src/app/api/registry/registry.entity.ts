import { DbRow } from "@/tools/Database/PostgreSql";

export const RegistryNameLenght = 32

export type RegistryType = "docker" | "helm" | "oci" | "curl";

export interface RegistryEntity extends DbRow {
    id?: number;
    name: string;        // regex => helm repo name
    url: string;
    gnUrl?:string;        // Global network URL
    path?:string;         // regex => uri
    excludePaths?:string; // regex => uri list
    timeout?: number;
    user?: string;
    // No password saved here, if a user is set UI request password...
    type: RegistryType;
    iconUrl?: string;    // regex => url uri
}

export const UndefinedRegistry = {
    url : "",
    name: "",
    type: "oci" as RegistryType,
}
