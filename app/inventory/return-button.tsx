'use client';

import { deleteItem } from '@/lib/actions';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function ReturnItemButton({ itemId }: { itemId: number }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleReturn = async () => {
        if (confirm('Are you sure you want to RETURN this item to the vendor?\n\nThis will remove it from stock and mark it as "Returned".')) {
            setIsDeleting(true);
            await deleteItem(itemId);
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleReturn}
            disabled={isDeleting}
            className="p-2 hover:bg-orange-100 hover:text-orange-600 rounded-md transition-colors disabled:opacity-50"
            title="Return to Supplier"
        >
            <Trash2 size={16} />
        </button>
    );
}
