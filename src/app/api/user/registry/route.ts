/**
 * Route obtenir tous les tags d'un repository
 */
export const dynamic = "force-dynamic"; // Indique que la route est toujours dynamique

import { NextRequest } from "next/server";
import { ForbiddenResponse } from "@/tools/Response/ForbiddenResponse";
import CatchError from "@/tools/CatchError";
import App from "../../App";
import UserRegistry from "@/model/UserRegistry.table";
import { RegistryEntity } from "../../registry/registry.entity";
import User from "@/model/User.table";
import { UserEntity } from "../entites/user.entity";
import { UserRegistryEntity } from "../entites/userRegistry.entity";
import { BadRequestResponse } from "@/tools/Response/BadRequestResponse";
import { OkResponse } from "@/tools/Response/OkResponse";
import { SchemaTables } from "@/model/SchemaTables";

/**
 * add Registry to user
 */
export async function POST(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "insert", SchemaTables.UserRegistry);
    const { route, user } = result;
    let { response } = result;
    if (response.status === 200) {

        try {
            const registryId = request.nextUrl.searchParams.get("registryId");
            const registry = await (await App.Instance(route)).UserHas<RegistryEntity>(route, user, registryId, UserRegistry);
            const userId = request.nextUrl.searchParams.get("userId");
            const idUser = userId ? parseInt(userId) : null;
            const userTo = await (await App.Instance(route)).UserHas<UserEntity>(route, user, idUser, User);
            if (!registry || !userTo) {
                response = ForbiddenResponse();
            }
            else {
                const data: UserRegistryEntity | undefined = await (await App.Instance(route)).UserService.addRegistry(route, userTo, registry);
                if(!data) {
                    response = BadRequestResponse();
                }
                response = Response.json(data);
            }
        } catch (err: unknown) {
            response = CatchError(route, err);
        }
    }
    return response;
}

/**
 * remove Registry from user
 */
export async function DELETE(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "delete", SchemaTables.UserRegistry);
    const { route, user } = result;
    let { response } = result;
    if (response.status === 200) {

        try {
            const registryId = request.nextUrl.searchParams.get("registryId");
            const registry = await (await App.Instance(route)).UserHas<RegistryEntity>(route, user, registryId, UserRegistry);
            const userId = request.nextUrl.searchParams.get("userId");
            const idUser = userId ? parseInt(userId) : null;
            const userTo = await (await App.Instance(route)).UserHas<UserEntity>(route, user, idUser, User);
            if (!registry || !userTo) {
                response = ForbiddenResponse();
            }
            else {
                await (await App.Instance(route)).UserService.removeRegistry(route, userTo, registry);
                response = OkResponse();
            }
        } catch (err: unknown) {
            response = CatchError(route, err);
        }
    }
    return response;
}
