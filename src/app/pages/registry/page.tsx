"use client";

import styles from "../../page.module.css";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { GetApi } from "@/tools/FetchApi";
import { Button, Dropdown, DropdownButton, Form, InputGroup, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { ImageSrc, LinkPagesHref } from "@/tools/Homepage-BasePath";
import Logo from "@/app/components/Logo";
import useApplicationContext, { UserIsNotConnected } from "@/app/ApplicationContext";
import { useSearchParams } from "next/navigation";
import { ExtendedCatalogEntity, Repository } from "@/app/api/repository/repository.entity";
import OrderByColumn, { OrderBy, sortRows, TableKeyOrder } from "@/app/components/Tables/OrderByColumn";
import HeaderEntity, { InvalidUrl, validateDistribution } from "@/app/api/registry/test/header.entity";
import UserCan from "@/app/components/UserCan";
import { CreateAlert } from "@/app/components/FlyingAlert";
import OffcanvasEditRegistry from "@/app/dialog/OffcanvasEditRegistry";
import OffcanvasEditRepository from "@/app/dialog/OffcanvasEditRepository";
import { ValidRegistry } from "@/app/page";
import { EmptyImageMeta, ImageMeta } from "@/tools/RegistryUsage/RegistryUsage";
import BreadcrumbTrail from "@/app/components/BreadcrumbTrail";
import RegistryIcone from "@/app/components/RegistryIcone";
import { RegistryCredential, RegistryUser } from "@/tools/Auth/Auth";
import { NameRegex } from "@/app/components/RegistryForm";
import { SchemaTables } from "@/model/SchemaTables";
import FilterRows, { TableKeyFilter } from "@/app/components/Tables/FilterRows";
import { useLocalStorage } from "@/app/hooks/useLocalstorage";
import DialogImagePull from "@/app/dialog/DialogImageHelpers/Pull";
import DialogImagePush from "@/app/dialog/DialogImageHelpers/Push";
import DialogImageRun from "@/app/dialog/DialogImageHelpers/Run";
import { SmallIcone } from "@/app/components/const";
import { RegistryUsages } from "@/tools/RegistryUsage/RegistryUsages";
import { Rating } from "@/app/components/Rating";

const getMetaInfos = (catalog: ExtendedCatalogEntity): ImageMeta => ({
    registry: {
        name: catalog.registry.name,
        url: new URL(catalog.registry.url),
        gnUrl: catalog.registry.gnUrl ? new URL(catalog.registry.gnUrl) : undefined,
        user: catalog.registry.user,
        type: catalog.registry.type,
    },
    image: EmptyImageMeta,
});

function Registry_() {
    const { t } = useTranslation();
    const { fetchContext, setAlert, setRegistryCredential } = useApplicationContext();
    const searchParams = useSearchParams();
    const registryId = searchParams.get("registryId");
    const [registryCredentials, setRegistryCredentials] = useState(searchParams.get("registryUser"));

    const [catalog, setCatalog] = useState<ExtendedCatalogEntity | undefined>(undefined);
    const [validRegistry, setValidRegistry] = useState<ValidRegistry | undefined>(undefined);

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
            if (result) {
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
        if (!catalog) {
            setAlert(CreateAlert.error(t("Common.errors.CONNECTION_REFUSED", { url: "" })));
        } else {
            let user: RegistryUser;
            if (catalog.registry.user) {
                user = {
                    name: catalog.registry.user,
                    password: "",
                };
            } else {
                user = { name: "", password: "" };
            }
            setRegistryCredential({
                user,
                api: {
                    url: catalog.registry.url,
                    timeout: catalog.registry.timeout,
                },
                action: validateUrl,
                toValidate: validRegistry,
            });
        }
    };

    const requestCatalog = async (credential: RegistryCredential) => {
        const result = await GetApi<ExtendedCatalogEntity>(
            fetchContext,
            `registry/catalog?registryId=${registryId}${
                credential.token ? `&token=${encodeURIComponent(credential.token)}` : ""
            }`,
            t("Common.errors.identification")
        );
        if (result) {
            setCatalog(result);
            if (result.header) {
                const nameOk = NameRegex.test(result.registry.name);
                setValidRegistry({
                    registry: result.registry,
                    valid: validateDistribution(nameOk, result.header),
                });
            } else {
                setAlert(CreateAlert.error(t("Common.errors.CONNECTION_REFUSED", { url: result.registry.url })));
            }
        }
    };

    const getCatalog = async () => {
        setValidRegistry({
            registry: { name: "", url: "", type: "oci" },
            valid: { ...InvalidUrl },
        });
        let user: RegistryUser;
        if (registryCredentials) {
            user = {
                name: registryCredentials,
                password: "",
            };
        } else {
            user = { name: "", password: "" };
        }
        setRegistryCredential({
            user,
            action: requestCatalog,
        });
    };

    useEffect(() => {
        if (UserIsNotConnected(fetchContext)) {
            fetchContext.login();
        } else {
            if (registryId) {
                getCatalog();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [registryId]);

    const tableKey = "registry";
    const [filter, setFilter] = useLocalStorage(TableKeyFilter(tableKey), "");
    const [sortBy, setSortBy] = useLocalStorage<OrderBy>(TableKeyOrder(tableKey), {
        column: "repository",
        order: "ASC",
    });

    const [registryToEdit, setRegistryToEdit] = useState<ValidRegistry | undefined>(undefined);
    const updateRegistry = () => {
        if (catalog) {
            setRegistryToEdit({
                registry: catalog.registry,
                valid: validRegistry?.valid,
            });
        }
    };
    const updatedRegistry = (data: ValidRegistry) => {
        if (data) {
            setRegistryCredentials(data.registry.user ?? null);
            getCatalog();
        }
    };
    const [infosPull, setInfosPull] = useState<ImageMeta | undefined>(undefined);
    const hidePullImage = () => setInfosPull(undefined);
    const showHowToPullImage = () => {
        if (catalog) {
            setInfosPull(getMetaInfos(catalog));
        }
    };
    const [infosPush, setInfosPush] = useState<ImageMeta | undefined>(undefined);
    const hidePushImage = () => setInfosPush(undefined);
    const showHowToPushImage = () => {
        if (catalog) {
            setInfosPush(getMetaInfos(catalog));
        }
    };
    const [infosRun, setInfosRun] = useState<ImageMeta | undefined>(undefined);
    const hideRunImage = () => setInfosRun(undefined);
    const showHowToPushRun = () => {
        if (catalog) {
            setInfosRun(getMetaInfos(catalog));
        }
    };

    const hasRunSupport = catalog ? RegistryUsages(getMetaInfos(catalog)).some((rt) => rt.CanRun) : false;
    const [editRepo, setEditRepo] = useState<Repository | undefined>(undefined);
    const updatedRepository = (data: Repository) => {
        if (catalog && data) {
            setCatalog({
                ...catalog,
                repositories: catalog.repositories.map((repo) => (repo.repository === data.repository ? data : repo)),
            });
        }
    };

    return (
        <div className={styles.page}>
            <DialogImagePull infos={infosPull} hide={hidePullImage} />
            <DialogImagePush infos={infosPush} hide={hidePushImage} />
            <DialogImageRun infos={infosRun} hide={hideRunImage} />
            <OffcanvasEditRegistry
                data={registryToEdit}
                savedRegistry={updatedRegistry}
                hide={() => setRegistryToEdit(undefined)}
            />
            <OffcanvasEditRepository
                registry={catalog?.registry}
                data={editRepo}
                savedRepository={updatedRepository}
                hide={() => setEditRepo(undefined)}
            />
            <BreadcrumbTrail title={t("Registry.title")}></BreadcrumbTrail>
            <main className={styles.main}>
                <Logo image="registry" />
                {catalog && (
                    <Form>
                        {/* Catalog */}
                        <InputGroup className="mb-1">
                            <InputGroup.Text>{t("Registry.title")}</InputGroup.Text>
                            {catalog.registry.iconUrl && (
                                <Button variant="light">
                                    {/* eslint-disable-next-line @next/next/no-img-element*/}
                                    <img src={catalog.registry.iconUrl} alt="." width={28} height={28} />
                                </Button>
                            )}
                            <Form.Control disabled value={catalog.registry.name} />
                            <InputGroup.Text>{t("Common.apiVersion")}</InputGroup.Text>
                            <Form.Control
                                type="tag"
                                disabled
                                isValid={validRegistry?.valid?.distributionOk}
                                isInvalid={
                                    validRegistry && validRegistry.valid
                                        ? !validRegistry.valid.distributionOk
                                        : undefined
                                }
                                value={validRegistry?.valid?.distributionApiVersion}
                            />
                        </InputGroup>
                        {/* URL */}
                        <InputGroup className="mb-1">
                            <InputGroup.Text>{t("Registry.url")}</InputGroup.Text>
                            <Form.Control
                                disabled
                                value={catalog.registry.url}
                                isValid={validRegistry?.valid?.urlOk}
                                isInvalid={
                                    validRegistry && validRegistry.valid ? !validRegistry.valid.urlOk : undefined
                                }
                            />
                            <InputGroup.Text>{t("Registry.type")}</InputGroup.Text>
                            <Button variant="light">
                                <RegistryIcone type={catalog.registry.type} />
                            </Button>
                            <Form.Control disabled value={catalog.registry.type} />
                        </InputGroup>
                        {/* Type */}
                        <InputGroup className="mb-3">
                            {catalog.registry.path && (
                                <>
                                    <InputGroup.Text>{t("Registry.path")}</InputGroup.Text>
                                    <Form.Control disabled value={catalog.registry.path} />
                                </>
                            )}
                            {catalog.registry.excludePaths && (
                                <>
                                    <InputGroup.Text>{t("Registry.excludePaths")}</InputGroup.Text>
                                    <Form.Control disabled value={catalog.registry.excludePaths} />
                                </>
                            )}
                            <Button variant="info" onClick={checkUrl}>
                                <Image
                                    aria-hidden
                                    src={ImageSrc("icon_success.svg")}
                                    alt="success"
                                    width={SmallIcone.width}
                                    height={SmallIcone.height}
                                />
                                &nbsp;
                                {t("Registry.checkUrl")}
                            </Button>
                        </InputGroup>
                        {/* Buttons */}
                        <InputGroup className="mb-1">
                            <Button variant="light" onClick={getCatalog}>
                                <Image
                                    aria-hidden
                                    src={ImageSrc("refresh.svg")}
                                    alt="refresh"
                                    width={SmallIcone.width}
                                    height={SmallIcone.height}
                                />
                                &nbsp;
                                {t("Registry.refresh")}
                            </Button>
                            &nbsp;
                            <UserCan action="update" table={SchemaTables.Registry}>
                                <Button variant="light" onClick={updateRegistry}>
                                    <Image
                                        aria-hidden
                                        src={ImageSrc("edit.svg")}
                                        alt="edit"
                                        width={SmallIcone.width}
                                        height={SmallIcone.height}
                                    />
                                    &nbsp;
                                    {t("Registry.update")}
                                </Button>
                            </UserCan>
                            &nbsp;
                            <Button variant="light" onClick={showHowToPushImage}>
                                <Image
                                    aria-hidden
                                    src={ImageSrc("upload.svg")}
                                    alt="upload"
                                    width={SmallIcone.width}
                                    height={SmallIcone.height}
                                />
                                &nbsp;
                                {t("Home.registry.upload")}
                            </Button>
                            &nbsp;
                            <Button variant="light" onClick={showHowToPullImage}>
                                <Image
                                    aria-hidden
                                    src={ImageSrc("download.svg")}
                                    alt="download"
                                    width={SmallIcone.width}
                                    height={SmallIcone.height}
                                />
                                &nbsp;
                                {t("Repository.howToDownload")}
                            </Button>
                            &nbsp;
                            {hasRunSupport && (
                                <Button variant="light" onClick={showHowToPushRun}>
                                    <Image
                                        aria-hidden
                                        src={ImageSrc("run.svg")}
                                        alt="download"
                                        width={SmallIcone.width}
                                        height={SmallIcone.height}
                                    />
                                    &nbsp;
                                    {t("Repository.howToRun")}
                                </Button>
                            )}
                        </InputGroup>

                        <FilterRows tableKey={tableKey} setFilter={setFilter} filter={filter} />
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <OrderByColumn
                                        tableKey={tableKey}
                                        sortBy={sortBy}
                                        setSortBy={setSortBy}
                                        title={t("Repository.path")}
                                        column="path"
                                    />
                                    <OrderByColumn
                                        tableKey={tableKey}
                                        sortBy={sortBy}
                                        setSortBy={setSortBy}
                                        title={t("Repository.title")}
                                        column="name"
                                    />
                                    <OrderByColumn
                                        tableKey={tableKey}
                                        sortBy={sortBy}
                                        setSortBy={setSortBy}
                                        title={t("Repository.rating")}
                                        column="rating"
                                    />
                                    <OrderByColumn
                                        tableKey={tableKey}
                                        sortBy={sortBy}
                                        setSortBy={setSortBy}
                                        title={t("Repository.description")}
                                        column="description"
                                    />
                                    <th>
                                        <Button variant="light" disabled>
                                            {t("Registry.tags")}
                                        </Button>
                                    </th>
                                    <th>
                                        <Button variant="light" disabled>
                                            <Image
                                                aria-hidden
                                                src={ImageSrc("3dots.svg")}
                                                alt="file"
                                                width={SmallIcone.width}
                                                height={SmallIcone.height}
                                            />
                                        </Button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {catalog.repositories
                                    ?.filter((repo: Repository) => repo.repository.includes(filter))
                                    .map((repo: Repository) => ({
                                        repository: repo.repository,
                                        path: repo.repository.includes("/")
                                            ? "1" + repo.repository.substring(0, repo.repository.indexOf("/"))
                                            : "9",
                                        rating: repo.rating,
                                        description: repo.description,
                                    }))
                                    .sort((a, b) => sortRows(sortBy, a, b))
                                    .map((repo) => (
                                        <tr key={repo.repository}>
                                            <td>
                                                {repo.path.startsWith("1") ? (
                                                    <>
                                                        <Image
                                                            aria-hidden
                                                            src={ImageSrc("folder.svg")}
                                                            alt="file"
                                                            width={SmallIcone.width}
                                                            height={SmallIcone.height}
                                                        />
                                                        &nbsp;
                                                        {repo.path.substring(1)}
                                                    </>
                                                ) : (
                                                    <Image
                                                        aria-hidden
                                                        src={ImageSrc("file.svg")}
                                                        alt="file"
                                                        width={SmallIcone.width}
                                                        height={SmallIcone.height}
                                                    />
                                                )}
                                            </td>
                                            <td>
                                                {repo.path.length > 1
                                                    ? repo.repository.substring(repo.path.length)
                                                    : repo.repository}
                                            </td>
                                            <td>
                                                <Rating value={repo.rating} />
                                            </td>
                                            <td>{repo.description}</td>
                                            <td>
                                                <Link
                                                    style={{
                                                        height: "100%",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                    href={LinkPagesHref(
                                                        `/repository?registryId=${registryId}&repository=${
                                                            repo.repository
                                                        }${
                                                            registryCredentials
                                                                ? `&registryUser=${registryCredentials}`
                                                                : ""
                                                        }`
                                                    )}
                                                >
                                                    <Button variant="light">
                                                        <Image
                                                            aria-hidden
                                                            src={ImageSrc("tag.svg")}
                                                            alt="file"
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
                                                    <Dropdown.Item onClick={() => setEditRepo(repo)}>
                                                        <Image
                                                            aria-hidden
                                                            src={ImageSrc("edit.svg")}
                                                            alt="..."
                                                            width={SmallIcone.width}
                                                            height={SmallIcone.height}
                                                        />
                                                        &nbsp;{t("EditRegistry.title")}
                                                    </Dropdown.Item>
                                                </DropdownButton>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>
                    </Form>
                )}
            </main>
        </div>
    );
}

export default function Registry() {
    return (
        <Suspense>
            <Registry_ />
        </Suspense>
    );
}
