/**
 * Route obtenir tous les traces
 */
export const dynamic = "force-dynamic"; // Indique que la route est toujours dynamique

import { NextRequest } from "next/server";
import App from "../App";
import CatchError from "@/tools/CatchError";
import { SchemaTables } from "@/model/SchemaTables";
import { UserInfo } from "../user/entites/user.entity";

/**
 * Get all Traces
 */
export async function GET(request: NextRequest): Promise<Response> {
    let result = App.CheckPolicies(request, "list", SchemaTables.Trace);
    let { response } = result;
    if (response.status === 200) {
        const { route, user } = result;
        route.function = `list Traces`;
        try {
            const instance = await App.Instance(route);
            const users: UserInfo[] = await instance.UserService.list(route, user);
            const traces = await instance.TraceService.load(route, users);
            response = Response.json(traces);
        } catch (err: unknown) {
            response = CatchError(route, err);
        }
    } else {
        result = App.CheckPolicies(request, "select", SchemaTables.Trace);
        const { route, user } = result;
        route.function = `list user Traces`;
        response = result.response;
        if (response.status === 200) {
            try {
                const traces = await (await App.Instance(route)).TraceService.load(route, [user]);
                response = Response.json(traces);
            } catch (err: unknown) {
                response = CatchError(route, err);
            }
        }
    }

    return response;
}
