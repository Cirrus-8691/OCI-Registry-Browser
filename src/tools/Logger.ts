import { AxiosError, isAxiosError } from "axios";
import { NextRequest } from "next/server";

export type Verb = "GET" | "POST" | "TEST";
export type Level = "INF" | "WRN" | "ERR";
import { v4 as uuidv4 } from "uuid";

export interface MergingObject {
    verb: Verb;
    userId?: string;
    function?: string;
    path?: string;
    requestId?: string;
    [column: string]: string | undefined;
}

export const TestNotAroute = (userId: number, fn: string): MergingObject => ({
    verb: "TEST",
    userId: userId > 0 ? userId.toString() : undefined,
    function: fn,
});

interface Logger {
    error(route: MergingObject, err: unknown): void;
    warn(route: MergingObject, message: string): void;
    log(route: MergingObject, message: string): void;
}

export class BaseLogger implements Logger {
    private isLoggable(level: Level): boolean {
        const maxLevel = process.env.LOG_LEVEL ?? "INF";
        switch (maxLevel) {
            case "INF":
                return true;
            case "WRN":
                return level === "ERR" || level === "WRN";
            case "ERR":
                return level === "ERR";
            case "SILENCE":
                return false;
            default:
                throw new Error(`Invalide LOG_LEVEL=${maxLevel}`);
        }
    }

    private redact(route: MergingObject, level: Level, msg: string) {
        let icon = "ℹ️ ";
        switch (level) {
            case "WRN":
                icon = "⚠️";
                break;
            case "ERR":
                icon = "🔥";
                break;
        }
        // anonymise email
        if (route.email) {
            const [localPart, domain] = route.email.split("@");
            route.email = `${localPart[0]}***@${domain ?? "❌ undefined"}`;
        }
        if (route.password) {
            route.password = "********";
        }
        return JSON.stringify({ icon, ...route, msg });
    }

    error(route: MergingObject, err: unknown): void {
        if (this.isLoggable("ERR")) {
            if (typeof err === "string") {
                console.log(this.redact(route, "ERR", err as string));
            } else if (err instanceof AggregateError) {
                const errors = (err as AggregateError).errors;
                for(const error of errors) {
                    console.log(this.redact(route, "ERR", error));
                }
            } else if (err instanceof Error) {
                console.log(this.redact(route, "ERR", (err as Error).message));
            } else {
                console.log(this.redact(route, "ERR", ""));
                console.error(err);
            }
        }
    }

    log(route: MergingObject, message: string): void {
        if (this.isLoggable("INF")) {
            console.log(this.redact(route, "INF", message));
        }
    }

    warn(route: MergingObject, message: string): void {
        if (this.isLoggable("WRN")) {
            console.log(this.redact(route, "WRN", message));
        }
    }
}

export class Log {
    private static logger: Logger = new BaseLogger();

    constructor(logger?: Logger) {
        if (logger) {
            Log.logger = logger;
        }
    }

    static error(route: MergingObject, err: unknown) {
        Log.logger.error(route, err);
        if (err && isAxiosError(err)) {
            const axiosError = err as AxiosError;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = axiosError.response?.data as any;
            if (data && data.errors) {
                Log.logger.error(route, data.errors[0]);
            }
        }
    }

    static log(route: MergingObject, message: string) {
        Log.logger.log(route, message);
    }

    static warn(route: MergingObject, message: string) {
        Log.logger.warn(route, message);
    }

    static logRoute(request: NextRequest): MergingObject {
        const route = {
            verb: request.method as Verb,
            userId: undefined,
            path: request.nextUrl.pathname,
            requestId: uuidv4().substring(0, 6),
        };
        const searchParams = request.nextUrl.searchParams ? request.nextUrl.searchParams.toString() : "";
        this.logger.log(route, decodeURIComponent(searchParams));

        return route;
    }

    static logResponse(route: MergingObject, response: Response) {
        if (response.status >= 300) {
            Log.logger.error(route, `Err: ${response.status} msg:${response.statusText}`);
        }
        else {
            Log.logger.warn(route, `Ok: ${response.status} msg:${response.statusText}`);
        }
        return response;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static debug(route: MergingObject, name: string, value: any) {
        Log.logger.log(route, `${name}: ${JSON.stringify(value)}` );
    }
}
