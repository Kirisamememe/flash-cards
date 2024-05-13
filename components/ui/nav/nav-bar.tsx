'use client'

import Logo from "@/components/ui/nav/logo";
import GithubLink from "@/components/ui/nav/githubLink";
import RightMenu from "@/components/ui/nav/right-menu";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/ui/nav/modeToggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookA, CircleUser, Cpu, Tv2 } from "lucide-react";
import NavItem from "@/components/ui/nav/nav-item";
import useMediaQuery from "@mui/material/useMediaQuery";


export default function NavBar({children, isLogin}: {children: React.ReactNode, isLogin: boolean}) {

    const isSmallDevice = useMediaQuery('(max-width:640px)');

    return (
        <>
            <nav className="fixed top-0 w-full h-20 sm:h-24 pl-2 pr-4 sm:px-8 flex justify-between items-center z-20">
                <Logo className={"scale-90 sm:scale-100"}/>
                <div className={"flex gap-2 sm:gap-4 items-center"}>
                    <GithubLink/>
                    <RightMenu/>
                    <Separator className={"h-6 mr-1.5"} orientation="vertical"/>
                    {(!isSmallDevice || isLogin) && <ModeToggle className={"mr-2"}/>}
                    {children}
                </div>
            </nav>

            <nav
                className={"sm:hidden z-20 fixed bottom-0 left-[50%] translate-x-[-50%] w-full h-[62px] bg-background/80 ring-1 ring-foreground/5 dark:ring-foreground/10 backdrop-blur-xl"}>
                <div className={"flex justify-center items-center h-[62px]"}>
                    <NavItem className={"w-[18.5%] ml-[2%]"} href={"/"}><Tv2 size={24}/></NavItem>
                    <NavItem className={"w-[18.5%]"} href={"/words"}><BookA size={24}/></NavItem>
                    <Button className={"w-[22%] h-full rounded-none invisible"} variant={"ghost"}></Button>
                    {/*<NavItem className={"w-[18.5%]"} href={"/ai"}><Cpu size={24}/></NavItem>*/}
                    <Button disabled className={"w-[18.5%] h-full rounded-none hover:bg-transparent"} variant={"ghost"}>
                        <Link href={"/ai"}><Cpu size={24}/></Link>
                    </Button>
                    <Button disabled className={"w-[18.5%] h-full rounded-none hover:bg-transparent mr-[2%]"} variant={"ghost"}>
                        <CircleUser size={24}/>
                    </Button>
                </div>

            </nav>
        </>
    )
}