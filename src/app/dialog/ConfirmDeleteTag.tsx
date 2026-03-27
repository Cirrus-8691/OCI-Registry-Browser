import { Trans, useTranslation } from "react-i18next";
import Image from "next/image";
import ConfirmDelete from "./ConfirmDelete";
import { RegistryEntity } from "../api/registry/registry.entity";
import { ImageSrc } from "@/tools/Homepage-BasePath";
import { SmallIcone } from "../components/const";

export default function ConfirmDeleteTag({
    confirm,
    registry,
    repository,
    tag,
}: {
    confirm: (value: boolean) => void;
    registry: RegistryEntity | undefined;
    repository: string | null;
    tag: string;
}) {
    const { t } = useTranslation();
    return (
        <ConfirmDelete
            show={!!tag}
            confirm={confirm}
            title={t("ConfirmDeleteTag.title", { the_tag: t(`Tag.${registry?.type.toString()}.the_tag`) })}
            confirmString={tag}
        >
            <br />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image src={ImageSrc(`garbage.svg`)} unoptimized alt="garbage" width={180} height={180} priority />
                &nbsp;
                <Image src={ImageSrc(`deleteRepository.svg`)} unoptimized alt="delRepo" width={180} height={180} priority />
            </div>
            &nbsp;
            {t("Common.name")}&nbsp;
            <Image aria-hidden src={ImageSrc("file.svg")} alt="file" width={SmallIcone.width} height={SmallIcone.height} />
            &nbsp;<strong>{repository}</strong>
            <br />
            &nbsp;{t("Repository.tag")}&nbsp;
            <Image aria-hidden src={ImageSrc("tag.svg")} alt="tag" width={SmallIcone.width} height={SmallIcone.height} />
            &nbsp;<strong>{tag}</strong>
            <br />
            <Trans
                i18nKey="ConfirmDeleteTag.tag"
                values={{
                    this_tag: t(`Tag.${registry?.type.toString()}.the_tag`),
                    tag_name: tag,
                }}
            />
        </ConfirmDelete>
    );
}
