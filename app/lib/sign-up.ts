'use server';

import {z} from "zod";
import {signUpSchema} from "@/types";
import bcrypt from "bcryptjs";
import {SignResult} from "@/types/ActionsResult";
import {getUserByEmail} from "@/app/lib/user";
import {handleError} from "@/app/lib/utils";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const signUp = async (
    values: z.infer<typeof signUpSchema>
): Promise<SignResult> => {
    const validatedFields = signUpSchema.safeParse(values);

    if (!validatedFields.success) {
        return {
            isSuccess: false,
            error: {
                message: validatedFields.error.message,
            },
        };
    }

    const { email, password, nickname } = validatedFields.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            return {
                isSuccess: false,
                error: {
                    message: 'このメールアドレスは既に登録されています。',
                },
            };
        }

        await prisma.user.create({
            data: {
                name: nickname,
                email,
                password: hashedPassword,
                role: "USER"
            },
        });

        return {
            isSuccess: true,
            message: 'サインアップに成功しました。',
        };
    } catch (error) {
        handleError(error);

        return {
            isSuccess: false,
            error: {
                message: 'サインアップに失敗しました。',
            },
        };
    } finally {
        await prisma.$disconnect()
    }
};