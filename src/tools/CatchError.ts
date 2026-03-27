import { Log, MergingObject } from "./Logger";
import { BadRequestResponse } from "./Response/BadRequestResponse";
import { ConflictResponse } from "./Response/ConflictResponse";
import { ForbiddenResponse } from "./Response/ForbiddenResponse";
import { InternalServerError } from "./Response/InternalServerError";
import { NotFoundResponse } from "./Response/NotFoundResponse";
import { UnauthorizedResponse } from "./Response/UnauthorizedResponse";

export class HttpError extends Error {
    status: number;
    constructor(status: number, message?: string) {
        super(message);
        this.status = status;
    }
}

export class ErrorBadRequest extends HttpError { constructor(message?: string) { super(400, message) } };
export class ErrorUnauthorized extends HttpError { constructor(message?: string) { super(401, message) } };
export class ErrorForbidden extends HttpError { constructor(message?: string) { super(403, message) } };
export class ErrorNotFound extends HttpError { constructor(message?: string) { super(404, message) } };
export class ErrorConflict extends HttpError { constructor(message?: string) { super(409, message) } };

const CatchError = (route: MergingObject, error: unknown): Response => {
    Log.error(route, error);
    if (error instanceof HttpError) {
        const { status, message } = error as HttpError;
        if (message) {
            return new Response(message, { status });
        }
        switch (status) {
            case 400: return BadRequestResponse();
            case 401: return UnauthorizedResponse();
            case 403: return ForbiddenResponse();
            case 404: return NotFoundResponse();
            case 409: return ConflictResponse();
        }
    }
    return InternalServerError(error);
}

export default CatchError;