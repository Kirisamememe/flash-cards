'use client';

import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub, FaApple, FaTwitter, FaFacebook } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';

export const Social = () => {
    const onClick = (provider: 'google' | 'github' | 'twitter' | 'facebook') => {
        signIn(provider, {
            callbackUrl: DEFAULT_LOGIN_REDIRECT,
        }).catch(e => console.error(e))
    };

    return (
        <div className='flex flex-col items-center w-full gap-4'>
            <Button
                size='lg'
                className='w-full'
                variant='outline'
                onClick={() => onClick('google')}
            >
                <FcGoogle className='h-5 w-5' />
                <span className='ml-2'>Sign in with Google</span>
            </Button>
            <Button
                size='lg'
                className='w-full'
                variant='outline'
                onClick={() => onClick('github')}
            >
                <FaGithub className='h-5 w-5' />
                <span className='ml-2'>Sign in with GitHub</span>
            </Button>
            <Button
                size='lg'
                className='w-full'
                variant='outline'
                onClick={() => onClick('twitter')}
            >
                <FaTwitter className='h-5 w-5' />
                <span className='ml-2'>Sign in with X</span>
            </Button>
            {/*<Button*/}
            {/*    size='lg'*/}
            {/*    className='w-full'*/}
            {/*    variant='outline'*/}
            {/*    onClick={() => onClick('apple')}*/}
            {/*>*/}
            {/*    <FaFacebook className='h-5 w-5' />*/}
            {/*    <span className='ml-2'>Sign in with Apple</span>*/}
            {/*</Button>*/}
        </div>
    );
};
