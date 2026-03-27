"use client";

import { Trans, useTranslation } from "react-i18next";
import Link from "next/link";
import styles from "../../page.module.css";
import Logo from "@/app/components/Logo";
import { Button, Form } from "react-bootstrap";
import { LinkPagesHref } from "@/tools/Homepage-BasePath";
import UserForm, { UserInputData, UserInputToUserDto } from "@/app/components/UserForm";
import { useEffect, useState } from "react";
import useApplicationContext, { UserIsNotConnected } from "@/app/ApplicationContext";
import { UserDto } from "@/app/api/user/create/User.dto";
import { UserInfo } from "@/app/api/user/entites/user.entity";
import { PostApi } from "@/tools/FetchApi";
import { CreateAlert } from "@/app/components/FlyingAlert";

export default function ChangePassword() {
    const { t } = useTranslation();
    const { userConnected, fetchContext, setAlert } = useApplicationContext();
    useEffect(() => {
        if (UserIsNotConnected(fetchContext)) {
            fetchContext.login();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [user, setUser] = useState<UserInputData>({
        email: userConnected.user.email as string,
        profile: userConnected.user.profile as string,
        password: "",
        want: "changePassword",
    });
    const [userIsValid, setUserIsValid] = useState(false);

    const save = async () => {
        const userDto: UserDto = UserInputToUserDto({
            ...user,
        });
        const updatedUser = await PostApi<UserInfo>(fetchContext, `user`, userDto, t("ChangePassword.error"));
        if (updatedUser) {
            setAlert(CreateAlert.success(t("ChangePassword.success")));
            fetchContext.login();
        }
    };
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <Logo image="user" />
                <Form>
                    <Form.Text style={{ fontSize: "1.25rem" }}>{t("ChangePassword.title")}</Form.Text>
                    <p>
                        {t("Common.or")}&nbsp;
                        <Link href={LinkPagesHref("/signup")}>
                            <Button variant="link">{t("Login.createNewRegistry")}</Button>
                        </Link>
                    </p>
                    <Trans i18nKey="ChangePassword.explain" />
                    <UserForm user={user} setUser={setUser} userIsValid={userIsValid} setUserIsValid={setUserIsValid} />
                    <Button disabled={!userIsValid} onClick={save}>{t("Common.OK")}</Button>
                </Form>
            </main>
        </div>
    );
}
