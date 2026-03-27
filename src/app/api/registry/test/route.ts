/**
 * Route pour créer un Registry
 */
export const dynamic = "force-dynamic"; // Indique que la route est toujours dynamique

import { Log } from "@/tools/Logger";
import { EmptyResponse } from "@/tools/Response/EmptyResponse";
import { InternalServerError } from "@/tools/Response/InternalServerError";
import { NextRequest } from "next/server";
import App from "../../App";
import HeaderEntity from "./header.entity";
import CatchError, { ErrorBadRequest } from "@/tools/CatchError";
import { BadRequestResponse } from "@/tools/Response/BadRequestResponse";

/**
 * Test Registry Url
 */
export async function GET(request: NextRequest): Promise<Response> {
    const route = Log.logRoute(request);
    route.function = `test Registry url`;
    const url = request.nextUrl.searchParams.get("url");
    let response;
    if (!url) {
        response = InternalServerError("No url");
    }
    else {
        response = EmptyResponse();
        try {
            const timeoutStr = request.nextUrl.searchParams.get("timeout");
            let timeout: number | undefined = undefined;
            if(timeoutStr) {
                timeout = parseInt(timeoutStr);
                if(isNaN(timeout)) {
                    throw new ErrorBadRequest();
                }
            }
            const token = request.nextUrl.searchParams.get("token");
            const result: HeaderEntity | undefined = await (await App.Instance(route)).RegistryService.test(route, url, timeout, token);
            if (!result) {
                response = BadRequestResponse();
            }
            else {
                response = Response.json(result);
            }
        } catch (err: unknown) {
            response = CatchError(route, err);
        }
    }
    return response;
}
