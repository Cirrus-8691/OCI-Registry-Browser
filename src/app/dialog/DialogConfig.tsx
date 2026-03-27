import { useTranslation } from "react-i18next";
import Dialog from "./Dialog";
import { FloatingLabel, Form, InputGroup } from "react-bootstrap";
import {
    ConfigEntity,
    ConfigDocker,
    ConfigHelm,
} from "../api/repository/manifest/manifest.entity";
import JsonView from "@uiw/react-json-view";
import { vscodeTheme } from "@uiw/react-json-view/vscode";

export default function DialogConfig({ entity, hide }: { entity: ConfigEntity | undefined; hide: () => void }) {
    const { t } = useTranslation();
    const setShow = (value: boolean) => {
        if (!value) {
            hide();
        }
    };
    if(!entity) {
        return null;
    }
    const configDocker = entity as ConfigDocker;
    const configHelm = entity as ConfigHelm;
    return (
        <Dialog size="xl" show={!!entity} setShow={setShow} title={t("Repository.config")}>
            <>
                {configDocker.architecture && configDocker.os && (
                    <InputGroup className="mb-3">
                        <FloatingLabel style={{ maxWidth: "160px" }} label={t("Os")}>
                            <Form.Control type="text" disabled defaultValue={configDocker.os} />
                        </FloatingLabel>
                        <FloatingLabel style={{ maxWidth: "160px" }} label={t("Architecture")}>
                            <Form.Control type="text" disabled defaultValue={configDocker.architecture} />
                        </FloatingLabel>
                        <FloatingLabel label={t("Created")}>
                            <Form.Control type="text" disabled defaultValue={configDocker.created} />
                        </FloatingLabel>
                    </InputGroup>
                )}
                {configHelm.name && configHelm.type && (
                    <>
                        <InputGroup className="mb-3">
                            <FloatingLabel style={{ maxWidth: "160px" }} label={t("ApiVersion")}>
                                <Form.Control type="text" disabled defaultValue={configHelm.apiVersion} />
                            </FloatingLabel>
                            <FloatingLabel label={t("Name")}>
                                <Form.Control type="text" disabled defaultValue={configHelm.name} />
                            </FloatingLabel>
                            <FloatingLabel style={{ maxWidth: "160px" }} label={t("Chart Version")}>
                                <Form.Control type="text" disabled defaultValue={configHelm.version} />
                            </FloatingLabel>
                            <FloatingLabel label={t("Type")}>
                                <Form.Control type="text" disabled defaultValue={configHelm.type} />
                            </FloatingLabel>
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <FloatingLabel label={t("Description")}>
                                <Form.Control type="text" disabled defaultValue={configHelm.description} />
                            </FloatingLabel>
                            <FloatingLabel style={{ maxWidth: "160px" }} label={t("AppVersion")}>
                                <Form.Control type="text" disabled defaultValue={configHelm.appVersion} />
                            </FloatingLabel>
                        </InputGroup>
                    </>
                )}
                <JsonView
                    value={entity}
                    style={vscodeTheme}
                    enableClipboard={false}
                    displayDataTypes={false}
                    displayObjectSize={false}
                />
            </>
        </Dialog>
    );
}
