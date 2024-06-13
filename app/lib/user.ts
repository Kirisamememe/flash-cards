'use server'

import { PrismaClient } from '@prisma/client/edge'

const prisma = new PrismaClient()


// export const getUserByEmail = async (email: string) => {
//     try {
//         const user = await prisma.user.findUnique({
//             where: { email }
//         });
//         await prisma.$disconnect();
//         return user;
//     } catch {
//         return null;
//     }
// };

export const getUserById = async (id: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id }
        });
        await prisma.$disconnect();
        return user;
    } catch (e) {
        return null;
    }
};
