import { CaptionsOff, Captions } from "lucide-react";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle"
import { useState } from "react";
import { useDebouncedCallback } from 'use-debounce';

export default function Setting() {

    console.log("Settingがレンダリングされたようだ")

    const userInfo = useWordbookStore((state) => state.userInfo)
    const blindMode = useWordbookStore((state) => state.blindMode)
    const setBlindMode = useWordbookStore((state) => state.setBlindMode)
    const userInterval = useWordbookStore((state) => state.userInterval)
    const setUserInterval = useWordbookStore((state) => state.setUserInterval)
    const setCurrentIndex = useWordbookStore((state) => state.setCurrentIndex)

    const [sliderValue, setSliderValue] = useState(userInterval)

    const handleSlider = useDebouncedCallback((value: number[]) => {
        setUserInterval(value[0] * 1000)
        localStorage.setItem("interval", (value[0] * 1000).toString())
        document.getAnimations().map(a => a.cancel())

        console.log("！！！setBlindModeが実行されました！！！")
    },400)

    const handleBlindModeSwitchChange = (value: boolean) => {
        if (blindMode) {
            const prev = localStorage.getItem("prevInterval") || "10000"
            localStorage.setItem("interval", prev)
            setSliderValue(parseInt(prev))
            setUserInterval(parseInt(prev))
        } else {
            localStorage.setItem("prevInterval", userInterval.toString())
            localStorage.setItem("interval", "10000")
            setSliderValue(10000)
            setUserInterval(10000)
            setCurrentIndex(0)
        }

        setBlindMode(value, userInfo)
    }

    return (
        <div className={"flex flex-col w-svw h-40 sm:h-24 sm:max-w-[32rem] lg:max-w-[48rem] items-center justify-start flex-none"} >
            <div className={"w-full h-20 flex items-center justify-center gap-2 sm:gap-4 pl-6 pr-12 sm:pr-16"} >
                <Toggle pressed={blindMode} onPressedChange={handleBlindModeSwitchChange} className={"group flex-none rounded-full p-0 size-14 text-muted-foreground hover:scale-110 hover:bg-primary/10 hover:text-primary active:bg-primary/10 active:scale-90 data-[state=on]:bg-transparent data-[state=on]:text-primary data-[state=on]:hover:bg-primary/10 data-[state=on]:hover:text-primary data-[state=off]:bg-transparent data-[state=off]:text-primary data-[state=off]:hover:bg-primary/10 data-[state=off]:hover:text-primary transition-all"} type={"button"} >
                    <CaptionsOff className={"group-data-[state=on]:hidden"} size={28}/>
                    <Captions className={"group-data-[state=off]:hidden"} size={28}/>
                </Toggle>

                <Slider
                    value={[sliderValue >= 1000 ? sliderValue / 1000 : 2]}
                    max={30} min={2} step={1}
                    onValueChange={(value) => {
                        setSliderValue(value[0] * 1000)
                        handleSlider(value) }}>
                    {`${sliderValue / 1000}秒`}
                </Slider>
            </div>
        </div>

    )
}