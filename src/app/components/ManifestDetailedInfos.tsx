import { Badge, Button, Form, InputGroup } from "react-bootstrap";
import Image from "next/image";
import { ManifestV1 } from "../api/repository/manifest/manifest.entity";
import { useTranslation } from "react-i18next";
import { ImageSrc } from "@/tools/Homepage-BasePath";
import { useState } from "react";
import { GetApi, PostApi } from "@/tools/FetchApi";
import useApplicationContext from "../ApplicationContext";
import { RepositoryEntity } from "../api/repository/repository.entity";
import { Rating } from "./Rating";
import Bits from "@/tools/Bits";
import { UserHaveAbility } from "@/model/UserAbility";
import { SchemaTables } from "@/model/SchemaTables";
import { SmallIcone } from "./const";
import ManifestV1helper from "@/tools/Manifest/ManifestV1helper";

interface Signatures {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    docker: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cosign: any;
}

export const ManifestDetailedInfos = ({
    registryId,
    repository,
    tag,
    manifest,
    details,
    rating,
    setRating,
}: {
    registryId: string;
    repository: string;
    tag: string;
    manifest: ManifestV1 | undefined;
    details: RepositoryEntity | undefined;
    rating: number;
    setRating: (value: number) => void;
}) => {
    const { t } = useTranslation();
    const { fetchContext, registryCredential, userConnected } = useApplicationContext();
    const [signature, setSignature] = useState<Signatures | undefined>(undefined);
    const checkSignature = () => {
        const load = async () => {
            if (manifest) {
                setSignature(undefined);
                const result = await GetApi<Signatures>(
                    fetchContext,
                    `repository/signature?registryId=${registryId}&repository=${manifest.name}&reference=${
                        manifest.tag
                    }${registryCredential.token ? `&token=${encodeURIComponent(registryCredential.token)}` : ""}`,
                    t("Common.errors.unavaible")
                );
                setSignature(result);
            }
        };
        load();
    };
    const handleRating = async (newValue: number) => {
        setRating(newValue);
        // Save in Database
        await PostApi(
            fetchContext,
            `repository/tags/rating`,
            {
                registryId,
                repository,
                tag,
                rating: newValue,
            },
            t("Common.errors.unavaible")
        );
    };
    return (
        <>
            {details && (
                <>
                    <InputGroup className="mb-1">
                        <InputGroup.Text>{t("Repository.description")}</InputGroup.Text>
                        <Form.Control disabled value={details?.description || t("Common.unavaible")} />
                    </InputGroup>
                    <InputGroup className="mb-3">
                        <InputGroup.Text>{t("Repository.architecture")}</InputGroup.Text>
                        <InputGroup.Text>
                            <Badge bg="warning">{details?.architecture || t("Common.unavaible")}</Badge>
                        </InputGroup.Text>
                        <InputGroup.Text>{t("Repository.os")}</InputGroup.Text>
                        <InputGroup.Text>
                            <Badge bg="warning">
                                {details?.os || t("Common.unavaible")}
                            </Badge>
                        </InputGroup.Text>
                        <Form.Control disabled value={""} />
                        <Rating
                            value={rating}
                            updateValue={
                                UserHaveAbility(userConnected.user, "update", SchemaTables.Repository)
                                    ? (newValue: number) => handleRating(newValue)
                                    : undefined
                            }
                        />
                    </InputGroup>
                    <InputGroup className="mb-1">
                        <InputGroup.Text>{t("Repository.size")}</InputGroup.Text>
                        <Form.Control disabled value={(details && Bits(details.size)) || t("Common.unavaible")} />
                        <InputGroup.Text>{t("Repository.created")}</InputGroup.Text>
                        <Form.Control disabled value={details?.created || t("Common.unavaible")} />
                    </InputGroup>

                    <InputGroup className="mb-1">
                        <InputGroup.Text>{t("Repository.fromImage")}</InputGroup.Text>
                        <Form.Control
                            disabled
                            value={ManifestV1helper.extract("fromImage", manifest) || t("Common.unavaible")}
                        />
                    </InputGroup>

                    <InputGroup className="mb-1">
                        <InputGroup.Text>{t("Repository.signature")}</InputGroup.Text>
                        <Form.Control
                            disabled
                            value={ManifestV1helper.extract("signature", manifest) || t("Common.unavaible")}
                        />
                        <Button
                            variant="secondary"
                            onClick={checkSignature}
                            disabled={!UserHaveAbility(userConnected.user, "update", SchemaTables.Repository)}
                        >
                            <Image
                                aria-hidden
                                src={ImageSrc("keys-black.svg")}
                                alt="keys"
                                width={SmallIcone.width}
                                height={SmallIcone.height}
                            />
                            &nbsp;
                            {t("Repository.checkSignature")}
                        </Button>
                        <Form.Control disabled value={signature ? JSON.stringify(signature) : t("Common.unavaible")} />
                    </InputGroup>
                    <InputGroup>
                        <InputGroup.Text>{t("Repository.licenses")}</InputGroup.Text>
                        <Form.Control disabled value={details?.licenses || t("Common.unavaible")} />
                    </InputGroup>
                </>
            )}
        </>
    );
};
