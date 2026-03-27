import { NextRequest } from "next/server";
import App from "../../App";
import { UnavailableResponse } from "@/tools/Response/UnavailableResponse";
import { OkResponse } from "@/tools/Response/OkResponse";
import { Log } from "@/tools/Logger";

export const dynamic = "force-dynamic"; // Indique que la route est toujours dynamique

/**
 * Juste savoir que le server.js est démarré
 */
export async function GET (request: NextRequest): Promise<Response> {
    const route = Log.logRoute(request);
    const status = (await App.Instance(route)).Status;
    if (status === "ready") {
        return OkResponse();
    }
    return Log.logResponse(route, UnavailableResponse());
}
