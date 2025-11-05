import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: videoId } = await params
    
    // TODO: Implement video fetching logic
    return NextResponse.json({ 
        message: 'Video endpoint placeholder',
        videoId 
    })
}