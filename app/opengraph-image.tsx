import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  const moltyImageData = readFileSync(join(process.cwd(), 'public/og-image.png'))
  const moltyImageSrc = `data:image/png;base64,${moltyImageData.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background:
            'radial-gradient(ellipse at top left, #f5e6b8 0%, #f9c8d4 40%, #c8dff5 100%)',
          padding: '0 80px 0 72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Left: text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#c94a4a',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            molty.pet
          </div>
          <div
            style={{
              fontSize: 62,
              fontWeight: 800,
              color: '#1a1a2e',
              lineHeight: 1.1,
              letterSpacing: '-2px',
              maxWidth: 480,
            }}
          >
            Meet your new desk best friend.
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#5a5a7a',
              marginTop: 24,
              lineHeight: 1.5,
              maxWidth: 420,
            }}
          >
            A tiny AI companion that actually gets you.
          </div>
        </div>

        {/* Right: Molty image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={moltyImageSrc}
          alt="Molty"
          style={{
            width: 520,
            height: 520,
            objectFit: 'cover',
            flexShrink: 0,
            borderRadius: 48,
          }}
        />
      </div>
    ),
    { ...size }
  )
}
