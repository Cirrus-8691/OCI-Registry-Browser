import { RegistryType } from "@/app/api/registry/registry.entity";
import ApplicationSettings from "../ApplicationSettings";

export interface ImageMeta {
    registry: {
        name: string;
        url: URL;
        gnUrl?: URL;
        user?: string;
        type: RegistryType;
    };
    image: {
        path: string;
        name: string;
        tag: string;
    };
}

export const EmptyImageMeta = {
    path: "",
    name: "",
    tag: "",
};

export const UseHttp = (meta: ImageMeta): boolean => {
    return meta.registry.url.protocol === "http:"
}

export const UseHost = (meta: ImageMeta): string => {
    return ApplicationSettings.RunningOnK8s && meta.registry.gnUrl
        ? meta.registry.gnUrl.host
        : meta.registry.url.host;
}

export const UsePath = (meta: ImageMeta, addBeginSlash = false): string => {
    let path = "";
    if (meta.image.path) {
        if (addBeginSlash) {
            // Expecting "/path"
            path = meta.image.path.startsWith("/") ? meta.image.path : "/" + meta.image.path;
            path = path.endsWith("/") ? path.substring(0, path.length - 1) : path;
        }
        else {
            // Expecting "path/"
            path = meta.image.path.startsWith("/") ? meta.image.path.substring(1, path.length - 1) : meta.image.path;
            path = path.endsWith("/") ? path : path + "/";
        }
    }
    return path;
}

export interface UsageExplain {
    titleKey18n: string,
    detailKey18n: string,
}

export type RegistryUsageCan = "CanPull" | "CanPush" | "CanRun" | "CanSignature";

export interface RegistryUsage {

    title: string;
    key: string;

    get CanPull(): boolean;
    pull(meta: ImageMeta): UsageExplain[];

    get CanPush(): boolean;
    push(meta: ImageMeta): UsageExplain[];

    get CanRun(): boolean;
    run(meta: ImageMeta): UsageExplain[];

    get CanSignature(): boolean;
    signature(meta: ImageMeta): UsageExplain[];
}