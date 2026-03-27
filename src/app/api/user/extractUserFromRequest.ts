import { Log, MergingObject } from "@/tools/Logger";
import { NextRequest } from "next/server";
import { UserInfo } from "./entites/user.entity";
import { UnauthorizedResponse } from "@/tools/Response/UnauthorizedResponse";
import { EmptyResponse } from "@/tools/Response/EmptyResponse";
import UserService from "./user.service";

export const ExtractTokenFromRequest = (
    request: NextRequest
): { token: string; response: Response; } => {
    let token = "";
    let response = UnauthorizedResponse();
    if (request.headers) {
        const authorization = request.headers.get("Authorization");
        if (authorization && authorization.startsWith("Bearer ")) {
            response = EmptyResponse();
            token = authorization.substring(7);
        }
    }
    return {
        token,
        response
    };
}

const ExtractUserFromRequest = (
    route: MergingObject,
    request: NextRequest
): { user: UserInfo | undefined; response: Response; } => {
    let user: UserInfo | undefined = undefined;
    const extract = ExtractTokenFromRequest(request);
    let response = extract.response
    if (response.status === 200) {
        user = UserService.extractUserFromToken(extract.token);
        if (user) {
            route.userId = user.id?.toString();
            Log.log({ ...route, email: user.email as string} , `checkUser: Ok ✅`);
        }
        else {
            response = UnauthorizedResponse();
        }
    }
    return {
        user,
        response
    };
}

export default ExtractUserFromRequest;