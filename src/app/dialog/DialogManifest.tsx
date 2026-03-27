import { useTranslation } from "react-i18next";
import Dialog from "./Dialog";
import { FloatingLabel, Form, InputGroup } from "react-bootstrap";
import { ManifestV1, ManifestV2, ManifestEntity } from "../api/repository/manifest/manifest.entity";
import JsonView from "@uiw/react-json-view";
import { vscodeTheme } from '@uiw/react-json-view/vscode';

export default function DialogManifest({ entity, hide }: { entity: ManifestEntity | undefined; hide: () => void }) {
    const { t } = useTranslation();
    const setShow = (value: boolean) => {
        if (!value) {
            hide();
        }
    };
    return (
        <Dialog size="xl" show={!!entity} setShow={setShow} title={t("DialogManifest.title")}>
            {entity && entity.header && (
                <>
                    <InputGroup className="mb-3">
                        <FloatingLabel style={{ maxWidth: "160px" }} label={t("Common.apiVersion")}>
                            <Form.Control
                                type="text"
                                disabled
                                defaultValue={entity.header.docker.distributionApiVersion}
                            />
                        </FloatingLabel>
                        <FloatingLabel label={t("DialogManifest.contentType")}>
                            <Form.Control type="text" disabled defaultValue={entity.header.content.type} />
                        </FloatingLabel>
                        <FloatingLabel label={t("DialogManifest.digest")}>
                            <Form.Control type="text" disabled defaultValue={entity.header.docker.contentDigest} />
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mb-3">
                        <FloatingLabel style={{ maxWidth: "160px" }} label={t("DialogManifest.schemaVersion")}>
                            <Form.Control type="text" disabled defaultValue={entity.manifest.schemaVersion} />
                        </FloatingLabel>
                        {entity.manifest.schemaVersion === 1 && (
                            <>
                                <FloatingLabel label={t("Common.name")}>
                                    <Form.Control
                                        type="text"
                                        disabled
                                        defaultValue={(entity.manifest as ManifestV1).name}
                                    />
                                </FloatingLabel>
                                <FloatingLabel label={t("DialogManifest.configTag")}>
                                    <Form.Control
                                        type="text"
                                        disabled
                                        defaultValue={(entity.manifest as ManifestV1).tag}
                                    />
                                </FloatingLabel>
                                <FloatingLabel label={t("DialogManifest.architecture")}>
                                    <Form.Control
                                        type="text"
                                        disabled
                                        defaultValue={(entity.manifest as ManifestV1).architecture}
                                    />
                                </FloatingLabel>
                            </>
                        )}
                        {entity.manifest.schemaVersion === 2 && (
                            <>
                                <FloatingLabel label={t("DialogManifest.configMediaType")}>
                                    <Form.Control
                                        type="text"
                                        disabled
                                        defaultValue={(entity.manifest as ManifestV2).config?.mediaType}
                                    />
                                </FloatingLabel>
                                <FloatingLabel label={t("DialogManifest.configTag")}>
                                    <Form.Control
                                        type="text"
                                        disabled
                                        defaultValue={(entity.manifest as ManifestV2).config?.digest}
                                    />
                                </FloatingLabel>
                            </>
                        )}
                    </InputGroup>
                    <JsonView 
                        value={entity.manifest} 
                        style={vscodeTheme}
                        enableClipboard={false}
                        displayDataTypes={false}
                        displayObjectSize={false}
                    />
                </>
            )}
        </Dialog>
    );
}
