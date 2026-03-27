
import { Tedis } from "tedis";
import { GlobalRef } from "./GlobalRef";
import Sleep from "../Sleep";
import { Log, MergingObject, TestNotAroute } from "../Logger";

export interface RedisUri {
  host: string;
  port: number;
  password: string;
  database: number;
}

export default class Redis {

  private static databaseConn = new GlobalRef<Redis>("Redis.database");
  private static tryPing = true;
  private static awaitPing = false;
  private static route: MergingObject = TestNotAroute(0, "init-redis");

  static instance(route: MergingObject, onError?: (error: unknown) => void): Redis {
    Redis.route = route;
    if (!Redis.databaseConn.value ||
      (
        Redis.databaseConn.value &&
        Redis.databaseConn.value.tedis === undefined
      )
    ) {
      Log.log(route, "🔥 Redis connection: ❌ undefined");
      if (!process.env.REDIS_HOST) {
        Log.log(route, `🔶 No Redis connection: ⭕`);
        Redis.databaseConn.value = new Redis(undefined, onError);
      }
      else {
        const redisUri = {
          host: process.env.REDIS_HOST,
          port: +(process.env.REDIS_PORT ?? 6379),
          password: process.env.REDIS_PWD ?? "",
          database: +(process.env.REDIS_DB ?? 0),
        }
        Redis.databaseConn.value = new Redis(redisUri, onError);
        if (Redis.databaseConn.value.tedis !== undefined) {
          Log.log(route, `🔶 Redis connection: ✅ OK`);
          Log.log(route, `🔸 redis host: ✅ ${redisUri.host}`);
          Log.log(route, `🔸 redis port: ✅ ${redisUri.port}`);
          Log.log(route, `🔸 redis user: ⭕ ""`);
          Log.log(route, `🔸 redis pswd: ✅ ${redisUri.password ? "***" : ""}`);
          Log.log(route, `🔸 redis base: ✅ ${redisUri.database}`);
        }
      }
    }
    return Redis.databaseConn.value;
  }

  private constructor(uri: RedisUri | undefined, onError?: (error: unknown) => void) {
    try {
      if (onError) {
        this.onError = onError;
      }
      if (uri) {
        if (uri.host === "") {
          throw Error("Redis start with host");
        }
        if (uri.port < 1024 || 59999 < uri.port) {
          throw Error("You must choose a port number between 1024 and 59999");
        }

        this.tedis = new Tedis({
          port: uri.port,
          host: uri.host,
          password: uri.password
        });
        this.tedis.on("error", this.onError.bind(this));
        this.tedis.on("timeout", this.onTimeout.bind(this));
        this.database = uri.database;
      }
    }
    catch (error: unknown) {
      this.tedis = undefined;
      Log.log(Redis.route, `🔥🔥🔥🔥🔥🔥`);
      Log.log(Redis.route, `🔥 ERROR`);
      Log.log(Redis.route, `🔥🔥🔥🔥🔥🔥`);
      console.error(error)
    }
  }

  private tedis: Tedis | undefined = undefined;
  private database: number = 0;

  private onError(error: unknown) {
    Log.log(Redis.route, `🔥🔥🔥🔥🔥🔥`);
    Log.log(Redis.route, `🔥 Error:`);
    Log.log(Redis.route, `🔥🔥🔥🔥🔥🔥`);
    Log.error(Redis.route, error);
    Redis.close();
  };
  private onTimeout() {
    this.onError(new Error("Redis timeout"));
  }

  public async select(database: number): Promise<void> {
    if (this.tedis === undefined) {
      throw Error("Open Redis");
    }
    if (database < 0) {
      throw Error("database must be >= 0");
    }
    if (database > 0) {
      await this.tedis.command("SELECT", database);
    }
  }

  public async using<T>(command: (tedis: Tedis) => Promise<T>): Promise<T | undefined> {
    if (this.tedis === undefined) {
      Log.error(Redis.route, `🔶 Redis connection: not open 🚫`);
    }
    else {
      const ok = await this.ping();
      if (ok) {
        try {
          return await command(this.tedis);
        }
        catch (error: unknown) {
          this.onError(error);
          this.tedis = undefined;
          throw error;
        }
      }
      else {
        Log.error(Redis.route, `🔶 Redis connection: not ready 🚫`);
        throw new Error("Redis connection: not ready");
      }
    }
  }

  private async ping(): Promise<boolean> {
    let pingOk = true;
    while (Redis.awaitPing) {
      Log.log(Redis.route, `🔶 Redis connection: await test ⌚`);
      await Sleep(100);
    }
    if (Redis.tryPing) {
      Redis.awaitPing = true;
      try {
        Log.log(Redis.route, `🔶 Redis connection: testing 🛃`);
        if (this.tedis === undefined) {
          throw new Error("open Redis")
        }
        const result = await this.tedis.command("PING");
        pingOk = result === "PONG";
        await this.select(this.database);
      }
      catch (error: unknown) {
        this.onError(error);
        this.tedis = undefined;
        pingOk = false;
      }
      if (pingOk) {
        Redis.tryPing = false;
        Log.log(Redis.route, `🔶 Redis connection: test ✅ OK`);
      }
      else {
        Redis.tryPing = true; //retry ...
        Log.log(Redis.route, `🔶 Redis connection: test ❌ Failed`);
      }
      Redis.awaitPing = false;
    }
    return pingOk;
  }

  public static close(): void {
    Redis.tryPing = true;
    Redis.awaitPing = false;
    if (Redis.databaseConn.value &&
      Redis.databaseConn.value.tedis != undefined) {
      Redis.databaseConn.value.tedis.close();
      Log.log(Redis.route, `🔶 Connection: Redis close 💀`);
    }
  }

}

