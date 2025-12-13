import { addExpense } from '@/lib/cashflow-actions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    await addExpense(formData);
    return NextResponse.redirect(new URL('/cashflow', request.url));
}
