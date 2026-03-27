/**
 * Route obtenir tous les tags d'un repository
 */
export const dynamic = "force-dynamic"; // Indique que la route est toujours dynamique

import { NextRequest } from "next/server";
import App from "../../App";
import { RegistryEntity } from "../../registry/registry.entity";
import UserRegistry from "@/model/UserRegistry.table";
import { ManifertAccepted } from "./manifest.entity";
import { OkResponse } from "@/tools/Response/OkResponse";
import { ForbiddenResponse } from "@/tools/Response/ForbiddenResponse";
import CatchError from "@/tools/CatchError";
import { SchemaTables } from "@/model/SchemaTables";
/**
 * Get manifest+details
 */
export async function GET(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "select", SchemaTables.Repository);
    const { route, user } = result;
    route.function = `get Repository manifest`;
    let { response } = result;
    if (response.status === 200) {
        const registryId = request.nextUrl.searchParams.get("registryId");
        const registry = await (
            await App.Instance(route)
        ).UserHas<RegistryEntity>(route, user, registryId, UserRegistry);
        if (!registry) {
            response = ForbiddenResponse();
        } else {
            const repository = request.nextUrl.searchParams.get("repository");
            const reference = request.nextUrl.searchParams.get("reference");
            const type = request.nextUrl.searchParams.get("type") as ManifertAccepted | null;

            try {
                const token = request.nextUrl.searchParams.get("token");
                const app = await App.Instance(route);
                const image = { registry, repository, reference, type };
                const manifest = await app.RepositoryService.getManifest(route, image, token);
                response = Response.json(manifest);
            } catch (err: unknown) {
                response = CatchError(route, err);
            }
        }
    }
    return response;
}

/**
 * DELETE manifest
 */
export async function DELETE(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "delete", SchemaTables.Repository);
    const { route, user } = result;
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
                const reference = request.nextUrl.searchParams.get("reference");
                const token = request.nextUrl.searchParams.get("token");
                await (
                    await App.Instance(route)
                ).RepositoryService.deleteManifest(
                    route,
                    {
                        registry,
                        repository,
                        reference,
                        type: "oci",
                    },
                    token
                );
                response = OkResponse();
            } catch (err: unknown) {
                response = CatchError(route, err);
            }
        }
    }
    return response;
}
