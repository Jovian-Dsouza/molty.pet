import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body' },
      { status: 400 },
    )
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('email' in body) ||
    typeof (body as Record<string, unknown>).email !== 'string'
  ) {
    return NextResponse.json(
      { success: false, message: 'Email is required' },
      { status: 400 },
    )
  }

  const rawEmail = (body as { email: string }).email.trim().toLowerCase()

  if (!EMAIL_REGEX.test(rawEmail)) {
    return NextResponse.json(
      { success: false, message: 'Please enter a valid email address' },
      { status: 400 },
    )
  }

  const existing = await prisma.waitlistEntry.findUnique({
    where: { email: rawEmail },
  })

  if (existing) {
    return NextResponse.json(
      { success: false, message: "You're already on the list! We'll be in touch." },
      { status: 409 },
    )
  }

  try {
    await prisma.waitlistEntry.create({ data: { email: rawEmail } })
  } catch (err) {
    console.error('[waitlist] db write error:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to save. Please try again.' },
      { status: 500 },
    )
  }

  return NextResponse.json(
    { success: true, message: "You're on the list!" },
    { status: 201 },
  )
}
