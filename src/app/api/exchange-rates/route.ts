import { NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config();

export async function GET() {

    const res = await fetch(`${process.env.API_URL}/api/exchange-rates`, {
        headers: {
            'x-api-key': process.env.INTERNAL_API_KEY!,
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        return NextResponse.json(
            { error: 'Failed to fetch exchange rates' },
            { status: res.status }
        );
    }

    const data = await res.json();
    return NextResponse.json(data);
}
