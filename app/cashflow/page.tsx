import {
    getPartners,
    getContributions,
    getExpenses,
    getBalanceSheet,
    getProfitAndLoss,
    addContribution,
    addExpense
} from '@/lib/cashflow-actions';
import Link from 'next/link';
import { ArrowLeft, Wallet } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CashFlowClient from './client';

export default async function CashFlowPage({
    searchParams,
}: {
    searchParams: { balanceDate?: string; plStartDate?: string; plEndDate?: string };
}) {
    const user = await getUser();
    if (!user) redirect('/login');

    const partners = await getPartners();
    const contributions = await getContributions();
    const expenses = await getExpenses();

    // Balance sheet
    const balanceDate = searchParams.balanceDate || new Date().toISOString().split('T')[0];
    const balanceSheet = await getBalanceSheet(balanceDate);

    // P&L
    const plEndDate = searchParams.plEndDate || new Date().toISOString().split('T')[0];
    const plStartDate = searchParams.plStartDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const profitLoss = await getProfitAndLoss(plStartDate, plEndDate);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-muted rounded-full">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <Wallet size={24} className="text-primary" />
                        <h1 className="text-xl font-bold tracking-tight">Cash Flow Management</h1>
                    </div>
                </div>
                <div className="text-sm text-muted-foreground">User: {user}</div>
            </header>

            <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
                <CashFlowClient
                    partners={partners}
                    contributions={contributions}
                    expenses={expenses}
                    initialBalanceSheet={balanceSheet}
                    initialProfitLoss={profitLoss}
                />
            </main>
        </div>
    );
}
