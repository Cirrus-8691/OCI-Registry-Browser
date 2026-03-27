import { Trans, useTranslation } from "react-i18next";
import { Button, FloatingLabel, Form, Modal } from "react-bootstrap";
import Copyright from "@/tools/Copyright";
import { ChangeEvent, useState } from "react";

export default function ConfirmDelete({
    confirm,
    show,
    title,
    children,
    confirmString,
}: Readonly<{
    confirm: (value: boolean) => void;
    show: boolean;
    title: string;
    confirmString: string;
    children: React.ReactNode;
}>) {
    const { t } = useTranslation();

    const onValidate = () => confirm(true);
    const onCancel = () => confirm(false);

    const [del, setDelete] = useState("");
    const deleteChange = (event: ChangeEvent<HTMLInputElement>) => setDelete(event.target.value);

    return (
        <Modal show={show} onHide={onCancel}>
            <Modal.Header closeButton>
                <Modal.Title>{`${Copyright.logo} ${Copyright.name}`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>
                            <Trans i18nKey={title} />
                        </Form.Label>
                        <Form.Label>
                        {children}
                        </Form.Label>
                        <Form.Group className="mb-3">
                            <FloatingLabel label={confirmString}>
                                <Form.Control
                                    type="email"
                                    required
                                    placeholder={confirmString}
                                    onChange={deleteChange}
                                    isInvalid={del !== confirmString}
                                />
                            </FloatingLabel>
                        </Form.Group>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button disabled={del !== confirmString} onClick={onValidate}>
                    {t("Common.OK")}
                </Button>
                <Button variant="secondary" onClick={onCancel}>
                    {t("Common.cancel")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
