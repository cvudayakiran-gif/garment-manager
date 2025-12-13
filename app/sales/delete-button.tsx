'use client';

import { deleteSale } from '@/lib/sales-actions';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function DeleteButton({ saleId }: { saleId: number }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this sale?\n\nThis will restore the inventory stock and permanently remove the transaction.')) {
            setIsDeleting(true);
            await deleteSale(saleId);
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 hover:bg-red-100 hover:text-red-600 rounded-md transition-colors disabled:opacity-50"
            title="Delete / Return"
        >
            <Trash2 size={16} />
        </button>
    );
}
