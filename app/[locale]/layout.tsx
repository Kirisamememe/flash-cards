import type { Metadata } from "next";
import type { Viewport } from 'next'
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import Nav from "@/components/nav/nav";
import React from "react";
import { auth } from "@/app/lib/auth";
import { WordbookStoreProvider } from "@/providers/wordbook-store-provider";
import IntlProvider from "@/app/[locale]/IntlProvider";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Ailingo",
    description: "Utilize your extra displays for language learning!",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false
}


export default async function LocaleLayout({ children, params: { locale } }: Readonly<{
    children: React.ReactNode;
    params: { locale: string };
}>) {

    const session = await auth()

    // h-dvhは、主にsafari対策
    // 僕も可能なら普通にbodyでスクロールしたかった…
    // でもbodyをスクロールエリアにすると、Drawerの動きがおかしくなる…
    return (
        <html lang={locale}>
        <body className={`${inter.className} h-dvh selection:bg-primary/50 selection:text-foreground`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <WordbookStoreProvider userId={session?.user.id} url={session?.user.image} userName={session?.user.name}>
                <IntlProvider>
                    <Nav />
                    <main className={"h-dvh overflow-scroll"} id={"scrollArea"}>
                        {children}
                    </main>
                </IntlProvider>
            </WordbookStoreProvider>
            <Toaster/>
        </ThemeProvider>
        </body>
        </html>
    );
}
