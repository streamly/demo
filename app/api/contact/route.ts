import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, videoId, videoTitle } = body

    // Validate required fields
    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Log the contact message (in production, you'd save to database or send email)
    console.log('📧 Contact Form Submission:', {
      message: message.trim(),
      videoId,
      videoTitle,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    })

    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Integrate with CRM
    // 4. Send to Slack/Discord webhook
    
    // For now, we'll just simulate a successful response
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate processing time

    return NextResponse.json(
      { 
        success: true, 
        message: 'Contact message received successfully' 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to process contact message' },
      { status: 500 }
    )
  }
}
