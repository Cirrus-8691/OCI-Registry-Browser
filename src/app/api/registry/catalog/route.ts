/**
 * Route obtenir tous les Registries du user
 */
export const dynamic = "force-dynamic"; // Indique que la route est toujours dynamique

import { NextRequest } from "next/server";
import App from "../../App";
import UserRegistry from "@/model/UserRegistry.table";
import { RegistryEntity } from "../registry.entity";
import { ExtendedCatalogEntity } from "../../repository/repository.entity";
import { ForbiddenResponse } from "@/tools/Response/ForbiddenResponse";
import CatchError from "@/tools/CatchError";
import { SchemaTables } from "@/model/SchemaTables";

/**
 * Get all Registry catalog
 */
export async function GET(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "list", SchemaTables.Repository);
    const { route, user } = result;
    route.function = `get Registry catalog`;
    let { response } = result;
    if (response.status === 200) {
        const registryId = request.nextUrl.searchParams.get("registryId");
        const registry = await (await App.Instance(route)).UserHas<RegistryEntity>(route, user, registryId, UserRegistry);
        if (!registry) {
            response = ForbiddenResponse();
        }
        else {
            try {
                const token = request.nextUrl.searchParams.get("token");
                const catalog: ExtendedCatalogEntity = await (await App.Instance(route)).RegistryService.readCatalog(route, registry, token);
                response = Response.json(catalog);
            } catch (err: unknown) {
                response = CatchError(route, err);
            }
        }
    }
    return response;
}
