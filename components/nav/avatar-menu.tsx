import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CircleUser } from 'lucide-react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import Profile from "@/components/user/Profile";
import { useSession } from "next-auth/react";


export default function AvatarMenu(){

    const { data: session } = useSession()

    const isSmallDevice = useMediaQuery('(max-width:640px)');


    if (!session?.user) return null

    if (isSmallDevice) {
        return (
            <Drawer noBodyStyles>
                <DrawerTrigger asChild autoFocus={false}>
                    <Button className={"w-full h-full rounded-none focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0 outline-none"} variant={"ghost"} autoFocus={false}>
                        <CircleUser className={"text-muted-foreground"} size={24}/>
                    </Button>
                </DrawerTrigger>
                <DrawerContent autoFocus={false} className={"focus-visible:ring-0 focus-visible:outline-none"}>
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
                        <AvatarImage className={"hover:opacity-90"} width={40} height={40} src={session?.user.image || ""}/>
                        <AvatarFallback>{session?.user.name && session.user.name[0] || "A"}</AvatarFallback>
                    </Avatar>
                </Button>
            </SheetTrigger>
            <SheetContent side={isSmallDevice ? "left" : "right"}>
                <Profile />
            </SheetContent>
        </Sheet>
    )
}


