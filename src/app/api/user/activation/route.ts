/**
 * Route obtenir tous les tags d'un repository
 */
export const dynamic = "force-dynamic"; // Indique que la route est toujours dynamique

import { NextRequest } from "next/server";
import App from "../../App";
import { ForbiddenResponse } from "@/tools/Response/ForbiddenResponse";
import CatchError from "@/tools/CatchError";
import { Log } from "@/tools/Logger";
import { EmptyResponse } from "@/tools/Response/EmptyResponse";
import { ActivateDto } from "./activate.dto";
import { ActivationDto } from "./activation.dto";

/**
 * Get Admin public key (jwt) used to identify user
 */
export async function GET(request: NextRequest): Promise<Response> {
    const route = Log.logRoute(request);
    route.function = `get Admin pubkey`;
    let response: Response = EmptyResponse();
    try {
        const email = request.nextUrl.searchParams.get("email");
        if (!email) {
            response = ForbiddenResponse();
        }
        else {
            const result = await (await App.Instance(route)).UserService.getActivation(route, email);
            response = Response.json(result);
        }
    } catch (err: unknown) {
        response = CatchError(route, err);
    }
    return response;
}

/**
 * Set Admin public key (jwt) to get an activation code
 */
export async function POST(request: NextRequest): Promise<Response> {
    const route = Log.logRoute(request);
    route.function = `post Admin pubkey`;
    let response: Response = EmptyResponse();
    try {
        const activate: ActivateDto = await request.json();
        if (! activate || !activate.pubkey ) {
            response = ForbiddenResponse();
        }
        else {
            const result = await (await App.Instance(route)).UserService.setActivation(route, activate);
            response = Response.json(result);
        }
    } catch (err: unknown) {
        response = CatchError(route, err);
    }
    return response;
}

/**
 * Patch Admin user to activate her account
 */
export async function PATCH(request: NextRequest): Promise<Response> {
    const route = Log.logRoute(request);
    route.function = `patch Admin with activation code`;
    let response: Response = EmptyResponse();
    try {
        const activation: ActivationDto = await request.json();
        if (! activation || !activation.pubkey || !activation.email) {
            response = ForbiddenResponse();
        }
        else {
            const result = await (await App.Instance(route)).UserService.activate(route, activation);
            response = Response.json(result);
        }
    } catch (err: unknown) {
        response = CatchError(route, err);
    }
    return response;
}

