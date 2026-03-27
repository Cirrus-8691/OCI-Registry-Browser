import { Trans, useTranslation } from "react-i18next";
import Image from "next/image";
import { UserInfo } from "../api/user/entites/user.entity";
import ConfirmDelete from "./ConfirmDelete";
import { ImageSrc } from "@/tools/Homepage-BasePath";

export default function ConfirmForgetMe({
    confirm,
    data,
}: {
    confirm: (value: boolean) => void;
    data: UserInfo | undefined;
}) {
    const { t } = useTranslation();
    return (
        <ConfirmDelete show={!!data} confirm={confirm} title={t("ConfirmForgetMe.title")} confirmString={data?.email as string}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image src={ImageSrc(`garbage.svg`)} unoptimized alt="garbage" width={180} height={180} priority />
                &nbsp;
                <Image src={ImageSrc(`user.svg`)} unoptimized alt="user" width={180} height={180} priority />
            </div>
            <Trans i18nKey="ConfirmForgetMe.email" values={data}/>
        </ConfirmDelete>
    );
}
