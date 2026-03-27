import { ImageMeta, RegistryUsage, UsageExplain, UseHost, UsePath } from "./RegistryUsage";

export class Cosign implements RegistryUsage {

    key = "cosign";
    title = "Cosign";

    get CanPull() {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pull(meta: ImageMeta): UsageExplain[] {
        return [];
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
        return true;
    }
    signature(meta: ImageMeta): UsageExplain[] {
        const path = UsePath(meta);
        const host = UseHost(meta);
        return [
            {
                titleKey18n: "cosign-login",
                detailKey18n: `cosign login ${host} ${meta.registry.user ? `-u ${meta.registry.user} -p <password>` : ""}`,
            },
            {
                titleKey18n: "cosign-verify",
                detailKey18n: `cosign verify ${host}/${path}${meta.image.name}:${meta.image.tag}\n `,
            },
        ];
    }
}
