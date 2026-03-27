import { NextRequest } from "next/server";
import { RegistryEntity } from "../../registry/registry.entity";
import UserRegistry from "@/model/UserRegistry.table";
import App from "../../App";
import { SchemaTables } from "@/model/SchemaTables";
import { ForbiddenResponse } from "@/tools/Response/ForbiddenResponse";
import CatchError from "@/tools/CatchError";

export async function GET(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "select", SchemaTables.Repository);
    const { route, user } = result;
    route.function = `get Repository signatures`;
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
            try {
                const result = await (
                    await App.Instance(route)
                ).RepositoryService.signature(route, {
                    registry,
                    repository,
                    reference,
                });
                response = Response.json(result);
            } catch (err: unknown) {
                response = CatchError(route, err);
            }
        }
    }
    return response;
}
