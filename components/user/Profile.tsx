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
import { sync } from "@/app/lib/sync";
import { useToast } from "@/components/ui/use-toast";
import { SignOut } from "@/components/auth/signOut";


export default function Profile() {

    const t = useTranslations('User')
    // const { data: session } = useSession()

    const userInfo = useWordbookStore((state) => state.userInfo)
    const setUserInfo = useWordbookStore((state) => state.setUserInfo)
    const words = useWordbookStore((state) => state.words)
    const setWords = useWordbookStore((state) => state.setWords)
    const setPos = useWordbookStore((state) => state.setPos)
    const blindMode = useWordbookStore((state) => state.blindMode)
    const setBlindMode = useWordbookStore((state) => state.setBlindMode)

    const [progressVal, setProgressVal] = useState(0)
    const [progressMessage, setProgressMessage] = useState("")

    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()

    const locale = useLocale();

    const handleSync = useCallback( () => {
        if (userInfo) {
            startTransition(async () => {
                await sync(words, setWords, setPos, userInfo, setProgressMessage, setProgressVal, t, toast)
            })
        }
    },[setPos, setWords, t, toast, userInfo, words])


    useEffect(() => {
        // 自動同期
        if (userInfo && userInfo.auto_sync) {
            if (userInfo.synced_at){
                if (new Date().getTime() - userInfo.synced_at.getTime() > 24 * 60 * 60 * 1000) {
                    handleSync()
                }
            }
            else handleSync()
        }
    }, [userInfo, handleSync]);

    if (!userInfo) return null

    return (
        <div className={"flex flex-col h-full justify-between max-w-[25rem] min-w-80"}>
            <div className={"flex flex-col"}>
                <Card className={"mt-8 mb-3"}>
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
                    <CardContent className={"flex flex-col px-9 pb-6"}>
                        {userInfo && <div className={"h-8 flex w-full justify-between items-center gap-6 mb-3"}>
                            <h4 className="font-medium leading-none">{t("auto_sync")}</h4>
                            <Switch
                                checked={userInfo.auto_sync || false}
                                defaultChecked={userInfo.auto_sync || false}
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
                    </CardContent>
                </Card>
                <div>
                    <Card>
                        {isPending && <CardHeader className={"gap-3"}>
                            <CardTitle className={"text-center"}>{t('syncing')}</CardTitle>
                            <CardDescription className={"text-center"}>{progressMessage}</CardDescription>
                            <Progress
                                className={"h-2 w-full"}
                                value={progressVal}/>
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