"use client";

import { Trans, useTranslation } from "react-i18next";
import Link from "next/link";
import styles from "../../page.module.css";
import Logo from "@/app/components/Logo";
import { Button, FloatingLabel, Form } from "react-bootstrap";
import { LinkPagesHref } from "@/tools/Homepage-BasePath";
import QRCode from "react-qr-code";
import useApplicationContext, { UserIsNotConnected } from "@/app/ApplicationContext";
import { ChangeEvent, useEffect, useState } from "react";
import { GetApi, PatchApi } from "@/tools/FetchApi";
import { UserInfo } from "@/app/api/user/entites/user.entity";
import { ActivationDto } from "@/app/api/user/activation/activation.dto";
import { CreateAlert } from "@/app/components/FlyingAlert";

let forceOnlyOneGetActivation = true;

export default function AwaitActivation() {
    const { t } = useTranslation();
    const { userConnected, fetchContext, setAlert } = useApplicationContext();
    const [pubKey, setPubKey] = useState("");
    useEffect(() => {
        const getActivation = async () => {
            forceOnlyOneGetActivation = false;
            const result = await GetApi<string>(
                fetchContext,
                `user/activation?email=${encodeURIComponent(userConnected.user.email as string)}`,
                t("Common.errors.identification")
            );
            if (result) {
                setPubKey(result);
            }
        };
        if (UserIsNotConnected(fetchContext)) {
            fetchContext.login();
        } else if (forceOnlyOneGetActivation) {
            getActivation();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [code, setCode] = useState("");
    const codeChange = (event: ChangeEvent<HTMLInputElement>) => setCode(event.target.value);
    const setActivation = async () => {
        if (!code) {
            setAlert(CreateAlert.error(t("AwaitActivation.error")));
            return;
        }
        const activation: ActivationDto = {
            email: userConnected.user.email as string,
            pubkey: pubKey,
            code,
        };
        const updatedUser = await PatchApi<UserInfo>(
            fetchContext,
            `user/activation`,
            activation,
            t("AwaitActivation.error")
        );
        if (updatedUser) {
            setAlert(CreateAlert.success(t("AwaitActivation.success")));
            fetchContext.login();
        }
    };

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <Logo image="user" />
                <Form>
                    <Form.Text style={{ fontSize: "1.25rem" }}>{t("AwaitActivation.title")}</Form.Text>
                    <p>
                        {t("Common.or")}&nbsp;
                        <Link href={LinkPagesHref("/signup")}>
                            <Button variant="link">{t("Login.createNewRegistry")}</Button>
                        </Link>
                    </p>
                    <Form.Group className="mb-3">
                        <Trans i18nKey="AwaitActivation.explain" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <QRCode
                                value={LinkPagesHref(`activate?pubkey=${encodeURIComponent(pubKey)}`)}
                            />
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <FloatingLabel label={t("AwaitActivation.code") + " *"}>
                            <Form.Control
                                type="text"
                                required
                                placeholder={t("AwaitActivation.code") + " *"}
                                onChange={codeChange}
                                isValid={code !== ""}
                            />
                        </FloatingLabel>
                    </Form.Group>
                    <a
                        href={LinkPagesHref(`activate?pubkey=${encodeURIComponent(pubKey)}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="link">Pour debugger tu là, puis tu reviens saisir le code</Button>
                    </a>
                    <br />
                    <Button onClick={setActivation}>{t("Common.OK")}</Button>
                </Form>
            </main>
        </div>
    );
}
