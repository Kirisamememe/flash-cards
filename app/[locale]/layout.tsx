import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider"
import Nav from "@/components/ui/nav/nav";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Ailingo",
    description: "Utilize your extra displays for language learning!",
};

export default function LocaleLayout({ children, params: {locale} }: Readonly<{
    children: React.ReactNode;
    params: {locale: string};
}>) {
    return (
        <html lang={locale}>
            <body className={`${inter.className} h-svh`}>
                <Toaster/>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Nav/>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
