"use client";

import { createContext, useContext, useState } from "react";
import { AlertMessage } from "./components/FlyingAlert";
import { NotConnected, UserConnected, UserInfo } from "./api/user/entites/user.entity";
import { RegistryCredential, InputCredential } from "@/tools/Auth/Auth";
import Basic from "@/tools/Auth/Basic";
import { Want } from "./components/UserForm";

export type PageTarget = "login" | "repository" | "";

export interface FetchContext {
    setAlert: (alert: AlertMessage) => void;
    userConnected: UserConnected;
    setUserConnected: (alert: UserConnected) => void;
    login: () => void;
}

export const UserIsNotConnected = (fetchContext: FetchContext) => {
    const userIsNotConnected = fetchContext.userConnected.tokens.auth === NotConnected.tokens.auth;
    if (userIsNotConnected) {
        const previousUserConnected = localStorage.getItem("UserConnected");
        const userConnected = previousUserConnected ? JSON.parse(previousUserConnected) : undefined;
        if (!userConnected) {
            return userIsNotConnected;
        }
        if (userConnected.user.active !== "activated") {
            return userIsNotConnected;
        }
        fetchContext.userConnected = userConnected;
        fetchContext.setUserConnected(userConnected);
        return false;
    }
    return userIsNotConnected;
};

export interface ApplicationContext {
    registryCredential: RegistryCredential;
    setRegistryCredential: (credential: InputCredential) => void;

    alerts: AlertMessage[];
    setAlert: (alert: AlertMessage) => void;
    removeAlert: (alert: AlertMessage) => void;

    userConnected: UserConnected;
    setUserConnected: React.Dispatch<React.SetStateAction<UserConnected>>;
    editUser: { user: UserInfo; want: Want } | undefined;
    setEditUser: React.Dispatch<React.SetStateAction<{ user: UserInfo; want: Want } | undefined>>;
    updatedUser: UserInfo | undefined;
    setUpdatedUser: React.Dispatch<React.SetStateAction<UserInfo | undefined>>;

    fetchContext: FetchContext;

    pageTarget: PageTarget;
    setPageTarget: React.Dispatch<React.SetStateAction<PageTarget>>;
}

const ApplicationContext = createContext<ApplicationContext | undefined>(undefined);

const useApplicationContext = () => {
    const context = useContext(ApplicationContext);
    if (!context) {
        throw new Error("useApplicationContext must be used in a ApplicationContext.Provider");
    }
    return context;
};

export const ApplicationContextProvider = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const [registryCredential, setInternalCredential] = useState<RegistryCredential>({
        user: {
            name: "",
            password: "",
        },
        token: "",
        auth: "Basic",
        api: { url: "" },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        action: async (credential: RegistryCredential) => {},
    });

    const setRegistryCredential = (credential: InputCredential) => {
        const auth = credential.auth ? credential.auth : registryCredential.auth;
        let token = registryCredential.token;
        switch (auth) {
            case "Basic":
                token = new Basic().token(credential.user);
                break;
            case "ApiKey":
                token = "TODO..."; // TODO
                break;
            default:
                token = "";
        }
        const api = credential.api
            ? {
                  url: credential.api.url.trim(),
                  timeout: credential.api.timeout,
              }
            : registryCredential.api;
        setInternalCredential({
            auth,
            user: credential.user,
            token,
            api,
            action: credential.action ?? registryCredential.action,
            toValidate: credential.toValidate ?? registryCredential.toValidate,
        });
    };

    const [alerts, setAlerts] = useState<AlertMessage[]>([]);
    const [userConnected, setUserConnected] = useState<UserConnected>(NotConnected);
    const [editUser, setEditUser] = useState<{ user: UserInfo; want: Want } | undefined>(undefined);
    const [updatedUser, setUpdatedUser] = useState<UserInfo | undefined>(undefined);

    const removeAlert = (alert: AlertMessage) =>
        setAlerts((prevAlerts) => prevAlerts.filter((prevAlert) => prevAlert !== alert));
    const setAlert = (alert: AlertMessage) => {
        setAlerts((prevAlerts) => [...prevAlerts, alert]);
        setTimeout(() => removeAlert(alert), 3000);
    };

    const [pageTarget, setPageTarget] = useState<PageTarget>("");
    const fetchContext = {
        setAlert,
        userConnected,
        setUserConnected,
        login: () => {
            setPageTarget("login");
        },
    };

    return (
        <ApplicationContext.Provider
            value={{
                registryCredential,
                setRegistryCredential,

                alerts,
                setAlert,
                removeAlert,

                userConnected,
                setUserConnected,
                editUser,
                setEditUser,
                updatedUser,
                setUpdatedUser,

                fetchContext,

                pageTarget,
                setPageTarget,
            }}
        >
            {children}
        </ApplicationContext.Provider>
    );
};

export default useApplicationContext;
