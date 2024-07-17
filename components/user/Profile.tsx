import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import React, { useCallback, useEffect, useState, useTransition } from "react";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { useLocale, useTranslations } from "next-intl";
import { useToast } from "@/components/ui/use-toast";
import { SignOut } from "@/components/auth/signOut";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LanguageCode, languageList } from "@/types/User";


export default function Profile() {

    const t = useTranslations('User')
    // const { data: session } = useSession()

    const userInfo = useWordbookStore((state) => state.userInfo)
    const setUserInfo = useWordbookStore((state) => state.setUserInfo)
    const words = useWordbookStore((state) => state.words)
    const setWords = useWordbookStore((state) => state.setWords)
    const blindMode = useWordbookStore((state) => state.blindMode)
    const playSE = useWordbookStore((state) => state.playSE)
    const setBlindMode = useWordbookStore((state) => state.setBlindMode)
    const setPlaySE = useWordbookStore((state) => state.setPlaySE)
    const sync = useWordbookStore((state) => state.sync)
    const progress = useWordbookStore((state) => state.progress)

    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()

    const locale = useLocale();

    const handleSync = useCallback( () => {
        if (userInfo) {
            startTransition(async () => {
                await sync(t, toast)
            })
        }
    },[sync, t, toast, userInfo])

    const handleLearningLanguageChange = (value: LanguageCode) => {
        if (!userInfo) return
        setUserInfo({ ...userInfo, learning_lang: value, updated_at: new Date() }).then()
    }

    const handleTranslationLanguageChange = (value: LanguageCode | "NONE") => {
        if (!userInfo) return
        setUserInfo({ ...userInfo, trans_lang: value === "NONE" ? undefined : value, updated_at: new Date() }).then()
    }

    if (!userInfo) return null

    return (
        <div className={"flex flex-col h-full justify-between min-w-80"}>
            <div className={"flex flex-col gap-3"}>
                <Card className={"mt-8"}>
                    <CardHeader className={"items-center gap-2"}>
                        <Avatar className={"w-20 h-20"}>
                            <AvatarImage src={userInfo.image || ""}/>
                            <AvatarFallback>{userInfo.name && userInfo.name[0] || "A"}</AvatarFallback>
                        </Avatar>
                        <SheetTitle className={"text-xl text-center"}>{userInfo.name}</SheetTitle>
                        <div className={"flex flex-col w-full p-6 gap-2 items-center justify-center"}>
                            <h1 className={"text-5xl font-bold"}>{words.length}</h1>
                            <p>{t("learning")}</p>
                        </div>
                        <Separator/>
                    </CardHeader>
                    <CardContent className={"flex flex-col px-9 pb-6 space-y-3"}>
                        {userInfo && <div className={"h-8 flex w-full justify-between items-center gap-6"}>
                            <h4 className="font-medium leading-none">{t("auto_sync")}</h4>
                            <Switch
                                checked={userInfo.auto_sync}
                                defaultChecked={userInfo.auto_sync}
                                onCheckedChange={(value) => setUserInfo({
                                    ...userInfo,
                                    auto_sync: value,
                                    updated_at: new Date()
                                })}
                            />
                        </div>}
                        <div className={"h-8 flex w-full justify-between items-center gap-6"}>
                            <h4 className="font-medium leading-none">{t("blind_mode")}</h4>
                            <Switch
                                checked={blindMode}
                                defaultChecked={blindMode}
                                onCheckedChange={(value) => setBlindMode(value)}
                            />
                        </div>
                        <div className={"h-8 hidden sm:flex w-full justify-between items-center gap-6"}>
                            <h4 className="font-medium leading-none">{t("play_sound_effect")}</h4>
                            <Switch
                                checked={playSE}
                                defaultChecked={playSE}
                                onCheckedChange={(value) => setPlaySE(value)}
                            />
                        </div>

                    </CardContent>
                </Card>
                <Card className={""}>
                    <CardContent className={"flex flex-col gap-4 py-5"}>
                        <div className={"space-y-2"}>
                            <label
                                className={"flex items-center ml-1.5 gap-2.5 text-sm text-muted-foreground font-semibold"}>
                                <div className={"px-0.5 py-1 bg-muted-foreground/50"}/>
                                {"Learning Language"}
                            </label>
                            <Select defaultValue={userInfo?.learning_lang} onValueChange={handleLearningLanguageChange}>
                                <SelectTrigger className={"h-12 text-start"}>
                                    <SelectValue placeholder={"The Language you're learning."}/>
                                </SelectTrigger>
                                <SelectContent sideOffset={4}>
                                    {Object.entries(languageList).map(([key, value]) => (
                                        <SelectItem key={key} value={key} disabled={key === userInfo?.trans_lang}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className={"space-y-2"}>
                            <label
                                className={"flex items-center ml-1.5 gap-2.5 text-sm text-muted-foreground font-semibold"}>
                                <div className={"px-0.5 py-1 bg-muted-foreground/50"}/>
                                {"Translate Into"}
                            </label>
                            <Select defaultValue={userInfo?.trans_lang || "NONE"} onValueChange={handleTranslationLanguageChange}>
                                <SelectTrigger className={"h-12 text-start"}>
                                    <SelectValue placeholder={"The Language you want translate into."}/>
                                </SelectTrigger>
                                <SelectContent sideOffset={4}>
                                    <SelectItem value={"NONE"}>
                                        {"Do not translate."}
                                    </SelectItem>
                                    {Object.entries(languageList).map(([key, value]) => (
                                        <SelectItem key={key} value={key} disabled={key === userInfo?.learning_lang}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>

                </Card>
                <div>
                    <Card>
                        {isPending && <CardHeader className={"gap-3"}>
                            <CardTitle className={"text-center"}>{t('syncing')}</CardTitle>
                            <CardDescription className={"text-center"}>{progress.message}</CardDescription>
                            <Progress
                                className={"h-2 w-full"}
                                value={progress.progress}/>
                        </CardHeader>}
                        {!isPending && <CardContent className={"flex flex-col pt-6 gap-4 items-center"}>
                            <Button className={"w-full"} onClick={handleSync} type={"button"} disabled={isPending}>
                                {t("sync")}
                            </Button>
                            {userInfo?.synced_at ?
                                <div className={"flex gap-4 text-foreground/50 text-xs text-center"}>
                                    <p>{`${t('synced_at')} : ${userInfo.synced_at.toLocaleString(locale, { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}`}</p>
                                </div> :
                                <p className={"text-muted-foreground text-xs text-center"}>{t('sync_at_null')}</p>}
                        </CardContent>}
                    </Card>
                </div>
            </div>
            <SignOut className={"flex flex-col w-full my-3"} text={t('signOut')}/>
        </div>
    )
}