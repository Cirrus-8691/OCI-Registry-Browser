/**
 * Route obtenir tous les tags d'un repository
 */
export const dynamic = "force-dynamic"; // Indique que la route est toujours dynamique

import { NextRequest } from "next/server";
import App from "../../App";
import { UserDto } from "./User.dto";
import CatchError from "@/tools/CatchError";
import { BadRequestResponse } from "@/tools/Response/BadRequestResponse";
import { ForbiddenResponse } from "@/tools/Response/ForbiddenResponse";
import { SchemaTables } from "@/model/SchemaTables";

/**
 * Create user
 */
export async function POST(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "insert", SchemaTables.User);
    const { route } = result;
    let { response } = result;
    if (response.status === 200) {

        try {
            const userToCreate: UserDto = await request.json();
            if (!userToCreate) {
                response = ForbiddenResponse();
            }
            else {
                const app = await App.Instance(route);
                const registry = await app.RegistryService.loadOne(route);
                if (!registry) {
                    response = BadRequestResponse();
                }
                else {
                    const userCreated = await app.UserService.createUserToRegistry(route, userToCreate, registry);
                    if (!userCreated) {
                        response = BadRequestResponse();
                    }
                    else {
                        response = Response.json(userCreated);
                    }
                }
            }
        } catch (err: unknown) {
            response = CatchError(route, err);
        }
    }
    return response;
}

