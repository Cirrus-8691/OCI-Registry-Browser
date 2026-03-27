import { Button, Dropdown, DropdownButton, InputGroup } from "react-bootstrap";
import Image from "next/image";

import { ImageSrc } from "@/tools/Homepage-BasePath";
import { SchemaTables } from "@/model/SchemaTables";
import { ManifertAccepted } from "../api/repository/manifest/manifest.entity";
import UserCan from "./UserCan";
import { useTranslation } from "react-i18next";
import { SmallIcone } from "./const";

interface RepositoryActionsBarProps {
    tag: string;
    showHowToPullImage: (tag: string) => void;
    showHowToRunImage: (tag: string) => void;
    showHowToCheckSignature: (tag: string) => void;
    setDeleteTagImage: (tag: string) => void;
    showManifest: (type: ManifertAccepted, tag: string) => Promise<void>;
    showConfig: (tag: string) => void;
    registryId: string;
    repository: string;
    hasRunSupport: boolean;
}

const RepositoryActionsBar = ({
    tag,
    showHowToPullImage,
    showHowToRunImage,
    showHowToCheckSignature,
    setDeleteTagImage,
    showManifest,
    showConfig,
    hasRunSupport,
}: RepositoryActionsBarProps) => {
    const { t } = useTranslation();

    return (
        <InputGroup className="mb-3">
            <Button variant="light" onClick={() => showHowToPullImage(tag)}>
                <Image aria-hidden src={ImageSrc("download.svg")} alt="download" width={SmallIcone.width} height={SmallIcone.height} />
                &nbsp;{t("Repository.howToDownload")}
            </Button>
            &nbsp;
            {hasRunSupport && (
                <Button variant="light" onClick={() => showHowToRunImage(tag)}>
                    <Image aria-hidden src={ImageSrc("run.svg")} alt="run" width={SmallIcone.width} height={SmallIcone.height} />
                    &nbsp;{t("Repository.howToRun")}
                </Button>
            )}
            {hasRunSupport && <>&nbsp;</>}
            &nbsp;
            <Button variant="light" onClick={() => showHowToCheckSignature(tag)}>
                <Image aria-hidden src={ImageSrc("keys.svg")} alt="keys" width={SmallIcone.width} height={SmallIcone.height} />
                &nbsp;
                {t("Repository.checkSignature")}
            </Button>
            &nbsp;
            <DropdownButton
                size="sm"
                variant="light"
                title={
                    <>
                        <Image aria-hidden src={ImageSrc("3dots.svg")} alt="..." width={SmallIcone.width} height={SmallIcone.height} />
                        &nbsp;{t("Repository.manifest")}
                    </>
                }
            >
                <Dropdown.Item onClick={() => showConfig(tag)}>
                    <Image aria-hidden src={ImageSrc("file.svg")} alt="file" width={SmallIcone.width} height={SmallIcone.height} />
                    &nbsp;{t("Repository.config")}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => showManifest("oci", tag)}>
                    <Image aria-hidden src={ImageSrc("file.svg")} alt="file" width={SmallIcone.width} height={SmallIcone.height} />
                    &nbsp;{t("Repository.manifest")}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => showManifest("v1", tag)}>
                    <Image aria-hidden src={ImageSrc("file.svg")} alt="file" width={SmallIcone.width} height={SmallIcone.height} />
                    &nbsp;{t("Repository.manifest")}.v1
                </Dropdown.Item>
                <Dropdown.Item onClick={() => showManifest("v2", tag)}>
                    <Image aria-hidden src={ImageSrc("file.svg")} alt="file" width={SmallIcone.width} height={SmallIcone.height} />
                    &nbsp;{t("Repository.manifest")}.v2
                </Dropdown.Item>
            </DropdownButton>
            &nbsp;
            <UserCan table={SchemaTables.Repository} action="delete">
                <Button variant="light" onClick={() => setDeleteTagImage(tag)}>
                    <Image aria-hidden src={ImageSrc("trash.svg")} alt="trash" width={SmallIcone.width} height={SmallIcone.height} />
                    &nbsp;{t("Repository.delete")}
                </Button>
            </UserCan>
        </InputGroup>
    );
};

export default RepositoryActionsBar;
