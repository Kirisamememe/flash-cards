'use client'

import useMediaQuery from "@mui/material/useMediaQuery";
import * as React from "react";
import { useEffect, useState } from "react";
import TabBar from "@/components/nav/TabBar";
import Header from "@/components/nav/Header";
import ReactDOM from "react-dom";
import { cn } from "@/app/lib/utils";
import { useWordbookStore } from "@/providers/wordbook-store-provider";

function LoadingDiv({ isComing }: { isComing: boolean }) {
    return ReactDOM.createPortal(
        <div id={"loading-div"}
            className={cn(
                "z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                isComing ? "faceIn line-2-horizontal" : "hidden"
            )}
        />,
        document.body
    );
}

export default function NavBar() {
    const isSmallDevice = useMediaQuery('(max-width:640px)');

    const [open, setOpen] = useState(false)
    const [atTop, setAtTop] = useState(true)
    const [lastScrollTop, setLastScrollTop] = useState(50)
    const [hideHeader, setHideHeader] = useState(false)
    const isTransition = useWordbookStore((state) => state.isTransition)


    useEffect(() => {
        const scrollArea = document.getElementById('scrollArea')
        if (scrollArea) {
            const handleScroll = () => {
                setAtTop( scrollArea.scrollTop <= 30)
                const currentScrollTop = scrollArea.scrollTop

                if (currentScrollTop > lastScrollTop + 10) {
                    // 下にスクロール
                    setHideHeader(true)

                }
                else if (currentScrollTop <= lastScrollTop - 10) {
                    // 上にスクロール
                    setHideHeader(false)
                }
                setLastScrollTop(Math.max(currentScrollTop, 30))
            }
            console.log("スクロールしました")

            scrollArea && scrollArea.addEventListener("scroll", handleScroll)

            return () => {
                scrollArea && scrollArea.removeEventListener("scroll", handleScroll)
            }
        }
    }, [lastScrollTop])

    useEffect(() => {
        if (atTop) {
            setHideHeader(false)
        }
    }, [atTop])


    return (
        <>
            <LoadingDiv isComing={isTransition} />
            {isSmallDevice && <TabBar setOpen={setOpen}/>}
            <Header className={hideHeader ? "translate-y-[-100%]" : atTop ? "bg-transparent backdrop-blur-none" : "h-[3.75rem]"} open={open} setOpen={setOpen}/>
        </>

    )
}