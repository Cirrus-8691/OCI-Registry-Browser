import Auth, { RegistryUser } from "./Auth";

export default class Basic implements Auth {
    authorization(token: string) {
        return token ? `Basic ${token}` : "";
    }
    token(credential: RegistryUser) {
        // echo -n "user:password" | base64
        if (credential.name && credential.password) {
            const buffer = Buffer.from(`${credential.name}:${credential.password}`);
            return buffer.toString('base64');
        }
        return "";
    }
}