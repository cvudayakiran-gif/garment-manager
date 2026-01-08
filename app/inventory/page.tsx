import { getItems, deleteItem, Item } from "@/lib/actions";
import ReturnItemButton from "./return-button";
import Link from "next/link";
import { Plus, Search, Trash2, ArrowLeft, Image as ImageIcon, Calendar } from "lucide-react";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function InventoryPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string, sort?: string, status?: string }>;
}) {
    const user = await getUser();
    if (!user) redirect('/login');

    const params = await searchParams;
    const query = params.q || "";
    const sort = params.sort || "newest";
    const status = params.status || "active";

    let items = await getItems(query, status);

    // Sorting Logic (in memory for now as getItems doesn't support generic sort arg yet)
    if (sort === "oldest") {
        items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sort === "newest") {
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const getDaysOld = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-muted rounded-full">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight">Inventory</h1>
                </div>
                <Link href="/inventory/add" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 gap-2">
                    <Plus size={16} /> Add Saree
                </Link>
            </header>

            <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
                <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <form>
                            <input
                                name="q"
                                defaultValue={query}
                                placeholder="Search by ID, Material or Name..."
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                            {/* Preserve sort if exists */}
                            <input type="hidden" name="sort" value={sort} />
                        </form>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Sort:</span>
                        <div className="flex bg-muted rounded-md p-1">
                            <Link href={`/inventory?q=${query}&sort=newest`} className={`px-3 py-1 text-sm rounded ${sort === 'newest' ? 'bg-background shadow font-medium' : 'text-muted-foreground hover:text-foreground'}`}>Newest</Link>
                            <Link href={`/inventory?q=${query}&sort=oldest`} className={`px-3 py-1 text-sm rounded ${sort === 'oldest' ? 'bg-background shadow font-medium' : 'text-muted-foreground hover:text-foreground'}`}>Oldest</Link>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mb-4">
                    <Link
                        href="/inventory"
                        className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${!params.status ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >
                        Available Stock
                    </Link>
                    <Link
                        href="/inventory?status=returned"
                        className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${params.status === 'returned' ? 'bg-orange-100 text-orange-800' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >
                        Returned Items
                    </Link>
                </div>

                <div className="rounded-md border bg-card">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground w-[60px]">Img</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Material</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Color/Pattern</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Age</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Price</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Stock</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-4 text-center text-muted-foreground">No items found.</td>
                                    </tr>
                                ) : (
                                    items.map((item) => {
                                        const daysOld = getDaysOld(item.created_at);
                                        return (
                                            <tr key={item.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <td className="p-2 align-middle text-center">
                                                    {item.image_path ? (
                                                        <div className="relative h-10 w-10 text-center mx-auto rounded overflow-hidden bg-white ring-1 ring-border">
                                                            <Image src={item.image_path} alt={item.name} fill className="object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-10 w-10 mx-auto bg-muted rounded flex items-center justify-center text-muted-foreground">
                                                            <ImageIcon size={16} />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 align-middle font-mono text-xs text-muted-foreground">#{item.id}</td>
                                                <td className="p-4 align-middle font-medium">
                                                    {item.name}
                                                    {item.source && <div className="text-xs text-muted-foreground font-normal">Src: {item.source}</div>}
                                                </td>
                                                <td className="p-4 align-middle">{item.category}</td>
                                                <td className="p-4 align-middle text-right">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs whitespace-nowrap ${daysOld < 7 ? 'bg-primary/10 text-primary font-bold' :
                                                        daysOld > 60 ? 'bg-orange-100 text-orange-700' :
                                                            'bg-muted text-muted-foreground'
                                                        }`}>
                                                        <Calendar size={10} /> {daysOld}d
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle text-right">₹{item.price}</td>
                                                <td className={`p-4 align-middle text-right font-bold ${item.stock < 5 ? 'text-destructive' : ''}`}>{item.stock}</td>
                                                <td className="p-4 align-middle text-right">
                                                    <ReturnItemButton itemId={item.id} />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
