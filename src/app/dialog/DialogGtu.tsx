import Copyright from "@/tools/Copyright";
import { useTranslation } from "react-i18next";
import Dialog from "./Dialog";
import { Form } from "react-bootstrap";

const GTU =
    "" +
    "GENERAL TERMS OF USE\n" +
    "\n" +
    "Version 1.0 – Last updated: 08-06-2025\n" +
    "\n" +
    "Article 1 – Preamble\n" +
    `These General Terms of Use (hereinafter the 'GTU') govern the access to and use of the mobile\n`+
    `application and/or web service named ${Copyright.name} (hereinafter the 'Application').\n`+
    ` The Application is the exclusive property of ${Copyright.author}.\n` +
    "\n" +
    "Article 2 – Restriction of Access and Use\n" +
    `Access to and use of the Application are strictly limited to one and only one natural person identified\n`+
    `as ${Copyright.author}. Any other person, including family members, friends, colleagues, or any other legal\n`+
    `or natural entity, is not authorized to access or use the Application.\n` +
    "\n" +
    "By accessing the Application, the user certifies that they are the person designated above.\n"+
    "Any access by an unauthorized person will be considered a violation of these GTU\n"+
    "and may lead to legal action.\n" +
    "\n" +
    "Article 3 – Intellectual Property\n" +
    `The content of the Application (including, but not limited to, texts, graphics, images, sounds, videos,\n`+
    `logos, icons) is the exclusive property of ${Copyright.author} or its licensors and is protected by French\n`+
    `and international intellectual property laws.\n` +
    "\n" +
    `User agrees not to reproduce, copy, modify, alter, create derivative works from, distribute,\n`+
    `publicly display, transmit, sell, or exploit in any way, all or part of the content of the Application,\n`+
    `without the express prior authorization of ${Copyright.author}.\n` +
    "\n" +
    "Article 4 – Liability\n" +
    `The Application is provided 'as is' and ${Copyright.author} does not guarantee its uninterrupted or error-free\n`+
    `operation. ${Copyright.author} shall not be held liable for any direct or indirect damages resulting from \n`+
    `the use of the Application by User or the inability to use it.\n` +
    "\n" +
    "User is solely responsible for the use of the Application and agrees to comply with all applicable laws\n"+
    "and regulations.\n" +
    "\n" +
    "Article 5 – Termination\n" +
    `${Copyright.author} reserves the right to terminate or suspend user's access to the Application, at any time\n`+
    `and without prior notice, in the event of non-compliance with these GTU.\n` +
    "\n" +
    "Article 6 – Applicable Law and Jurisdiction\n" +
    "These GTU are governed by French law. In the event of a dispute concerning their interpretation\n"+
    "or execution, the French courts will have exclusive jurisdiction.\n";

export default function DialogGtu({ show, setShow }: { show: boolean; setShow: (value: boolean) => void }) {
    const { t } = useTranslation();
    return (
        <Dialog size="lg" show={show} setShow={setShow} title={t("DialogGtu.gtu")}>
            <Form.Control
                as="textarea"
                wrap={"off"}
                rows={GTU.split("\n").length}
                value={GTU}
                readOnly
            />
        </Dialog>
    );
}
