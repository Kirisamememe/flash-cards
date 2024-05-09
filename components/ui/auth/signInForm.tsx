'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signUpSchema } from '@/schemas';
import { FormError } from '@/components/formError';
import { useState, useTransition } from 'react';
import { signUp } from "@/app/lib/sign-up";
import { toast } from 'sonner';

export function SignInForm({children, text}: {children?: React.ReactNode, text: any}) {
    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            nickname: '',
            email: '',
            password: '',
        },
    });

    const onSubmit = (values: z.infer<typeof signUpSchema>) => {
        setError('');

        startTransition(async () => {
            await signUp(values).then(async (res) => {
                if (!res.isSuccess){
                    setError(res.error.message);
                }
                else{
                    toast.success(res.message)
                }
            }).catch(async (e) => {
                console.error(e)
            });
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                {/*<FormField*/}
                {/*    control={form.control}*/}
                {/*    name='nickname'*/}
                {/*    render={({ field }) => (*/}
                {/*        <FormItem>*/}
                {/*            <FormLabel>{text.nickname}</FormLabel>*/}
                {/*            <FormControl>*/}
                {/*                <Input placeholder='ailingo' {...field} />*/}
                {/*            </FormControl>*/}
                {/*            <FormMessage />*/}
                {/*        </FormItem>*/}
                {/*    )}*/}
                {/*/>*/}
                <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{text.email}</FormLabel>
                            <FormControl>
                                <Input type={"email"} placeholder='ailingo@example.com' {...field} />
                            </FormControl>
                            {/*<FormDescription></FormDescription>*/}
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{text.password}</FormLabel>
                            <FormControl>
                                <Input type={"password"} placeholder='' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormError message={error} />
                <div>
                    {/*<Button className={"w-full mb-4"} type='submit' disabled={isPending}>*/}
                    {/*    アカウントを作成*/}
                    {/*</Button>*/}
                    {children}
                </div>
            </form>
        </Form>
    );
}
