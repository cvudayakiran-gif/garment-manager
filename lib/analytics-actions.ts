'use server';

import { supabaseAdmin } from '@/lib/supabase-client';

export interface TrendingItem {
    name: string;
    category: string | null;
    source: string | null;
    total_quantity_sold: number;
    total_revenue: number;
}

export interface SlowMovingItem {
    id: number;
    name: string;
    category: string | null;
    stock: number;
    days_old: number;
    last_sale_days_ago: number | null;
}

export interface MaterialTrend {
    material: string;
    count: number;
    revenue: number;
}

export interface CategoryTrend {
    category: string;
    count: number;
    revenue: number;
}

export interface SourceTrend {
    source: string;
    count: number;
    revenue: number;
}

export async function getTrendingItems(): Promise<TrendingItem[]> {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    // Get sales from last 90 days
    const { data: salesInRange } = await supabaseAdmin
        .from('sales')
        .select('id')
        .gte('created_at', ninetyDaysAgo)
        .eq('status', 'completed');

    const saleIds = salesInRange?.map((s: any) => s.id) || [];

    if (saleIds.length === 0) {
        return [];
    }

    // Fallback: manual query
    const { data: items } = await supabaseAdmin
        .from('sale_items')
        .select(`
            quantity,
            price_at_sale,
            items:item_id (
                name,
                category,
                source
            )
        `)
        .in('sale_id', saleIds);

    // Aggregate manually
    const aggregated = items?.reduce((acc: any, item: any) => {
        const key = item.items.name;
        if (!acc[key]) {
            acc[key] = {
                name: item.items.name,
                category: item.items.category,
                source: item.items.source,
                total_quantity_sold: 0,
                total_revenue: 0
            };
        }
        acc[key].total_quantity_sold += item.quantity;
        acc[key].total_revenue += item.quantity * Number(item.price_at_sale);
        return acc;
    }, {});

    const result = Object.values(aggregated || {})
        .sort((a: any, b: any) => b.total_quantity_sold - a.total_quantity_sold)
        .slice(0, 10);

    return result as TrendingItem[];
}

export async function getSlowMovingItems(): Promise<SlowMovingItem[]> {
    const { data } = await supabaseAdmin
        .from('items')
        .select('id, name, category, stock, created_at')
        .gt('stock', 0);

    if (!data) return [];

    const result: SlowMovingItem[] = [];
    const now = new Date();

    for (const item of data) {
        const createdDate = new Date(item.created_at);
        const days_old = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

        // Get last sale date
        const { data: lastSale } = await supabaseAdmin
            .from('sale_items')
            .select('sales:sale_id(created_at, status)')
            .eq('item_id', item.id)
            .eq('sales.status', 'completed')
            .order('sales(created_at)', { ascending: false })
            .limit(1)
            .single();

        let last_sale_days_ago: number | null = null;
        if (lastSale && lastSale.sales) {
            const saleDate = new Date((lastSale.sales as any).created_at);
            last_sale_days_ago = Math.floor((now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
        }

        // Check if item is slow-moving
        if ((last_sale_days_ago === null && days_old > 60) || (last_sale_days_ago !== null && last_sale_days_ago > 60)) {
            result.push({
                id: item.id,
                name: item.name,
                category: item.category,
                stock: item.stock,
                days_old,
                last_sale_days_ago
            });
        }
    }

    return result.sort((a, b) => b.days_old - a.days_old).slice(0, 20);
}

export async function getMaterialTrends(): Promise<MaterialTrend[]> {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    // Get sales from last 90 days
    const { data: salesInRange } = await supabaseAdmin
        .from('sales')
        .select('id')
        .gte('created_at', ninetyDaysAgo)
        .eq('status', 'completed');

    const saleIds = salesInRange?.map((s: any) => s.id) || [];

    if (saleIds.length === 0) {
        return [];
    }

    const { data: items } = await supabaseAdmin
        .from('sale_items')
        .select(`
            quantity,
            price_at_sale,
            items:item_id (name)
        `)
        .in('sale_id', saleIds);

    const aggregated = items?.reduce((acc: any, item: any) => {
        const material = item.items.name;
        if (!acc[material]) {
            acc[material] = { material, count: 0, revenue: 0 };
        }
        acc[material].count += item.quantity;
        acc[material].revenue += item.quantity * Number(item.price_at_sale);
        return acc;
    }, {});

    return Object.values(aggregated || {})
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10) as MaterialTrend[];
}

export async function getCategoryTrends(): Promise<CategoryTrend[]> {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    // Get sales from last 90 days
    const { data: salesInRange } = await supabaseAdmin
        .from('sales')
        .select('id')
        .gte('created_at', ninetyDaysAgo)
        .eq('status', 'completed');

    const saleIds = salesInRange?.map((s: any) => s.id) || [];

    if (saleIds.length === 0) {
        return [];
    }

    const { data: items } = await supabaseAdmin
        .from('sale_items')
        .select(`
            quantity,
            price_at_sale,
            items:item_id (category)
        `)
        .in('sale_id', saleIds)
        .not('items.category', 'is', null);

    const aggregated = items?.reduce((acc: any, item: any) => {
        const category = item.items.category;
        if (!category) return acc;
        if (!acc[category]) {
            acc[category] = { category, count: 0, revenue: 0 };
        }
        acc[category].count += item.quantity;
        acc[category].revenue += item.quantity * Number(item.price_at_sale);
        return acc;
    }, {});

    return Object.values(aggregated || {})
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10) as CategoryTrend[];
}

export async function getSourceTrends(): Promise<SourceTrend[]> {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    // Get sales from last 90 days
    const { data: salesInRange } = await supabaseAdmin
        .from('sales')
        .select('id')
        .gte('created_at', ninetyDaysAgo)
        .eq('status', 'completed');

    const saleIds = salesInRange?.map((s: any) => s.id) || [];

    if (saleIds.length === 0) {
        return [];
    }

    const { data: items } = await supabaseAdmin
        .from('sale_items')
        .select(`
            quantity,
            price_at_sale,
            items:item_id (source)
        `)
        .in('sale_id', saleIds)
        .not('items.source', 'is', null);

    const aggregated = items?.reduce((acc: any, item: any) => {
        const source = item.items.source;
        if (!source) return acc;
        if (!acc[source]) {
            acc[source] = { source, count: 0, revenue: 0 };
        }
        acc[source].count += item.quantity;
        acc[source].revenue += item.quantity * Number(item.price_at_sale);
        return acc;
    }, {});

    return Object.values(aggregated || {})
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10) as SourceTrend[];
}
