import { ValidRegistry } from "@/app/page";

export type RegistryAuth = "None" | "Basic" | "ApiKey";

export interface RegistryUser {
    name: string;
    password: string;
}

export interface RegistryApi {
    url: string;
    gnUrl?: string;
    timeout?: number;
}

export interface RegistryCredential {
    user: RegistryUser;
    auth: RegistryAuth;
    token: string;
    api: RegistryApi;
    action: (credential: RegistryCredential) => Promise<void>;
    toValidate?: ValidRegistry;
}

export interface InputCredential {
    user: RegistryUser;
    auth?: RegistryAuth;
    api?: RegistryApi;
    action?: (credential: RegistryCredential) => Promise<void>;
    toValidate?: ValidRegistry;
}

export default interface Auth {
    authorization(token: string): string;
    token(credential: RegistryUser): string;
}
