'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    const user = formData.get('user') as string;
    const pin = formData.get('pin') as string;

    // Simple mock auth
    if (pin === '1234') {
        const cookieStore = await cookies();
        cookieStore.set('user', user, { httpOnly: true, path: '/' });
        redirect('/');
    }

    return { error: 'Invalid PIN' };
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
