'use server';

import { supabaseAdmin } from '@/lib/supabase-client';
import { revalidatePath } from 'next/cache';

export interface Partner {
    id: number;
    name: string;
    created_at: string;
}

export interface Contribution {
    id: number;
    partner_id: number;
    amount: number;
    contribution_date: string;
    notes: string | null;
    created_at: string;
    partner_name?: string;
}

export interface Expense {
    id: number;
    description: string;
    amount: number;
    expense_date: string;
    category: string | null;
    created_at: string;
}

export interface BalanceSheet {
    totalContributions: number;
    inventoryValue: number;
    cashBalance: number;
    totalAssets: number;
    totalExpenses: number;
    totalRevenue: number;
    costOfGoodsSold: number;
}

export interface ProfitLoss {
    revenue: number;
    costOfGoodsSold: number;
    grossProfit: number;
    expenses: number;
    netProfit: number;
}

// Partners
export async function getPartners(): Promise<Partner[]> {
    const { data } = await supabaseAdmin
        .from('partners')
        .select('*')
        .order('name');

    if (!data || data.length === 0) {
        // Seed default partners if none exist
        const { error } = await supabaseAdmin
            .from('partners')
            .insert([{ name: 'Putty' }, { name: 'Sony' }]);

        if (!error) {
            const { data: newData } = await supabaseAdmin
                .from('partners')
                .select('*')
                .order('name');
            return newData || [];
        }
    }

    return data || [];
}

export async function seedPartners() {
    try {
        const { error } = await supabaseAdmin
            .from('partners')
            .insert([{ name: 'Putty' }, { name: 'Sony' }])
            .select();

        if (error) {
            // Ignore unique constraint violation if they exist now
            if (!error.message.includes('unique')) {
                return { success: false, error: error.message };
            }
        }

        revalidatePath('/cashflow');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Contributions
export async function addContribution(formData: FormData) {
    const partner_id = parseInt(formData.get('partner_id') as string);
    const amount = parseFloat(formData.get('amount') as string);
    const contribution_date = formData.get('contribution_date') as string;
    const notes = formData.get('notes') as string;

    await supabaseAdmin
        .from('partner_contributions')
        .insert({
            partner_id,
            amount,
            contribution_date,
            notes: notes || null
        });

    revalidatePath('/cashflow');
}

export async function getContributions(): Promise<Contribution[]> {
    const { data } = await supabaseAdmin
        .from('partner_contributions')
        .select(`
            *,
            partners:partner_id (name)
        `)
        .order('contribution_date', { ascending: false });

    return data?.map((item: any) => ({
        ...item,
        partner_name: item.partners?.name
    })) || [];
}

// Expenses
export async function addExpense(formData: FormData) {
    const description = formData.get('description') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const expense_date = formData.get('expense_date') as string;
    const category = formData.get('category') as string;

    await supabaseAdmin
        .from('expenses')
        .insert({
            description,
            amount,
            expense_date,
            category: category || null
        });

    revalidatePath('/cashflow');
}

export async function getExpenses(startDate?: string, endDate?: string): Promise<Expense[]> {
    let query = supabaseAdmin
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

    if (startDate) {
        query = query.gte('expense_date', startDate);
    }
    if (endDate) {
        query = query.lte('expense_date', endDate);
    }

    const { data } = await query;
    return data || [];
}

// Balance Sheet
export async function getBalanceSheet(asOfDate: string): Promise<BalanceSheet> {
    // Total contributions up to date
    const { data: contributions } = await supabaseAdmin
        .from('partner_contributions')
        .select('amount')
        .lte('contribution_date', asOfDate);
    const totalContributions = contributions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

    // Current inventory value (cost × stock)
    const { data: items } = await supabaseAdmin
        .from('items')
        .select('cost, stock');
    const inventoryValue = items?.reduce((sum, item) => sum + (Number(item.cost) * item.stock), 0) || 0;

    // Total expenses up to date
    const { data: expenses } = await supabaseAdmin
        .from('expenses')
        .select('amount')
        .lte('expense_date', asOfDate);
    const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

    // Total revenue from sales up to date
    const { data: sales } = await supabaseAdmin
        .from('sales')
        .select('total')
        .eq('status', 'completed')
        .lte('created_at', `${asOfDate}T23:59:59`);
    const totalRevenue = sales?.reduce((sum, s) => sum + Number(s.total), 0) || 0;

    // Cost of goods sold (all completed sales up to date)
    const { data: completedSales } = await supabaseAdmin
        .from('sales')
        .select('id')
        .eq('status', 'completed')
        .lte('created_at', `${asOfDate}T23:59:59`);

    const saleIds = completedSales?.map(s => s.id) || [];

    let costOfGoodsSold = 0;
    if (saleIds.length > 0) {
        const { data: saleItems } = await supabaseAdmin
            .from('sale_items')
            .select('item_id, quantity, items:item_id(cost)')
            .in('sale_id', saleIds);

        costOfGoodsSold = saleItems?.reduce((sum, si: any) => {
            const cost = Number(si.items?.cost || 0);
            return sum + (cost * si.quantity);
        }, 0) || 0;
    }

    // Cash Balance = Contributions + Revenue - COGS - Expenses - Inventory Value
    const cashBalance = totalContributions + totalRevenue - costOfGoodsSold - totalExpenses - inventoryValue;

    // Total Assets = Inventory + Cash
    const totalAssets = inventoryValue + cashBalance;

    return {
        totalContributions,
        inventoryValue,
        cashBalance,
        totalAssets,
        totalExpenses,
        totalRevenue,
        costOfGoodsSold
    };
}

// Profit & Loss Statement
export async function getProfitAndLoss(startDate: string, endDate: string): Promise<ProfitLoss> {
    // Revenue from sales in period
    const { data: sales } = await supabaseAdmin
        .from('sales')
        .select('total')
        .eq('status', 'completed')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);
    const revenue = sales?.reduce((sum, s) => sum + Number(s.total), 0) || 0;

    // Cost of goods sold in period
    const { data: completedSales } = await supabaseAdmin
        .from('sales')
        .select('id')
        .eq('status', 'completed')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);

    const saleIds = completedSales?.map(s => s.id) || [];

    let costOfGoodsSold = 0;
    if (saleIds.length > 0) {
        const { data: saleItems } = await supabaseAdmin
            .from('sale_items')
            .select('item_id, quantity, items:item_id(cost)')
            .in('sale_id', saleIds);

        costOfGoodsSold = saleItems?.reduce((sum, si: any) => {
            const cost = Number(si.items?.cost || 0);
            return sum + (cost * si.quantity);
        }, 0) || 0;
    }

    // Expenses in period
    const { data: expenseData } = await supabaseAdmin
        .from('expenses')
        .select('amount')
        .gte('expense_date', startDate)
        .lte('expense_date', endDate);
    const expenses = expenseData?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

    const grossProfit = revenue - costOfGoodsSold;
    const netProfit = grossProfit - expenses;

    return {
        revenue,
        costOfGoodsSold,
        grossProfit,
        expenses,
        netProfit
    };
}
