import Link from "next/link";
import { ShoppingBag, Package, Users, BarChart3 } from "lucide-react";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Anavrin Sarees</h1>
        <div className="text-sm text-muted-foreground">User: {user}</div>
      </header>

      <main className="flex-1 p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto w-full items-start content-start">

        <Link href="/pos" className="group relative flex flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8 text-card-foreground shadow-sm transition-colors hover:bg-muted/50 hover:border-primary/50 aspect-square">
          <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <ShoppingBag size={48} />
          </div>
          <h2 className="text-2xl font-semibold">Point of Sale</h2>
          <p className="text-center text-muted-foreground">Process sales, scan items, and take payments.</p>
        </Link>

        <Link href="/inventory" className="group relative flex flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8 text-card-foreground shadow-sm transition-colors hover:bg-muted/50 hover:border-primary/50 aspect-square">
          <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Package size={48} />
          </div>
          <h2 className="text-2xl font-semibold">Inventory</h2>
          <p className="text-center text-muted-foreground">Manage stock, add items, and track variants.</p>
        </Link>

        <Link href="/sales" className="group relative flex flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8 text-card-foreground shadow-sm transition-colors hover:bg-muted/50 hover:border-primary/50 aspect-square">
          <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Users size={48} />
          </div>
          <h2 className="text-2xl font-semibold">Sales History</h2>
          <p className="text-center text-muted-foreground">View transactions and process refunds.</p>
        </Link>

        <Link href="/analytics" className="group relative flex flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8 text-card-foreground shadow-sm transition-colors hover:bg-muted/50 hover:border-primary/50 aspect-square">
          <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <BarChart3 size={48} />
          </div>
          <h2 className="text-2xl font-semibold">Analytics</h2>
          <p className="text-center text-muted-foreground">View trends and insights on sales data.</p>
        </Link>

      </main>
    </div>
  );
}
