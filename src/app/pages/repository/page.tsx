"use client";

import styles from "../../page.module.css";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { DeleteApi, GetApi } from "@/tools/FetchApi";
import { Accordion, Button, Form, InputGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { ImageSrc, LinkPagesHref } from "@/tools/Homepage-BasePath";
import Logo from "@/app/components/Logo";
import useApplicationContext, { UserIsNotConnected } from "@/app/ApplicationContext";
import { useSearchParams } from "next/navigation";
import { TagsHeaderEntity } from "@/app/api/repository/tags/tag.entity";
import { ConfigEntity, ManifertAccepted, ManifestEntity } from "@/app/api/repository/manifest/manifest.entity";
import DialogManifest from "@/app/dialog/DialogManifest";
import ConfirmDeleteTag from "@/app/dialog/ConfirmDeleteTag";
import { ImageMeta } from "@/tools/RegistryUsage/RegistryUsage";
import BreadcrumbTrail from "@/app/components/BreadcrumbTrail";
import { OrderBy, sortRows, TableKeyOrder } from "@/app/components/Tables/OrderByColumn";
import { AccordionEventKey } from "react-bootstrap/esm/AccordionContext";
import FilterRows, { TableKeyFilter } from "@/app/components/Tables/FilterRows";
import { useLocalStorage } from "@/app/hooks/useLocalstorage";
import DialogImageSignature from "@/app/dialog/DialogImageHelpers/Signature";
import DialogImagePull from "@/app/dialog/DialogImageHelpers/Pull";
import DialogImageRun from "@/app/dialog/DialogImageHelpers/Run";
import RepositoryCard, { decodeName } from "@/app/components/RepositoryCard";
import { SmallIcone } from "@/app/components/const";
import { RegistryUsages } from "@/tools/RegistryUsage/RegistryUsages";
import { Rating } from "@/app/components/Rating";
import OffcanvasEditRepository from "@/app/dialog/OffcanvasEditRepository";
import { Repository } from "@/app/api/repository/repository.entity";
import DialogConfig from "@/app/dialog/DialogConfig";

function RepositoryPage_() {
    const { t } = useTranslation();
    const { fetchContext, registryCredential } = useApplicationContext();

    const searchParams = useSearchParams();
    const registryId = searchParams.get("registryId");
    const repository = searchParams.get("repository");
    const [registryCredentials] = useState(searchParams.get("registryUser"));
    const [activeKey, setActiveKey] = useState("");

    const getTagsEntity = async () => {
        const result = await GetApi<TagsHeaderEntity>(
            fetchContext,
            `repository/tags?registryId=${registryId}&repository=${repository}${
                registryCredential.token ? `&token=${encodeURIComponent(registryCredential.token)}` : ""
            }`,
            t("Common.errors.identification")
        );
        setTagsHeaderEntity(result);
        setActiveKey(
            result?.tags && result.tags.length > 0
                ? result.tags.sort((a, b) => sortRows(sortBy, { tag: a.tag }, { tag: b.tag }))[0].tag
                : ""
        );
    };

    const [tagsHeaderEntity, setTagsHeaderEntity] = useState<TagsHeaderEntity | undefined>(undefined);
    useEffect(() => {
        if (UserIsNotConnected(fetchContext)) {
            fetchContext.login();
        } else {
            if (registryId && repository) {
                getTagsEntity();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const tableKey = "repository";
    const [filter, setFilter] = useLocalStorage(TableKeyFilter(tableKey), "");
    const [sortBy] = useLocalStorage<OrderBy>(TableKeyOrder(tableKey), {
        column: "tag",
        order: "DESC",
    });

    const [manifestEntity, setManifestEntity] = useState<ManifestEntity | undefined>(undefined);
    const hideManifest = () => setManifestEntity(undefined);
    const loadManifest = async (type: ManifertAccepted, tag: string): Promise<ManifestEntity | undefined> => {
        const result = await GetApi<ManifestEntity>(
            fetchContext,
            `repository/manifest?registryId=${registryId}&repository=${repository}&reference=${tag}&type=${type}${
                registryCredential.token ? `&token=${encodeURIComponent(registryCredential.token)}` : ""
            }`,
            t("Common.errors.unavaible")
        );
        return result;
    };
    const showManifest = async (type: ManifertAccepted, tag: string) => {
        setManifestEntity(await loadManifest(type, tag));
    };

    const [config, setConfig] = useState<ConfigEntity| undefined>(undefined);
    const hideConfig = () => setConfig(undefined);
    const showConfig = async (tag: string) => {
        const config = await GetApi<ConfigEntity>(
            fetchContext,
            `repository/config?registryId=${registryId}&repository=${repository}&reference=${tag}${
                registryCredential.token ? `&token=${encodeURIComponent(registryCredential.token)}` : ""
            }`,
            t("Common.errors.unavaible")
        );
        setConfig(config);
    };

    const [infosImageToPull, setInfosImageToPull] = useState<ImageMeta | undefined>(undefined);
    const hidePullImage = () => setInfosImageToPull(undefined);
    const showHowToPullImage = (tag: string) => {
        if (tagsHeaderEntity) {
            const { name, path } = decodeName(tagsHeaderEntity.name);
            setInfosImageToPull({
                registry: {
                    name: tagsHeaderEntity.registry.name,
                    url: new URL(tagsHeaderEntity.registry.url),
                    gnUrl: tagsHeaderEntity.registry.gnUrl ? new URL(tagsHeaderEntity.registry.gnUrl) : undefined,
                    user: tagsHeaderEntity.registry.user,
                    type: tagsHeaderEntity.registry.type,
                },
                image: { path, name, tag },
            });
        }
    };
    const [infosImageToRun, setInfosImageToRun] = useState<ImageMeta | undefined>(undefined);
    const hideRunImage = () => setInfosImageToRun(undefined);
    const showHowToRunImage = (tag: string) => {
        if (tagsHeaderEntity) {
            const { name, path } = decodeName(tagsHeaderEntity.name);
            setInfosImageToRun({
                registry: {
                    name: tagsHeaderEntity.registry.name,
                    url: new URL(tagsHeaderEntity.registry.url),
                    gnUrl: tagsHeaderEntity.registry.gnUrl ? new URL(tagsHeaderEntity.registry.gnUrl) : undefined,
                    user: tagsHeaderEntity.registry.user,
                    type: tagsHeaderEntity.registry.type,
                },
                image: { path, name, tag },
            });
        }
    };
    const [infosImageToCheck, setInfosImageToCheck] = useState<ImageMeta | undefined>(undefined);
    const hideSignatureImage = () => setInfosImageToCheck(undefined);
    const showHowToCheckSignature = (tag: string) => {
        if (tagsHeaderEntity) {
            const { name, path } = decodeName(tagsHeaderEntity.name);
            setInfosImageToCheck({
                registry: {
                    name: tagsHeaderEntity.registry.name,
                    url: new URL(tagsHeaderEntity.registry.url),
                    gnUrl: tagsHeaderEntity.registry.gnUrl ? new URL(tagsHeaderEntity.registry.gnUrl) : undefined,
                    user: tagsHeaderEntity.registry.user,
                    type: tagsHeaderEntity.registry.type,
                },
                image: { path, name, tag },
            });
        }
    };

    const [deleteTagImage, setDeleteTagImage] = useState("");
    const confirmDeleteImage = async (value: boolean) => {
        if (value) {
            const ok = await DeleteApi(
                fetchContext,
                `repository/manifest?registryId=${registryId}&repository=${repository}&reference=${deleteTagImage}${
                    registryCredential.token ? `&token=${encodeURIComponent(registryCredential.token)}` : ""
                }`,
                t("Common.errors.delete")
            );
            if (ok) {
                setTagsHeaderEntity((prevTags) => {
                    if (prevTags) {
                        return {
                            ...prevTags,
                            tags: prevTags?.tags.filter((tagHeader) => tagHeader.tag !== deleteTagImage),
                        };
                    }
                });
            }
        }
        setDeleteTagImage("");
    };

    let hasRunSupport = false;
    if (tagsHeaderEntity) {
        const fakeMeta: ImageMeta = {
            registry: {
                type: tagsHeaderEntity.registry.type,
                name: "",
                url: new URL("http://dummy"),
                gnUrl: undefined,
                user: undefined,
            },
            image: { name: "", tag: "", path: "" },
        };
        hasRunSupport = RegistryUsages(fakeMeta).some((rt) => rt.CanRun);
    }
    const [editRepo, setEditRepo] = useState<Repository | undefined>(undefined);
    const updatedRepository = (data: Repository) => {
        if (tagsHeaderEntity && data) {
            setTagsHeaderEntity(
                (prevRepo) =>
                    prevRepo && {
                        ...prevRepo,
                        repository: data,
                    }
            );
        }
    };

    return (
        <div className={styles.page}>
            <DialogManifest entity={manifestEntity} hide={hideManifest} />
            <DialogConfig entity={config} hide={hideConfig} />
            <DialogImagePull editDisabled infos={infosImageToPull} hide={hidePullImage} />
            <DialogImageRun editDisabled infos={infosImageToRun} hide={hideRunImage} />
            <DialogImageSignature editDisabled infos={infosImageToCheck} hide={hideSignatureImage} />
            <ConfirmDeleteTag
                confirm={confirmDeleteImage}
                registry={tagsHeaderEntity?.registry}
                repository={repository}
                tag={deleteTagImage}
            />
            <OffcanvasEditRepository
                registry={tagsHeaderEntity?.registry}
                data={editRepo}
                savedRepository={updatedRepository}
                hide={() => setEditRepo(undefined)}
            />
            <BreadcrumbTrail title={t("Repository.title")}>
                <Link
                    href={LinkPagesHref(
                        `/registry?registryId=${registryId}${
                            registryCredentials ? `&registryUser=${registryCredentials}` : ""
                        }`
                    )}
                >
                    <Button variant="link">{t("Registry.title")}</Button>
                </Link>
            </BreadcrumbTrail>
            <main className={styles.main}>
                <Logo image="repository" />
                <Form>
                    {tagsHeaderEntity && (
                        <>
                            <InputGroup className="mb-1">
                                <InputGroup.Text>
                                    <strong>{t("Repository.title")}</strong>
                                </InputGroup.Text>
                                <Form.Control disabled type="text" value={tagsHeaderEntity.name} />
                                <InputGroup.Text>{t("Registry.title")}</InputGroup.Text>
                                <Form.Control disabled value={tagsHeaderEntity.registry.name} />
                            </InputGroup>
                            <InputGroup className="mb-3">
                                <InputGroup.Text>{t("Repository.description")}</InputGroup.Text>
                                <Form.Control disabled type="text" value={tagsHeaderEntity.repository.description} />
                                <InputGroup.Text>{t("Repository.rating")}</InputGroup.Text>
                                <InputGroup.Text>
                                    <Rating value={tagsHeaderEntity.repository.rating} />
                                </InputGroup.Text>
                            </InputGroup>
                        </>
                    )}
                    <InputGroup className="mb-1">
                        <Button variant="light" onClick={getTagsEntity}>
                            <Image
                                aria-hidden
                                src={ImageSrc("refresh.svg")}
                                alt="refresh"
                                width={SmallIcone.width}
                                height={SmallIcone.height}
                            />
                            &nbsp;
                            {t("Repository.refresh")}
                        </Button>
                        &nbsp;
                        <Button variant="light" onClick={() => setEditRepo(tagsHeaderEntity?.repository)}>
                            <Image
                                aria-hidden
                                src={ImageSrc("edit.svg")}
                                alt="..."
                                width={SmallIcone.width}
                                height={SmallIcone.height}
                            />
                            &nbsp;{t("EditRegistry.title")}
                        </Button>
                    </InputGroup>
                    <FilterRows tableKey={tableKey} setFilter={setFilter} filter={filter} />
                    <Accordion
                        activeKey={activeKey}
                        onSelect={(eventKey: AccordionEventKey) => {
                            setActiveKey(eventKey ? (eventKey as string) : "");
                        }}
                    >
                        {registryId &&
                            repository &&
                            tagsHeaderEntity?.tags
                                ?.filter((tagHeader) => tagHeader.tag?.includes(filter))
                                .sort((a, b) => sortRows(sortBy, { tag: a.tag }, { tag: b.tag }))
                                .map((tagHeader) => (
                                    <RepositoryCard
                                        key={tagHeader.tag}
                                        tagHeader={tagHeader}
                                        registryId={registryId}
                                        repository={repository}
                                        showHowToPullImage={showHowToPullImage}
                                        showHowToRunImage={showHowToRunImage}
                                        showHowToCheckSignature={showHowToCheckSignature}
                                        setDeleteTagImage={setDeleteTagImage}
                                        showManifest={showManifest}
                                        showConfig={showConfig}
                                        hasRunSupport={hasRunSupport}
                                    />
                                ))}
                    </Accordion>
                </Form>
            </main>
        </div>
    );
}

export default function RepositoryPage() {
    return (
        <Suspense>
            <RepositoryPage_ />
        </Suspense>
    );
}
