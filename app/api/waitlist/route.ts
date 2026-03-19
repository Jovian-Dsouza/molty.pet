import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const WAITLIST_FILE = path.join(DATA_DIR, 'waitlist.json')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface WaitlistEntry {
  email: string
  timestamp: string
}

async function readWaitlist(): Promise<WaitlistEntry[]> {
  try {
    const content = await readFile(WAITLIST_FILE, 'utf-8')
    return JSON.parse(content) as WaitlistEntry[]
  } catch {
    return []
  }
}

async function writeWaitlist(entries: WaitlistEntry[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(WAITLIST_FILE, JSON.stringify(entries, null, 2), 'utf-8')
}

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

  const entries = await readWaitlist()

  if (entries.some((e) => e.email === rawEmail)) {
    return NextResponse.json(
      { success: false, message: "You're already on the list! We'll be in touch." },
      { status: 409 },
    )
  }

  const updated = [...entries, { email: rawEmail, timestamp: new Date().toISOString() }]

  try {
    await writeWaitlist(updated)
  } catch (err) {
    console.error('[waitlist] write error:', err)
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
