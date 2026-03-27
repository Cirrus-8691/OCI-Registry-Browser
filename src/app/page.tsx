"use client";

import styles from "./page.module.css";
import Image from "next/image";
import useApplicationContext, { UserIsNotConnected } from "./ApplicationContext";
import { useEffect, useState } from "react";
import Logo from "./components/Logo";
import { RegistryEntity, UndefinedRegistry } from "./api/registry/registry.entity";
import { DeleteApi, GetApi, PostApi } from "@/tools/FetchApi";
import { Button, Dropdown, DropdownButton, Form, InputGroup, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageSrc, LinkPagesHref } from "@/tools/Homepage-BasePath";
import { CreateAlert } from "./components/FlyingAlert";
import OffcanvasEditRegistry from "./dialog/OffcanvasEditRegistry";
import OrderByColumn, { OrderBy, sortRows, TableKeyOrder } from "./components/Tables/OrderByColumn";
import HeaderEntity, { InvalidUrl, RegistryIsValid, validateDistribution } from "./api/registry/test/header.entity";
import ConfirmDeleteRegistry from "./dialog/ConfirmDeleteRegistry";
import OffcanvasCreateRegistry from "./dialog/OffcanvasCreateRegistry";
import UserCan from "./components/UserCan";
import { ImageMeta } from "@/tools/RegistryUsage/RegistryUsage";
import RegistryIcone from "./components/RegistryIcone";
import { RegistryCredential, RegistryUser } from "@/tools/Auth/Auth";
import { SchemaTables } from "@/model/SchemaTables";
import FilterRows, { TableKeyFilter } from "./components/Tables/FilterRows";
import { useLocalStorage } from "./hooks/useLocalstorage";
import Copyright from "@/tools/Copyright";
import DialogImagePush from "./dialog/DialogImageHelpers/Push";
import { SmallIcone } from "./components/const";

export interface ValidRegistry {
    registry: RegistryEntity;
    valid?: RegistryIsValid;
}

