import { FloatingLabel, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { ChangeEvent, useState } from "react";
import useApplicationContext from "../ApplicationContext";
import { Profile } from "../api/user/entites/user.entity";
import { UserDto } from "../api/user/create/User.dto";

export type Want = "createAdmin" | "create" | "input" | "edit" | "changePassword";

const EmailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
const RegexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^*]).{8,}$/;

export interface UserInputData {
    want: Want;
    email: string;
    desc?: string;
    password: string;
    profile?: string | undefined;
    mustChangePassword?: boolean;
}
export const UserInputToUserDto = (user: UserInputData): UserDto => ({
    email: user.email,
    desc: user.desc,
    password: user.password,
    profile: (user.profile ?? "user-view") as Profile,
    mustChangePassword: user.mustChangePassword,
});

const UserForm = ({
    user,
    setUser,
    userIsValid,
    setUserIsValid,
}: {
    user: UserInputData;
    setUser: React.Dispatch<React.SetStateAction<UserInputData>>;
    userIsValid: boolean;
    setUserIsValid: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const { t } = useTranslation();
    const { userConnected } = useApplicationContext();

    const setInput = (field: string, value: string) => setUser((prevRegistry) => ({ ...prevRegistry, [field]: value }));

    const descChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInput("desc", event.target.value);
        setUserIsValid(!passwordInvalid && !emailInvalid);
    };
    const profileChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setInput("profile", event.target.value);
        setUserIsValid(!passwordInvalid && !emailInvalid);
    };

    const [emailInvalid, setEmailInvalid] = useState(!EmailRegex.test(user.email));
    const emailChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newEmail = event.target.value;
        setInput("email", newEmail);
        const isValid = EmailRegex.test(newEmail);
        if (userIsValid && !isValid) {
            setUserIsValid(false);
        }
        if (isValid && !passwordInvalid) {
            setUserIsValid(true);
        }
        setEmailInvalid(!isValid);
    };

    const [passwordInvalid, setPasswordInvalid] = useState(false);
    const passwordChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newPassword = event.target.value;
        setInput("password", newPassword);
        const isValid = RegexPassword.test(newPassword);
        if (userIsValid && !isValid) {
            setUserIsValid(false);
        }
        if (isValid && !emailInvalid) {
            setUserIsValid(true);
        }
        setPasswordInvalid(!isValid);
    };

    const [changePassword, setMustChangePassword] = useState(false);
    const changePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
        const changePassword = event.target.checked;
        setMustChangePassword(changePassword);
        setUser((prevRegistry) => ({ ...prevRegistry, mustChangePassword: changePassword }));
        setUserIsValid(!passwordInvalid && !emailInvalid);
    };

    const passwordLabel =
        user.want === "edit" || user.want === "changePassword"
            ? t("UserForm.newPassword")
            : t("Common.password") + " *";
    const cannotUpdateMyself = userConnected.user.email === user.email;

    return (
        <>
            {user && (
                <>
                    <Form.Group className="mb-3">
                        <FloatingLabel label={t("Common.email") + " *"}>
                            <Form.Control
                                type="email"
                                required={user.want === "input"}
                                disabled={user.want === "edit" || user.want === "changePassword"}
                                placeholder={t("Common.email") + " *"}
                                onChange={emailChange}
                                isInvalid={emailInvalid}
                                defaultValue={user.email}
                            />
                        </FloatingLabel>
                    </Form.Group>
                    {user.want !== "edit" && (
                        <Form.Group className="mb-3">
                            <FloatingLabel label={passwordLabel}>
                                <Form.Control
                                    type="password"
                                    required={user.want === "input"}
                                    placeholder={passwordLabel}
                                    onChange={passwordChange}
                                    isInvalid={passwordInvalid}
                                />
                            </FloatingLabel>
                            <Form.Label style={{ fontSize: "0.75rem", color: "red" }}>
                                {passwordInvalid ? t("Common.passwordPoliciy") : ""}
                            </Form.Label>
                        </Form.Group>
                    )}
                    {user.want === "edit" && user.email !== userConnected.user.email && (
                        <Form.Group className="mb-3">
                            <Form.Check>
                                <Form.Check.Input
                                    type="checkbox"
                                    checked={changePassword}
                                    onChange={changePasswordChange}
                                />
                                <Form.Check.Label>{t("UserForm.awaitChangePassword")}</Form.Check.Label>
                            </Form.Check>
                        </Form.Group>
                    )}
                    {(user.want === "create" || user.want === "edit") && (
                        <>
                            <Form.Group className="mb-3">
                                <FloatingLabel label={t("Common.desc")}>
                                    <Form.Control
                                        type="email"
                                        placeholder={t("Common.desc")}
                                        onChange={descChange}
                                        defaultValue={user.desc}
                                    />
                                </FloatingLabel>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <FloatingLabel label={t("Common.profile") + " *"}>
                                    <Form.Select
                                        size="sm"
                                        onChange={profileChange}
                                        defaultValue={user.profile}
                                        required={!cannotUpdateMyself}
                                        disabled={cannotUpdateMyself}
                                    >
                                        <option value="admin">{t("Common.profiles.admin")}</option>
                                        <option value="user-view">{t("Common.profiles.user-view")}</option>
                                        <option value="user-del-tag">{t("Common.profiles.user-del-tag")}</option>
                                        <option value="user-adm-reg">{t("Common.profiles.user-adm-reg")}</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Form.Group>
                        </>
                    )}
                </>
            )}
        </>
    );
};

export default UserForm;
