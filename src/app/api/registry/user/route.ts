/**
 * Route obtenir tous les Registries du user
 */
export const dynamic = "force-dynamic"; // Indique que la route est toujours dynamique

import { NextRequest } from "next/server";
import CatchError from "@/tools/CatchError";
import App from "../../App";
import { UserEntity } from "../../user/entites/user.entity";
import User from "@/model/User.table";
import { ForbiddenResponse } from "@/tools/Response/ForbiddenResponse";
import { SchemaTables } from "@/model/SchemaTables";

/**
 * Get all user Registries
 */
export async function GET(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "list", SchemaTables.UserRegistry);
    const { route, user } = result;
    let { response } = result;
    if (response.status === 200) {
        try {
            const userId = request.nextUrl.searchParams.get("userId");
            const idUser = userId ? parseInt(userId) : null;
            const userLoad = await (await App.Instance(route)).UserHas<UserEntity>(route, user, idUser, User);
            if (!userLoad) {
                response = ForbiddenResponse();
            }
            else {
                const registries = await (await App.Instance(route)).RegistryService.load(route, userLoad);
                response = Response.json(registries);
            }
        } catch (err: unknown) {
            response = CatchError(route, err);
        }
    }
    return response;
}
