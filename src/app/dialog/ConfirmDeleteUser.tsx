import { Trans, useTranslation } from "react-i18next";
import Image from "next/image";
import { UserInfo } from "../api/user/entites/user.entity";
import ConfirmDelete from "./ConfirmDelete";
import { ImageSrc } from "@/tools/Homepage-BasePath";

export default function ConfirmDeleteUser({
    confirm,
    data,
}: {
    confirm: (value: boolean) => void;
    data: UserInfo | undefined;
}) {
    const { t } = useTranslation();
    return (
        <ConfirmDelete show={!!data} confirm={confirm} title={t("ConfirmDeleteUser.title")} confirmString={data?.email as string}>
            <br />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image src={ImageSrc(`garbage.svg`)} unoptimized alt="garbage" width={180} height={180} priority />
                &nbsp;
                <Image src={ImageSrc(`user.svg`)} unoptimized alt="user" width={180} height={180} priority />
            </div>
            <Trans i18nKey="ConfirmDeleteUser.email" values={data}/>
        </ConfirmDelete>
    );
}
