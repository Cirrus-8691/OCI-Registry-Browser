import { ImageSrc, LinkHomeHref } from "@/tools/Homepage-BasePath";
import Image from "next/image";
import Link from "next/link";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { SmallIcone } from "./const";

const BreadcrumbTrail = ({ children, title }: { title: string; children?: React.ReactNode; }) => {
    const { t } = useTranslation();
    return (
        <p>
            <Image aria-hidden src={ImageSrc("arrowleft.svg")} alt="arrowleft icone" width={SmallIcone.width} height={SmallIcone.height} />
            &nbsp;
            <Link href={LinkHomeHref()}>
                <Button variant="link">{t("Common.GoHome")}</Button>
            </Link>
            &nbsp;/&nbsp;
            {children && (
                <>
                    {children}
                    &nbsp;/&nbsp;
                </>
            )}
            {title}
        </p>
    );
};

export default BreadcrumbTrail;
