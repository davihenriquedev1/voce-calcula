import { NextResponse } from 'next/server';

export async function GET() {
    const { API_URL, INTERNAL_API_KEY } = process.env;

    if (!API_URL || !INTERNAL_API_KEY) {
        return NextResponse.json(
            { error: 'Server misconfiguration' },
            { status: 500 }
        );
    }

    const res = await fetch(`${API_URL}/api/exchange-rates`, {
        headers: {
            'x-api-key': INTERNAL_API_KEY,
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