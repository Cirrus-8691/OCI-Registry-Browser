import { ImageMeta, RegistryUsage, UsageExplain, UseHost, UsePath } from "./RegistryUsage";

export class Curl implements RegistryUsage {
    key = "curl";
    title = "Curl";

    get CanPull() {
        return true;
    }
    pull(meta: ImageMeta): UsageExplain[] {
        const path = UsePath(meta);
        const host = UseHost(meta);
        return [
            {
                titleKey18n: "curl-catalog",
                detailKey18n: `curl ${meta.registry.user ? `-u ${meta.registry.user}:<password>` : ""} \\
-X GET http://${host}/v2/_catalog`,
            },
            {
                titleKey18n: "curl-tags",
                detailKey18n: `curl ${meta.registry.user ? `-u ${meta.registry.user}:<password>` : ""} \\
-X GET http://${host}/v2/${path}${meta.image.name}/tags/list`,
            },
        ];
    }

    get CanPush() {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    push(meta: ImageMeta): UsageExplain[] {
        return [];
    }

    get CanRun() {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run(meta: ImageMeta): UsageExplain[] {
        return [];
    }

    get CanSignature(): boolean {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    signature(meta: ImageMeta): UsageExplain[] {
        return [];
    }
}
