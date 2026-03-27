"use client";

import styles from "../../page.module.css";
import useApplicationContext from "../../ApplicationContext";
import { Button, Col, Form, Row } from "react-bootstrap";
import { CreateAlert } from "../../components/FlyingAlert";
import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { LinkPagesHref } from "@/tools/Homepage-BasePath";
import Logo from "@/app/components/Logo";
import Footer from "@/app/components/Footer";
import DialogGtu from "@/app/dialog/DialogGtu";
import { useTranslation } from "react-i18next";
import { UndefinedRegistry } from "@/app/api/registry/registry.entity";
import RegistryForm from "@/app/components/RegistryForm";
import { ValidRegistry } from "@/app/page";
import UserForm, { UserInputData } from "@/app/components/UserForm";
import { UserInfo } from "@/app/api/user/entites/user.entity";
import { PostApi } from "@/tools/FetchApi";

type Event = ChangeEvent<HTMLInputElement>;

export default function Signup() {
    const { t } = useTranslation();
    const { setAlert, fetchContext } = useApplicationContext();
    const onClick = () => {
        const signup = async () => {
            if (user && registry) {
                const userCreated = await PostApi<UserInfo>(
                    fetchContext,
                    `user/signup`,
                    { registry: registry.registry, user },
                    t("Common.errors.identification")
                );
                if (userCreated) {
                    setAlert(CreateAlert.success(t("Signup.success", { email: user.email })));
                    localStorage.clear();
                    fetchContext.login();
                }
            } else {
                setAlert(CreateAlert.error(t("Common.errors.identification")));
            }
        };

        signup();
    };

    const [user, setUser] = useState<UserInputData>({
        email: "",
        password: "",
        want: "createAdmin",
    });
    const [userIsValid, setUserIsValid] = useState(false);

    const [gtu, setGtu] = useState(false);
    const gtuChange = (event: Event) => setGtu(event.target.checked);

    const [registry, setRegistry] = useState<ValidRegistry | undefined>({
        registry: UndefinedRegistry,
        valid: undefined,
    });

    const [showGtu, setShowGtu] = useState(false);
    return (
        <>
            <DialogGtu show={showGtu} setShow={setShowGtu} />
            <div className={styles.page}>
                <Link href={LinkPagesHref("/login")}>
                    {t("NewRegistry.alreadyAnAccount")}
                    <Button variant="link">{t("NewRegistry.connectYourself")}</Button>
                </Link>
                <main className={styles.main}>
                    <Logo />
                    <Form>
                        <Row>
                            <Form.Label>{t("NewRegistry.createNewRegistry")}</Form.Label>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Label>{t("NewRegistry.newUser")}</Form.Label>
                                <UserForm
                                    user={user}
                                    setUser={setUser}
                                    userIsValid={userIsValid}
                                    setUserIsValid={setUserIsValid}
                                />
                                <Form.Group className="mb-3">
                                    <Form.Check>
                                        <Form.Check.Input type="checkbox" onChange={gtuChange} isValid={gtu} />
                                        <Form.Check.Label>
                                            {t("NewRegistry.iAgree")}
                                            <Button variant="link" onClick={() => setShowGtu(true)}>
                                                {t("NewRegistry.gtu")}
                                            </Button>
                                        </Form.Check.Label>
                                    </Form.Check>
                                </Form.Group>
                            </Col>
                            <Col>
                                <RegistryForm simple data={registry} setRegistry={setRegistry} />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Button
                                    variant="primary"
                                    onClick={onClick}
                                    disabled={
                                        !userIsValid || !registry || !registry.registry.url || !gtu
                                    }
                                >
                                    {t("NewRegistry.createRegistry")}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </main>
                <Footer />
            </div>
        </>
    );
}
