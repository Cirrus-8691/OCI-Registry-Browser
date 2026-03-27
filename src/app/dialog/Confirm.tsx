import Copyright from "@/tools/Copyright";
import { Button, Form, Modal } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";

export default function Confirm(
    props: Readonly<{
        size?: "sm" | "lg" | "xl";
        show: boolean;
        confirm: (value: boolean) => void;
        title: string;
        children: React.ReactNode;
    }>
) {
    const onValidate = () => props.confirm(true);
    const onCancel = () => props.confirm(false);
    const { t } = useTranslation();
    return (
        <Modal show={props.show} size={props.size} onHide={onCancel}>
            <Modal.Header closeButton>
                <Modal.Title>{`${Copyright.logo} ${Copyright.name}`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>
                            <Trans i18nKey={props.title} />
                        </Form.Label>
                        {props.children}
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onValidate}>{t("Common.OK")}</Button>
                <Button variant="secondary" onClick={onCancel}>
                    {t("Common.cancel")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
