'use server';

import { supabaseAdmin } from '@/lib/supabase-client';
import { revalidatePath } from 'next/cache';

export interface Sale {
    id: number;
    total: number;
    payment_method: string;
    discount: number;
    status: string;
    created_at: string;
}

export interface Analytics {
    totalRevenue: number;
    dailyRevenue: number;
    totalTransactions: number;
    totalItemsSold: number;
}

export async function getSales(): Promise<Sale[]> {
    const { data } = await supabaseAdmin
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

    return data || [];
}

export async function getAnalytics(): Promise<Analytics> {
    const today = new Date().toISOString().split('T')[0];

    // Total revenue
    const { data: revenueData } = await supabaseAdmin
        .from('sales')
        .select('total')
        .eq('status', 'completed');
    const totalRevenue = revenueData?.reduce((sum: number, sale: any) => sum + Number(sale.total), 0) || 0;

    // Daily revenue
    const { data: dailyData } = await supabaseAdmin
        .from('sales')
        .select('total')
        .eq('status', 'completed')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);
    const dailyRevenue = dailyData?.reduce((sum: number, sale: any) => sum + Number(sale.total), 0) || 0;

    // Total transactions
    const { count: totalTransactions } = await supabaseAdmin
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

    // Total items sold
    const { data: itemsData } = await supabaseAdmin
        .from('sale_items')
        .select('quantity');
    const totalItemsSold = itemsData?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

    return {
        totalRevenue,
        dailyRevenue,
        totalTransactions: totalTransactions || 0,
        totalItemsSold
    };
}

export async function reverseSale(saleId: number) {
    try {
        // Get sale items
        const { data: saleItems } = await supabaseAdmin
            .from('sale_items')
            .select('item_id, quantity')
            .eq('sale_id', saleId);

        if (!saleItems) return;

        // Restore stock for each item
        for (const item of saleItems) {
            const { data: currentItem } = await supabaseAdmin
                .from('items')
                .select('stock')
                .eq('id', item.item_id)
                .single();

            if (currentItem) {
                await supabaseAdmin
                    .from('items')
                    .update({ stock: currentItem.stock + item.quantity })
                    .eq('id', item.item_id);
            }
        }

        // Update sale status
        await supabaseAdmin
            .from('sales')
            .update({ status: 'refunded' })
            .eq('id', saleId);

        revalidatePath('/sales');
        revalidatePath('/inventory');
    } catch (error) {
        console.error('Refund failed', error);
    }
}
