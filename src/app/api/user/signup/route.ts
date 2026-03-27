/**
 * Route pour se connecter et accèder aux trads "payantes"...
 */
export const dynamic = 'force-dynamic'; // Indique que la route est toujours dynamique

import { Log } from "@/tools/Logger";
import { EmptyResponse } from "@/tools/Response/EmptyResponse";
import { NextRequest } from "next/server";
import App from "../../App";
import { SignupDto } from "./signup.dto";
import CatchError from "@/tools/CatchError";
import { ForbiddenResponse } from "@/tools/Response/ForbiddenResponse";

/**
 * Create new admin User + Registry + 
 */
export async function POST(request: NextRequest): Promise<Response> {
  const route = Log.logRoute(request);
  route.function = `signup User`;
  let response: Response = EmptyResponse();
  try {
    const body: SignupDto = await request.json();
    if (!body) {
      response = ForbiddenResponse();
    }
    else {
      const app = await App.Instance(route);
      const user = await (app).UserService.signup(route, body, app.RegistryService);
      response = Response.json(user);
    }
  } catch (err: unknown) {
    response = CatchError(route, err);
  }
  return response;
}
