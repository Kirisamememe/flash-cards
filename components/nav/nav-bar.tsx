'use client'

import useMediaQuery from "@mui/material/useMediaQuery";
import * as React from "react";
import { useEffect, useState } from "react";
import TabBar from "@/components/nav/TabBar";
import Header from "@/components/nav/Header";

export default function NavBar() {
    const isSmallDevice = useMediaQuery('(max-width:640px)');

    const [open, setOpen] = useState(false)
    const [atTop, setAtTop] = useState(true)
    const [lastScrollTop, setLastScrollTop] = useState(50)
    const [hideHeader, setHideHeader] = useState(false)


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
            {isSmallDevice && <TabBar setOpen={setOpen}/>}
            <Header className={ hideHeader ? "translate-y-[-100%]" : atTop ? "bg-transparent backdrop-blur-0" : "h-[3.75rem]" } open={open} setOpen={setOpen}/>
        </>

    )
}