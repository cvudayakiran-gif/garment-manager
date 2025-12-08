import { getSales, getAnalytics, reverseSale } from "@/lib/sales-actions";
import Link from "next/link";
import { ArrowLeft, RotateCcw, TrendingUp, ShoppingBag, Banknote } from "lucide-react";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SalesPage() {
    const user = await getUser();
    if (!user) redirect('/login');

    const sales = await getSales();
    const stats = await getAnalytics();

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
                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Banknote size={16} /> Total Revenue
                        </span>
                        <span className="text-2xl font-bold mt-2">₹{stats.totalRevenue.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground mt-1">
                            Today: <span className="text-green-600 font-medium">₹{stats.dailyRevenue.toLocaleString()}</span>
                        </span>
                    </div>
                    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp size={16} /> Transactions
                        </span>
                        <span className="text-2xl font-bold mt-2">{stats.totalTransactions}</span>
                    </div>
                    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <ShoppingBag size={16} /> Sarees Sold
                        </span>
                        <span className="text-2xl font-bold mt-2">{stats.totalItemsSold}</span>
                    </div>
                </div>

                <div className="rounded-md border bg-card">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold">Recent Transactions</h2>
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
                                {sales.map((sale) => (
                                    <tr key={sale.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-mono text-xs">#{sale.id}</td>
                                        <td className="p-4 align-middle">
                                            {new Date(sale.created_at).toLocaleDateString()} <span className="text-muted-foreground text-xs">{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                        <td className="p-4 align-middle text-right font-bold">₹{sale.total}</td>
                                        <td className="p-4 align-middle text-right text-muted-foreground">{sale.discount > 0 ? `-₹${sale.discount}` : '-'}</td>
                                        <td className="p-4 align-middle text-right">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${sale.status === 'refunded'
                                                    ? 'bg-destructive/10 text-destructive'
                                                    : 'bg-green-100 text-green-800'
                                                }`}>
                                                {sale.status}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            {sale.status !== 'refunded' && (
                                                <form action={async () => {
                                                    'use server';
                                                    await reverseSale(sale.id);
                                                }}>
                                                    <button type="submit" className="p-2 hover:bg-orange-100 hover:text-orange-600 rounded-md transition-colors" title="Reverse Sale (Refund)">
                                                        <RotateCcw size={16} />
                                                    </button>
                                                </form>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
