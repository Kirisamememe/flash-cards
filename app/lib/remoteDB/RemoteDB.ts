import { PrismaClient } from "@prisma/client/edge"
import { withAccelerate } from "@prisma/extension-accelerate"

class RemoteDB {
    private static instance: RemoteDB
    private constructor() {}

    private db = new PrismaClient().$extends(withAccelerate())

    
}