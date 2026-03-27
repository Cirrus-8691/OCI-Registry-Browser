import { Form, InputGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Repository } from "../api/repository/repository.entity";
import { Rating } from "./Rating";

const RepositoryForm = ({
    data,
    setRepository,
}: {
    data: Repository | undefined;
    setRepository: (value: Repository | undefined) => void;
}) => {
    const { t } = useTranslation();

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (data) {
            setRepository({
                ...data,
                description: e.target.value,
            });
        }
    };

    if (!data) return null;

    return (
        <>
            {/* Repository Name (read-only) */}
            <InputGroup className="mb-3">
                <InputGroup.Text>{t("Repository.title")}</InputGroup.Text>
                <Form.Control disabled type="text" value={data.repository} />
            </InputGroup>

            {/* Rating */}
            <InputGroup className="mb-3">
                <Rating
                    value={data.rating}
                    updateValue={(newValue: number) => {
                        if (data) {
                            setRepository({
                                ...data,
                                rating: newValue,
                            });
                        }
                    }}
                />
            </InputGroup>

            {/* Description */}
            <InputGroup className="mb-3">
                <InputGroup.Text>{t("Repository.description")}</InputGroup.Text>
                <Form.Control type="text" value={data.description || ""} onChange={handleDescriptionChange} />
            </InputGroup>
        </>
    );
};

export default RepositoryForm;
