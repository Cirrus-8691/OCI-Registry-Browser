import { TestProductionEnvSettings } from "@/tests/TestEnvSettings";
import UserService from "./user/user.service";
import RegistryService from "./registry/registry.service";
import Roles, { DbTableClass } from "./Roles";
import { NextRequest } from "next/server";
import ExtractUserFromRequest from "./user/extractUserFromRequest";
import { Log, MergingObject } from "@/tools/Logger";
import { UndefinedUser, UserInfo } from "./user/entites/user.entity";
import { UnauthorizedResponse } from "@/tools/Response/UnauthorizedResponse";
import { ForbiddenResponse } from "@/tools/Response/ForbiddenResponse";
import Guard from "./Guard";
import RepositoryService from "./repository/repository.service";
import TraceService from "./trace/trace.service";
import { Database } from "@/model/Database";
import UserAbility from "@/model/UserAbility";
import { SchemaTables } from "@/model/SchemaTables";

export type Status = "idle" | "init" | "ready";

export default class App {
  private static app: App | undefined = undefined;
  private constructor(
    public readonly UserService: UserService,
    public readonly RegistryService: RegistryService,
    public readonly RepositoryService: RepositoryService,
    public readonly TraceService: TraceService,
  ) { }

  static async Instance(route: MergingObject): Promise<App> {
    if (!App.app) {
      App.app = new App(
        new UserService(),
        new RegistryService(),
        new RepositoryService(),
        new TraceService()
      );
      App.app.status = "init";
      TestProductionEnvSettings(route);
      await Database.ready(route);
      App.app.status = "ready";
    }
    return App.app;
  }

  private status: Status = "idle";
  public get Status(): Status {
    return this.status;
  }

  static CheckPolicies(request: NextRequest, action: UserAbility, tableName: SchemaTables): { user: UserInfo, route: MergingObject, response: Response } {
    const route = Log.logRoute(request);
    route.function = `${action} ${tableName}`; // Basic function like: "create Registry"
    let { user, response } = ExtractUserFromRequest(route, request);
    if (!user) {
      response = UnauthorizedResponse();
      user = UndefinedUser;
    }
    else {
      if (!Roles.userCan(user, action, tableName)) {
        response = ForbiddenResponse();
      }
      else {
        route.userId = user.id?.toString();
      }
    }
    return { user, route, response };
  }

  async UserHas<T>(route: MergingObject, user: UserInfo, itemId: string | number | null, classType: DbTableClass): Promise<T | undefined> {
    let data: T | undefined = undefined;
    if (itemId) {
      const userHas = await Guard.userHas<T>(route, user, itemId, classType);
      data = userHas;
    }
    return data;
  }
}
