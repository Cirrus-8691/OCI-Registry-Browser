import { MergingObject } from "../../../tools/Logger";
import { RegistryEntity } from "../registry/registry.entity";
import { TagsEntity, TagsHeaderEntity } from "./tags/tag.entity";
import {
    ConfigDocker,
    ConfigEntity,
    ConfigHelm,
    ManifertAccepted,
    Manifest,
    ManifestEntity,
    ManifestV2,
} from "./manifest/manifest.entity";
import { getHeader } from "../registry/test/header.entity";
import Axios, { RawAxiosHeaders } from "../Axios";
import { TraceEntity } from "../trace/trace.entity";
import { Database } from "@/model/Database";
import { ErrorNotFound } from "@/tools/CatchError";
import { DockerCmd } from "@/tools/Cmd/DockerCmd";
import { CosignCmd } from "@/tools/Cmd/CosignCmd";
import { Repository, RepositoryEntity } from "./repository.entity";
import { RatingDto } from "./tags/rating/rating.dto";
import { ForbiddenResponse } from "@/tools/Response/ForbiddenResponse";
import { UpdateRepositoryDto } from "./updateRepository.dto";
import { AxiosResponse } from "axios";

export interface IdentifyImage {
    registry: RegistryEntity;
    repository: string | null;
    reference: string | null;
    type?: ManifertAccepted | null;
}
/**
 * Mandatory to use this docker.distribution.manifest.v2
 * Withou you'll get an error when deleting image:
 * {"errors":[{"code":"MANIFEST_UNKNOWN","message":"manifest unknown"}]}
 */
const AcceptManifest = (type: ManifertAccepted): RawAxiosHeaders | undefined => {
    let Accept: string | undefined = undefined;
    switch (type) {
        case "oci":
            Accept = "application/vnd.oci.image.manifest.v1+json";
            break;
        case "manifest":
            // Default manifest => v1 with Registry, v2 with Zot
            Accept = undefined;
            break;
        case "v1":
            // Zot never provide this v1 manifest
            Accept = "application/vnd.docker.distribution.manifest.v1+json";
            // Accept = "application/vnd.docker.distribution.manifest.v1+prettyjws";
            break;
        case "v2":
            Accept = "application/vnd.docker.distribution.manifest.v2+json";
            break;
    }
    return Accept
        ? {
              Accept,
          }
        : undefined;
};

export default class RepositoryService {
    /**
     * Fetch the tags under the repository identified by name.
     * curl -X GET http://localhost:32000/v2/emoji/tags/list
     * {"name":"emoji","tags":["0.1.0"]}
     */
    async tags(
        route: MergingObject,
        registry: RegistryEntity,
        repositoryName: string | null,
        token: string | null
    ): Promise<TagsHeaderEntity> {
        if (!repositoryName) {
            throw new ErrorNotFound();
        }
        if (token) {
            Axios.Token = token;
        }
        const fullUrl = `${registry.url}/v2/${repositoryName}/tags/list`;
        const result = await Axios.Get<TagsEntity>(route, fullUrl);
        const tags = [];
        const repository: Repository = {
            repository: repositoryName,
            rating: 0,
            description: "",
        };
        if (result.tags) {
            result.tags.push(""); // adding Repository itself, to get rating & description
            const repoInfos: RepositoryEntity[] = await Database.Repository.select(route, {
                select: {
                    columns: ["tag", "rating", "size", "description", "created", "os", "architecture", "licenses"],
                },
                request: `WHERE "registryId"=$1 AND name=$2 AND tag=ANY($3)`,
                values: [registry.id, repositoryName, result.tags],
            });
            for (const tag of result.tags) {
                const repo = repoInfos.find((r) => r.tag === tag);
                if (tag) {
                    const image = {
                        registry,
                        repository: repositoryName,
                        reference: tag,
                    };
                    // Header "OCI"
                    const header = await this.headManifest(route, image, "oci", token);
                    if (repo) {
                        tags.push({
                            tag,
                            header: header.header,
                            rating: repo.rating,
                            size: repo.size,
                            desc: repo.description,
                            created: repo.created,
                            os: repo.os,
                            architecture: repo.architecture,
                            licenses: repo.licenses,
                        });
                    } else {
                        tags.push({
                            tag,
                            header: header.header,
                            rating: 0,
                            size: 0,
                            desc: "",
                            created: "",
                            os: "",
                            architecture: "",
                            licenses: "",
                        });
                    }
                } else if (repo) {
                    repository.rating = repo.rating;
                    repository.description = repo.description;
                }
            }
        }
        return {
            repository,
            registry,
            name: result.name,
            tags,
        };
    }

