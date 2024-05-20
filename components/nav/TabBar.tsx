import { NavItemMobile } from "@/components/nav/nav-item";
import { BookA, Cpu, Tv2, UserCircle2 } from "lucide-react";
import AddWordBtn from "@/components/home/AddBtn";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import AvatarMenu from "@/components/nav/avatar-menu";
import * as React from "react";
import { SetStateAction } from "react";
import { useWordbookStore } from "@/providers/wordbook-store-provider";

export default function TabBar({ setOpen }: { setOpen: React.Dispatch<SetStateAction<boolean>> }) {

    const userInfo = useWordbookStore((state) => state.userInfo)

    return (
        <nav
            className={"z-20 fixed bottom-0 left-[50%] translate-x-[-50%] w-full h-[62px] bg-background/80 ring-[0.03125rem] ring-foreground/5 dark:ring-foreground/10 backdrop-blur-md"}>
            <div className={"flex items-center h-[62px] px-[3%]"}>
                <NavItemMobile className={"flex-auto"} href={"/"}>
                    <Tv2 size={24}/>
                </NavItemMobile>
                <NavItemMobile className={"flex-auto"} href={"/words"}>
                    <BookA size={24}/>
                </NavItemMobile>
                <AddWordBtn>
                    <div className={"basis-1/4 flex flex-col items-center"}>
                        <Button className={"rounded-full"}>
                            <PlusIcon className={""} width={32} height={32}/>
                        </Button>
                    </div>
                </AddWordBtn>
                <NavItemMobile disabled className={"flex-auto"} href={"/ai"}>
                    <Cpu size={24}/>
                </NavItemMobile>
                <div
                    className={"flex-auto inline-flex p-0 h-full justify-center items-center transition-all active:scale-110"}>
                    {userInfo ?
                        <AvatarMenu/> :
                        <Button
                            className={"text-muted-foreground w-full h-full rounded-none active:scale-110 active:bg-transparent"}
                            variant={"ghost"}
                            onClick={() => setOpen(true)}
                        >
                            <UserCircle2 size={24}/>
                        </Button>
                    }
                </div>

            </div>
        </nav>
    )
}