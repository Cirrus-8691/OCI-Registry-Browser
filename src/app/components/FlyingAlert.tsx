import { Variant } from "react-bootstrap/esm/types";
import { Toast } from "react-bootstrap";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { ImageSrc } from "@/tools/Homepage-BasePath";
import { SmallIcone } from "./const";

export interface AlertMessage {
    variant: Variant;
    message: number | string | string[];
    titleStrong?: string;
    titleSmall?: string;
}

export class CreateAlert {
    static error(error: unknown): AlertMessage {
        let message;
        if (typeof error === "number") {
            message = error as number;
        } else if (typeof error === "string") {
            message = error as string;
        } else if (error instanceof Error) {
            message = (error as Error).message;
        } else {
            message = JSON.stringify(error);
        }
        return {
            variant: "danger",
            message,
        };
    }

    static warning(message: string | string[]): AlertMessage {
        return {
            variant: "warning",
            message,
        };
    }

    static info(message: string | string[]): AlertMessage {
        return {
            variant: "info",
            message,
        };
    }

    static success(message: string | string[]): AlertMessage {
        return {
            variant: "success",
            message,
        };
    }
}

const FlyingAlert = ({ message, onClose }: { message: AlertMessage; onClose: () => void }) => {
    const { t } = useTranslation();
    let text;
    if (typeof message.message === "number") {
        switch (message.message as number) {
            case 401: // Unauthorized
                text = t("FlyingAlert.status.Unauthorized");
                break;
            case 403: // Forbidden;
                text = t("FlyingAlert.status.Forbidden");
                break;
            case 409: // Conflict
                text = t("FlyingAlert.status.Conflict");
                break;
            default: // Internal Server Error
                text = t("FlyingAlert.status.InternalServerError");
                break;
        }
    } else {
        text = message.message;
    }
    return (
        <Toast bg={message.variant} onClose={onClose}>
            <Toast.Header>
                <Image
                    aria-hidden
                    src={ImageSrc(`icon_${message.variant}.svg`)}
                    alt={`icon ${message.variant}`}
                    width={SmallIcone.width}
                    height={SmallIcone.height}
                />
                &nbsp;
                <strong className="me-auto">{message.titleStrong ?? t(`FlyingAlert.${message.variant}`)}</strong>
                <small>{message.titleSmall}</small>
            </Toast.Header>
            <Toast.Body className={"text-black"}>{text}</Toast.Body>
        </Toast>
    );
};
export default FlyingAlert;
