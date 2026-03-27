/**
 * Route obtenir tous les tags d'un repository
 */
export const dynamic = "force-dynamic"; // Indique que la route est toujours dynamique

import { NextRequest } from "next/server";
import User from "@/model/User.table";
import App from "../App";
import { Active, Profile, UserEntity, UserInfo } from "../user/entites/user.entity";
import { UserDto } from "./create/User.dto";
import { ForbiddenResponse } from "@/tools/Response/ForbiddenResponse";
import CatchError from "@/tools/CatchError";
import { BadRequestResponse } from "@/tools/Response/BadRequestResponse";
import { OkResponse } from "@/tools/Response/OkResponse";
import { SchemaTables } from "@/model/SchemaTables";

/**
 * Get users
 */
export async function GET(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "list", SchemaTables.User);
    const { route, user } = result;
    route.function = `list Users`;
    let { response } = result;
    if (response.status === 200) {
        try {
            const users: UserInfo[] = await (await App.Instance(route)).UserService.list(route, user);
            response = Response.json(users);
        } catch (err: unknown) {
            response = CatchError(route, err);
        }
    }
    return response;
}

/**
 * Update user
 */
export async function POST(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "update", SchemaTables.User);
    const { route, user } = result;
    let { response } = result;
    if (response.status === 200) {

        try {
            const body: UserDto = await request.json();
            const userToUpdate = await (await App.Instance(route)).UserHas<UserEntity>(route, user, body.email, User);
            if (!userToUpdate) {
                response = ForbiddenResponse();
            }
            else {
                const user: UserInfo | undefined = await (await App.Instance(route)).UserService.update(route, userToUpdate, body);
                response = Response.json(user);
            }
        } catch (err: unknown) {
            response = CatchError(route, err);
        }
    }
    return response;
}

/**
 * soft Delete user
 */
export async function DELETE(request: NextRequest): Promise<Response> {
    const result = App.CheckPolicies(request, "forget", SchemaTables.User);
    const { route, user } = result;
    let { response } = result;
    if (response.status === 200) {
        try {
            const userId = request.nextUrl.searchParams.get("userId");
            const idUser = userId ? parseInt(userId) : null;
            if (idUser===null) {
                response = BadRequestResponse();
            }
            else {
                let userToDelete = await (await App.Instance(route)).UserHas<UserEntity>(route, user, idUser, User);
                if (!userToDelete && user.profile==="admin" && user.id===idUser) {
                    // Admin without Registry trying to forget itself
                    userToDelete = { 
                        id: user.id as number,
                        email: user.email as string,
                        hashPwd: "", // not usefull
                        profile: user.email as Profile,
                        active :  user.active as Active,
                     };
                }
                if (!userToDelete) {
                    response = ForbiddenResponse();
                }
                else {
                    await (await App.Instance(route)).UserService.forget(route, userToDelete, user);
                    response = OkResponse();
                }
            }
        } catch (err: unknown) {
            response = CatchError(route, err);
        }
    }
    return response;
}

