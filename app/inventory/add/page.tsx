'use client';

import { addItem } from "@/lib/actions";
import Link from "next/link";
import { ArrowLeft, Camera, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddItemPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [generatedIds, setGeneratedIds] = useState<number[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitting(true);

        const formData = new FormData(event.currentTarget);

        try {
            const result = await addItem(formData);
            if (result.success && result.ids) {
                setGeneratedIds(result.ids);
                setShowSuccess(true);
                // Optional: Reset form?
                // event.currentTarget.reset();
            }
        } catch (e) {
            console.error(e);
            alert("Failed to add items. Please check if SKU is unique.");
        } finally {
            setSubmitting(false);
        }
    }

    function handleAcknowledge() {
        setShowSuccess(false);
        setGeneratedIds([]);
        router.push('/inventory');
    }

    if (showSuccess) {
        return (
            <div className="flex flex-col min-h-screen bg-background items-center justify-center p-6">
                <div className="max-w-md w-full bg-card border rounded-xl p-8 shadow-lg text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold">Items Added Successfully!</h2>
                    <p className="text-muted-foreground">The following Saree IDs have been generated:</p>

                    <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {generatedIds.map(id => (
                                <span key={id} className="bg-background border px-2 py-1 rounded font-mono text-sm">
                                    #{id.toString().padStart(6, '0')}
                                </span>
                            ))}
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{generatedIds.length} items added to inventory.</p>

                    <button
                        onClick={handleAcknowledge}
                        className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        OK
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background max-w-2xl mx-auto w-full p-6">
            <div className="mb-8 flex items-center gap-4">
                <Link href="/inventory" className="p-2 hover:bg-muted rounded-full">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold">Add New Saree</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Basic Info */}
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Saree Material</label>
                    <input required type="text" name="name" id="name" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="e.g. Pure Silk, Cotton, Georgette" />
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="category" className="text-sm font-medium">Color / Pattern</label>
                        <input type="text" name="category" id="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="e.g. Red with Gold Zari" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="source" className="text-sm font-medium">Source / Vendor</label>
                        <input type="text" name="source" id="source" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="e.g. Weaver A" />
                    </div>
                </div>

                {/* Pricing & Stock */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="date" className="text-sm font-medium">Date</label>
                        <input required type="date" name="date" id="date" defaultValue={new Date().toISOString().split('T')[0]} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="price" className="text-sm font-medium">Price (₹)</label>
                        <input required type="number" step="1" name="price" id="price" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="cost" className="text-sm font-medium">Cost (₹)</label>
                        <input type="number" step="1" name="cost" id="cost" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="stock" className="text-sm font-medium">Quantity</label>
                        <input required type="number" name="stock" id="stock" min="1" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="1" />
                        <p className="text-[10px] text-muted-foreground">Each item will get a unique ID.</p>
                    </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                    <label htmlFor="image" className="text-sm font-medium flex items-center gap-2">
                        <Camera size={16} /> Product Image
                    </label>
                    <input
                        type="file"
                        name="image"
                        id="image"
                        accept="image/*"
                        capture="environment"
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-primary hover:file:bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">Tap 'Choose File' to open Camera on mobile.</p>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        {submitting ? 'Adding...' : 'Save Item(s)'}
                    </button>
                </div>
            </form>
        </div>
    );
}
