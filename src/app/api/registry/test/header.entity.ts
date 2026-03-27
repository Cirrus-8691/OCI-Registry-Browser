import { AxiosResponse } from "axios";

export default interface HeaderEntity {
    content: {
        type: string;
        length: string; // header lenght
    };
    docker: {
        contentDigest?: string;
        distributionApiVersion: string;
    };
}

export const getHeader = (response: AxiosResponse<unknown> | undefined): HeaderEntity =>
    response
        ? {
            content: {
                type: response.headers["content-type"]?.toString() || "",
                length: response.headers["content-length"]?.toString() || "",
            },
            docker: {
                contentDigest: response.headers["docker-content-digest"] || "",
                distributionApiVersion: response.headers["docker-distribution-api-version"] || "",
            },
        }
        : {
            content: {
                type: "",
                length: "",
            },
            docker: {
                contentDigest: "",
                distributionApiVersion: "",
            },
        };

export interface RegistryIsValid {
    urlOk: boolean;
    gnUrlOk: boolean,
    distributionOk: boolean;
    distributionApiVersion: string;
    nameOk: boolean;
}

export const InvalidUrl: RegistryIsValid = {
    urlOk: false,
    gnUrlOk: false,
    distributionOk: false,
    distributionApiVersion: "",
    nameOk: false,
};

export const validateDistribution = (nameOk: boolean, header: HeaderEntity): RegistryIsValid => ({
    urlOk: true, // url is alway ok if we validateDistribution
    gnUrlOk: true, // url is alway ok if we validateDistribution
    distributionOk: header.docker.distributionApiVersion === "registry/2.0",
    distributionApiVersion: header.docker.distributionApiVersion,
    nameOk, // Name is validade on the other hand
});
