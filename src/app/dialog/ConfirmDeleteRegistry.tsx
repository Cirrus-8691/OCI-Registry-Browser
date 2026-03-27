import { Trans, useTranslation } from "react-i18next";
import Image from "next/image";
import { ValidRegistry } from "../page";
import ConfirmDelete from "./ConfirmDelete";
import { ImageSrc } from "@/tools/Homepage-BasePath";

export default function ConfirmDeleteRegistry({
    confirm,
    data,
}: {
    confirm: (value: boolean) => void;
    data: ValidRegistry | undefined;
}) {
    const { t } = useTranslation();
    return (
        <ConfirmDelete show={!!data} confirm={confirm} title={t("ConfirmDeleteRegistry.title")} confirmString={data?.registry.name as string}>
            &nbsp;
            {data && (
                <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Image src={ImageSrc(`garbage.svg`)} unoptimized alt="garbage" width={180} height={180} priority />
                        &nbsp;
                        <Image
                            src={ImageSrc(`deleteRegistry.svg`)}
                            unoptimized
                            alt="delReg"
                            width={180}
                            height={180}
                            priority
                        />
                    </div>
                    {/* &nbsp;<Image aria-hidden src={ImpagePath("window.svg")} alt="window" width={SmallIcone.width} height={SmallIcone.height} />
                    &nbsp;{t("Common.name")}
                    &nbsp;<strong>{data.registry.name}</strong>
                    <br />
                    &nbsp;<Image aria-hidden src={ImpagePath("globe.svg")} alt="globe" width={SmallIcone.width} height={SmallIcone.height} />
                    &nbsp;{t("RegistryEntity.registry.url")}
                    &nbsp;
                    <strong>{data.registry.url}</strong> */}
                    <Trans i18nKey="ConfirmDeleteRegistry.registry" values={data.registry}/>
                </>
            )}
        </ConfirmDelete>
    );
}
