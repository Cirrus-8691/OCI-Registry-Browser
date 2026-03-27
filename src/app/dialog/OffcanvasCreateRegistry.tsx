import { Button, Form, Offcanvas } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import RegistryForm from "../components/RegistryForm";
import { PostApi } from "@/tools/FetchApi";
import useApplicationContext from "../ApplicationContext";
import { useEffect, useState } from "react";
import { ValidRegistry } from "../page";
import { RegistryEntity } from "../api/registry/registry.entity";

const OffcanvasCreateRegistry = ({
    data,
    savedRegistry,
    hide,
}: {
    data: ValidRegistry | undefined;
    savedRegistry: (value: ValidRegistry) => void;
    hide: () => void;
}) => {
    const { t } = useTranslation();
    const { fetchContext } = useApplicationContext();
    const [registryToSave, setRegistryToSave] = useState(data);
    useEffect(() => {
        setRegistryToSave(data);
    }, [data]);
    const save = async () => {
        if (registryToSave) {
            const savedRegistryEntity = await PostApi<RegistryEntity>(
                fetchContext,
                `registry/create`,
                registryToSave.registry,
                t("Common.errors.identification")
            );
            if (savedRegistryEntity) {
                const validRegistry: ValidRegistry = {
                    registry: savedRegistryEntity,
                    valid: registryToSave.valid,
                };
                savedRegistry(validRegistry);
                hide();
            }
        }
    };
    return (
        <Offcanvas show={data} onHide={hide} placement="end">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>{t("CreateRegistry.title")}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <RegistryForm data={registryToSave} setRegistry={setRegistryToSave} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Button
                            disabled={!(registryToSave?.valid?.urlOk && !!registryToSave?.registry.name)}
                            onClick={save}
                        >
                            {t("Common.OK")}
                        </Button>
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

export default OffcanvasCreateRegistry;
