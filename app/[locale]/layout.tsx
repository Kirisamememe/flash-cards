import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import Nav from "@/components/ui/nav/nav";
import React from "react";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Ailingo",
    description: "Utilize your extra displays for language learning!",
};

export default async function LocaleLayout({ children, params: { locale } }: Readonly<{
    children: React.ReactNode;
    params: { locale: string };
}>) {

    const session = await auth()

    return (
        <html lang={locale}>
        <body className={`${inter.className} h-svh`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <Nav userId={session?.user.id} userName={session?.user.name || ""} avatar={session?.user.image || ""} isLogin={!!session}/>
            {children}
            <Toaster/>
        </ThemeProvider>
        </body>
        </html>
    );
}
