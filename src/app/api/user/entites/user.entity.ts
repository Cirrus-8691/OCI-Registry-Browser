import { DbForgetRow } from "../../../../tools/Database/PostgreSql/DbForgetTable";

export type Profile = "user-view" | "user-del-tag" | "user-adm-reg" | "admin" | "sys" | undefined;
export type Active = "awaitActivation" | "activated" | "changePassword"
export interface UserEntity extends DbForgetRow {
    id?: number;
    forgetAt?: Date | undefined;
    email: string;
    desc?: string;
    hashPwd: string;
    profile: Profile;
    active: Active;
}

export type UserInfo = Omit<UserEntity, "hashPwd">;

export const UndefinedUser: UserInfo = {
    email: "",
    profile: undefined
}

export interface Tokens {
    auth: string;
    renew: string;
}

export interface UserConnected {
    tokens: Tokens;
    user: UserInfo;
}

export const NotConnected: UserConnected = {
    tokens: {
        auth: "",
        renew: ""
    },
    user: {
        name: "",
        profile: undefined
    }
};
