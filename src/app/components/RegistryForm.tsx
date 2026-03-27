import { Button, FloatingLabel, Form, InputGroup } from "react-bootstrap";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { ChangeEvent } from "react";
import useApplicationContext from "../ApplicationContext";
import { CreateAlert } from "./FlyingAlert";
import { GetApi } from "@/tools/FetchApi";
import HeaderEntity, { InvalidUrl, validateDistribution } from "../api/registry/test/header.entity";
import { ValidRegistry } from "../page";
import { RegistryType } from "../api/registry/registry.entity";
import RegistryIcone from "./RegistryIcone";
import { RegistryCredential, RegistryUser } from "@/tools/Auth/Auth";
import { ImageSrc } from "@/tools/Homepage-BasePath";
import ApplicationSettings from "@/tools/ApplicationSettings";
import { SmallIcone } from "./const";

/*
 A lowercase RFC 1123 label must consist of lower case alphanumeric characters or '-', and must start and end with an alphanumeric character
// and must be no more than 61 characters
*/
export const NameRegex = /^[a-z][a-z0-9-]{0,61}[a-z0-9]$/;

const RegistryForm = ({
    simple = false,
    data,
    setRegistry,
}: {
    simple?: boolean;
    data: ValidRegistry | undefined;
    setRegistry: React.Dispatch<React.SetStateAction<ValidRegistry | undefined>>;
}) => {
    const { t } = useTranslation();
    const { fetchContext, setAlert, setRegistryCredential } = useApplicationContext();

    const nameChange = (event: ChangeEvent<HTMLInputElement>) => {
        const name = event.target.value;
        const nameOk = NameRegex.test(name);
        setRegistry((prevRegistry) => {
            if (prevRegistry) {
                return {
                    registry: { ...prevRegistry.registry, name },
                    valid: {
                        urlOk: false,
                        gnUrlOk: false,
                        distributionOk: false,
                        distributionApiVersion: "",
                        nameOk,
                    },
                };
            }
        });
    };
    const setInput = (field: string, value: string) => {
        setRegistry((prevRegistry) => {
            if (prevRegistry) {
                return {
                    registry: {
                        ...prevRegistry.registry,
                        [field]: value,
                    },
                    valid: prevRegistry.valid,
                };
            }
        });
    };

    const userChange = (event: ChangeEvent<HTMLInputElement>) => setInput("user", event.target.value);
    const iconUrlChange = (event: ChangeEvent<HTMLInputElement>) => setInput("iconUrl", event.target.value);
    const timeoutChange = (event: ChangeEvent<HTMLInputElement>) => setInput("timeout", event.target.value);
    const pathChange = (event: ChangeEvent<HTMLInputElement>) => setInput("path", event.target.value);
    const excludePathsChange = (event: ChangeEvent<HTMLInputElement>) => setInput("excludePaths", event.target.value);

    const urlChange = (event: ChangeEvent<HTMLInputElement>) => {
        setRegistry((prevRegistry) => {
            if (prevRegistry) {
                return {
                    registry: {
                        ...prevRegistry.registry,
                        url: event.target.value,
                    },
                    valid: {
                        ...InvalidUrl,
                        nameOk: prevRegistry.valid?.nameOk ?? false,
                    },
                };
            }
        });
    };
    const gnUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
        setRegistry((prevRegistry) => {
            if (prevRegistry) {
                return {
                    registry: {
                        ...prevRegistry.registry,
                        gnUrl: event.target.value,
                    },
                    valid: {
                        ...InvalidUrl,
                        nameOk: prevRegistry.valid?.nameOk ?? false,
                    },
                };
            }
        });
    };

    const typeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setRegistry((prevRegistry) => {
            if (prevRegistry) {
                return {
                    registry: {
                        ...prevRegistry.registry,
                        type: event.target.value as RegistryType,
                    },
                    valid: {
                        ...InvalidUrl,
                        nameOk: prevRegistry.valid?.nameOk ?? false,
                    },
                };
            }
        });
    };

    const validateUrl = async (credential: RegistryCredential) => {
        if (credential.toValidate && credential.api.url) {
            const nameOk = NameRegex.test(credential.toValidate.registry.name);
            credential.toValidate.valid = { ...InvalidUrl, nameOk };
            const result = await GetApi<HeaderEntity>(
                fetchContext,
                `registry/test?url=${encodeURIComponent(credential.api.url)}${
                    credential.api.timeout ? `&timeout=${credential.api.timeout}` : ""
                }${credential.token ? `&token=${encodeURIComponent(credential.token)}` : ""}`,
                t("Common.errors.CONNECTION_REFUSED", { url: credential.api.url })
            );
            setRegistryCredential({
                user: { name: "", password: "" },
                api: { url: "", timeout: undefined },
                action: async () => {},
            });
            if (result) {
                if (credential.api.gnUrl) {
                    await GetApi<HeaderEntity>(
                        fetchContext,
                        `registry/test?url=${encodeURIComponent(credential.api.gnUrl)}${
                            credential.api.timeout ? `&timeout=${credential.api.timeout}` : ""
                        }${credential.token ? `&token=${encodeURIComponent(credential.token)}` : ""}`,
                        t("Common.errors.CONNECTION_REFUSED", { url: credential.api.gnUrl })
                    );
                }
                setAlert(
                    CreateAlert.success(
                        t("Common.errors.SUCESS_CONNECTION_OK", {
                            url: credential.api.url,
                            apiVersion: result.docker.distributionApiVersion,
                        })
                    )
                );
                credential.toValidate.valid = validateDistribution(nameOk, result);
            }
        }
    };

    const checkUrl = async () => {
        if (!data) {
            setAlert(CreateAlert.error(t("Common.errors.CONNECTION_REFUSED", { url: "" })));
        } else {
            let user: RegistryUser;
            if (data.registry.user) {
                user = {
                    name: data.registry.user,
                    password: "",
                };
            } else {
                user = { name: "", password: "" };
            }
            setRegistryCredential({
                user,
                api: {
                    url: data.registry.url,
                    timeout: data.registry.timeout,
                    gnUrl: data.registry.gnUrl,
                },
                action: validateUrl,
                toValidate: data,
            });
        }
    };

    return (
        <>
            {data && (
                <>
                    <Form.Label>{t("RegistryEntity.ociRegistry")}</Form.Label>
                    <Form.Group className="mb-3">
                        <FloatingLabel label={t("RegistryEntity.registry.name")}>
                            <Form.Control
                                type="text"
                                required
                                placeholder={t("RegistryEntity.registry.name")}
                                onChange={nameChange}
                                defaultValue={data.registry.name}
                                isInvalid={!data.valid?.nameOk}
                            />
                        </FloatingLabel>
                        <Form.Label style={{ fontSize: "0.75rem", color: "red" }}>
                            {!data.valid?.nameOk ? t("RegistryEntity.registry.namePoliciy") : ""}
                        </Form.Label>
                    </Form.Group>
                    {!simple && (
                        <InputGroup className="mb-3">
                            <RegistryIcone size={56} type={data.registry.type} />
                            &nbsp;
                            <FloatingLabel label={t("RegistryEntity.registry.type") + " *"}>
                                <Form.Select size="sm" required onChange={typeChange} defaultValue={data.registry.type}>
                                    <option value="docker">Docker</option>
                                    <option value="helm">Helm</option>
                                    <option value="oci">Generic OCI</option>
                                </Form.Select>
                            </FloatingLabel>
                        </InputGroup>
                    )}
                    <FloatingLabel label={t("RegistryEntity.registry.url") + " *"}>
                        <Form.Control
                            type="url"
                            required
                            placeholder={t("RegistryEntity.registry.url") + " *"}
                            onChange={urlChange}
                            defaultValue={data.registry.url}
                            isValid={data.valid?.urlOk}
                        />
                    </FloatingLabel>
                    {ApplicationSettings.RunningOnK8s && (
                        <FloatingLabel label={t("RegistryEntity.registry.gnUrl")}>
                            <Form.Control
                                type="url"
                                required
                                placeholder={t("RegistryEntity.registry.gnUrl")}
                                onChange={gnUrlChange}
                                defaultValue={data.registry.gnUrl}
                                isValid={data.valid?.gnUrlOk}
                            />
                        </FloatingLabel>
                    )}
                    <FloatingLabel label={t("RegistryEntity.registry.path")}>
                        <Form.Control
                            type="url"
                            placeholder={t("RegistryEntity.registry.path")}
                            onChange={pathChange}
                            defaultValue={data.registry.path}
                            isValid={data.registry.path ? !data.registry.path.endsWith("/") : true}
                            isInvalid={data.registry.path ? data.registry.path.endsWith("/") : false}
                        />
                    </FloatingLabel>

                    <FloatingLabel label={t("RegistryEntity.registry.excludePaths")}>
                        <Form.Control
                            type="url"
                            placeholder={t("RegistryEntity.registry.excludePaths")}
                            onChange={excludePathsChange}
                            defaultValue={data.registry.excludePaths}
                            isValid={data.registry.excludePaths ? !data.registry.excludePaths.endsWith("/") : true}
                            isInvalid={data.registry.excludePaths ? data.registry.excludePaths.endsWith("/") : false}
                        />
                    </FloatingLabel>

                    {!simple && (
                        <FloatingLabel label={t("RegistryEntity.registry.timeout")}>
                            <Form.Control
                                type="number"
                                placeholder={t("RegistryEntity.registry.timeout")}
                                onChange={timeoutChange}
                                defaultValue={data.registry.timeout}
                                isValid={data.registry.timeout ? data.registry.timeout > 100 : undefined}
                                isInvalid={data.registry.timeout ? data.registry.timeout < 100 : undefined}
                            />
                        </FloatingLabel>
                    )}
                    <FloatingLabel label={t("RegistryEntity.registry.user")}>
                        <Form.Control
                            type="text"
                            placeholder={t("RegistryEntity.registry.user")}
                            onChange={userChange}
                            defaultValue={data.registry.user}
                            isValid={data.registry.user ? data.valid?.urlOk : true}
                            isInvalid={data.registry.user ? !data.valid?.urlOk : false}
                        />
                    </FloatingLabel>
                    {!simple && (
                        <>
                            <InputGroup className="mb-3">
                                <Button variant="info" disabled={data.registry.url === ""} onClick={() => checkUrl()}>
                                    <Image
                                        aria-hidden
                                        src={ImageSrc("icon_success.svg")}
                                        alt="..."
                                        width={SmallIcone.width}
                                        height={SmallIcone.height}
                                    />
                                    &nbsp;{t("RegistryEntity.registry.checkUrl")}
                                </Button>
                                <InputGroup.Text>{t("Common.apiVersion")}</InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    disabled
                                    defaultValue={data.valid?.distributionApiVersion}
                                    isValid={data.valid?.distributionOk}
                                    isInvalid={data.valid ? !data.valid.distributionOk : undefined}
                                />
                            </InputGroup>
                            <InputGroup className="mb-3">
                                <FloatingLabel label={t("RegistryEntity.registry.iconUrl")}>
                                    <Form.Control
                                        type="url"
                                        required
                                        placeholder={t("RegistryEntity.registry.iconUrl")}
                                        onChange={iconUrlChange}
                                        defaultValue={data.registry.iconUrl}
                                    />
                                </FloatingLabel>
                                <InputGroup.Text>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={data.registry.iconUrl} alt="ico" width={32} height={32} />
                                </InputGroup.Text>
                            </InputGroup>
                        </>
                    )}
                </>
            )}
        </>
    );
};

export default RegistryForm;
