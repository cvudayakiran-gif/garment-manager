import { getSales, getAnalytics } from "@/lib/sales-actions";
import DeleteButton from "./delete-button";
import Link from "next/link";
import { ArrowLeft, RotateCcw, TrendingUp, ShoppingBag, Banknote, Calendar } from "lucide-react";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SalesPage({
    searchParams,
}: {
    searchParams: { startDate?: string; endDate?: string };
}) {
    const user = await getUser();
    if (!user) redirect('/login');

    const startDate = searchParams.startDate;
    const endDate = searchParams.endDate;

    const sales = await getSales(startDate, endDate);
    const stats = await getAnalytics();

    // Calculate date range display
    const defaultEndDate = new Date().toISOString().split('T')[0];
    const defaultStartDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const displayStartDate = startDate || defaultStartDate;
    const displayEndDate = endDate || defaultEndDate;

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-muted rounded-full">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight">Sales History</h1>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
                {/* Date Filter */}
                <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar size={18} className="text-primary" />
                        <h3 className="font-semibold">Filter by Date Range</h3>
                    </div>
                    <form method="get" className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[150px]">
                            <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                defaultValue={displayStartDate}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label htmlFor="endDate" className="text-sm font-medium">End Date</label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                defaultValue={displayEndDate}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <button
                            type="submit"
                            className="h-10 px-4 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            Apply Filter
                        </button>
                        <Link
                            href="/sales"
                            className="h-10 px-4 inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-muted"
                        >
                            Reset (Last 90 Days)
                        </Link>
                    </form>
                    <p className="text-xs text-muted-foreground mt-2">
                        Showing: {new Date(displayStartDate).toLocaleDateString()} - {new Date(displayEndDate).toLocaleDateString()}
                        {!startDate && !endDate && " (Last 90 Days)"}
                    </p>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Banknote size={16} /> Total Revenue (90 Days)
                        </span>
                        <span className="text-2xl font-bold mt-2">₹{stats.totalRevenue.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground mt-1">
                            Today: <span className="text-green-600 font-medium">₹{stats.dailyRevenue.toLocaleString()}</span>
                        </span>
                    </div>
                    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp size={16} /> Transactions (90 Days)
                        </span>
                        <span className="text-2xl font-bold mt-2">{stats.totalTransactions}</span>
                    </div>
                    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <ShoppingBag size={16} /> Sarees Sold (90 Days)
                        </span>
                        <span className="text-2xl font-bold mt-2">{stats.totalItemsSold}</span>
                    </div>
                </div>

                <div className="rounded-md border bg-card">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold">Transactions ({sales.length})</h2>
                    </div>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Amount</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Discount</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            No transactions found for this date range.
                                        </td>
                                    </tr>
                                ) : (
                                    sales.map((sale) => (
                                        <tr key={sale.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-mono text-xs">#{sale.id}</td>
                                            <td className="p-4 align-middle">
                                                <div className={sale.status === 'reversed' ? 'line-through opacity-50' : ''}>
                                                    {new Date(sale.created_at).toLocaleDateString()} <span className="text-muted-foreground text-xs">{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className={`p-4 align-middle text-right font-bold ${sale.status === 'reversed' ? 'line-through opacity-50' : ''}`}>₹{sale.total}</td>
                                            <td className="p-4 align-middle text-right text-muted-foreground">{sale.discount > 0 ? `-₹${sale.discount}` : '-'}</td>
                                            <td className="p-4 align-middle text-right">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${sale.status === 'reversed'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {sale.status}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                {sale.status !== 'reversed' && (
                                                    <DeleteButton saleId={sale.id} />
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
