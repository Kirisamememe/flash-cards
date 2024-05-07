import GithubLink from "@/components/ui/nav/githubLink";
import {ModeToggle} from "@/components/ui/nav/modeToggle";
import Logo from "@/components/ui/nav/logo";
import LocaleSwitcher from "@/components/ui/localeSwitcher";
import UserButton from "@/components/ui/nav/userButton";
import {auth} from "@/auth";


export default async function Nav({children}: { children?: React.ReactNode }) {
    const session = await auth()

    return (
        <>
            <nav className="fixed top-0 w-full h-20 px-6 flex justify-between items-center">
                <Logo/>
                <div className={"flex gap-4 items-center"}>
                    <GithubLink/>
                    <LocaleSwitcher/>
                    <ModeToggle/>
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