import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as React from "react";

export default function UserSaver({userName}: {userName: string}) {


    return (
        <Avatar className={"hidden sm:block"}>
            <AvatarImage width={40} height={40} src={""}/>
            <AvatarFallback>{userName[0]}</AvatarFallback>
        </Avatar>
    )
}