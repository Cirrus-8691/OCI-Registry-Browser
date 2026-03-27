import { ImageMeta, RegistryUsage, UsageExplain, UseHost, UsePath } from "./RegistryUsage";

export class Docker implements RegistryUsage {

    key = "docker";
    title = "Docker";

    get CanPull() {
        return true;
    }
    pull(meta: ImageMeta): UsageExplain[] {
        const path = UsePath(meta);
        const host = UseHost(meta);
        return [
            {
                titleKey18n: "docker-login",
                detailKey18n: `docker login ${host} ${meta.registry.user ? `-u ${meta.registry.user} -p <password>` : ""}`,
            },
            {
                titleKey18n: "docker",
                detailKey18n: `docker image pull ${host}/${path}${meta.image.name}:${meta.image.tag}`,
            },
        ];
    }
    get CanPush() {
        return true;
    }
    push(meta: ImageMeta): UsageExplain[] {
        const path = UsePath(meta);
        const host = UseHost(meta);
        return [
            {
                titleKey18n: "docker-login",
                detailKey18n: `docker login ${host} ${meta.registry.user ? `-u ${meta.registry.user} -p <password>` : ""}`,
            },
            {
                titleKey18n: "docker",
                detailKey18n: `docker tag ${meta.image.name}:${meta.image.tag} ${host}/${path}${meta.image.name}:${meta.image.tag}
docker push ${host}/${path}${meta.image.name}:${meta.image.tag}`,
            },
        ];
    }

    get CanRun() {
        return true;
    }

    run(meta: ImageMeta): UsageExplain[] {
        const path = UsePath(meta);
        const host = UseHost(meta);
        return [
            {
                titleKey18n: "docker-login",
                detailKey18n: `docker login ${host} ${meta.registry.user ? `-u ${meta.registry.user} -p <password>` : ""}`,
            },
            {
                titleKey18n: "docker-pull",
                detailKey18n: `docker image pull ${host}/${path}${meta.image.name}:${meta.image.tag}`,
            },
            {
                titleKey18n: "docker-run",
                detailKey18n: `docker run -it ${meta.image.name}:${meta.image.tag} sh`,
            },
        ];
    }

    get CanSignature(): boolean {
        return true;
    }
    signature(meta: ImageMeta): UsageExplain[] {
        const path = UsePath(meta);
        const host = UseHost(meta);
        return [
            {
                titleKey18n: "docker-login",
                detailKey18n: `docker login ${host} ${meta.registry.user ? `-u ${meta.registry.user} -p <password>` : ""}`,
            },
            {
                titleKey18n: "docker-pull",
                detailKey18n: `export DOCKER_CONTENT_TRUST=1 
docker image pull ${host}/${path}${meta.image.name}:${meta.image.tag}`,
            },
            {
                titleKey18n: "docker-trust",
                detailKey18n: `docker trust inspect ${meta.image.name}:${meta.image.tag}`,
            },
        ];
    }
}
