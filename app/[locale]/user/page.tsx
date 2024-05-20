import {auth} from "@/app/lib/auth";

export default async function UserPage() {
    const session = await auth()

    if (!session) return null

    if (session?.user) {
    return (
        <div className={"w-svw h-svh flex flex-col items-center justify-center"}>
            <h1>こちらがユーザーページであります</h1>
            <div className="flex flex-col gap-4 w-[70%]">
                <h2 className="text-xl font-bold">Current Session Data</h2>
                {Object.keys(session.user).length > 3 ? (
                    <p>hahaha</p>
                ) : (
                    <p>hohoho</p>
                )}
                <div className="flex flex-col rounded-md bg-muted">
                    <div className="p-4 font-bold rounded-t-md bg-muted-foreground">
                        Session
                    </div>
                    <pre className="py-6 px-4 whitespace-pre-wrap break-all">
            {JSON.stringify(session, null, 2)}
          </pre>
                </div>
            </div>
        </div>
    )}
}