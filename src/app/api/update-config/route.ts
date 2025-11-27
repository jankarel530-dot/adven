
'use server';

import { update } from '@vercel/edge-config';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { key, value } = await request.json();
  const apiToken = request.headers.get('x-api-token');

  if (apiToken !== process.env.EDGE_CONFIG_API_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!key || value === undefined) {
    return NextResponse.json({ error: 'Missing key or value' }, { status: 400 });
  }

  if (!process.env.EDGE_CONFIG) {
    return NextResponse.json({ error: 'EDGE_CONFIG connection string not found' }, { status: 500 });
  }

  try {
    await update(key, value, {
      connectionString: process.env.EDGE_CONFIG,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to update Edge Config: ${error.message}` }, { status: 500 });
  }
}
