import { addContribution } from '@/lib/cashflow-actions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    await addContribution(formData);
    return NextResponse.redirect(new URL('/cashflow', request.url));
}
