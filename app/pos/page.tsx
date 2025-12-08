import POSClient from './client';
import { getItems } from '@/lib/actions';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function POSPage() {
    const user = await getUser();
    if (!user) redirect('/login');

    const items = await getItems();
    return <POSClient initialItems={items} />;
}
