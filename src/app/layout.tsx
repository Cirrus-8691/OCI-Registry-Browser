import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ApplicationContextProvider } from "./ApplicationContext";
import PageLayout from "./components/PageLayout";
import Copyright from "@/tools/Copyright";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-fields
export const metadata: Metadata = {
    title: Copyright.title,
    description: Copyright.version,
    applicationName: Copyright.name,
    keywords: ["oci", "registry"],
    authors: {
        name: "Cirrus-8691",
        url: "https://github.com/Cirrus-8691",
    },
    creator: "Cirrus-8691",
    publisher: "Cirrus-8691",
    other: {
        charSet: "utf-8",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <ApplicationContextProvider>
                <body className={`${geistSans.variable} ${geistMono.variable}`} style={{ minHeight: '100vh', margin: 0 }}>
                    <PageLayout>{children}</PageLayout>
                </body>
            </ApplicationContextProvider>
        </html>
    );
}
