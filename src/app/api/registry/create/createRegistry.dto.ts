import { RegistryType } from "../registry.entity";

export interface CreateRegistryDto {
    name: string;
    type: RegistryType;
    url: string;
    gnUrl?:string;        // Global network URL
    path?: string;
    excludePaths?: string;
    user?: string;
    timeout?: number;
    iconUrl?: string;
}