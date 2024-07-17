import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MaterialContainer } from "@/components/ai-booster/MaterialContainer"
import { MaterialIndexDB } from "@/types/AIBooster"
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import useMediaQuery from "@mui/material/useMediaQuery"

export function Archive({ materials }: { materials: MaterialIndexDB[] }) {

    const isSmallDevice = useMediaQuery('(max-width:640px)')


    if (isSmallDevice) {
        return (
            <ul className="flex flex-col mt-36 mb-24 px-4 w-full gap-3 justify-center items-start">
                {materials.map((content, index) => (
                    <ArchiveMobileItem key={index} content={content}/>
                ))}
            </ul>
        )
    }

    return (
        <div className={"mt-36 lg:mt-48 mx-auto w-full flex gap-12 lg:gap-12 xl:gap-16 lg:px-[10.125rem] justify-center items-start max-w-[95rem]"}>
            <Tabs defaultValue="0" className="relative w-full flex gap-1 lg:gap-4">
                <TabsList className={"sticky py-0 pr-0.5 top-28 flex flex-col justify-start items-start h-[calc(100vh-12rem)] rounded-xl bg-transparent HOVER:ring-1 HOVER:ring-border HOVER:bg-foreground/[0.02] overflow-y-auto shrink-0 transition-all"}>
                    <ScrollArea className="flex flex-col pl-1 pr-3 items-start overflow-x-visible" barClass="py-2 px-0.5">
                        {materials.map((tri, index) => (
                            <TabsTrigger className="group first:mt-2 last:mb-3 flex flex-col gap-2 text-start justify-center items-start w-60 lg:w-72 xl:w-80 h-fit pl-4 py-3 rounded-lg data-[state=active]:bg-primary/10 transition-all" key={index} value={`${index}`}>
                                <p className="w-full text-wrap line-clamp-2 group-data-[state=active]:text-primary transition-all">
                                    {tri?.title}
                                </p>
                                <p className="w-full truncate text-xs text-muted-foreground/50 group-data-[state=active]:text-primary/60 transition-all">
                                    {tri?.created_at.toLocaleString()}
                                </p>
                            </TabsTrigger>
                        ))}
                    </ScrollArea>
                </TabsList>
                {materials.map((content, index) => (
                        <TabsContent key={index} value={`${index}`}>
                            <MaterialContainer material={content}/>
                        </TabsContent>
                    ))}
            </Tabs>
        </div>
    )
}

function ArchiveMobileItem({ content }: { content: MaterialIndexDB }) {
    return(
        <li className="w-full flex justify-start items-center px-3 py-2 h-fit bg-foreground/5 rounded-lg">
            <Drawer>
                <DrawerTrigger className="w-full flex flex-col gap-1 justify-center items-start text-start">
                    <p className="line-clamp-2 font-medium">{content.title}</p>
                    <p className="text-xs text-muted-foreground/50">{content.created_at.toLocaleString()}</p>
                </DrawerTrigger>
                <DrawerContent>
                    <ScrollArea>
                        <DrawerTitle className="opacity-0 h-6">
                            {content.title}
                        </DrawerTitle>
                        <MaterialContainer material={content}/>
                    </ScrollArea>
                </DrawerContent>
                <DrawerDescription className="hidden">
                    {content.title}
                </DrawerDescription>
            </Drawer>
        </li>
    )
}