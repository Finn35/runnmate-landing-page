import { NextResponse } from 'next/server'
import { authEmailTemplates } from '@/lib/auth-email-templates'

export async function POST(request: Request) {
  // Minimal implementation to satisfy build
  return NextResponse.json({
    subject: authEmailTemplates.magicLink.subject['en'],
    message: 'This is a placeholder endpoint.'
  })
} 