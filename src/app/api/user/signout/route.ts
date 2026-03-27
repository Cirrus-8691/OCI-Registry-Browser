/**
 * Route pour se déconnecter
 */
export const dynamic = "force-dynamic"; // Indique que la route est toujours dynamique

import { NextRequest } from "next/server";
import { UnauthorizedResponse } from "@/tools/Response/UnauthorizedResponse";
import { OkResponse } from "@/tools/Response/OkResponse";
import { SignoutDto } from "./signout.dto";
import App from "../../App";
import CatchError from "@/tools/CatchError";
import { ForbiddenResponse } from "@/tools/Response/ForbiddenResponse";
import { SchemaTables } from "@/model/SchemaTables";

/**
 * Déconnexion d'un utilisateur
 * @param request
 * @returns
 */
export async function POST(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "select", SchemaTables.User);
    const { route, user } = result;
    route.function = `signout User`;
    let { response } = result;
    if (response.status === 200) {
        try {
            const body: SignoutDto = await request.json();
            if (!body || !body.renewToken) {
                response = ForbiddenResponse();
            }
            else {
                if (body.renewToken) {
                    await (await App.Instance(route)).UserService.signout(route, body.renewToken, user);
                    response = OkResponse();
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
