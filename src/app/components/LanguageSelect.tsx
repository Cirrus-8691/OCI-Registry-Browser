import { ChangeEvent, useState } from "react";
import { Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const LanguageSelect = () => {
    const { t, i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
    const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const language = event.target.value;
        setCurrentLanguage(language);
        i18n.changeLanguage(language);
    };

    return (
        <Form.Select size="sm" onChange={onChange} defaultValue={currentLanguage}>
            <option value="de">{`🇩🇪 ${t("LanguageSelect.de")}`}</option>
            <option value="en">{`🇬🇧 ${t("LanguageSelect.en")}`}</option>
            <option value="es">{`🇪🇸 ${t("LanguageSelect.es")}`}</option>
            <option value="fr">{`🇫🇷 ${t("LanguageSelect.fr")}`}</option>
            <option value="it">{`🇮🇹 ${t("LanguageSelect.it")}`}</option>
        </Form.Select>
    );
};

export default LanguageSelect;
