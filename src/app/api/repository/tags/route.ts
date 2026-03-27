/**
 * Route obtenir tous les tags d'un repository
 */
export const dynamic = "force-dynamic"; // Indique que la route est toujours dynamique

import { NextRequest } from "next/server";
import App from "../../App";
import { RegistryEntity } from "../../registry/registry.entity";
import UserRegistry from "@/model/UserRegistry.table";
import { TagsHeaderEntity } from "./tag.entity";
import { ForbiddenResponse } from "@/tools/Response/ForbiddenResponse";
import CatchError from "@/tools/CatchError";
import { SchemaTables } from "@/model/SchemaTables";

/**
 * Get all Tags
 */
export async function GET(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "select", SchemaTables.Repository);
    const { route, user } = result;
    route.function = `list Repository tags`;
    let { response } = result;
    if (response.status === 200) {

        const registryId = request.nextUrl.searchParams.get("registryId");
        const registry = await (await App.Instance(route)).UserHas<RegistryEntity>(route, user, registryId, UserRegistry);
        if (!registry) {
            response = ForbiddenResponse();
        }
        else {
            try {
                const repositoryName = request.nextUrl.searchParams.get("repository");
                const token = request.nextUrl.searchParams.get("token");
                const tag: TagsHeaderEntity = await (await App.Instance(route)).RepositoryService.tags(route, registry, repositoryName, token)
                response = Response.json(tag);
            } catch (err: unknown) {
                response = CatchError(route, err);
            }
        }
    }
    return response;
}
