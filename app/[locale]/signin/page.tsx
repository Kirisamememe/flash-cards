"use client"

import { Social } from "@/components/auth/socialButtons"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "next-intl"

export default function Signin() {
    const t = useTranslations('User')

    return (
        <div className={"flex flex-col justify-center items-center h-screen"}>
            <Card className={"max-w-[25rem] w-full p-6 rounded-4 shadow-2xl"}>
                <CardHeader className={"gap-2 mb-4 p-0"}>
                    <CardTitle>
                        {t("signIn")}
                    </CardTitle>
                    <CardDescription className={"text-xs leading-relaxed whitespace-pre-wrap"}>
                        {t("description")}
                        </CardDescription>
                </CardHeader>
                <Social/>
            </Card>
        </div>
    )
}