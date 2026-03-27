import axios, { AxiosResponse } from "axios";
import { Log, MergingObject } from "../../tools/Logger";
import Basic from "../../tools/Auth/Basic";

export interface RawAxiosHeaders {
    [key: string]: string | string[] | number | boolean | null;
}

export default class Axios {

    private static token = "";
    static set Token(token: string) {
        this.token = token;
    }
    private static timeout: number | undefined = undefined;
    static set Timeout(millisecond: number | undefined) {
        this.timeout = millisecond;
    }

    private static authorization() {
        return (new Basic()).authorization(this.token);
    }

    /**
     * timeout error.code === 'ECONNABORTED'
     * Authorization header An RFC7235 compliant authorization header.
     */
    private static Config = (hearders?: RawAxiosHeaders | undefined) => (
        {
            timeout: this.timeout,
            headers:
                (this.token) ?
                    {
                        ...hearders,
                        Authorization: this.authorization()
                    }
                    : hearders
        }
    );

    static async Get<T>(route: MergingObject, url: string): Promise<T> {
        return (await this.get<T>(route, url)).data;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async get<T>(route: MergingObject, url: string, hearders?: RawAxiosHeaders | undefined): Promise<AxiosResponse<T, any>> {
        const conf = this.Config(hearders);
        Log.log({ ...route, url, conf: JSON.stringify(conf) }, `axios GET`);
        return (await axios.get<T, AxiosResponse<T>>(url,
            conf,
        ));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async Head<T>(route: MergingObject, url: string, hearders?: RawAxiosHeaders | undefined): Promise<AxiosResponse<T, any> | undefined> {
        Log.log({ ...route, url }, `axios HEAD`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let response: AxiosResponse<T, any> | undefined = undefined;
        try {
            response = (await axios.head<T, AxiosResponse<T>>(url, this.Config(hearders)));
        } catch (err: unknown) {
            Log.error(route, err);
        }
        return response;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async Delete<T>(route: MergingObject, url: string): Promise<AxiosResponse<T, any>> {
        Log.log({ ...route, url }, `axios DELETE`);
        return (await axios.delete<T, AxiosResponse<T>>(url, this.Config(),));
    }

}