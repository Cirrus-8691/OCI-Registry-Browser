import { Log } from "@/tools/Logger";
import { OkResponse } from "@/tools/Response/OkResponse";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic'; // Indique que la route est toujours dynamique

/**
 * Juste savoir que le server.js est dispo
 */
export async function GET(request: NextRequest): Promise<Response> {
  Log.logRoute(request);
  return OkResponse();
}
