import { CaptionsOff, Captions } from "lucide-react";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { saveUserInfoToLocal } from "@/app/lib/indexDB/saveToLocal";
import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle"


export default function Setting() {

    console.log("Settingがレンダリングされたようだ")

    const t = useTranslations('User')

    const userInfo = useWordbookStore((state) => state.userInfo)
    const setUserInfo = useWordbookStore((state) => state.setUserInfo)
    const blindMode = useWordbookStore((state) => state.blindMode)
    const setBlindMode = useWordbookStore((state) => state.setBlindMode)
    const loggedOutUse = useWordbookStore((state) => state.loggedOutUse)
    const setLoggedOutUse = useWordbookStore((state) => state.setLoggedOutUse)
    const userInterval = useWordbookStore((state) => state.userInterval)
    const setUserInterval = useWordbookStore((state) => state.setUserInterval)


    const handleSlider = (value: number[]) => {
        setUserInterval(Math.max(value[0] * 1000, 500))
        localStorage.setItem("interval", Math.max(value[0] * 1000, 500).toString())
    }

    const handleBlindModeSwitchChange = (value: boolean) => {
        setBlindMode(value, userInfo)
    }

    const handleAutoSyncSwitchChange = async (value: boolean) => {
        if (userInfo) {
            setUserInfo({ ...userInfo, auto_sync: value, updated_at: new Date() })

            localStorage.setItem("autoSync", value ? "1" : "0")
            await saveUserInfoToLocal(userInfo)
        }
    }

    return (
        <div className={"fixed left-[50%] translate-x-[-50%] bottom-20 sm:bottom-8 h-16 flex w-svw sm:w-[28rem] max-w-[28rem] items-center justify-center gap-2 sm:gap-4 pl-6 pr-12 sm:pr-16"} >
            <Toggle pressed={blindMode} onPressedChange={setBlindMode} className={"group flex-none rounded-full p-0 size-14 text-muted-foreground hover:scale-110 hover:bg-primary/10 hover:text-primary active:bg-primary/10 active:scale-90 data-[state=on]:bg-transparent data-[state=on]:text-primary data-[state=on]:hover:bg-primary/10 data-[state=on]:hover:text-primary data-[state=off]:bg-transparent data-[state=off]:text-primary data-[state=off]:hover:bg-primary/10 data-[state=off]:hover:text-primary transition-all"} type={"button"} >
                <CaptionsOff className={"group-data-[state=on]:hidden"} size={28}/>
                <Captions className={"group-data-[state=off]:hidden"} size={28}/>
            </Toggle>
            {/*<Popover>*/}
            {/*    <PopoverTrigger className={""} >*/}
            {/*        <Button className={"rounded-full h-14 hover:bg-primary/10 active:bg-primary/10"} type={"button"} variant={"ghost"}>*/}
            {/*            <SlidersVertical className={"text-primary"}/>*/}
            {/*        </Button>*/}
            {/*    </PopoverTrigger>*/}
            {/*    <PopoverContent className={"w-full rounded-xl px-8 py-6 gap-6"} >*/}
            {/*        {userInfo?.id ?*/}
            {/*            <div className={"h-8 flex w-full justify-between items-center gap-6 mb-3"}>*/}
            {/*                <h4 className="font-medium leading-none">{t("auto_sync")}</h4>*/}
            {/*                <Switch*/}
            {/*                    checked={userInfo?.auto_sync || false}*/}
            {/*                    defaultChecked={userInfo?.auto_sync || false}*/}
            {/*                    onCheckedChange={handleAutoSyncSwitchChange}*/}
            {/*                />*/}
            {/*            </div> :*/}
            {/*            <div className={"h-8 flex w-full justify-between items-center gap-6 mb-4"}>*/}
            {/*                <h4 className="font-medium leading-none">{t("use_when_logged_out")}</h4>*/}
            {/*                <Switch*/}
            {/*                    checked={loggedOutUse}*/}
            {/*                    defaultChecked={loggedOutUse}*/}
            {/*                    onCheckedChange={(value) => setLoggedOutUse(value)}*/}
            {/*                />*/}
            {/*            </div>*/}
            {/*        }*/}

            {/*        <div className={"h-8 flex w-full justify-between items-center gap-6"}>*/}
            {/*            <h4 className="font-medium leading-none">{t("blind_mode")}</h4>*/}
            {/*            <Switch*/}
            {/*                checked={blindMode}*/}
            {/*                defaultChecked={blindMode}*/}
            {/*                onCheckedChange={handleBlindModeSwitchChange}*/}
            {/*            />*/}
            {/*        </div>*/}
            {/*    </PopoverContent>*/}
            {/*</Popover>*/}
            <Slider
                defaultValue={[userInterval >= 1000 ? userInterval / 1000 : 0]}
                max={10} min={0} step={1}
                onValueChange={handleSlider}
                className={"w-80"}>
                {`${userInterval / 1000}秒`}
            </Slider>
        </div>

    )
}