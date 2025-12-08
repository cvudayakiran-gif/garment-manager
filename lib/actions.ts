'use server';

import { supabaseAdmin } from './supabase-client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface Item {
    id: number;
    name: string;
    sku: string | null;
    price: number;
    cost: number;
    stock: number;
    category: string | null;
    source: string | null;
    image_path: string | null;
    created_at: string;
}

export async function getItems(query?: string): Promise<Item[]> {
    let queryBuilder = supabaseAdmin
        .from('items')
        .select('*')
        .order('id', { ascending: false });

    if (query) {
        // Try to parse as ID for exact match
        const idSearch = parseInt(query);
        if (!isNaN(idSearch)) {
            const { data } = await supabaseAdmin
                .from('items')
                .select('*')
                .eq('id', idSearch)
                .single();
            return data ? [data] : [];
        }

        // Otherwise search by name, SKU, category, or source
        const { data } = await supabaseAdmin
            .from('items')
            .select('*')
            .or(`name.ilike.%${query}%,sku.ilike.%${query}%,category.ilike.%${query}%,source.ilike.%${query}%`)
            .order('id', { ascending: false });

        return data || [];
    }

    const { data } = await queryBuilder;
    return data || [];
}

export async function getItem(id: number): Promise<Item | null> {
    const { data } = await supabaseAdmin
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

    return data;
}

export async function addItem(formData: FormData) {
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string) || 0;
    const cost = parseFloat(formData.get('cost') as string) || 0;
    const stock = parseInt(formData.get('stock') as string) || 0;
    const sku = formData.get('sku') as string;
    const category = formData.get('category') as string;
    const source = formData.get('source') as string;

    let image_path = null;
    const imageFile = formData.get('image') as File;

    if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
        try {
            // Upload to Supabase Storage
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = fileName;

            const { error: uploadError } = await supabaseAdmin.storage
                .from('saree-images')
                .upload(filePath, imageFile, {
                    contentType: imageFile.type,
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
            } else {
                // Get public URL
                const { data } = supabaseAdmin.storage
                    .from('saree-images')
                    .getPublicUrl(filePath);

                image_path = data.publicUrl;
            }
        } catch (error) {
            console.error('Failed to upload image:', error);
        }
    }

    const { error } = await supabaseAdmin
        .from('items')
        .insert({
            name,
            sku: sku || null,
            price,
            cost,
            stock,
            category: category || null,
            source: source || null,
            image_path
        });

    if (error) {
        console.error('Failed to add item:', error);
    }

    revalidatePath('/inventory');
    redirect('/inventory');
}

export async function updateStock(id: number, adjustment: number) {
    // First get current stock
    const { data: item } = await supabaseAdmin
        .from('items')
        .select('stock')
        .eq('id', id)
        .single();

    if (item) {
        await supabaseAdmin
            .from('items')
            .update({ stock: item.stock + adjustment })
            .eq('id', id);
    }

    revalidatePath('/inventory');
    revalidatePath('/pos');
}

export async function deleteItem(id: number) {
    // Get item to check if it has an image
    const { data: item } = await supabaseAdmin
        .from('items')
        .select('image_path')
        .eq('id', id)
        .single();

    // Delete image from storage if it exists
    if (item?.image_path) {
        const fileName = item.image_path.split('/').pop();
        if (fileName) {
            await supabaseAdmin.storage
                .from('saree-images')
                .remove([fileName]);
        }
    }

    // Delete item from database
    await supabaseAdmin
        .from('items')
        .delete()
        .eq('id', id);

    revalidatePath('/inventory');
}

export interface CartItem {
    id: number;
    quantity: number;
}

export async function processSale(cart: CartItem[], paymentMethod: string = 'cash', discount: number = 0) {
    if (cart.length === 0) return { error: 'Cart is empty' };

    try {
        let subtotal = 0;
        const saleItemsData = [];

        // Get item prices
        for (const item of cart) {
            const { data: dbItem } = await supabaseAdmin
                .from('items')
                .select('price, stock')
                .eq('id', item.id)
                .single();

            if (!dbItem) continue;
            if (dbItem.stock < item.quantity) {
                return { error: `Insufficient stock for item #${item.id}` };
            }

            subtotal += dbItem.price * item.quantity;
            saleItemsData.push({ ...item, price: dbItem.price });
        }

        const total = Math.max(0, subtotal - discount);

        // Create sale
        const { data: sale, error: saleError } = await supabaseAdmin
            .from('sales')
            .insert({
                total,
                payment_method: paymentMethod,
                discount,
                status: 'completed'
            })
            .select('id')
            .single();

        if (saleError || !sale) {
            throw new Error('Failed to create sale');
        }

        // Create sale items and update stock
        for (const item of saleItemsData) {
            // Insert sale item
            await supabaseAdmin
                .from('sale_items')
                .insert({
                    sale_id: sale.id,
                    item_id: item.id,
                    quantity: item.quantity,
                    price_at_sale: item.price
                });

            // Update stock
            await updateStock(item.id, -item.quantity);
        }

        revalidatePath('/pos');
        revalidatePath('/inventory');
        revalidatePath('/sales');
        return { success: true };

    } catch (error) {
        console.error('Sale failed:', error);
        return { error: 'Transaction failed' };
    }
}
