import { exec } from "child_process";
import { promisify } from "util";
import { Log, MergingObject } from "../Logger";

const execAsync = promisify(exec);

export interface Parametre {
    param: string;
    secret: boolean;
}

export default class Command {
    static CurrentWorkingDirectory = process.cwd();

    protected cmd = "";
    protected route: MergingObject;

    constructor(cmd: string, route: MergingObject) {
        this.cmd = cmd;
        this.route = route;
    }

    private toLog(parametres: Parametre[]): string {
        const paramsLog = parametres.map((p) => (p.secret ? "***" : p.param)).join(" ");
        return `${this.cmd} ${paramsLog}`;
    }

    private fullCommand(parametres: Parametre[]): string {
        return `${this.cmd} ${parametres.map((p) => p.param).join(" ")}`;
    }

    async execute(parametres: Parametre[]): Promise<string> {
        const fullCommand = this.fullCommand(parametres);
        try {
            Log.log(this.route, this.toLog(parametres));
            const { stdout, stderr } = await execAsync(fullCommand, {
                cwd: Command.CurrentWorkingDirectory,
            });
            if (stdout !== "") {
                Log.log(this.route, this.toLog(parametres));
                stdout.split("\n").forEach((msg) => Log.log(this.route, msg));
            }
            if (stderr !== "") {
                Log.error(this.route, this.toLog(parametres));
                stderr.split("\n").forEach((msg) => Log.error(this.route, msg));
            }
            return stdout;
        } catch (error: unknown) {
            const { code, stdout, stderr } = error as { code: number; stdout: string; stderr: string };
            if (stderr && stderr !== "") {
                stderr.split("\n").forEach((msg) => Log.error(this.route, msg));
            }
            if (stdout && stdout !== "") {
                stdout.split("\n").forEach((msg) => Log.log(this.route, msg));
            }
            if (code !== 1) {
                Log.error(this.route, this.toLog(parametres));
                Log.error(this.route, error);
                throw error;
            }
            return stdout;
        }
    }
}

export function ChangeDirectory(directory: string, route: MergingObject) {
    if (Command.CurrentWorkingDirectory !== directory) {
        Log.log(route, "CurrentWorkingDirectory: " + directory);
        Command.CurrentWorkingDirectory = directory;
    }
}
