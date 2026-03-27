"use client";

import styles from "../../page.module.css";

import useApplicationContext from "../../ApplicationContext";
import { Button, FloatingLabel, Form } from "react-bootstrap";
import { CreateAlert } from "../../components/FlyingAlert";
import { ChangeEvent, useState } from "react";
import { LinkPagesHref } from "@/tools/Homepage-BasePath";
import Link from "next/link";
import Logo from "@/app/components/Logo";
import Footer from "@/app/components/Footer";
import { useTranslation } from "react-i18next";

export default function ForgottenPassword() {
    const { t } = useTranslation();
    const { setAlert } = useApplicationContext();
    const onClick = () => {
        setAlert(
            CreateAlert.error(
                t("ForgottenPassword.discalmer",{email})
            )
        );
    };

    const [email, setEmail] = useState("");
    const emailChange = (event: ChangeEvent<HTMLInputElement>) =>
        setEmail(event.target.value);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <Logo image="user" />
                <Form>
                    <Form.Label>
                         {t("ForgottenPassword.toChangePassword")}
                    </Form.Label>
                    <p>
                        {t("Common.or")}&nbsp;
                        <Link href={LinkPagesHref("/signup")}>
                            <Button variant="link">
                                {t("ForgottenPassword.createNewRegistry")}
                            </Button>
                        </Link>
                    </p>
                    <Form.Group className="mb-3">
                        <Form.Label> {t("Common.user")}</Form.Label>
                        <FloatingLabel label={t("Common.email")+" *"}>
                            <Form.Control
                                type="email"
                                required
                                placeholder={t("Common.email")+" *"}
                                onChange={emailChange}
                                isValid={email!==""}
                            />
                        </FloatingLabel>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Link href={LinkPagesHref("/login")}>
                            <Button variant="link">
                                {t("ForgottenPassword.connectWithPassword")}
                            </Button>
                        </Link>
                    </Form.Group>
                    <Button
                        variant="primary"
                        onClick={onClick}
                        disabled={email === ""}
                    >
                        {t("ForgottenPassword.sendEmail")}
                    </Button>
                </Form>
            </main>
            <Footer />
        </div>
    );
}
