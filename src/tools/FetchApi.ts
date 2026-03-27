import { CreateAlert } from "@/app/components/FlyingAlert";
import { ApiPath } from "./Homepage-BasePath";
import { FetchContext } from "@/app/ApplicationContext";
import { UserConnected } from "@/app/api/user/entites/user.entity";

const FetchApi = async <Data>(
    fetchContext: FetchContext,
    url: string,
    init?: RequestInit,
    stdErrorMessage?: string,
): Promise<Data | undefined> => {
    let data: Data | undefined = undefined;
    try {
        const response = await fetch(ApiPath(url), init);
        if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await response.json() as Data;
            }
            if (contentType && contentType.includes("text/plain")) {
                data = (await response.text()) as Data;
            }
        } else {
            switch (response.status) {
                case 401: // Unauthorized
                    if (init && init.headers && fetchContext.userConnected.tokens) {
                        // try to renew 
                        const responseNewToken = await fetch(ApiPath(`/user/signin`), {
                            headers: renewHeaders(fetchContext)
                        },);
                        if (responseNewToken.ok) {
                            const userConnected = await responseNewToken.json() as UserConnected;
                            fetchContext.setUserConnected(userConnected);
                            fetchContext.userConnected = userConnected;
                            return await FetchApi<Data>(fetchContext, url, {
                                headers: headers(fetchContext)
                            }, stdErrorMessage);
                        }
                        else {
                            fetchContext.setAlert(CreateAlert.error(response.status));
                            fetchContext.login();
                        }
                    }
                    break;
                case 403: // Forbidden;
                case 409: // Conflict
                    fetchContext.setAlert(CreateAlert.error(response.status));
                    break;
                
                default:
                    fetchContext.setAlert(
                        CreateAlert.error(
                            stdErrorMessage ? stdErrorMessage : 500
                        )
                    );
            }
            data = undefined;
        }
    } catch (error: unknown) {
        fetchContext.setAlert(CreateAlert.error(error));
        data = undefined;
    }
    return data;
};

const renewHeaders = (fetchContext: FetchContext) => {
    return fetchContext.userConnected.tokens.renew
        ? { Authorization: `Bearer ${fetchContext.userConnected.tokens.renew}` }
        : undefined;
};
const headers = (fetchContext: FetchContext) => {
    return fetchContext.userConnected.tokens.auth
        ? { Authorization: `Bearer ${fetchContext.userConnected.tokens.auth}` }
        : undefined;
};

export const GetApi = async <Data>(
    context: FetchContext,
    url: string,
    stdErrorMessage?: string,
): Promise<Data | undefined> => {
    return await FetchApi<Data>(
        context,
        url,
        {
            headers: headers(context)
        },
        stdErrorMessage,
    );
};

export const PostApi = async <Data>(
    context: FetchContext,
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any,
    stdErrorMessage?: string
): Promise<Data | undefined> => {
    return await FetchApi<Data>(
        context,
        url,
        {
            method: "POST",
            headers: headers(context),
            body: payload ? JSON.stringify(payload) : undefined
        },
        stdErrorMessage
    );
};

export const PatchApi = async <Data>(
    context: FetchContext,
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any,
    stdErrorMessage?: string
): Promise<Data | undefined> => {
    return await FetchApi<Data>(
        context,
        url,
        {
            method: "PATCH",
            headers: headers(context),
            body: payload ? JSON.stringify(payload) : undefined
        },
        stdErrorMessage
    );
};

export const DeleteApi = async <Data>(
    context: FetchContext,
    url: string,
    stdErrorMessage?: string
): Promise<Data | undefined> => {
    return await FetchApi<Data>(
        context,
        url,
        {
            method: "DELETE",
            headers: headers(context),
        },
        stdErrorMessage
    );
};