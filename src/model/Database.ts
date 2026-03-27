import { MergingObject } from "../tools/Logger";
import PostreSql from "../tools/Database/PostgreSql";
import Registry from "./Registry.table";
import User from "./User.table";
import UserRegistry from "./UserRegistry.table";
import Trace from "./Trace.table";
import { TraceEntity } from "@/app/api/trace/trace.entity";
import { PoolClient } from "pg";
import RepositoryRegistry from "./Repository.table";

export class Database {
    public static User: User = new User();
    public static Registry: Registry = new Registry();
    public static UserRegistry: UserRegistry = new UserRegistry();
    public static Repository: RepositoryRegistry = new RepositoryRegistry();

    public static Trace: Trace = new Trace();

    public static create = async (route: MergingObject) => {
        await Database.ready(route);
        if (!await Database.User.exists(route)) {
            await Database.User.create(route);
        }
        if (!await Database.Registry.exists(route)) {
            await Database.Registry.create(route);
        }
        if (!await Database.UserRegistry.exists(route)) {
            await Database.UserRegistry.create(route);
        }
        if (!await Database.Repository.exists(route)) {
            await Database.Repository.create(route);
        }
        if (!await Database.Trace.exists(route)) {
            await Database.Trace.create(route);
        }
    };

    public static async trace(route: MergingObject, transaction: PoolClient, trace: TraceEntity): Promise<TraceEntity | undefined> {
        return await Database.Trace.insert(route, trace, transaction);
    }

    public static ready = async (route: MergingObject) => {
        await PostreSql.test(route);
        Database.User.inject(Database.trace);
        Database.Registry.inject(Database.trace);
        Database.UserRegistry.inject(Database.trace); // Because UserRegistry has no id column
        Database.Repository.inject(Database.trace)
        // Warning #1: Do not: Database.Trace.inject(Database.trace);
    }
}
