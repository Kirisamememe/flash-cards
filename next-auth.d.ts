import NextAuth, { type DefaultSession } from 'next-auth';

export type ExtendedUser = DefaultSession['user'] & {
  role: 1 | 2;
};

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser;
  }
}
