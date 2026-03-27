import DialogImageSupport, { ImageSupport } from "./Support";

const DialogImagePull = ({ infos, hide, editDisabled = false }: ImageSupport) => (
    <DialogImageSupport
        can={"CanPull"}
        infos={infos}
        hide={hide}
        editDisabled={editDisabled}
        translations={"DialogPullImage"}
    />
);

export default DialogImagePull;
