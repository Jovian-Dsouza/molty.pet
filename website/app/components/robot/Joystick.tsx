"use client";

import { useRef, useState, type PointerEvent } from "react";
import type { DriveInput } from "./physics";

const RADIUS = 44;

/** Touch/mouse joystick. Up = forward, left = turn left. */
export function Joystick({ onChange }: { onChange: (input: DriveInput) => void }) {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);

  const update = (e: PointerEvent) => {
    const rect = base.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const len = Math.hypot(dx, dy);
    const s = len > RADIUS ? RADIUS / len : 1;
    const x = dx * s;
    const y = dy * s;
    setKnob({ x, y });
    onChange({ forward: -y / RADIUS, turn: -x / RADIUS });
  };

  const release = () => {
    dragging.current = false;
    setKnob({ x: 0, y: 0 });
    onChange({ forward: 0, turn: 0 });
  };

  return (
    <div
      ref={base}
      aria-hidden
      title="Drag to drive"
      className="relative size-28 touch-none rounded-full border border-border bg-background/70 backdrop-blur-sm select-none"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e);
      }}
      onPointerMove={(e) => dragging.current && update(e)}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
    >
      <span className="absolute inset-3 rounded-full border border-dashed border-border" />
      <span
        className="absolute top-1/2 left-1/2 size-10 rounded-full bg-primary shadow-[0_0_24px_var(--primary)]"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  );
}
