import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationDE from "../../public/locales/de/translation.json";
import translationEN from "../../public/locales/en/translation.json";
import translationES from "../../public/locales/es/translation.json";
import translationFR from "../../public/locales/fr/translation.json";
import translationIT from "../../public/locales/it/translation.json";


export const DefaultLanguage = "fr";

const resources = {
  de: { translation: translationDE, },
  en: { translation: translationEN, },
  es: { translation: translationES, },
  fr: { translation: translationFR, },
  it: { translation: translationIT, },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: DefaultLanguage,
    keySeparator: ".",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;