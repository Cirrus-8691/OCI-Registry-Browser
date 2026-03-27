import { MergingObject } from "../Logger";
import Command from "./Command";

export class DockerCmd extends Command {
    constructor(route: MergingObject) {
        super("docker", route);
    }

    async Pull(image: string): Promise<string> {
        return await this.execute([
            { param: "pull", secret: false },
            { param: image, secret: false },
        ]);
    }

    async Trust(image: string): Promise<string> {
        return await this.execute([
            { param: "trust", secret: false },
            { param: "inspect", secret: false },
            { param: image, secret: false },
        ]);
    }
}
