import GithubLink from "@/components/ui/nav/githubLink";
import Logo from "@/components/ui/nav/logo";
import UserButton from "@/components/ui/nav/userButton";
import { auth } from "@/auth";
import MenuWrapper from "@/components/ui/nav/menu-wrapper";
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/ui/nav/modeToggle";

export default async function Nav({children}: { children?: React.ReactNode }) {
    const session = await auth()

    // TODO Navigation Menuで言語スイッチャーとテーマスイッチャーを作り直す

    return (
        <>
            <nav className="fixed top-0 w-full h-24 px-8 flex justify-between items-center">
                <Logo/>
                <div className={"flex gap-4 items-center"}>
                    <GithubLink/>
                    <MenuWrapper/>
                    <Separator className={"h-6 mr-1.5"} orientation="vertical" />
                    <ModeToggle className={"mr-2"} />
                    <UserButton
                        isLogin={!!session}
                        userId={session?.user.id || undefined}
                        avatar={session?.user.image || ""}
                        userName={session?.user.name || "User"}
                    />
                    {children}
                </div>
            </nav>
        </>

    )
}