    async checkBlobRepository(
        route: MergingObject,
        image: IdentifyImage,
        token: string | null,
        configBlob:
            | {
                  config: ConfigEntity;
                  digest: string;
                  manifest: ManifestV2;
              }
            | undefined
    ) {
        if (!image.repository || !image.reference || !image.registry.id) {
            throw new ErrorNotFound();
        }
        let repositoryEntity: RepositoryEntity | undefined = undefined;
        if (token) {
            Axios.Token = token;
        }
        if (configBlob) {
            // select (registryId, name, tag) from RepositoryRegistry
            const repository = await Database.Repository.selectOne(
                route,
                `WHERE "registryId"=$1 AND name=$2 AND tag=$3`,
                [image.registry.id, image.repository, image.reference]
            );
            // if exist for digest return it
            if (repository) {
                if (repository.digestV2 === configBlob.digest) {
                    repositoryEntity = repository;
                }
            }
            // else update/create for values getManifest "oci"
            if (!repositoryEntity) {
                repositoryEntity = this.fillDetails(image, repository, configBlob);
                if (repository) {
                    repositoryEntity.id = repository.id;
                    await Database.Repository.update(route, repositoryEntity);
                } else {
                    await Database.Repository.insert(route, repositoryEntity);
                }
            }
        }
        return repositoryEntity;
    }

    private fillDetails(
        image: IdentifyImage,
        repository: RepositoryEntity | undefined,
        configBlob: {
            config: ConfigEntity;
            digest: string;
            manifest: ManifestV2;
        }
    ): RepositoryEntity {
        if (!image.repository || !image.reference || !image.registry.id) {
            throw new ErrorNotFound();
        }
        /*
        manifestV2 = {
            schemaVersion: 2,
            config: {
                mediaType: "application/vnd.cncf.helm.config.v1+json",
                digest: "sha256:ff5e331cc585fdef3db99183ea093cf9f0f058aa8f132124ab59e8851f733e08",
                size: 153,
            },
            layers: [
                {
                    mediaType: "application/vnd.cncf.helm.chart.content.v1.tar+gzip",
                    digest: "sha256:a507122fbffcf222076fa9b965acd502860d31b58eb6c0e1dd28377f6420fd16",
                    size: 4913,
                },
            ],
            annotations: {
                "org.opencontainers.image.created": "2025-09-24T23:05:38+02:00",
                "org.opencontainers.image.description": "A Helm chart for Kubernetes",
                "org.opencontainers.image.title": "oci-registry-browser",
                "org.opencontainers.image.version": "0.1.1",
            },
        };
        */
        const configDocker = configBlob.config as ConfigDocker;
        const configHelm = configBlob.config as ConfigHelm;
        let description = "";
        let licenses = "";
        let created = "";
        let os = "";
        let architecture = "";
        if (configDocker.architecture && configDocker.os) {
            const labels = configDocker.config.Labels;
            created = configDocker.created;
            os = configDocker.os;
            architecture = configDocker.architecture;
            if (labels) {
                description = labels["org.opencontainers.image.description"];
                licenses = labels["org.opencontainers.image.licenses"];
            }
        }
        if (configHelm.name && configHelm.type) {
            const annotations = configBlob.manifest.annotations;
            if (annotations) {
                description = annotations["org.opencontainers.image.description"] ?? configHelm.description;
                created = annotations["org.opencontainers.image.created"] ?? "";
                licenses = annotations["org.opencontainers.image.licenses"] ?? "";
            }
        }
        // manifestV2 somme des sizes des layers
        let size = 0;
        if (configBlob.manifest.layers) {
            for (const layer of configBlob.manifest.layers) {
                size += layer.size ?? 0;
            }
        }
        const repositoryEntity: RepositoryEntity = {
            registryId: image.registry.id,
            name: image.repository,
            tag: image.reference,
            digestV2: configBlob.digest,
            rating: repository ? repository.rating : 0,
            description,
            licenses,
            size,
            os,
            architecture,
            created,
        };
        return repositoryEntity;
    }

    async getRepositoryTag(route: MergingObject, image: IdentifyImage): Promise<RepositoryEntity | undefined> {
        if (!image.repository || !image.reference || !image.registry.id) {
            throw new ErrorNotFound();
        }
        return await Database.Repository.selectOne(route, `WHERE "registryId"=$1 AND name=$2 AND tag=$3`, [
            image.registry.id,
            image.repository,
            image.reference,
        ]);
    }
    async setRepositoryTagRating(
        route: MergingObject,
        registry: RegistryEntity,
        repositoryRating: RatingDto
    ): Promise<void> {
        const repository = await Database.Repository.selectOne(route, `WHERE "registryId"=$1 AND name=$2 AND tag=$3`, [
            registry.id,
            repositoryRating.repository,
            repositoryRating.tag,
        ]);
        if (repository) {
            repository.rating = repositoryRating.rating;
            await Database.Repository.update(route, repository);
        } else {
            throw ForbiddenResponse();
        }
    }

    async saveRepository(route: MergingObject, registry: RegistryEntity, body: UpdateRepositoryDto) {
        const repository = await Database.Repository.selectOne(route, `WHERE "registryId"=$1 AND name=$2 AND tag=''`, [
            registry.id,
            body.repository,
        ]);
        if (repository) {
            repository.description = body.description;
            repository.rating = body.rating;
            return await Database.Repository.update(route, repository);
        } else {
            return await Database.Repository.insert(route, {
                registryId: body.registry,
                name: body.repository,
                description: body.description,
                rating: body.rating,
                tag: "",
                digestV2: "",
                licenses: "",
                created: "",
                os: "",
                architecture: "",
                size: 0,
            });
        }
    }

