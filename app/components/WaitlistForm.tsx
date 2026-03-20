'use client'

import { useState } from 'react'
import { track } from '@vercel/analytics'

interface WaitlistFormProps {
  onSuccess?: () => void
  buttonText?: string
  compact?: boolean
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function WaitlistForm({
  onSuccess,
  buttonText = 'Join Waitlist 🚀',
  compact = false,
}: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email.trim()) return

    setFormState('loading')
    setMessage('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = (await res.json()) as { success: boolean; message: string }

      if (data.success) {
        setFormState('success')
        setMessage(data.message)
        setEmail('')
        track('waitlist_submit', { status: 'success' })
        onSuccess?.()
      } else {
        setFormState('error')
        setMessage(data.message)
        track('waitlist_submit', { status: 'error' })
      }
    } catch {
      setFormState('error')
      setMessage('Something went wrong. Try again!')
      track('waitlist_submit', { status: 'error' })
    }
  }

  if (formState === 'success') {
    return (
      <div
        className="animate-wiggle flex flex-col items-center gap-2 rounded-2xl border-3 border-dark bg-cyan px-6 py-4 text-center shadow-chunky"
        style={{ borderWidth: 3 }}
      >
        <p className="font-heading text-2xl font-bold text-dark">
          You&apos;re on the list! 🎉
        </p>
        <p className="font-body text-sm text-dark/80">{message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? 'flex gap-2' : 'flex flex-col gap-3 sm:flex-row'}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        disabled={formState === 'loading'}
        className={`
          flex-1 rounded-xl border-3 border-dark bg-white px-4 py-3
          font-body text-base text-dark placeholder:text-dark/40
          shadow-chunky-sm outline-none
          focus:border-primary focus:shadow-none
          disabled:opacity-60
          transition-all
        `}
        style={{ borderWidth: 3 }}
      />
      <button
        type="submit"
        disabled={formState === 'loading' || !email.trim()}
        className={`
          rounded-xl border-3 border-dark px-6 py-3
          font-heading text-lg font-semibold text-white
          shadow-chunky-sm
          transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
          disabled:cursor-not-allowed disabled:opacity-60
          ${formState === 'loading' ? 'bg-primary/70' : 'bg-accent hover:bg-accent/90'}
        `}
        style={{ borderWidth: 3, minWidth: compact ? 'auto' : 160 }}
      >
        {formState === 'loading' ? (
          <span className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Joining...
          </span>
        ) : (
          buttonText
        )}
      </button>

      {formState === 'error' && message && (
        <p className="w-full text-center text-sm font-medium text-red-500 sm:col-span-2">
          {message}
        </p>
      )}
    </form>
  )
}
