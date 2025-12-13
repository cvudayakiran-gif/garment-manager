import {
    getTrendingItems,
    getSlowMovingItems,
    getMaterialTrends,
    getCategoryTrends,
    getSourceTrends
} from '@/lib/analytics-actions';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, AlertTriangle, BarChart3, Package2 } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AnalyticsPage() {
    const user = await getUser();
    if (!user) redirect('/login');

    const trendingItems = await getTrendingItems();
    const slowMovingItems = await getSlowMovingItems();
    const materialTrends = await getMaterialTrends();
    const categoryTrends = await getCategoryTrends();
    const sourceTrends = await getSourceTrends();

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-muted rounded-full">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight">Business Analytics</h1>
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-primary/10 text-primary">
                        Last 90 Days
                    </span>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-8">
                {/* Top Selling Items */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="text-primary" size={24} />
                        <h2 className="text-2xl font-bold">Top Selling Items</h2>
                    </div>
                    <div className="rounded-md border bg-card">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Material</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Color/Pattern</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Source</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Qty Sold</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trendingItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-muted-foreground">No sales data yet.</td>
                                        </tr>
                                    ) : (
                                        trendingItems.map((item, idx) => (
                                            <tr key={idx} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle font-medium">{item.name}</td>
                                                <td className="p-4 align-middle">{item.category || '-'}</td>
                                                <td className="p-4 align-middle text-sm text-muted-foreground">{item.source || '-'}</td>
                                                <td className="p-4 align-middle text-right font-bold">{item.total_quantity_sold}</td>
                                                <td className="p-4 align-middle text-right font-bold text-green-600">₹{Math.round(item.total_revenue).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Trends Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Material Trends */}
                    <div className="rounded-xl border bg-card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 size={20} className="text-primary" />
                            <h3 className="font-semibold">Top Materials</h3>
                        </div>
                        <div className="space-y-3">
                            {materialTrends.slice(0, 5).map((trend, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium truncate">{trend.material}</div>
                                        <div className="text-xs text-muted-foreground">{trend.count} sold</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-green-600">₹{Math.round(trend.revenue).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                            {materialTrends.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
                            )}
                        </div>
                    </div>

                    {/* Category Trends */}
                    <div className="rounded-xl border bg-card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Package2 size={20} className="text-primary" />
                            <h3 className="font-semibold">Top Colors/Patterns</h3>
                        </div>
                        <div className="space-y-3">
                            {categoryTrends.slice(0, 5).map((trend, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium truncate">{trend.category}</div>
                                        <div className="text-xs text-muted-foreground">{trend.count} sold</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-green-600">₹{Math.round(trend.revenue).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                            {categoryTrends.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
                            )}
                        </div>
                    </div>

                    {/* Source Trends */}
                    <div className="rounded-xl border bg-card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={20} className="text-primary" />
                            <h3 className="font-semibold">Top Sources</h3>
                        </div>
                        <div className="space-y-3">
                            {sourceTrends.slice(0, 5).map((trend, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium truncate">{trend.source}</div>
                                        <div className="text-xs text-muted-foreground">{trend.count} sold</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-green-600">₹{Math.round(trend.revenue).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                            {sourceTrends.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Slow Moving Inventory */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="text-orange-500" size={24} />
                        <h2 className="text-2xl font-bold">Slow Moving Inventory</h2>
                        <span className="text-sm text-muted-foreground">(Older than 60 days)</span>
                    </div>
                    <div className="rounded-md border bg-card">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Material</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Color/Pattern</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Stock</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Days Old</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Last Sale</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {slowMovingItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-4 text-center text-muted-foreground">No slow-moving items! 🎉</td>
                                        </tr>
                                    ) : (
                                        slowMovingItems.map((item) => (
                                            <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle font-mono text-xs">#{item.id}</td>
                                                <td className="p-4 align-middle font-medium">{item.name}</td>
                                                <td className="p-4 align-middle">{item.category || '-'}</td>
                                                <td className="p-4 align-middle text-right font-bold">{item.stock}</td>
                                                <td className="p-4 align-middle text-right">
                                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700">
                                                        {item.days_old}d
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle text-right text-muted-foreground text-xs">
                                                    {item.last_sale_days_ago !== null ? `${item.last_sale_days_ago}d ago` : 'Never'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
