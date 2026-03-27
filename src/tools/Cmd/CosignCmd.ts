import { MergingObject } from "../Logger";
import Command from "./Command";

export class CosignCmd extends Command {
    constructor(route: MergingObject) {
        super("cosign", route);
    }

    async Verify(image: string): Promise<string> {
        return await this.execute([
            { param: "verify", secret: false },
            { param: image, secret: false },
        ]);
    }

}
