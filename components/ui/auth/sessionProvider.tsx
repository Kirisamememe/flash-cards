import {auth} from "@/auth";
import CardContainer from "@/components/cardContainer";

export default async function SessionProvider() {
    const session = await auth()

    return <CardContainer userId={session?.user.id} />

}