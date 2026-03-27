import { Button, Form, Offcanvas } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { PostApi } from "@/tools/FetchApi";
import useApplicationContext from "../ApplicationContext";
import { useEffect, useState } from "react";
import { UserInfo } from "../api/user/entites/user.entity";
import UserForm, { UserInputData, UserInputToUserDto } from "../components/UserForm";

const OffcanvasCreateUser = ({
    data,
    savedUser,
    hide,
}: {
    data: UserInfo | undefined;
    savedUser: (value: UserInfo) => void;
    hide: () => void;
}) => {
    const { t } = useTranslation();
    const { fetchContext } = useApplicationContext();
    const [user, setUser] = useState<UserInputData>({
        email: "",
        profile: "",
        password: "",
        want: "create",
    });
    const [userIsValid, setUserIsValid] = useState(false);

    const save = async () => {
        const userCreated = await PostApi<UserInfo>(
            fetchContext,
            `user/create`,
            UserInputToUserDto(user),
            t("Common.errors.identification")
        );
        if (userCreated) {
            savedUser(userCreated);
            hide();
        }
    };

    useEffect(() => {
        if (data) {
            setUser({
                email: data.email as string,
                desc: (data.desc as string) ?? "",
                profile: data.profile as string,
                password: "",
                want: "create",
            });
        }
    }, [data]);
    return (
        <Offcanvas show={!!data} onHide={hide} placement="end">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>{t("CreateUser.title")}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <UserForm
                            user={user}
                            setUser={setUser}
                            userIsValid={userIsValid}
                            setUserIsValid={setUserIsValid}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Button disabled={!userIsValid} onClick={save}>{t("Common.OK")}</Button>
                        &nbsp;
                        <Button onClick={hide} variant="secondary">
                            {t("Common.cancel")}
                        </Button>
                    </Form.Group>
                </Form>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default OffcanvasCreateUser;
