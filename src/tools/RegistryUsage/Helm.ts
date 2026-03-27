import { K8sDeploymentSample } from "./Kubectl";
import { ImageMeta, RegistryUsage, UsageExplain, UseHost, UseHttp, UsePath } from "./RegistryUsage";

export class Helm implements RegistryUsage {
    key = "helm";
    title = "Helm";

    private addRepo(meta: ImageMeta) {
        return meta.registry.user
            ? `helm registry login ${meta.registry.url.hostname} -u ${meta.registry.user} -p <password>`
            : `helm registry login ${meta.registry.url.hostname}`;
    }

    get CanPull() {
        return true;
    }
    pull(meta: ImageMeta): UsageExplain[] {
        const useHttp = UseHttp(meta);
        const path = UsePath(meta);
        const host = UseHost(meta);
        return [
            {
                titleKey18n: "helm-login",
                detailKey18n: this.addRepo(meta),
            },
            {
                titleKey18n: "helm",
                detailKey18n: `helm -n <namespace> install ${useHttp ? "--plain-http" : ""} \\
${meta.image.name} \\ 
oci://${host}/${path}${meta.image.name}:${meta.image.tag} \\
-f <values.yaml>`,
            },
            {
                titleKey18n: "helm-values",
                detailKey18n: K8sDeploymentSample(meta),
            },
        ];
    }
    get CanPush() {
        return true;
    }
    push(meta: ImageMeta): UsageExplain[] {
        const path = UsePath(meta, true);
        const host = UseHost(meta);
        return [
            {
                titleKey18n: "helm-login",
                detailKey18n: this.addRepo(meta),
            },
            {
                titleKey18n: "helm",
                detailKey18n: `helm package ${meta.image.name} --version ${meta.image.tag}
helm push ${meta.image.name}-${meta.image.tag}.tgz oci://${host}${path}`,
            },
        ];
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

