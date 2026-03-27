"use client";

import React from "react";
import { ImageSrc } from "@/tools/Homepage-BasePath";
import { ImageMeta, RegistryUsageCan } from "@/tools/RegistryUsage/RegistryUsage";
import { RegistryUsages } from "@/tools/RegistryUsage/RegistryUsages";
import Image from "next/image";
import { Button, Form, InputGroup, Tab, Tabs } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import useApplicationContext from "../ApplicationContext";
import { CreateAlert } from "./FlyingAlert";
import { SmallIcone } from "./const";

const UserSupport = ({ meta, translations, can }: { meta: ImageMeta; translations: string; can: RegistryUsageCan }) => {
    const { t } = useTranslation();
    const registryUsages = RegistryUsages(meta);

    const { setAlert } = useApplicationContext();

    const onClickCopy = (text: string) => {
        if (text && document.hasFocus()) {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text);
                setAlert(CreateAlert.success(`${text} copy to clipboard`));
            } else {
                setAlert(
                    CreateAlert.error(
                        `Clipboard not avaiable for ${text}, requires a secure origin — either HTTPS or localhost`
                    )
                );
            }
        }
    };
    const firstDisplayed = registryUsages.find((registryType) => registryType[can]);
    const defaultActiveKey = firstDisplayed?.key ?? registryUsages[0]?.key;
    const fnNameToGetMeta = (can as string).substring(3).toLowerCase() as "pull" | "push" | "run" | "signature";
    return (
        <Tabs defaultActiveKey={defaultActiveKey} id="uncontrolled-tab-example" className="mb-3">
            {registryUsages.map(
                (registryType) =>
                    registryType[can] && (
                        <Tab key={registryType.key} eventKey={registryType.key} title={registryType.title}>
                            {registryType[fnNameToGetMeta](meta).map((usage) => (
                                <div key={usage.titleKey18n}>
                                    <InputGroup className="mb-1">
                                        <Form.Control
                                            type="text"
                                            value={t(`${translations}.${usage.titleKey18n}`)}
                                            disabled
                                        />
                                        <Button variant="light" onClick={() => onClickCopy(usage.detailKey18n)}>
                                            <Image
                                                aria-hidden
                                                src={ImageSrc("copy.svg")}
                                                alt="copy"
                                                width={SmallIcone.width}
                                                height={SmallIcone.height}
                                            />
                                        </Button>
                                    </InputGroup>
                                    <InputGroup className="mb-1">
                                        <Form.Control
                                            as="textarea"
                                            wrap={"off"}
                                            rows={usage.detailKey18n.split("\n").length}
                                            style={{
                                                backgroundColor: "black",
                                                color: "white",
                                            }}
                                            value={usage.detailKey18n}
                                            readOnly
                                        />
                                    </InputGroup>
                                </div>
                            ))}
                        </Tab>
                    )
            )}
        </Tabs>
    );
};

export default UserSupport;
