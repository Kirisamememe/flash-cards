import Logo from "@/components/nav/logo";
import { NavItem } from "@/components/nav/nav-item";
import { BadgeHelp, BookA, Cpu, Tv2 } from "lucide-react";
import GithubLink from "@/components/nav/githubLink";
import RightMenu from "@/components/nav/right-menu";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/nav/modeToggle";
import { cn } from "@/app/lib/utils";
import AvatarMenu from "@/components/nav/avatar-menu";
import SignIn from "@/components/auth/signIn";
import * as React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { SetStateAction, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { useToast } from "../ui/use-toast";


export default function Header({ className, open, setOpen, atTop }: { className?:string, open: boolean, setOpen: React.Dispatch<SetStateAction<boolean>>, atTop: boolean }) {

    // const { data: session } = useSession()
    const userInfo = useWordbookStore((state) => state.userInfo)
    const sync = useWordbookStore((state) => state.sync)
    
    const isSmallDevice = useMediaQuery('(max-width:640px)');
    const t = useTranslations()
    const { toast } = useToast()

    useEffect(() => {
        // 自動同期
        if (userInfo && userInfo.auto_sync) {
            if (userInfo.synced_at){
                const needSync = ((new Date().getTime() - userInfo.synced_at.getTime()) > (24 * 60 * 60 * 1000))
                if (needSync) sync(t, toast)
            }
            else sync(t, toast)
        }
    }, [sync, t, toast, userInfo])

    return (
        <div id={"header"} className={cn("fixed top-0 flex flex-col w-full h-fit z-10 bg-background/50 backdrop-blur-xl", atTop && "bg-transparent backdrop-blur-none")}>
            <nav
                className={cn("w-full h-16 lg:h-24 pl-2 pr-4 lg:px-8 flex justify-between items-center transition-all duration-300", className)}>
                <div className={"flex items-center sm:gap-4 lg:gap-6"}>
                    <Logo className={"scale-90 lg:scale-100"}/>
                    <div className={"hidden sm:flex gap-3"}>
                        <NavItem href={"/"}>
                            <Tv2 size={20}/>
                            <p className={"text-sm hidden lg:block"}>{t("Index.home")}</p>
                        </NavItem>
                        <NavItem href={"/words"}>
                            <BookA size={20}/>
                            <p className={"text-sm hidden lg:block"}>{t("Index.wordbook")}</p>
                        </NavItem>
                        <NavItem href={"/ai-booster"}>
                            <Cpu size={20}/>
                            <p className={"text-sm hidden lg:block"}>{t("Index.ai_booster")}</p>
                        </NavItem>
                        <NavItem disabled href={"/docs"}>
                            <BadgeHelp size={20}/>
                            <p className={"text-sm hidden lg:block"}>{t("Index.docs")}</p>
                        </NavItem>
                    </div>
                </div>
                <div className={"flex gap-2 sm:gap-3 lg:gap-4 items-center"}>
                    <GithubLink/>
                    <RightMenu/>
                    <Separator className={"h-6 mr-1.5 hidden lg:block"} orientation="vertical"/>
                    <ModeToggle className={"lg:mr-2"}/>
                    <div className={cn(isSmallDevice && "hidden")}>
                        {userInfo?.id ? <AvatarMenu/> : <SignIn open={open} setOpen={setOpen}/>}
                    </div>
                </div>
            </nav>
        </div>

    )
}