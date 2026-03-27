import { Form, Offcanvas, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import JsonView from "@uiw/react-json-view";
import { vscodeTheme } from "@uiw/react-json-view/vscode";
import { TraceEntity } from "../api/trace/trace.entity";

const OffcanvasDetailTraceChange = ({ trace, hide }: { trace: TraceEntity | undefined; hide: () => void }) => {
    const { t } = useTranslation();
    return (
        <Offcanvas show={!!trace} onHide={hide} placement="bottom">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>{t("Trace.detail")}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                {trace && (
                    <Form>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th># </th>
                                    <th>{t("Common.date")}</th>
                                    <th>{t("Common.user")}</th>
                                    <th>{t("Common.function")}</th>
                                    <th>{t("Common.type")}</th>
                                    <th>{t("Common.action")}</th>
                                    <th>{t("Common.table")}</th>
                                    <th>{t("Common.itemId")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr key={trace.id?.toString()}>
                                    <td>{trace.id?.toString()}</td>
                                    <td>{trace.date ? trace.date.toString() : ""}</td>
                                    <td>{trace.userId ? (trace.userId as number) : ""}</td>
                                    <td>{trace.function}</td>
                                    <td>{trace.type as string}</td>
                                    <td>{trace.action as string}</td>
                                    <td>{trace.table}</td>
                                    <td>{trace.itemId}</td>
                                </tr>
                            </tbody>
                        </Table>
                        <Form.Text style={{ fontSize: "1.25rem" }}>{t("Common.changes")}</Form.Text>
                        <Form.Group className="mb-3">
                            <JsonView
                                value={JSON.parse(trace.change)}
                                style={vscodeTheme}
                                enableClipboard={false}
                                displayDataTypes
                                displayObjectSize={false}
                            />
                        </Form.Group>
                    </Form>
                )}
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default OffcanvasDetailTraceChange;
