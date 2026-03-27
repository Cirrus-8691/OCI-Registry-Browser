import DialogImageSupport, { ImageSupport } from "./Support";

const DialogImagePush = ({ infos, hide }: ImageSupport) => (
    <DialogImageSupport can={"CanPush"} infos={infos} hide={hide} translations={"DialogPushImage"} />
);

export default DialogImagePush;
