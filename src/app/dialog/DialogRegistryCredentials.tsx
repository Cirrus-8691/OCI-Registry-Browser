import { useTranslation } from "react-i18next";
import Dialog from "./Dialog";
import { ChangeEvent, useEffect, useState } from "react";
import { FloatingLabel, Form } from "react-bootstrap";
import useApplicationContext from "../ApplicationContext";

export default function DialogRegistryCredentials() {
    const { t } = useTranslation();

    const { registryCredential, setRegistryCredential } = useApplicationContext();
    const [show, setShow] = useState(false);
    useEffect(() => {
        if (registryCredential.user.name && registryCredential.user.password === "") {
            setShow(true);
        }
    }, [registryCredential.user.name, registryCredential.user.password]);

    const [password, setPassword] = useState("");
    const passwordChange = (event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value);

    const validate = () =>
        setRegistryCredential({
            user: {
                name: registryCredential.user.name,
                password,
            },
        });

    useEffect(() => {
        if (!(registryCredential.user.name && registryCredential.user.password === "")) {
            registryCredential.action(registryCredential);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [registryCredential.action, registryCredential.token]);

    return (
        <Dialog show={show} setShow={setShow} validate={validate} title={t("RegistryCredentials.title")}>
            <Form.Group className="mb-3">
                <Form.Text>{t("RegistryCredentials.explain")}</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
                <FloatingLabel label={t("Common.user")}>
                    <Form.Control type="email" value={registryCredential.user.name} disabled />
                </FloatingLabel>
            </Form.Group>
            <Form.Group className="mb-3">
                <FloatingLabel label={t("Common.password") + " *"}>
                    <Form.Control
                        type="password"
                        required
                        placeholder={t("Common.password") + " *"}
                        onChange={passwordChange}
                        isInvalid={registryCredential.user.password === ""}
                    />
                </FloatingLabel>
            </Form.Group>
        </Dialog>
    );
}
