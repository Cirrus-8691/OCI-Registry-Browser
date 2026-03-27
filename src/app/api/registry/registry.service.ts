import { CreateRegistryDto } from "./create/createRegistry.dto";
import { RegistryEntity } from "./registry.entity";
import { Database } from "../../../model/Database";
import { UserInfo } from "../user/entites/user.entity";
import { CatalogEntity, ExtendedCatalogEntity, Repository } from "../repository/repository.entity";
import { Log, MergingObject } from "../../../tools/Logger";
import { UpdateRegistryDto } from "./updateRegistry.dto";
import HeaderEntity, { getHeader } from "./test/header.entity";
import Axios from "../Axios";
import PostreSql from "../../../tools/Database/PostgreSql";
import { PoolClient } from "pg";
import { AxiosResponse } from "axios";
import { ErrorConflict, ErrorNotFound } from "../../../tools/CatchError";

export default class RegistryService {
    private async _create(route: MergingObject, registry: CreateRegistryDto, client: PoolClient) {
        const registryEntity = await Database.Registry.insert(
            route,
            {
                name: registry.name.trim(),
                type: registry.type,
                url: registry.url.trim(),
                gnUrl: registry.gnUrl?.trim(),
                path: registry.path?.trim(),
                excludePaths: registry.excludePaths?.trim(),
                user: registry.user?.trim(),
                timeout: registry.timeout,
                iconUrl: registry.iconUrl?.trim(),
            },
            client
        );
        if (registryEntity && registryEntity.id) {
            await Database.UserRegistry.insert(
                route,
                {
                    userId: parseInt(route.userId ?? "0"),
                    registryId: registryEntity.id,
                },
                client
            );
        }
        return registryEntity;
    }

    async create(
        route: MergingObject,
        registry: CreateRegistryDto,
        transactionPoolClient?: PoolClient
    ): Promise<RegistryEntity | undefined> {
        let registryEntity: RegistryEntity | undefined = undefined;
        if (registry && registry.url) {
            const name = registry.name?.trim();
            registryEntity = await Database.Registry.selectOne(
                route,
                "WHERE name=$1",
                [name],
                undefined,
                transactionPoolClient
            );
            if (registryEntity) {
                throw new ErrorConflict();
            } else {
                if (transactionPoolClient) {
                    registryEntity = await this._create(route, registry, transactionPoolClient);
                } else {
                    registryEntity = (await PostreSql.instance(route).transaction<RegistryEntity>(
                        async (client: PoolClient) => {
                            return await this._create(route, registry, client);
                        }
                    )) as RegistryEntity;
                }
            }
        }
        return registryEntity;
    }

    async load(route: MergingObject, user: UserInfo): Promise<RegistryEntity[]> {
        let registries: RegistryEntity[] = [];
        if (user && user.id) {
            registries = await Database.Registry.selectMany(
                route,
                `JOIN "${Database.UserRegistry.Name}" ON "registryId"="${Database.Registry.Name}".id AND "userId"=$1`,
                [user.id]
            );
        }
        return registries;
    }

    async loadOne(route: MergingObject): Promise<RegistryEntity | undefined> {
        let registry: RegistryEntity | undefined = undefined;
        if (route.userId) {
            registry = await Database.Registry.selectOne(
                route,
                `JOIN "${Database.UserRegistry.Name}" ON "registryId"="${Database.Registry.Name}".id AND "userId"=$1`,
                [route.userId]
            );
        }
        return registry;
    }

    async update(
        route: MergingObject,
        previousRegistry: RegistryEntity,
        body: UpdateRegistryDto
    ): Promise<RegistryEntity> {
        const newRegistry = {
            id: previousRegistry.id,
            name: body.name.trim(),
            type: body.type,
            url: body.url.trim(),
            gnUrl: body.gnUrl?.trim(),
            path: body.path ? body.path.trim() : undefined,
            excludePaths: body.excludePaths ? body.excludePaths.trim() : undefined,
            user: body.user ? body.user.trim() : undefined,
            timeout: body.timeout,
            iconUrl: body.iconUrl ? body.iconUrl.trim() : undefined,
        };
        const result = await Database.Registry.update(route, newRegistry);
        if (!result) {
            throw new Error("Registry.update return null");
        }
        return result;
    }

    private async AxiosGet<Entity>(route: MergingObject, fullUrl: string): Promise<AxiosResponse<Entity> | undefined> {
        let response: AxiosResponse<Entity> | undefined = undefined;
        try {
            response = await Axios.get<Entity>(route, fullUrl);
        } catch (err) {
            // url unreached
            Log.error(route, err);
        }
        return response;
    }

    /**
     * curl -X GET http://localhost:32000/v2/_catalog
     * {"repositories":["emoji","helm-chart/emoji"]}
     */
    async readCatalog(
        route: MergingObject,
        registry: RegistryEntity,
        token: string | null
    ): Promise<ExtendedCatalogEntity> {
        const fullUrl = `${registry.url}/v2/_catalog`;
        Axios.Timeout = registry.timeout as number | undefined;
        if (token) {
            Axios.Token = token;
        }
        const response = await this.AxiosGet<{
            repositories: string[];
        }>(route, fullUrl);
        let repoFromRegistry = response ? response.data.repositories : [];
        if (response && registry.path) {
            const path = registry.path + "/";
            repoFromRegistry = repoFromRegistry.filter((repoName) => repoName.startsWith(path));
        }
        if (response && registry.excludePaths) {
            const path = registry.excludePaths + "/";
            repoFromRegistry = repoFromRegistry.filter((repoName) => !repoName.startsWith(path));
        }
        const result = await Database.Repository.select(route, {
            select: {
                columns: ["name", "rating", "description"],
            },
            request: 'WHERE "registryId"=$1 AND name=ANY($2) AND tag=$3',
            values: [registry.id, repoFromRegistry, ""],
        });
        const repositories: Repository[] = [];
        for (const repository of repoFromRegistry) {
            const repo = result.find((r) => r.name === repository);
            repositories.push(
                repo
                    ? {
                          repository,
                          rating: repo.rating,
                          description: repo.description,
                      }
                    : {
                          repository,
                          rating: 0,
                          description: "",
                      }
            );
        }
        return {
            repositories,
            registry,
            header: getHeader(response),
        };
    }
    /**
     * Check that the endpoint implements distribution API.
     *  curl -X GET http://localhost:32000/v2/
     *  http status: 200 and {}
     */
    async test(
        route: MergingObject,
        url: string,
        timeout: number | undefined,
        token: string | null
    ): Promise<HeaderEntity | undefined> {
        const fullUrl = `${url}/v2/`;
        Axios.Timeout = timeout;
        if (token) {
            Axios.Token = token;
        }
        const response = await this.AxiosGet<CatalogEntity>(route, fullUrl);
        return response ? getHeader(response) : undefined;
    }

    /**
     * Delete registry from Database
     * @param registryId
     */
    async delete(route: MergingObject, registry: RegistryEntity) {
        if (!registry.id) {
            throw new ErrorNotFound();
        }
        await Database.Registry.delete(route, registry);
    }
}
