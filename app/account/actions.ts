'use server';

import prisma from '@/lib/db';
import * as crypto from 'crypto';
import * as zod from 'zod';

export const formSchema = zod.object({
  username: zod.string().min(3).max(50),
  password: zod.string().min(8).max(50),
  remember: zod.boolean().optional()
});

const getHash = (source: string) =>
  crypto.createHash('md5').update(source).digest('hex').toString();

interface AuthError {
  field: 'username' | 'password';
  message: string;
}

export const login = async ({
  username,
  password
}: zod.infer<typeof formSchema>): Promise<AuthError | undefined> => {
  let user;

  if (
    !(user = await prisma.user.findUnique({
      where: {
        username
      }
    }))
  )
    return { field: 'username', message: "Username doesn't exist!" };

  if (getHash(password) !== user.password)
    return { field: 'password', message: 'Password is invalid!' };
};

export const signup = async ({
  username,
  password
}: zod.infer<typeof formSchema>): Promise<AuthError | undefined> => {
  if (
    await prisma.user.findUnique({
      where: {
        username
      }
    })
  )
    return { field: 'username', message: 'Username is taken!' };

  await prisma.user.create({
    data: {
      username,
      password: getHash(password)
    }
  });
};
