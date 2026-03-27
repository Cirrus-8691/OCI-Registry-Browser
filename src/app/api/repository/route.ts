/**
 * Route obtenir tous les tags d'un repository
 */
export const dynamic = "force-dynamic"; // Indique que la route est toujours dynamique

import { NextRequest } from "next/server";
import UserRegistry from "@/model/UserRegistry.table";
import { ForbiddenResponse } from "@/tools/Response/ForbiddenResponse";
import CatchError from "@/tools/CatchError";
import { SchemaTables } from "@/model/SchemaTables";
import { UpdateRepositoryDto } from "./updateRepository.dto";
import App from "../App";
import { RegistryEntity } from "../registry/registry.entity";
import { Repository } from "./repository.entity";
import { BadRequestResponse } from "@/tools/Response/BadRequestResponse";
/**
 * Update a Repository
 *  Rating and description
 */
export async function POST(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "update", SchemaTables.Repository);
    const { route, user } = result;
    let { response } = result;
    if (response.status === 200) {
        try {
            const body: UpdateRepositoryDto = await request.json();
            if (!body || !body.registry) {
                response = ForbiddenResponse();
            } else {
                const registry = await (
                    await App.Instance(route)
                ).UserHas<RegistryEntity>(route, user, body.registry, UserRegistry);
                if (!registry) {
                    response = ForbiddenResponse();
                } else {
                    const result = await (
                        await App.Instance(route)
                    ).RepositoryService.saveRepository(route, registry, body);
                    response = result
                        ? Response.json({
                              repository: result.name,
                              rating: result.rating,
                              description: result.description,
                          } as Repository)
                        : BadRequestResponse();
                }
            }
        } catch (err: unknown) {
            response = CatchError(route, err);
        }
    }
    return response;
}
