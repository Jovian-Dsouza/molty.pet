import { FLOW } from '@/app/content'

const CARD_X = 810
const BUS_X = 760
const LANE_Y = 330
const AGENT_Y = [90, 170, 250, 330] as const

/** Outbound: words leave the robot and fan out to an agent. */
const outPath = (y: number) => `M576 120 H${BUS_X} V${y} H${CARD_X}`
/** Return: the agent answers with a named move, which lands on the robot's move picker. */
const backPath = (y: number) => `M${CARD_X} ${y} H${BUS_X} V${LANE_Y} H580 Q540 ${LANE_Y} 540 ${LANE_Y + 40} V384`

function Packet({ path, begin, back = false }: { path: string; begin: number; back?: boolean }) {
  return (
    <circle r={back ? 5 : 4} className={back ? 'arch-packet arch-packet-back' : 'arch-packet'}>
      <animateMotion dur="3.6s" begin={`${begin}s`} repeatCount="indefinite" path={path} />
    </circle>
  )
}

function Node({ cx, cy, label, children }: { cx: number; cy: number; label: string; children: React.ReactNode }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r="36" className="arch-node" />
      <g className="arch-icon">{children}</g>
      <text y="62" textAnchor="middle" className="arch-label">
        {label}
      </text>
    </g>
  )
}

export function FlowDiagram() {
  return (
    <svg
      viewBox="0 0 1200 540"
      role="img"
      aria-label={FLOW.alt}
      className="arch-diagram"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="arch-glow">
          <stop offset="0" stopColor="var(--primary)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* zones */}
      <rect x="170" y="30" width="440" height="480" rx="28" className="arch-zone" />
      <rect x="720" y="30" width="440" height="480" rx="28" className="arch-zone arch-zone-cloud" />
      <text x="196" y="64" className="arch-zone-label">
        ON YOUR DESK
      </text>
      <text x="746" y="64" className="arch-zone-label">
        IN THE CLOUD
      </text>

      {/* you */}
      <g transform="translate(60 120)" className="arch-icon">
        <circle cy="-14" r="14" />
        <path d="M-26 28 Q-26 6 0 6 Q26 6 26 28" />
        <path d="M44 -26 Q56 -14 44 -2" className="arch-wave" />
        <path d="M58 -38 Q78 -14 58 10" className="arch-wave arch-wave-2" />
      </g>
      <text x="60" y="182" textAnchor="middle" className="arch-label">
        You
      </text>

      {/* static wiring */}
      <g className="arch-wire">
        <path d="M110 120 H204" />
        <path d="M276 120 H354" />
        <path d="M426 120 H504" />
        <path d={`M${BUS_X} 90 V${LANE_Y}`} />
        {AGENT_Y.map((y) => (
          <path key={y} d={`M${BUS_X} ${y} H${CARD_X}`} />
        ))}
        <path d="M576 120 H760" />
        <path d={`M${BUS_X} ${LANE_Y} H580 Q540 ${LANE_Y} 540 ${LANE_Y + 40} V384`} />
        <path d="M504 420 H426" />
        <path d="M354 420 H276" />
        {AGENT_Y.map((y) => (
          <path key={`m${y}`} d={`M1050 ${y} H1090`} />
        ))}
        <path d="M1090 90 V330 Q1090 440 1010 445" />
      </g>

      {/* flowing dashes on the main lanes */}
      <g className="arch-flow">
        <path d="M110 120 H204" />
        <path d="M276 120 H354" />
        <path d="M426 120 H504" />
        <path d="M576 120 H760" />
      </g>
      <g className="arch-flow arch-flow-back">
        <path d={`M${BUS_X} ${LANE_Y} H580 Q540 ${LANE_Y} 540 ${LANE_Y + 40} V384`} />
        <path d="M504 420 H426" />
        <path d="M354 420 H276" />
      </g>

      {/* local voice model bracket */}
      <rect x="318" y="164" width="300" height="30" rx="15" className="arch-pill" />
      <text x="468" y="184" textAnchor="middle" className="arch-pill-text">
        local voice model
      </text>

      {/* robot side */}
      <Node cx={240} cy={120} label="Mic">
        <rect x="-8" y="-20" width="16" height="26" rx="8" />
        <path d="M-16 -4 Q-16 14 0 14 Q16 14 16 -4 M0 14 V22" />
      </Node>
      <Node cx={390} cy={120} label="Hey Molty">
        <path d="M-22 0 V0 M-14 -10 V10 M-6 -20 V20 M2 -8 V8 M10 -16 V16 M18 -4 V4" />
      </Node>
      <Node cx={540} cy={120} label="Speech → text">
        <path d="M-18 -12 H18 M-18 0 H10 M-18 12 H18" />
      </Node>
      <Node cx={540} cy={420} label="Pick a move">
        <path d="M4 -22 L-12 4 H0 L-4 22 L14 -6 H2 Z" />
      </Node>
      <Node cx={390} cy={420} label="Servos">
        <circle r="10" />
        <path d="M0 -10 V-22 M0 10 V22 M-10 0 H-22 M10 0 H22" />
      </Node>
      <Node cx={240} cy={420} label="Moves + face">
        <rect x="-20" y="-16" width="40" height="32" rx="8" />
        <circle cx="-8" cy="-2" r="2.5" className="arch-dot" />
        <circle cx="8" cy="-2" r="2.5" className="arch-dot" />
        <path d="M-7 8 Q0 13 7 8" />
      </Node>

      {/* agents */}
      {AGENT_Y.map((y, i) => (
        <g key={y} transform={`translate(${CARD_X} ${y - 28})`}>
          <rect width="240" height="56" rx="16" className="arch-card" />
          {i === 0 ? (
            <image href="/hermes-agent-logo-dark.png" x="14" y="12" width="32" height="32" />
          ) : (
            <circle cx="30" cy="28" r="14" className="arch-card-dot" />
          )}
          {i === 3 && (
            <path d="M30 21 V35 M23 28 H37" className="arch-plus" />
          )}
          <text x="62" y="34" className="arch-card-text">
            {FLOW.agents[i]}
          </text>
        </g>
      ))}

      {/* memory */}
      <circle cx="930" cy="445" r="70" fill="url(#arch-glow)" className="arch-pulse" />
      <g transform="translate(930 445)" className="arch-memory">
        <ellipse cy="-24" rx="38" ry="12" />
        <path d="M-38 -24 V22 Q-38 34 0 34 Q38 34 38 22 V-24" />
        <path d="M-38 -2 Q-38 10 0 10 Q38 10 38 -2" />
      </g>
      <text x="930" y="497" textAnchor="middle" className="arch-label">
        Your memory
      </text>

      {/* gets better over time */}
      <g transform="translate(1058 470)" className="arch-grow">
        <rect x="0" y="22" width="9" height="12" rx="2" />
        <rect x="14" y="12" width="9" height="22" rx="2" />
        <rect x="28" y="0" width="9" height="34" rx="2" />
      </g>
      <path
        d="M868 400 A74 74 0 0 1 992 400"
        className="arch-learn"
        markerEnd="url(#arch-arrow)"
      />
      <defs>
        <marker id="arch-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--primary)" />
        </marker>
      </defs>

      {/* data in flight */}
      {AGENT_Y.map((y, i) => (
        <Packet key={`o${y}`} path={outPath(y)} begin={i * 0.9} />
      ))}
      {AGENT_Y.map((y, i) => (
        <Packet key={`b${y}`} path={backPath(y)} begin={i * 0.9 + 0.45} back />
      ))}
    </svg>
  )
}
