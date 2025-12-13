'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const VALID_USERS = ['Putty', 'Sony'];

export async function login(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // Validate username
    if (!VALID_USERS.includes(username)) {
        return { error: 'Invalid username' };
    }

    // Validate password against environment variables
    const expectedPassword = username === 'Putty'
        ? process.env.PUTTY_PASSWORD
        : process.env.SONY_PASSWORD;

    if (password === expectedPassword) {
        const cookieStore = await cookies();
        cookieStore.set('user', username, { httpOnly: true, path: '/' });
        redirect('/');
    }

    return { error: 'Invalid password' };
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('user');
    redirect('/login');
}

export async function getUser() {
    const cookieStore = await cookies();
    return cookieStore.get('user')?.value;
}
