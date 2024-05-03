import GithubLink from "@/components/ui/nav/githubLink";
import {ModeToggle} from "@/components/ui/nav/modeToggle";
import Logo from "@/components/ui/nav/logo";
import LocaleSwitcher from "@/components/ui/localeSwitcher";

export default function Nav({children}: {children?: React.ReactNode}) {
    return (
        <nav className="fixed top-0 w-full h-20 px-6 flex justify-between items-center">
            <Logo/>
            <div className={"flex gap-4 items-center"}>
                <GithubLink/>
                <LocaleSwitcher/>
                <ModeToggle/>
                {children}
            </div>
        </nav>
    )
}