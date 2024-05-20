import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CircleUser } from 'lucide-react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import Profile from "@/components/user/Profile";


export default function AvatarMenu(){

    const userInfo = useWordbookStore((state) => state.userInfo)

    const isSmallDevice = useMediaQuery('(max-width:640px)');


    if (!userInfo) return null

    if (isSmallDevice) {
        return (
            <Drawer noBodyStyles>
                <DrawerTrigger asChild>
                    <Button className={"w-full h-full rounded-none"} variant={"ghost"}>
                        <CircleUser className={"text-muted-foreground"} size={24}/>
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <ScrollArea className={"w-full h-full px-5"}>
                        <Profile />
                    </ScrollArea>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Sheet >
            <SheetTrigger asChild>
                <Button
                    className={"rounded-full size-10 hover:bg-transparent hover:scale-105 hover:ring-2 hover:ring-primary hover:ring-offset-4 transition-all duration-200"}
                    size={"icon"} variant={"ghost"}>
                    <Avatar>
                        <AvatarImage className={"hover:opacity-90"} width={40} height={40} src={userInfo.image || ""}/>
                        <AvatarFallback>{userInfo.name && userInfo.name[0] || "A"}</AvatarFallback>
                    </Avatar>
                </Button>
            </SheetTrigger>
            <SheetContent side={isSmallDevice ? "left" : "right"}>
                <Profile />
            </SheetContent>
        </Sheet>
    )
}


