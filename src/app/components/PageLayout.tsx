"use client";

import '@/tools/i18n';
import "../globals.css";
import React, { useEffect } from "react";
import useApplicationContext from "../ApplicationContext";

import FlyingAlert from "./FlyingAlert";
import { ToastContainer } from "react-bootstrap";
import NavigationBar from './NavigationBar';
import { useRouter } from 'next/navigation';
import DialogRegistryCredentials from '../dialog/DialogRegistryCredentials';

export default function PageLayout({
    children,
}: Readonly<{
    showHistory?: boolean;
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const { alerts, removeAlert, pageTarget, setPageTarget } = useApplicationContext();
    useEffect(() => {
        if (pageTarget) {
            router.push(`/pages/${pageTarget}`);
            setPageTarget("");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageTarget]);

    return (
        <div>
            <ToastContainer className="p-3" position={"top-end"}>
                {alerts.map((alert, index) => (
                    <FlyingAlert key={index.toString()} message={alert} onClose={() => removeAlert(alert)} />
                ))}
            </ToastContainer>
            <DialogRegistryCredentials />
            <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <NavigationBar />
                <div style={{ flex: 1 }}>{children}</div>
            </main>
        </div>
    );
}
