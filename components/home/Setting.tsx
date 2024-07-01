import { CaptionsOff, Captions, Disc3, CirclePause } from "lucide-react";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle"
import { useState } from "react";
import { useDebouncedCallback } from 'use-debounce';
import { flipAnimator } from "@/components/home/FlashCard";
import { cn, playSEAudio } from "@/app/lib/utils";
import { useSession } from "next-auth/react";

export default function Setting() {

    // console.log("Settingがレンダリングされたようだ")
    const { data: session } = useSession()

    const blindMode = useWordbookStore((state) => state.blindMode)
    const setBlindMode = useWordbookStore((state) => state.setBlindMode)
    const playTTS = useWordbookStore((state) => state.playTTS)
    const setPlayTTS = useWordbookStore((state) => state.setPlayTTS)
    const userInterval = useWordbookStore((state) => state.userInterval)
    const setUserInterval = useWordbookStore((state) => state.setUserInterval)
    const setCurrentIndex = useWordbookStore((state) => state.setCurrentIndex)

    const [sliderValue, setSliderValue] = useState(userInterval)

    const handleSlider = useDebouncedCallback((value: number[]) => {
        setUserInterval(value[0] * 1000)
        localStorage.setItem("interval", (value[0] * 1000).toString())
    },1000)

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

        const flashcard = document.getElementById("flashcard")
        const btnArea = document.getElementById("btnArea")
        flipAnimator(flashcard, btnArea, null, null, setBlindMode, value).then()
    }

    const handleMute = (value: boolean) => {
        setPlayTTS(value)
        localStorage.setItem("playTTS", value ? "1" : "0")
    }

    return (
        <div className={"flex flex-col w-svw h-36 sm:h-24 sm:max-w-[32rem] lg:max-w-[48rem] items-center justify-start flex-none"} >
            <div className={"w-full h-20 flex items-center justify-center gap-2 sm:gap-4 pl-6 pr-6"} >
                <Toggle pressed={blindMode} onPressedChange={handleBlindModeSwitchChange} className={"group flex-none rounded-full p-0 size-14 text-muted-foreground hover:scale-110 hover:bg-primary/10 hover:text-primary active:bg-primary/10 active:scale-90 data-[state=on]:bg-transparent data-[state=on]:text-primary data-[state=on]:hover:bg-primary/10 data-[state=on]:hover:text-primary data-[state=off]:bg-transparent data-[state=off]:text-primary data-[state=off]:hover:bg-primary/10 data-[state=off]:hover:text-primary transition-all"} type={"button"} >
                    <CaptionsOff className={cn("group-data-[state=off]:hidden", blindMode ? "group-hover:hidden" : "group-hover:block")} size={28}/>
                    <Captions className={cn("group-data-[state=on]:hidden", blindMode ? "group-hover:block" : "group-hover:hidden")} size={28}/>
                </Toggle>

                <Slider
                    value={[sliderValue >= 1000 ? sliderValue / 1000 : 2]}
                    max={30} min={2} step={2}
                    onValueChange={(value) => {
                        playSEAudio("/slider.mp3")
                        setSliderValue(value[0] * 1000)
                        handleSlider(value) }}>
                    {`${sliderValue / 1000}秒`}
                </Slider>

                <Toggle pressed={playTTS} onPressedChange={handleMute} disabled={!session?.user}
                        className={cn(
                            "group flex-none rounded-full p-0 size-14 text-muted-foreground hover:scale-110 hover:bg-primary/10 hover:text-primary active:bg-primary/10 active:scale-90 data-[state=on]:bg-transparent data-[state=on]:text-primary data-[state=on]:hover:bg-primary/10 data-[state=on]:hover:text-primary data-[state=off]:bg-transparent data-[state=off]:text-primary/50 data-[state=off]:hover:bg-primary/10 data-[state=off]:hover:text-primary transition-all",
                            !playTTS && "text-muted-foreground")}
                        type={"button"}>
                    <CirclePause
                        className={cn("hidden", playTTS && "group-hover:block")}
                        size={28}/>
                    <Disc3
                        className={cn(playTTS ? "animate-spin group-hover:hidden" : "group-hover:animate-spin")}
                        size={28}/>
                </Toggle>
            </div>
        </div>

    )
}