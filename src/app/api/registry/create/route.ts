/**
 * Route pour créer un Registry
 */
export const dynamic = "force-dynamic"; // Indique que la route est toujours dynamique

import { NextRequest } from "next/server";
import { UnauthorizedResponse } from "@/tools/Response/UnauthorizedResponse";
import { CreateRegistryDto } from "./createRegistry.dto";
import App from "../../App";
import CatchError from "@/tools/CatchError";
import { ForbiddenResponse } from "@/tools/Response/ForbiddenResponse";
import { SchemaTables } from "@/model/SchemaTables";

/**
 * Create new Registry
 */
export async function POST(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "insert", SchemaTables.Registry);
    const { route } = result;
    let { response } = result;
    if (response.status === 200) {
        try {
            const body: CreateRegistryDto = await request.json();
            if (!body) {
                response = ForbiddenResponse();
            }
            else {
                const registry = await (await App.Instance(route)).RegistryService.create(route, body);
                if (registry) {
                    response = Response.json(registry);
                } else {
                    response = UnauthorizedResponse();
                }
            }
        } catch (err: unknown) {
            response = CatchError(route, err);
        }
    }
    return response;
}
