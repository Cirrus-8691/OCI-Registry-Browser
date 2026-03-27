import { Pool, PoolClient, QueryResult } from 'pg';
import { GlobalRef } from './GlobalRef';
import { PostreSqlUri } from './PostgreSql/PostreSqlUri';
import { Log, MergingObject, TestNotAroute } from '../Logger';

export type KnownColumnDataType = string | number | Date | undefined;
export interface DbRow {
    id?: string | number;
    [column: string]: KnownColumnDataType;
}

export default class PostreSql {

    private static databaseConn = new GlobalRef<PostreSql>("PostreSql.database");
    private static log = false;
    public static Route: MergingObject = TestNotAroute(0, "init-postgresql");

    static instance(route: MergingObject, log = false, onError?: (error: unknown) => void): PostreSql {
        PostreSql.Route = route;
        this.log = log;
        if (!PostreSql.databaseConn.value ||
            (
                PostreSql.databaseConn.value &&
                PostreSql.databaseConn.value.pool === undefined
            )
        ) {
            if (log) {
                Log.log(route, "🔥 PostreSql connection: ❌ undefined");
            }
            const pg = {
                host: process.env.PG_HOST ?? "127.0.0.1",
                port: +(process.env.PG_PORT ?? 5432),
                database: process.env.PG_NAME,
                user: process.env.PG_USER,
                password: process.env.PG_PASS,
                ssl: process.env.PG_SSLMODE === "enabled"
            };
            PostreSql.databaseConn.value = new PostreSql(pg, onError);
            if (PostreSql.databaseConn.value.pool !== undefined) {
                if (log) {
                    Log.log(route, `🔶 pg connection: ✅ OK`);
                    Log.log(route, `🔸 pg host: ✅ ${pg.host}`);
                    Log.log(route, `🔸 pg port: ✅ ${pg.port}`);
                    Log.log(route, `🔸 pg user: ✅ ${pg.user}`);
                    Log.log(route, `🔸 pg pswd: ✅ ${pg.password ? "***" : ""}`);
                    Log.log(route, `🔸 pg base: ✅ ${pg.database}`);
                    Log.log(route, `🔸 pg ssl : ✅ ${pg.ssl.toString()}`);
                }
            }
            else {
                throw new Error("");
            }
        }
        return PostreSql.databaseConn.value;
    }

    private pool: Pool | undefined = undefined;

    private constructor(uri: PostreSqlUri, onError?: (error: unknown) => void) {
        try {
            if (onError) {
                this.onError = onError;
            }
            if (uri.host === "") {
                throw Error("PostreSql start with host");
            }
            if (uri.port < 1024 || 59999 < uri.port) {
                throw Error("You must choose a port number between 1024 and 59999");
            }

            this.pool = new Pool(uri);
            this.pool.on("error", this.onError.bind(this));
        }
        catch (error: unknown) {
            this.onError(error);
        }
    }

    public onError(error: unknown) {
        Log.log(PostreSql.Route, `🔥🔥🔥🔥🔥🔥`);
        Log.log(PostreSql.Route, `🔥 Error:`);
        Log.log(PostreSql.Route, `🔥🔥🔥🔥🔥🔥`);
        Log.error(PostreSql.Route, error)
        PostreSql.close();
    };

    public async using(command: (client: PoolClient) => Promise<QueryResult | void>): Promise<QueryResult | void> {
        if (this.pool === undefined) {
            Log.error(PostreSql.Route, `🔶 PostreSql connection: not open 🚫`);
        }
        else {
            const client = await this.pool.connect();
            try {
                return await command(client);
            }
            catch (error: unknown) {
                this.onError(error);
            }
            finally {
                client.release(); // Relâche le client pour qu'il soit réutilisé par d'autres requêtes
            }
        }
    }

    public async transaction<Entity>(command: (client: PoolClient) => Promise<Entity | undefined | void>): Promise<Entity | undefined | void> {
        if (this.pool === undefined) {
            Log.error(PostreSql.Route, `🔶 PostreSql connection: not open 🚫`);
        }
        else {
            const client = await this.pool.connect();
            try {
                await client.query('BEGIN');
                const result = await command(client);
                await client.query('COMMIT');
                return result;
            }
            catch (error: unknown) {
                await client.query('ROLLBACK');
                this.onError(error);
            }
            finally {
                client.release(); // Relâche le client pour qu'il soit réutilisé par d'autres requêtes
            }
        }
    }

    static async test(route: MergingObject): Promise<void> {
        await this.instance(route, true).using(async (client: PoolClient) => {
            const result =  await client.query("SELECT 1");
            if (result?.rowCount !== 1) {
                throw new Error("Bad database connexion")
            }
            await PostreSql.query(route, "CREATE SCHEMA IF NOT EXISTS public");
        });

    }

    static async query(route: MergingObject, query: string): Promise<QueryResult | void> {
        return await this.instance(route).using(async (client: PoolClient) => {
            Log.log(route, query);
            return await client.query(query);
        })
    }

    static close(): void {
        if (PostreSql.databaseConn.value &&
            PostreSql.databaseConn.value.pool !== undefined
        ) {
            PostreSql.databaseConn.value.pool.end();
            PostreSql.databaseConn.value.pool = undefined;
            if (this.log) {
                Log.log(PostreSql.Route, `🔶 Connection: PostreSql ended 💀`);
            }
        }
    }
}