    /**
     * Fetch the manifest identified by name and reference where reference can be a tag or digest.
     * A HEAD request can also be issued to this endpoint to obtain resource information without receiving all data.
     * GET /v2/<name>/manifests/<reference>
     */
    private async headManifest(
        route: MergingObject,
        image: IdentifyImage,
        type: ManifertAccepted,
        token: string | null
    ): Promise<ManifestEntity> {
        if (!image.repository || !image.reference) {
            throw new ErrorNotFound();
        }
        if (token) {
            Axios.Token = token;
        }
        const fullUrl = `${image.registry.url}/v2/${image.repository}/manifests/${image.reference}`;
        const response = await Axios.Head<Manifest>(route, fullUrl, AcceptManifest(type));
        return {
            manifest: {},
            header: getHeader(response),
            type,
        };
    }
    /**
     * Fetch the manifest identified by name and reference where reference can be a tag or digest.
     * A HEAD request can also be issued to this endpoint to obtain resource information without receiving all data.
     * GET /v2/<name>/manifests/<reference>
     */
    async getManifest(route: MergingObject, image: IdentifyImage, token: string | null): Promise<ManifestEntity> {
        if (!image.repository || !image.reference || !image.type) {
            throw new ErrorNotFound();
        }
        if (token) {
            Axios.Token = token;
        }
        const response = await this.getManifestType(route, image, image.type);
        if (response) {
            return {
                manifest: response.data,
                header: getHeader(response),
                type: image.type,
            };
        }
        throw new ErrorNotFound();
    }
    /**
     * 1 Get manifest V2= > config.digest
     */
    async getConfigBlog(
        route: MergingObject,
        image: IdentifyImage,
        token: string | null
    ): Promise<
        | {
              config: ConfigEntity;
              digest: string;
              manifest: ManifestV2;
          }
        | undefined
    > {
        if (!image.repository || !image.reference) {
            throw new ErrorNotFound();
        }
        if (token) {
            Axios.Token = token;
        }
        let manifestV2 = await this.getManifestV2(route, image, "v2");
        if (!manifestV2) {
            manifestV2 = await this.getManifestV2(route, image, "oci");
        }
        if (manifestV2 && manifestV2.config) {
            const configDigest = manifestV2.config.digest;
            if (configDigest) {
                const urlBloc = `${image.registry.url}/v2/${image.repository}/blobs/${configDigest}`;
                const responseBloc = await Axios.get<ConfigEntity>(route, urlBloc);
                return {
                    config: responseBloc.data,
                    digest: configDigest,
                    manifest: manifestV2,
                };
            }
        }
        return undefined;
    }

    private async getManifestV2(
        route: MergingObject,
        image: IdentifyImage,
        type: ManifertAccepted
    ): Promise<ManifestV2 | undefined> {
        const responseManifest = await this.getManifestType(route, image, type);
        return responseManifest?.data as ManifestV2;
    }

    private async getManifestType(
        route: MergingObject,
        image: IdentifyImage,
        type: ManifertAccepted
    ): Promise<AxiosResponse<Manifest> | undefined> {
        try {
            const urlManifest = `${image.registry.url}/v2/${image.repository}/manifests/${image.reference}`;
            const responseManifest = await Axios.get<Manifest>(route, urlManifest, AcceptManifest(type));
            if (responseManifest && responseManifest.data) {
                return responseManifest;
            }
        } catch {
            return undefined;
        }
    }

    /**
     * Delete the manifest identified by name and reference.
     * Note that a manifest can only be deleted by digest.
     */
    async deleteManifest(route: MergingObject, image: IdentifyImage, token: string | null) {
        if (!image.repository || !image.reference) {
            throw new ErrorNotFound();
        }
        const header = await this.headManifest(route, image, "v2", token);
        const digest = header.header?.docker.contentDigest;
        if (digest) {
            if (token) {
                Axios.Token = token;
            }
            const requestDeleteManifiest = `${image.registry.url}/v2/${image.repository}/manifests/${digest}`;
            await Axios.Delete<Manifest>(route, requestDeleteManifiest);
            const trace: TraceEntity = {
                userId: route.userId ? parseInt(route.userId) : undefined,
                function: `delete image ${image.repository}.${image.reference}`,
                action: "delete",
                type: "html",
                table: `Registry: ${image.registry.name}`,
                itemId: digest,
                change: requestDeleteManifiest,
            };
            await Database.Trace.insert(route, trace);
        } else {
            throw new Error("Cannot find digest");
        }
    }

    async signature(route: MergingObject, image: IdentifyImage) {
        const domain = image.registry.url.substring(image.registry.url.indexOf("://") + 3);
        const imageUrl = `${domain}/${image.repository}:${image.reference}`;
        const dockerCmd = new DockerCmd(route);
        const docker = await dockerCmd.Trust(imageUrl);
        const cosignCmd = new CosignCmd(route);
        const cosign = await cosignCmd.Verify(imageUrl);
        return {
            docker,
            cosign,
        };
    }
}
