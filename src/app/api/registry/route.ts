/**
 * Route obtenir tous les Registries du user
 */
export const dynamic = "force-dynamic"; // Indique que la route est toujours dynamique

import { NextRequest } from "next/server";
import App from "../App";
import { UpdateRegistryDto } from "./updateRegistry.dto";
import UserRegistry from "@/model/UserRegistry.table";
import { RegistryEntity } from "./registry.entity";
import { OkResponse } from "@/tools/Response/OkResponse";
import { ForbiddenResponse } from "@/tools/Response/ForbiddenResponse";
import CatchError from "@/tools/CatchError";
import { SchemaTables } from "@/model/SchemaTables";

/**
 * Get all Registries
 */
export async function GET(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "list", SchemaTables.UserRegistry);
    const { route, user } = result;
    let { response } = result;
    if (response.status === 200) {
        try {
            const registries = await (await App.Instance(route)).RegistryService.load(route, user);
            response = Response.json(registries);
        } catch (err: unknown) {
            response = CatchError(route, err);
        }
    }
    return response;
}
/**
 * Update a Registry
 */
export async function POST(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "update", SchemaTables.Registry);
    const { route, user } = result;
    let { response } = result;
    if (response.status === 200) {
        try {
            const body: UpdateRegistryDto = await request.json();
            if (!body || !body.id) {
                response = ForbiddenResponse();
            }
            else {
                const registry = await (await App.Instance(route)).UserHas<RegistryEntity>(route, user, body.id, UserRegistry);
                if (!registry) {
                    response = ForbiddenResponse();
                }
                else {
                    const result = await (await App.Instance(route)).RegistryService.update(route, registry, body);
                    response = Response.json(result);
                }
            }
        } catch (err: unknown) {
            response = CatchError(route, err);
        }
    }
    return response;
}

/**
 * DELETE Registry
 */
export async function DELETE(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "delete", SchemaTables.Registry);
    const { route, user } = result;
    let { response } = result;
    if (response.status === 200) {
        const registryId = request.nextUrl.searchParams.get("registryId");
        try {
            const registry = await (await App.Instance(route)).UserHas<RegistryEntity>(route, user, registryId, UserRegistry);
            if (!registry) {
                response = ForbiddenResponse();
            }
            else {
                await (await App.Instance(route)).RegistryService.delete(route, registry);
                response = OkResponse();
            }
        } catch (err: unknown) {
            response = CatchError(route, err);
        }
    }
    return response;
}
