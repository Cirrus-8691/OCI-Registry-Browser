"use client";

import styles from "../../page.module.css";
import useApplicationContext from "../../ApplicationContext";
import { Button, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LinkPagesHref } from "@/tools/Homepage-BasePath";
import Logo from "@/app/components/Logo";
import Footer from "@/app/components/Footer";
import { PostApi } from "@/tools/FetchApi";
import { NotConnected, UserConnected } from "@/app/api/user/entites/user.entity";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import UserForm, { UserInputData } from "@/app/components/UserForm";
import { CreateAlert } from "@/app/components/FlyingAlert";

export default function Login() {
    const { t } = useTranslation();
    const router = useRouter();
    const { fetchContext, setUserConnected, setAlert } = useApplicationContext();
    const signin = async () => {
        if (user.email && user.password) {
            const userConnected = await PostApi<UserConnected>(
                fetchContext,
                `user/signin`,
                user,
                t("Common.errors.identification")
            );
            localStorage.clear();
            if (userConnected) {
                setUserConnected(userConnected);
                localStorage.setItem("UserConnected", JSON.stringify(userConnected));
                switch (userConnected.user.active) {
                    case "activated":
                        router.push("/");
                        break;
                    case "awaitActivation":
                        router.push("/pages/awaitActivation");
                        break;
                    case "changePassword":
                        router.push("/pages/changePassword");
                        break;
                }
            } else {
                setAlert(CreateAlert.error(t("Common.errors.identification")));
                setUserConnected(NotConnected);
            }
        }
    };
    const [user, setUser] = useState<UserInputData>({
        email: "",
        password: "",
        want: "input",
    });
    const [userIsValid, setUserIsValid] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => setUserConnected(NotConnected), []);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <Logo />
                {/* <>
                    {ApiPath(" <= ApiPath")}
                    <br/>
                    {ImageSrc(" <= ImageSrc")}
                </> */}
                <Form>
                    <Form.Label>{t("Login.toAccesWorkspace")}</Form.Label>
                    <p>
                        {t("Common.or")}&nbsp;
                        <Link href={LinkPagesHref("/signup")}>
                            <Button variant="link">{t("Login.createNewRegistry")}</Button>
                        </Link>
                    </p>
                    <UserForm user={user} setUser={setUser} userIsValid={userIsValid} setUserIsValid={setUserIsValid} />
                    <Form.Group className="mb-3">
                        <Link href={LinkPagesHref("/forgottenPassword")}>
                            <Button variant="link">{t("Login.forgottenPassword")}</Button>
                        </Link>
                    </Form.Group>
                    <Button variant="primary" onClick={signin} /*disabled={!userIsValid}*/ >
                        {t("Login.connect")}
                    </Button>
                </Form>
            </main>
            <Footer />
        </div>
    );
}
