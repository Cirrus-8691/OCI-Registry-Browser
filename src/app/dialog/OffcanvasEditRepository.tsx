import { Button, Form, Offcanvas } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import RepositoryForm from "../components/RepositoryForm";
import { PostApi } from "@/tools/FetchApi";
import useApplicationContext from "../ApplicationContext";
import { useEffect, useState } from "react";
import { Repository } from "../api/repository/repository.entity";
import { RegistryEntity } from "../api/registry/registry.entity";

const OffcanvasEditRepository = ({
    registry,
    data,
    savedRepository,
    hide,
}: {
    registry: RegistryEntity | undefined;
    data: Repository | undefined;
    savedRepository: (value: Repository) => void;
    hide: () => void;
}) => {
    const { t } = useTranslation();
    const { fetchContext } = useApplicationContext();
    const [repositoryToSave, setRepositoryToSave] = useState(data);
    
    useEffect(() => {
        setRepositoryToSave(data);
    }, [data]);
    
    const save = async () => {
        if (repositoryToSave && registry) {
            const savedRepositoryEntity = await PostApi<Repository>(
                fetchContext,
                `repository`,
                {
                    registry: registry.id,
                    repository: repositoryToSave.repository,
                    rating: repositoryToSave.rating,
                    description: repositoryToSave.description
                },
                t("Common.errors.identification")
            );
            if (savedRepositoryEntity) {
                savedRepository(savedRepositoryEntity);
                hide();
            }
        }
    };
    
    return (
        <Offcanvas show={!!data} onHide={hide} placement="end">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>{t("EditRepository.title")}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <RepositoryForm data={repositoryToSave} setRepository={setRepositoryToSave} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Button onClick={save}>{t("Common.OK")}</Button>
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

export default OffcanvasEditRepository;
