import DialogImageSupport, { ImageSupport } from "./Support";

const DialogImageSignature = ({ infos, hide, editDisabled = false }: ImageSupport) => (
    <DialogImageSupport
        can={"CanSignature"}
        infos={infos}
        hide={hide}
        editDisabled={editDisabled}
        translations={"DialogCheckSignature"}
    />
);

export default DialogImageSignature;
