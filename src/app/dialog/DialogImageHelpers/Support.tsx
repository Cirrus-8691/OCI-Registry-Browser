import { useTranslation } from "react-i18next";
import Dialog from "../Dialog";
import { FloatingLabel, Form, InputGroup } from "react-bootstrap";
import { ChangeEvent, useEffect, useState } from "react";
import { ImageMeta, RegistryUsageCan } from "@/tools/RegistryUsage/RegistryUsage";
import UserSupport from "../../components/UserSupport";

export interface ImageSupport {
    infos: ImageMeta | undefined;
    hide: () => void;
    editDisabled?: boolean;
}

interface Props extends ImageSupport {
    can: RegistryUsageCan;
    translations: string;
}

export default function DialogImageSupport({ can, infos, translations, hide, editDisabled = false }: Props) {
    const { t } = useTranslation();
    const setShow = (value: boolean) => {
        if (!value) {
            hide();
        }
    };
    const [meta, setMeta] = useState<ImageMeta | undefined>(
        infos
            ?  infos.image && infos.image.name
                ? infos
                : {
                      ...infos,
                      image: {
                          name: "mynginx",
                          tag: "latest",
                          path: "",
                      },
                  }
            : undefined
    );
    useEffect(() => {
        setMeta(
            infos
                ?  infos.image && infos.image.name
                    ? infos
                    : {
                          ...infos,
                          image: {
                              name: "mynginx",
                              tag: "latest",
                              path: "",
                          },
                      }
                : undefined
        );
    }, [infos]);

    const setMetaImage = (prevInfo: ImageMeta, field: string, value: string): ImageMeta => {
        return {
            ...prevInfo,
            image: {
                ...prevInfo.image,
                [field]: value,
            },
        };
    };
    const imageChange = (event: ChangeEvent<HTMLInputElement>) =>
        setMeta((prevInfo) => (prevInfo ? setMetaImage(prevInfo, "name", event.target.value) : undefined));
    const tagChange = (event: ChangeEvent<HTMLInputElement>) =>
        setMeta((prevInfo) => (prevInfo ? setMetaImage(prevInfo, "tag", event.target.value) : undefined));
    const pathChange = (event: ChangeEvent<HTMLInputElement>) =>
        setMeta((prevInfo) => (prevInfo ? setMetaImage(prevInfo, "path", event.target.value) : undefined));

    return (
        <Dialog show={!!infos} setShow={setShow} title={t(`${translations}.title`)}>
            {meta && (
                <>
                    <Form.Group className="mb-3">
                        <FloatingLabel label={t(`DialogImageSupport.path`)}>
                            <Form.Control
                                type="text"
                                disabled={editDisabled}
                                placeholder={t(`DialogImageSupport.path`)}
                                defaultValue={meta.image.path}
                                onChange={pathChange}
                            />
                        </FloatingLabel>
                        <InputGroup className="mb-3">
                            <FloatingLabel label={t(`DialogImageSupport.image`) + " *"}>
                                <Form.Control
                                    type="text"
                                    disabled={editDisabled}
                                    required
                                    placeholder={t(`DialogImageSupport.image`) + " *"}
                                    defaultValue={meta.image.name}
                                    onChange={imageChange}
                                    isValid={meta.image.name !== ""}
                                />
                            </FloatingLabel>
                            <FloatingLabel label={t(`DialogImageSupport.tag`) + " *"}>
                                <Form.Control
                                    type="tag"
                                    disabled={editDisabled}
                                    required
                                    placeholder={t(`DialogImageSupport.tag`) + " *"}
                                    defaultValue={meta.image.tag}
                                    onChange={tagChange}
                                    isValid={meta.image.tag !== ""}
                                />
                            </FloatingLabel>
                        </InputGroup>
                    </Form.Group>
                    <UserSupport can={can} meta={meta} translations={translations} />
                </>
            )}
        </Dialog>
    );
}
