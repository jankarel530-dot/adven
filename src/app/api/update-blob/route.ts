
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const apiToken = request.headers.get('x-api-token');

    if (apiToken !== process.env.BLOB_API_TOKEN) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!filename) {
        return new NextResponse('Filename is required', { status: 400 });
    }
    
    if (!request.body) {
        return new NextResponse('Request body is empty', { status: 400 });
    }

    try {
        const blob = await put(filename, request.body, {
            access: 'public',
            contentType: 'application/json',
        });
        return NextResponse.json(blob);
    } catch (error) {
        console.error("Error updating blob:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new NextResponse(`Error updating blob: ${errorMessage}`, { status: 500 });
    }
}
