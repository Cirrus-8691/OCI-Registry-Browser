import DialogImageSupport, { ImageSupport } from "./Support";

const DialogImageRun = ({ infos, hide, editDisabled = false }: ImageSupport) => (
    <DialogImageSupport
        can={"CanRun"}
        infos={infos}
        hide={hide}
        editDisabled={editDisabled}
        translations={"DialogRunImage"}
    />
);

export default DialogImageRun;
