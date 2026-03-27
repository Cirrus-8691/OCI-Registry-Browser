"use client";

import { Trans, useTranslation } from "react-i18next";
import styles from "../../page.module.css";
import Logo from "@/app/components/Logo";
import { Form } from "react-bootstrap";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import useApplicationContext from "@/app/ApplicationContext";
import { PostApi } from "@/tools/FetchApi";
import { ActivateDto } from "@/app/api/user/activation/activate.dto";
import { CreateAlert } from "@/app/components/FlyingAlert";

function Activate_() {
    const { t } = useTranslation();
    const { fetchContext, setAlert } = useApplicationContext();
    const searchParams = useSearchParams();
    const pubkey = searchParams.get("pubkey");
    const [code, setCode] = useState("");
    useEffect(() => {
        const getActivation = async () => {
            if (!pubkey) {
                setAlert(CreateAlert.error(t("Activate.error")));
                fetchContext.login();
            } else {
                const activate: ActivateDto = { pubkey };
                const result = await PostApi<string>(
                    fetchContext,
                    `user/activation`,
                    activate,
                    t("Common.errors.identification")
                );
                if (result) {
                    setCode(result);
                } else {
                    setAlert(CreateAlert.error(t("Activate.error")));
                }
            }
        };
        getActivation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <Logo image="user" />
                <Form>
                    <Form.Text style={{ fontSize: "1.25rem" }}>{t("Activate.title")}</Form.Text>
                    <Form.Group className="mb-3">
                        <Trans i18nKey="Activate.explain" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        {t("Activate.code")} <code style={{ fontSize: "1.5em" }}>{code}</code>
                    </Form.Group>
                </Form>
            </main>
        </div>
    );
}

export default function Activate() {
    return (
        <Suspense>
            <Activate_ />
        </Suspense>
    );
}
