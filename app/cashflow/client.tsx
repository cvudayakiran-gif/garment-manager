'use client';

import { useState, useEffect } from 'react';
import { Partner, Contribution, Expense, BalanceSheet, ProfitLoss, seedPartners } from '@/lib/cashflow-actions';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function CashFlowClient({
    partners,
    contributions,
    expenses,
    initialBalanceSheet,
    initialProfitLoss,
}: {
    partners: Partner[];
    contributions: Contribution[];
    expenses: Expense[];
    initialBalanceSheet: BalanceSheet;
    initialProfitLoss: ProfitLoss;
}) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const currentTab = searchParams.get('tab') as 'contributions' | 'expenses' | 'balance' | 'profitloss' | null;

    const [activeTab, setActiveTab] = useState<'contributions' | 'expenses' | 'balance' | 'profitloss'>(currentTab || 'contributions');

    // Update URL when tab changes
    const handleTabChange = (tab: typeof activeTab) => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams);
        params.set('tab', tab);
        router.replace(`${pathname}?${params.toString()}`);
    };

    // Balance sheet date
    const [balanceDate, setBalanceDate] = useState(searchParams.get('balanceDate') || new Date().toISOString().split('T')[0]);

    // P&L dates
    const [plStartDate, setPlStartDate] = useState(searchParams.get('plStartDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [plEndDate, setPlEndDate] = useState(searchParams.get('plEndDate') || new Date().toISOString().split('T')[0]);

    const totalContributions = contributions.reduce((sum, c) => sum + Number(c.amount), 0);

    const tabs = [
        { id: 'contributions' as const, label: 'Partner Contributions' },
        { id: 'expenses' as const, label: 'Expenses' },
        { id: 'balance' as const, label: 'Balance Sheet' },
        { id: 'profitloss' as const, label: 'P&L Statement' },
    ];

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b">
                <div className="flex gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'contributions' && (
                <div className="space-y-6">
                    {/* Working Capital Summary */}
                    <div className="p-6 rounded-xl border bg-card">
                        <h3 className="text-lg font-semibold mb-2">Total Working Capital</h3>
                        <p className="text-3xl font-bold text-green-600">₹{totalContributions.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground mt-1">Combined contributions from both partners</p>
                    </div>

                    {/* Add Contribution Form */}
                    <div className="p-6 rounded-xl border bg-card">
                        <h3 className="font-semibold mb-4">Add New Contribution</h3>
                        <form action="/api/cashflow/add-contribution" method="post" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="partner_id" className="text-sm font-medium">Partner</label>
                                {partners.length > 0 ? (
                                    <select
                                        name="partner_id"
                                        id="partner_id"
                                        required
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">Select partner</option>
                                        {partners.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="space-y-2 border border-red-200 bg-red-50 p-2 rounded">
                                        <p className="text-red-600 text-xs font-medium">No partners found (Tables missing?)</p>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const res = await seedPartners();
                                                if (!res.success) alert("Failed: " + res.error);
                                                else alert("Done! Refresh page if needed.");
                                            }}
                                            className="text-xs bg-white border border-red-300 px-2 py-1 rounded shadow-sm hover:bg-gray-50"
                                        >
                                            Initialize Partners
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="amount" className="text-sm font-medium">Amount (₹)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    id="amount"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="contribution_date" className="text-sm font-medium">Date</label>
                                <input
                                    type="date"
                                    name="contribution_date"
                                    id="contribution_date"
                                    required
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="notes" className="text-sm font-medium">Notes (optional)</label>
                                <input
                                    type="text"
                                    name="notes"
                                    id="notes"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    className="h-10 px-4 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    Add Contribution
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Contributions Table */}
                    <div className="rounded-md border bg-card">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold">Contribution History</h3>
                        </div>
                        <div className="relative w-full overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="h-12 px-4 text-left font-medium">Partner</th>
                                        <th className="h-12 px-4 text-left font-medium">Date</th>
                                        <th className="h-12 px-4 text-right font-medium">Amount</th>
                                        <th className="h-12 px-4 text-left font-medium">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contributions.map((c) => (
                                        <tr key={c.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4 font-medium">{c.partner_name}</td>
                                            <td className="p-4">{new Date(c.contribution_date).toLocaleDateString()}</td>
                                            <td className="p-4 text-right font-bold text-green-600">₹{Number(c.amount).toLocaleString()}</td>
                                            <td className="p-4 text-muted-foreground">{c.notes || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'expenses' && (
                <div className="space-y-6">
                    {/* Add Expense Form */}
                    <div className="p-6 rounded-xl border bg-card">
                        <h3 className="font-semibold mb-4">Add New Expense</h3>
                        <form action="/api/cashflow/add-expense" method="post" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="description" className="text-sm font-medium">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    id="description"
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="expense_amount" className="text-sm font-medium">Amount (₹)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    id="expense_amount"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="expense_date" className="text-sm font-medium">Date</label>
                                <input
                                    type="date"
                                    name="expense_date"
                                    id="expense_date"
                                    required
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="category" className="text-sm font-medium">Category (optional)</label>
                                <input
                                    type="text"
                                    name="category"
                                    id="category"
                                    placeholder="e.g., Rent, Utilities, Transport"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    className="h-10 px-4 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    Add Expense
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Expenses Table */}
                    <div className="rounded-md border bg-card">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold">Expense History</h3>
                        </div>
                        <div className="relative w-full overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="h-12 px-4 text-left font-medium">Date</th>
                                        <th className="h-12 px-4 text-left font-medium">Description</th>
                                        <th className="h-12 px-4 text-left font-medium">Category</th>
                                        <th className="h-12 px-4 text-right font-medium">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map((e) => (
                                        <tr key={e.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4">{new Date(e.expense_date).toLocaleDateString()}</td>
                                            <td className="p-4 font-medium">{e.description}</td>
                                            <td className="p-4 text-muted-foreground">{e.category || '-'}</td>
                                            <td className="p-4 text-right font-bold text-red-600">₹{Number(e.amount).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'balance' && (
                <div className="space-y-6">
                    {/* Date Selector */}
                    <div className="p-4 rounded-xl border bg-card">
                        <form action="" method="get" className="flex items-end gap-4">
                            <div className="flex-1">
                                <label htmlFor="balanceDate" className="text-sm font-medium">As of Date</label>
                                <input
                                    type="date"
                                    id="balanceDate"
                                    name="balanceDate"
                                    value={balanceDate}
                                    onChange={(e) => setBalanceDate(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <input type="hidden" name="tab" value="balance" />
                            <button
                                type="submit"
                                className="h-10 px-4 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Update
                            </button>
                        </form>
                    </div>

                    {/* Balance Sheet */}
                    <div className="rounded-xl border bg-card overflow-hidden">
                        <div className="p-6 border-b bg-muted/30">
                            <h3 className="text-xl font-bold">Balance Sheet</h3>
                            <p className="text-sm text-muted-foreground">As of {new Date(balanceDate).toLocaleDateString()}</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="font-semibold mb-3 text-lg">Assets</h4>
                                <div className="space-y-2 pl-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Inventory Value</span>
                                        <span className="font-medium">₹{initialBalanceSheet.inventoryValue.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Cash Balance</span>
                                        <span className="font-medium">₹{initialBalanceSheet.cashBalance.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t font-bold text-lg">
                                        <span>Total Assets</span>
                                        <span className="text-green-600">₹{initialBalanceSheet.totalAssets.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h4 className="font-semibold mb-3 text-lg">Capital & Summary</h4>
                                <div className="space-y-2 pl-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Partner Contributions</span>
                                        <span className="font-medium">₹{initialBalanceSheet.totalContributions.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Revenue</span>
                                        <span className="font-medium">₹{initialBalanceSheet.totalRevenue.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Cost of Goods Sold</span>
                                        <span className="font-medium text-red-600">-₹{initialBalanceSheet.costOfGoodsSold.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Expenses</span>
                                        <span className="font-medium text-red-600">-₹{initialBalanceSheet.totalExpenses.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'profitloss' && (
                <div className="space-y-6">
                    {/* Date Range Selector */}
                    <div className="p-4 rounded-xl border bg-card">
                        <form action="" method="get" className="flex flex-wrap items-end gap-4">
                            <div className="flex-1 min-w-[150px]">
                                <label htmlFor="plStartDate" className="text-sm font-medium">From Date</label>
                                <input
                                    type="date"
                                    id="plStartDate"
                                    name="plStartDate"
                                    value={plStartDate}
                                    onChange={(e) => setPlStartDate(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label htmlFor="plEndDate" className="text-sm font-medium">To Date</label>
                                <input
                                    type="date"
                                    id="plEndDate"
                                    name="plEndDate"
                                    value={plEndDate}
                                    onChange={(e) => setPlEndDate(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <input type="hidden" name="tab" value="profitloss" />
                            <button
                                type="submit"
                                className="h-10 px-4 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Update
                            </button>
                        </form>
                    </div>

                    {/* P&L Statement */}
                    <div className="rounded-xl border bg-card overflow-hidden">
                        <div className="p-6 border-b bg-muted/30">
                            <h3 className="text-xl font-bold">Profit & Loss Statement</h3>
                            <p className="text-sm text-muted-foreground">
                                {new Date(plStartDate).toLocaleDateString()} - {new Date(plEndDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Sales Revenue</span>
                                <span className="font-medium">₹{initialProfitLoss.revenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cost of Goods Sold</span>
                                <span className="font-medium text-red-600">-₹{initialProfitLoss.costOfGoodsSold.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t font-semibold">
                                <span>Gross Profit</span>
                                <span className={initialProfitLoss.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    ₹{initialProfitLoss.grossProfit.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between pt-4">
                                <span className="text-muted-foreground">Operating Expenses</span>
                                <span className="font-medium text-red-600">-₹{initialProfitLoss.expenses.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t font-bold text-xl">
                                <span>Net Profit/Loss</span>
                                <span className={initialProfitLoss.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    ₹{initialProfitLoss.netProfit.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
