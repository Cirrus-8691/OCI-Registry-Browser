import { Accordion, Badge, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import Image from "next/image";

import { TagDetails } from "../api/repository/tags/tag.entity";
import { ImageSrc } from "@/tools/Homepage-BasePath";
import { Rating } from "./Rating";
import { useState } from "react";
import useApplicationContext from "../ApplicationContext";
import { CreateAlert } from "./FlyingAlert";
import { IsManfestV1, ManifertAccepted, ManifestEntity, ManifestV1 } from "../api/repository/manifest/manifest.entity";
import { GetApi } from "@/tools/FetchApi";
import { RepositoryEntity } from "../api/repository/repository.entity";
import { useTranslation } from "react-i18next";
import { ManifestDetailedInfos } from "./ManifestDetailedInfos";
import Bits from "@/tools/Bits";
import RepositoryActionsBar from "./RepositoryActionsBar";
import { SmallIcone } from "./const";

export const decodeName = (fullName: string): { path: string; name: string } => {
    const posLastSlash = fullName.lastIndexOf("/") + 1;
    const path = fullName.substring(0, posLastSlash);
    const name = fullName.substring(posLastSlash);
    return {
        path,
        name,
    };
};

type Processing = "ToDo" | "Loading" | "Loaded";
interface ManifestAndDetails {
    manifest: ManifestEntity;
    details: RepositoryEntity | undefined;
}
interface ManifestV1AndDetails {
    manifest: ManifestV1 | undefined;
    details: RepositoryEntity | undefined;
}

const RepositoryCard = ({
    tagHeader,
    registryId,
    repository,
    showHowToPullImage,
    showHowToRunImage,
    showHowToCheckSignature,
    setDeleteTagImage,
    showManifest,
    showConfig,
    hasRunSupport,
}: {
    tagHeader: TagDetails;
    registryId: string;
    repository: string;
    showHowToPullImage: (tag: string) => void;
    showHowToRunImage: (tag: string) => void;
    showHowToCheckSignature: (tag: string) => void;
    setDeleteTagImage: (tag: string) => void;
    showManifest: (type: ManifertAccepted, tag: string) => Promise<void>;
    showConfig: (tag: string) => void;
    hasRunSupport: boolean;
}) => {
    const { t } = useTranslation();
    const { fetchContext, registryCredential, setAlert } = useApplicationContext();

    const onClickCopy = async (char: string | undefined) => {
        if (char && document.hasFocus()) {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(char);
                setAlert(CreateAlert.success(`${char} copy to clipboard`));
            } else {
                setAlert(
                    CreateAlert.error(
                        `Clipboard not avaiable for ${char}, requires a secure origin — either HTTPS or localhost`
                    )
                );
            }
        }
    };

    const [manifestLoading, setManifestLoading] = useState<Processing>("ToDo");
    const loadManifestDetails = async (
        type: ManifertAccepted,
        tag: string
    ): Promise<ManifestAndDetails | undefined> => {
        const result = await GetApi<ManifestAndDetails>(
            fetchContext,
            `repository/details?registryId=${registryId}&repository=${repository}&reference=${tag}&type=${type}${
                registryCredential.token ? `&token=${encodeURIComponent(registryCredential.token)}` : ""
            }`,
            t("Common.errors.unavaible")
        );
        console.log(result);
        return result;
    };

    const [manifestDetailed, setManifestDetailed] = useState<ManifestV1AndDetails | undefined>(undefined);
    const handleLoadManifest = async (tag: string) => {
        const load = async () => {
            setManifestDetailed(undefined);
            setManifestLoading("Loading");
            const result = await loadManifestDetails("oci", tag);
            if (result) {
                if (result && IsManfestV1(result.manifest?.manifest)) {
                    setManifestDetailed({
                        manifest: result.manifest.manifest as ManifestV1,
                        details: result.details,
                    });
                } else {
                    setManifestDetailed({
                        manifest: undefined,
                        details: result.details,
                    });
                }
            }
            setManifestLoading("Loaded");
        };
        load();
    };
    const [rating, setRating] = useState(tagHeader.rating);
    return (
        <>
            <Accordion.Item key={tagHeader.tag} eventKey={tagHeader.tag}>
                <Accordion.Header>
                    <Image
                        aria-hidden
                        src={ImageSrc("tag.svg")}
                        alt="file"
                        width={SmallIcone.width}
                        height={SmallIcone.height}
                    />
                    &nbsp;
                    {/* {decodeName(tagsHeaderEntity.name).name}&nbsp;<strong>{tagHeader.tag}</strong> */}
                    {repository}&nbsp;<strong>{tagHeader.tag}</strong>
                    &nbsp;
                    <Rating value={rating} />
                    &nbsp;
                    {!!tagHeader.size && `${t("Repository.size")}: ${Bits(tagHeader.size)}`}
                    &nbsp;
                    {!tagHeader.size &&
                        manifestDetailed?.details &&
                        manifestDetailed.details.size &&
                        `${t("Repository.size")}: ${Bits(manifestDetailed.details.size)}`}
                    &nbsp; 
                    {(tagHeader.architecture || manifestDetailed?.details?.architecture) && (
                        <Badge bg="secondary">{tagHeader.architecture || manifestDetailed?.details?.architecture}</Badge>
                    )}
                    &nbsp;
                    {(tagHeader.os || manifestDetailed?.details?.os) && (
                        <Badge bg="secondary">{tagHeader.os || manifestDetailed?.details?.os}</Badge>
                    )}
                </Accordion.Header>
                <Accordion.Body>
                    {/* BUTTONS BAR */}
                    <RepositoryActionsBar
                        tag={tagHeader.tag}
                        showHowToPullImage={showHowToPullImage}
                        showHowToRunImage={showHowToRunImage}
                        showHowToCheckSignature={showHowToCheckSignature}
                        setDeleteTagImage={setDeleteTagImage}
                        showManifest={showManifest}
                        showConfig={showConfig}
                        registryId={registryId}
                        repository={repository}
                        hasRunSupport={hasRunSupport}
                    />
                    {/* IMAGE INFOS */}
                    <>
                        <InputGroup className="mb-1">
                            <InputGroup.Text>{t("Repository.description")}</InputGroup.Text>
                            <Form.Control
                                disabled
                                value={
                                    tagHeader.desc ||
                                    (manifestDetailed?.details && (manifestDetailed.details.description as string)) ||
                                    t("Common.unavaible")
                                }
                            />
                        </InputGroup>
                        <div className="row">
                            <InputGroup className="mb-3">
                                <InputGroup.Text>{t("Repository.size")}</InputGroup.Text>
                                <Form.Control
                                    disabled
                                    value={
                                        (tagHeader.size && Bits(tagHeader.size)) ||
                                        (!tagHeader.size &&
                                            manifestDetailed?.details &&
                                            manifestDetailed.details.size &&
                                            Bits(manifestDetailed.details.size)) ||
                                        t("Common.unavaible")
                                    }
                                />
                                <InputGroup.Text>{t("Repository.created")}</InputGroup.Text>
                                <Form.Control
                                    disabled
                                    value={
                                        tagHeader.created ||
                                        (!tagHeader.created &&
                                            manifestDetailed?.details &&
                                            manifestDetailed.details.created) ||
                                        t("Common.unavaible")
                                    }
                                />
                            </InputGroup>
                        </div>
                        <InputGroup className="mb-1">
                            <InputGroup.Text>
                                <strong>{t("Repository.contentDigest")}</strong>
                            </InputGroup.Text>
                            <Form.Control
                                disabled
                                value={tagHeader.header.docker.contentDigest || t("Common.unavaible")}
                            />
                            <Button
                                style={{
                                    border: "1px solid lightgrey",
                                }}
                                variant="light"
                                onClick={() => onClickCopy(tagHeader.header.docker.contentDigest)}
                            >
                                <Image
                                    aria-hidden
                                    src={ImageSrc("copy.svg")}
                                    alt="copy"
                                    width={SmallIcone.width}
                                    height={SmallIcone.height}
                                />
                            </Button>
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <InputGroup.Text>
                                <strong>{t("Repository.type")}</strong>
                            </InputGroup.Text>
                            <Form.Control disabled value={tagHeader.header.content.type || t("Common.unavaible")} />
                        </InputGroup>
                        <Accordion onSelect={() => handleLoadManifest(tagHeader.tag)}>
                            <Accordion.Header>
                                <Image
                                    aria-hidden
                                    src={ImageSrc("find.svg")}
                                    alt="file"
                                    width={SmallIcone.width}
                                    height={SmallIcone.height}
                                />
                                &nbsp;{t("Repository.config")}
                            </Accordion.Header>
                            <Accordion.Body style={{ border: "1px solid lightgrey" }}>
                                {manifestLoading === "Loading" && (
                                    <div className="text-center">
                                        <Spinner animation="border" size="sm" />
                                        &nbsp;{t("Common.loading")}
                                    </div>
                                )}
                                {manifestLoading === "Loaded" && !manifestDetailed && (
                                    <div className="text-center">{t("Common.unavaible")}</div>
                                )}
                                {manifestLoading === "Loaded" && manifestDetailed && registryId && repository && (
                                    <ManifestDetailedInfos
                                        registryId={registryId}
                                        repository={repository}
                                        tag={tagHeader.tag}
                                        manifest={manifestDetailed.manifest}
                                        details={manifestDetailed.details}
                                        rating={rating}
                                        setRating={(value: number) => {
                                            setRating(value);
                                        }}
                                    />
                                )}
                            </Accordion.Body>
                        </Accordion>
                    </>
                </Accordion.Body>
            </Accordion.Item>
        </>
    );
};

export default RepositoryCard;
