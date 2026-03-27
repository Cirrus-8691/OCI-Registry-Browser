/**
 * Route pour se connecter
 */
export const dynamic = "force-dynamic"; // Indique que la route est toujours dynamique

import { Log } from "@/tools/Logger";
import { EmptyResponse } from "@/tools/Response/EmptyResponse";
import { NextRequest } from "next/server";
import { SigninDto } from "./signin.dto";
import { UnauthorizedResponse } from "@/tools/Response/UnauthorizedResponse";
import App from "../../App";
import { ExtractTokenFromRequest } from "../extractUserFromRequest";
import Roles from "../../Roles";
import { ForbiddenResponse } from "@/tools/Response/ForbiddenResponse";
import CatchError from "@/tools/CatchError";
import { SchemaTables } from "@/model/SchemaTables";

/**
 * Connexion d'un utilisateur avec retour des tokens d'auth et de renouvellement
 * @param request
 * @returns
 */
export async function POST(request: NextRequest): Promise<Response> {
    const route = Log.logRoute(request);
    route.function = `signin User`;
    let response: Response = EmptyResponse();
    try {
        const body: SigninDto = await request.json();
        if (!body) {
            response = ForbiddenResponse();
        }
        else {
            const user = await (await App.Instance(route)).UserService.signin(route, body);
            if (!user) {
                response = UnauthorizedResponse();
            } else {
                if (!Roles.userCan(user, "select", SchemaTables.User)) {
                    response = ForbiddenResponse();
                }
                else {
                    const result = await (await App.Instance(route)).UserService.newToken(route, user);
                    Log.log(route, 'newToken OK');
                    response = Response.json(result);
                }
            }
        }
        Log.logResponse(route, response);
    } catch (err: unknown) {
        response = CatchError(route, err);
    }
    return response;
}

/**
 * Renew auth tokens
 * @param request 
 * @returns 
 */
export async function GET(request: NextRequest): Promise<Response> {
    const route = Log.logRoute(request);
    route.function = `renew auth tokens`;
    const extract = ExtractTokenFromRequest(request);
    let response = extract.response;
    if (response.status === 200) {

        try {
            const result = await (await App.Instance(route)).UserService.renewToken(route, extract.token);
            response = Response.json(result);
        } catch (err: unknown) {
            response = CatchError(route, err);
        }
    }
    return response;
}
