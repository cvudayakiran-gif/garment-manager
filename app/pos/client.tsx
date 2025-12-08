'use client';

import { useState } from 'react';
import { Item, processSale } from '@/lib/actions';
import { Search, ShoppingBag, Plus, Minus, Trash2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface POSClientProps {
    initialItems: Item[];
}

export default function POSClient({ initialItems }: POSClientProps) {
    const [items] = useState<Item[]>(initialItems);
    const [cart, setCart] = useState<{ item: Item; quantity: number }[]>([]);
    const [search, setSearch] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [discount, setDiscount] = useState<string>(''); // Keep as string for input handling

    const filteredItems = items.filter(item => {
        const term = search.toLowerCase();
        // Search match logic: Name, Category, or ID (Serial)
        return item.name.toLowerCase().includes(term) ||
            (item.category && item.category.toLowerCase().includes(term)) ||
            item.id.toString() === term; // Exact match for ID usually best, or partial? Let's do partial
    });

    const addToCart = (item: Item) => {
        setCart(prev => {
            const existing = prev.find(i => i.item.id === item.id);
            if (existing) {
                return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: number) => {
        setCart(prev => prev.filter(i => i.item.id !== itemId));
    };

    const updateQuantity = (itemId: number, delta: number) => {
        setCart(prev => {
            return prev.map(i => {
                if (i.item.id === itemId) {
                    const newQty = Math.max(1, i.quantity + delta);
                    return { ...i, quantity: newQty };
                }
                return i;
            });
        });
    };

    const totalPrice = cart.reduce((sum, i) => sum + (i.item.price * i.quantity), 0);
    const discountAmount = parseFloat(discount) || 0;
    const finalTotal = Math.max(0, totalPrice - discountAmount);

    const handleCheckout = async () => {
        if (confirm(`Charge ₹${finalTotal} (Cash)?`)) {
            setIsProcessing(true);
            const cartData = cart.map(i => ({ id: i.item.id, quantity: i.quantity }));
            const result = await processSale(cartData, 'cash', discountAmount);
            if (result.success) {
                setCart([]);
                setDiscount('');
                alert('Sale completed!');
            } else {
                alert('Sale failed: ' + result.error);
            }
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden">
            {/* Left: Product Grid */}
            <div className="flex-1 flex flex-col h-full border-r">
                <header className="p-4 border-b flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-muted rounded-full">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by Serial No (#ID), Material..."
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => addToCart(item)}
                                className="flex flex-col items-start p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-muted/50 transition-colors text-left"
                            >
                                <div className="w-full aspect-square bg-muted rounded-md mb-3 flex items-center justify-center text-muted-foreground relative overflow-hidden">
                                    {item.image_path ? (
                                        <Image src={item.image_path} alt={item.name} fill className="object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center opacity-20">
                                            <ImageIcon size={24} />
                                            <span className="text-2xl font-bold mt-1">{item.name.charAt(0)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between w-full">
                                    <h3 className="font-semibold leading-tight truncate pr-2">{item.name}</h3>
                                    <span className="text-xs font-mono text-muted-foreground">#{item.id}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1 truncate w-full">{item.category}</p>
                                <div className="mt-auto flex w-full items-center justify-between">
                                    <span className="font-bold">₹{item.price}</span>
                                    <span className={cn("text-xs px-2 py-0.5 rounded-full", item.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
                                        {item.stock} left
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Cart */}
            <div className="w-full md:w-96 bg-background flex flex-col h-[40vh] md:h-full border-t md:border-t-0 shadow-xl md:shadow-none z-20">
                <div className="p-4 border-b bg-muted/20">
                    <h2 className="font-semibold flex items-center gap-2">
                        <ShoppingBag size={20} /> Current Sale
                    </h2>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
                            <ShoppingBag size={48} className="mb-4 opacity-20" />
                            <p>Basket is empty</p>
                        </div>
                    ) : (
                        cart.map(({ item, quantity }) => (
                            <div key={item.id} className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-card">
                                <div className="h-10 w-10 bg-muted rounded overflow-hidden relative flex-shrink-0">
                                    {item.image_path ? (
                                        <Image src={item.image_path} alt="" fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full w-full text-xs text-muted-foreground">#{item.id}</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">₹{item.price} each</div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-muted rounded">
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-4 text-center text-sm font-medium">{quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-muted rounded">
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <div className="text-right min-w-[3rem] font-medium">
                                    ₹{item.price * quantity}
                                </div>

                                <button onClick={() => removeFromCart(item.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded flex-shrink-0">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t bg-background mt-auto space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">₹{totalPrice}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground whitespace-nowrap">Discount (-)</span>
                        <input
                            type="number"
                            value={discount}
                            onChange={e => setDiscount(e.target.value)}
                            placeholder="0"
                            className="w-24 text-right rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-2xl font-bold">₹{finalTotal}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isProcessing}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-lg font-bold text-lg disabled:opacity-50 disabled:pointer-events-none transition-all active:scale-[0.98]"
                    >
                        {isProcessing ? 'Processing...' : `Charge ₹${finalTotal}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
