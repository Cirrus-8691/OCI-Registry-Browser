/**
 * Route obtenir tous les tags d'un repository
 */
export const dynamic = "force-dynamic"; // Indique que la route est toujours dynamique

import { NextRequest } from "next/server";
import App from "../../../App";
import { RegistryEntity } from "../../../registry/registry.entity";
import UserRegistry from "@/model/UserRegistry.table";
import { ForbiddenResponse } from "@/tools/Response/ForbiddenResponse";
import CatchError from "@/tools/CatchError";
import { SchemaTables } from "@/model/SchemaTables";
import { RatingDto } from "./rating.dto";
import { NotFoundResponse } from "@/tools/Response/NotFoundResponse";

/**
 * Get Rating
 */
export async function GET(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "select", SchemaTables.Repository);
    const { route, user } = result;
    route.function = `Get repository rating`;
    let { response } = result;
    if (response.status === 200) {
        const registryId = request.nextUrl.searchParams.get("registryId");
        const registry = await (
            await App.Instance(route)
        ).UserHas<RegistryEntity>(route, user, registryId, UserRegistry);
        if (!registry) {
            response = ForbiddenResponse();
        } else {
            try {
                const repository = request.nextUrl.searchParams.get("repository");
                const tag = request.nextUrl.searchParams.get("tag");
                const repo = await (
                    await App.Instance(route)
                ).RepositoryService.getRepositoryTag(route, {
                    registry,
                    repository,
                    reference: tag,
                });
                if (repo) {
                    response = Response.json(repo.rating);
                } else {
                    response = NotFoundResponse();
                }
            } catch (err: unknown) {
                response = CatchError(route, err);
            }
        }
    }
    return response;
}

/**
 * Set Rating
 */
export async function POST(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "select", SchemaTables.Repository);
    const { route, user } = result;
    route.function = `Set repository rating`;
    let { response } = result;
    if (response.status === 200) {
        const repositoryRating: RatingDto = await request.json();
        const registry = await (
            await App.Instance(route)
        ).UserHas<RegistryEntity>(route, user, repositoryRating.registryId, UserRegistry);
        if (!registry) {
            response = ForbiddenResponse();
        } else {
            try {
                await (await App.Instance(route)).RepositoryService.setRepositoryTagRating(route, registry, repositoryRating);
            } catch (err: unknown) {
                response = CatchError(route, err);
            }
        }
    }
    return response;
}
