import Copyright from "@/tools/Copyright";
import { Button, Form, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function Dialog(
    props: Readonly<{
        size?: "sm" | "lg" | "xl";
        show: boolean;
        setShow: (value: boolean) => void;
        title: string;
        validate?: () => void;
        children: React.ReactNode;
    }>
) {
    const onClose = () => {
        if (props.validate) {
            props.validate();
        }
        props.setShow(false);
    };
    const { t } = useTranslation();
    return (
        <Modal show={props.show} size={props.size} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{`${Copyright.logo} ${Copyright.name}`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>{props.title}</Form.Label>
                        {props.children}
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onClose}>{t("Common.OK")}</Button>
            </Modal.Footer>
        </Modal>
    );
}