export default function Home() {
    const { t } = useTranslation();
    const router = useRouter();
    const { fetchContext, setAlert, setRegistryCredential, userConnected } = useApplicationContext();

    const [registers, setRegisters] = useState<ValidRegistry[]>([]);
    useEffect(() => {
        const getRegistries = async () => {
            const result = await GetApi<RegistryEntity[]>(fetchContext, `registry`, t("Common.errors.identification"));
            if (result) {
                const registryList = result.map((registry) => ({ registry, valid: undefined }));
                setRegisters(registryList);

                // Redirection automatique si l'utilisateur n'a accès qu'à un seul registry
                if (userConnected.user.profile !== "admin" && registryList.length === 1) {
                    const uniqueRegistry = registryList[0].registry;
                    router.push(
                        LinkPagesHref(
                            `/registry?registryId=${uniqueRegistry.id}${
                                uniqueRegistry.user ? `&registryUser=${uniqueRegistry.user}` : ""
                            }`
                        )
                    );
                }
            } else {
                setRegisters([]);
            }
        };
        if (UserIsNotConnected(fetchContext)) {
            fetchContext.login();
        } else {
            getRegistries();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchContext.userConnected.tokens.auth]);

    const tableKey = "home";
    const [filter, setFilter] = useLocalStorage(TableKeyFilter(tableKey), "");
    const [sortBy, setSortBy] = useLocalStorage<OrderBy>(TableKeyOrder(tableKey), {
        column: "name",
        order: "ASC",
    });

    const validateUrl = async (credential: RegistryCredential) => {
        if (credential.toValidate && credential.api.url) {
            credential.toValidate.valid = { ...InvalidUrl };
            const result = await GetApi<HeaderEntity>(
                fetchContext,
                `registry/test?url=${encodeURIComponent(credential.api.url)}${
                    credential.api.timeout ? `&timeout=${credential.api.timeout}` : ""
                }${credential.token ? `&token=${encodeURIComponent(credential.token)}` : ""}`,
                t("Common.errors.CONNECTION_REFUSED", { url: credential.api.url })
            );
            if (result) {
                setAlert(
                    CreateAlert.success(
                        t("Common.errors.SUCESS_CONNECTION_OK", {
                            url: credential.api.url,
                            apiVersion: result.docker.distributionApiVersion,
                        })
                    )
                );
                credential.toValidate.valid = validateDistribution(credential.toValidate.valid.nameOk, result);
            }
        }
    };
    const checkUrl = async (toValidate: ValidRegistry) => {
        toValidate.valid = { ...InvalidUrl };
        if (!toValidate.registry.id) {
            setAlert(CreateAlert.error(t("Common.errors.CONNECTION_REFUSED", { url: toValidate.registry.url })));
        }
        let user: RegistryUser;
        if (toValidate.registry.user) {
            user = {
                name: toValidate.registry.user,
                password: "",
            };
        } else {
            user = { name: "", password: "" };
        }
        setRegistryCredential({
            user,
            api: {
                url: toValidate.registry.url,
                timeout: toValidate.registry.timeout,
            },
            action: validateUrl,
            toValidate,
        });
    };

    const [registryToEdit, setRegistryToEdit] = useState<ValidRegistry | undefined>(undefined);
    const updatedRegistry = (data: ValidRegistry) => {
        setRegisters((prevData) =>
            prevData.map((prevRegistry) => (prevRegistry.registry.id === data.registry.id ? data : prevRegistry))
        );
    };
    const [registryToDelete, setRegistryToDelete] = useState<ValidRegistry | undefined>(undefined);
    const confirmDeleteRegistry = async (value: boolean) => {
        if (registryToDelete && value) {
            const registryId = registryToDelete.registry.id;
            const ok = await DeleteApi(fetchContext, `registry?registryId=${registryId}`, t("Common.errors.delete"));
            if (ok) {
                setRegisters((prevData) => prevData.filter((prevRegistry) => prevRegistry.registry.id !== registryId));
            }
        }
        setRegistryToDelete(undefined);
    };
    const [registryToCreate, setRegistryToCreate] = useState<ValidRegistry | undefined>(undefined);
    const createRegistry = async () => {
        setRegistryToCreate({
            registry: UndefinedRegistry,
            valid: undefined,
        });
    };
    const createdRegistry = (data: ValidRegistry) => {
        setRegisters((prevData) => [...prevData, data]);
    };

    const cloneRegistry = async (toClone: ValidRegistry) => {
        const newRegistry = {
            ...toClone.registry,
        };
        newRegistry.name += "-copy";
        let vs = 0;
        while (registers.find((r) => r.registry.name === newRegistry.name)) {
            vs++;
            newRegistry.name = `${toClone.registry.name}-copy${vs}`;
        }
        const savedRegistryEntity = await PostApi<RegistryEntity>(
            fetchContext,
            `registry/create`,
            newRegistry,
            t("Common.errors.identification")
        );
        if (savedRegistryEntity) {
            const validRegistry: ValidRegistry = {
                registry: savedRegistryEntity,
                valid: toClone.valid,
            };
            createdRegistry(validRegistry);
            setRegistryToEdit(validRegistry);
        }
    };

    const [infos, setInfos] = useState<ImageMeta | undefined>(undefined);
    const hidePushImage = () => setInfos(undefined);
    const showHowToPushImage = (registryEntity: RegistryEntity) => {
        if (registryEntity) {
            setInfos({
                registry: {
                    name: registryEntity.name,
                    url: new URL(registryEntity.url),
                    gnUrl: registryEntity.gnUrl ? new URL(registryEntity.gnUrl) : undefined,
                    user: registryEntity.user,
                    type: registryEntity.type,
                },
                image: {
                    path: "",
                    name: "",
                    tag: "",
                },
            });
        }
    };

    if (registers.length < 1) {
        return null;
    }
    if (userConnected.user.profile !== "admin" && registers.length === 1) {
        return null;
    }

    return (
        <div className={styles.page}>
            <OffcanvasCreateRegistry
                data={registryToCreate}
                savedRegistry={createdRegistry}
                hide={() => setRegistryToCreate(undefined)}
            />
            <OffcanvasEditRegistry
                data={registryToEdit}
                savedRegistry={updatedRegistry}
                hide={() => setRegistryToEdit(undefined)}
            />
            <DialogImagePush infos={infos} hide={hidePushImage} />
            <ConfirmDeleteRegistry confirm={confirmDeleteRegistry} data={registryToDelete} />
            <main className={styles.main}>
                <Logo />
                <Form>
                    <InputGroup className="mb-3">
                        <Button variant="light">{Copyright.logo}</Button>
                        <InputGroup.Text>{t("Home.title")}</InputGroup.Text>
                    </InputGroup>
                    <UserCan action="insert" table={SchemaTables.Registry}>
                        <InputGroup className="mb-1">
                            <Button variant="light" onClick={createRegistry}>
                                <Image
                                    aria-hidden
                                    src={ImageSrc("add.svg")}
                                    alt="add"
                                    width={SmallIcone.width}
                                    height={SmallIcone.height}
                                />
                                &nbsp;
                                {t("CreateRegistry.title")}
                            </Button>
                        </InputGroup>
                    </UserCan>
                    <FilterRows tableKey={tableKey} setFilter={setFilter} filter={filter} />
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <OrderByColumn
                                    tableKey={tableKey}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    title="#"
                                    column="id"
                                />
                                <th>.</th>
                                <OrderByColumn
                                    tableKey={tableKey}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    title={t("Home.registry.name")}
                                    column="name"
                                />
                                <OrderByColumn
                                    tableKey={tableKey}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    title={t("Home.registry.type")}
                                    column="type"
                                />
                                <OrderByColumn
                                    tableKey={tableKey}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    title={t("Home.registry.url")}
                                    column="url"
                                />
                                <OrderByColumn
                                    tableKey={tableKey}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    title={t("Home.registry.path")}
                                    column="path"
                                />
                                <OrderByColumn
                                    tableKey={tableKey}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    title={t("Home.registry.user")}
                                    column="user"
                                />
                                <th>
                                    <Button variant="light" disabled>
                                        {t("Home.registry.details")}
                                    </Button>
                                </th>
                                <th>
                                    <Button variant="light" disabled>
                                        <Image
                                            aria-hidden
                                            src={ImageSrc("3dots.svg")}
                                            alt="..."
                                            width={SmallIcone.width}
                                            height={SmallIcone.height}
                                        />
                                    </Button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {registers
                                ?.filter(
                                    (data: ValidRegistry) =>
                                        data.registry.name?.includes(filter) || data.registry.url.includes(filter)
                                )
                                .sort((a, b) => sortRows(sortBy, a.registry, b.registry))
                                .map((data: ValidRegistry) => (
                                    <tr key={data.registry.id}>
                                        <td>{data.registry.id}</td>
                                        <td>
                                            {data.registry.iconUrl && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={data.registry.iconUrl} alt="." width={32} height={32} />
                                            )}
                                        </td>
                                        <td>{data.registry.name}</td>
                                        <td>
                                            <RegistryIcone type={data.registry.type} />
                                            &nbsp;
                                            {data.registry.type}
                                        </td>
                                        <td>
                                            {data.registry.url}
                                            {data.valid && (
                                                <>
                                                    <Image
                                                        aria-hidden
                                                        src={ImageSrc(`${data.valid.urlOk ? "success" : "danger"}.svg`)}
                                                        alt="V~X"
                                                        width={SmallIcone.width}
                                                        height={SmallIcone.height}
                                                    />
                                                    {data.valid.distributionApiVersion}
                                                    <Image
                                                        aria-hidden
                                                        src={ImageSrc(
                                                            `${data.valid.distributionOk ? "success" : "danger"}.svg`
                                                        )}
                                                        alt="V~X"
                                                        width={SmallIcone.width}
                                                        height={SmallIcone.height}
                                                    />
                                                </>
                                            )}
                                        </td>
                                        <td>{data.registry.path}</td>
                                        <td>{data.registry.user}</td>
                                        <td>
                                            <Link
                                                style={{
                                                    height: "100%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                                href={LinkPagesHref(
                                                    `/registry?registryId=${data.registry.id}${
                                                        data.registry.user ? `&registryUser=${data.registry.user}` : ""
                                                    }`
                                                )}
                                            >
                                                <Button variant="light">
                                                    <Image
                                                        aria-hidden
                                                        src={ImageSrc("window.svg")}
                                                        alt="window"
                                                        width={SmallIcone.width}
                                                        height={SmallIcone.height}
                                                    />
                                                </Button>
                                            </Link>
                                        </td>
                                        <td>
                                            <DropdownButton
                                                size="sm"
                                                variant="light"
                                                title={
                                                    <Image
                                                        aria-hidden
                                                        src={ImageSrc("3dots.svg")}
                                                        alt="..."
                                                        width={SmallIcone.width}
                                                        height={SmallIcone.height}
                                                    />
                                                }
                                            >
                                                <Dropdown.Item onClick={() => checkUrl(data)}>
                                                    <Image
                                                        aria-hidden
                                                        src={ImageSrc("icon_success.svg")}
                                                        alt="sucess"
                                                        width={SmallIcone.width}
                                                        height={SmallIcone.height}
                                                    />
                                                    &nbsp;{t("Home.registry.checkUrl")}
                                                </Dropdown.Item>
                                                <UserCan action="update" table={SchemaTables.Registry}>
                                                    <Dropdown.Item onClick={() => setRegistryToEdit(data)}>
                                                        <Image
                                                            aria-hidden
                                                            src={ImageSrc("edit.svg")}
                                                            alt="edit"
                                                            width={SmallIcone.width}
                                                            height={SmallIcone.height}
                                                        />
                                                        &nbsp;{t("Home.registry.edit")}
                                                    </Dropdown.Item>
                                                </UserCan>
                                                <Dropdown.Item onClick={() => showHowToPushImage(data.registry)}>
                                                    <Image
                                                        aria-hidden
                                                        src={ImageSrc("upload.svg")}
                                                        alt="upload"
                                                        width={SmallIcone.width}
                                                        height={SmallIcone.height}
                                                    />
                                                    &nbsp;{t("Home.registry.upload")}
                                                </Dropdown.Item>
                                                <UserCan action="insert" table={SchemaTables.Registry}>
                                                    <Dropdown.Divider />
                                                    <Dropdown.Item onClick={() => cloneRegistry(data)}>
                                                        <Image
                                                            aria-hidden
                                                            src={ImageSrc("copy.svg")}
                                                            alt="copy"
                                                            width={SmallIcone.width}
                                                            height={SmallIcone.height}
                                                        />
                                                        &nbsp;{t("Home.registry.clone")}
                                                    </Dropdown.Item>
                                                </UserCan>
                                                <UserCan action="delete" table={SchemaTables.Registry}>
                                                    <Dropdown.Divider />
                                                    <Dropdown.Item onClick={() => setRegistryToDelete(data)}>
                                                        <Image
                                                            aria-hidden
                                                            src={ImageSrc("trash.svg")}
                                                            alt="trash"
                                                            width={SmallIcone.width}
                                                            height={SmallIcone.height}
                                                        />
                                                        &nbsp;{t("Home.registry.delete")}
                                                    </Dropdown.Item>
                                                </UserCan>
                                            </DropdownButton>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </Form>
            </main>
        </div>
    );
}
