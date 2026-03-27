import { useTranslation } from "react-i18next";
import Dialog from "./Dialog";
import { Form } from "react-bootstrap";

const LICENCE =
    "" +
    "MIT License\n" +
    "\n" +
    "Copyright (c) 2025 Cirrus-8691\n" +
    "\n" +
    "Permission is hereby granted, free of charge, to any person obtaining a copy\n" +
    'of this software and associated documentation files (the "Software"), to deal\n' +
    "in the Software without restriction, including without limitation the rights\n" +
    "to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n" +
    "copies of the Software, and to permit persons to whom the Software is\n" +
    "furnished to do so, subject to the following conditions:\n" +
    "\n" +
    "The above copyright notice and this permission notice shall be included in all\n" +
    "copies or substantial portions of the Software.\n" +
    "\n" +
    'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n' +
    "IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n" +
    "FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n" +
    "AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n" +
    "LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n" +
    "OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n" +
    "SOFTWARE.\n";

export default function DialogAbout({ show, setShow }: { show: boolean; setShow: (value: boolean) => void }) {
    const { t } = useTranslation();
    return (
        <Dialog size="lg" show={show} setShow={setShow} title={t("DialogAbout.licence")}>
            <Form.Control
                as="textarea"
                wrap={"off"}
                rows={LICENCE.split('\n').length}
                value={LICENCE}
                readOnly
            />
        </Dialog>
    );
}
