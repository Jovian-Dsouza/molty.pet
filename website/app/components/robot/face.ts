/**
 * Molty's face on its 0.96" SSD1306 OLED (128 × 64, one bit per pixel), plus
 * where that screen sits in the CAD model. Pure data and drawing only.
 */

import type { Vec3 } from "./servos";

export const OLED_WIDTH = 128;
export const OLED_HEIGHT = 64;

export type Expression = "open" | "blink";

/**
 * Active area of the display glass, measured from the Sesame STEP (#o1.11):
 * the screen tilts ~20° upward in the top cover's front window. CAD mm.
 */
export const OLED_SCREEN = {
  center: [-6.0, 43.45, 2.36] as Vec3,
  /** Out of the glass, toward the viewer. */
  normal: [-0.94, 0.342, 0] as Vec3,
  /** Screen "up" along the glass. */
  up: [0.342, 0.94, 0] as Vec3,
  /** Screen "right" as seen from the front. */
  right: [0, 0, 1] as Vec3,
  widthMm: 21.74,
  heightMm: 10.86,
};

const EYE = { x0: 30, x1: 48, y0: 10, y1: 34, corner: 5 };
const BLINK_ROWS = [21, 22, 23];
const SMILE = { x0: 44, x1: 84, top: 42, depth: 10, thickness: 3 };

function set(bitmap: Uint8Array, x: number, y: number): void {
  if (x >= 0 && x < OLED_WIDTH && y >= 0 && y < OLED_HEIGHT) bitmap[y * OLED_WIDTH + x] = 1;
}

/** Sets a pixel and its mirror across the vertical centre line. */
function setMirrored(bitmap: Uint8Array, x: number, y: number): void {
  set(bitmap, x, y);
  set(bitmap, OLED_WIDTH - 1 - x, y);
}

function drawEyes(bitmap: Uint8Array, expression: Expression): void {
  const { x0, x1, y0, y1, corner } = EYE;
  for (let x = x0; x < x1; x++) {
    if (expression === "blink") {
      for (const y of BLINK_ROWS) setMirrored(bitmap, x, y);
      continue;
    }
    for (let y = y0; y < y1; y++) {
      // Round the corners: keep pixel centres inside a quarter-circle of radius `corner`.
      const dx = Math.max(x0 + corner - (x + 0.5), x + 0.5 - (x1 - corner), 0);
      const dy = Math.max(y0 + corner - (y + 0.5), y + 0.5 - (y1 - corner), 0);
      if (dx * dx + dy * dy <= corner * corner) setMirrored(bitmap, x, y);
    }
  }
}

function drawSmile(bitmap: Uint8Array): void {
  const { x0, x1, top, depth, thickness } = SMILE;
  const mid = (OLED_WIDTH - 1) / 2;
  const half = (x1 - 1 - x0) / 2;
  const curve = (x: number) => Math.round(top + depth * (1 - ((x - mid) / half) ** 2));
  for (let x = x0; x <= mid; x++) {
    // Fill down to the neighbouring column too, so steep ends stay unbroken.
    const from = Math.min(curve(x), curve(x + 1));
    const to = Math.max(curve(x), curve(x + 1)) + thickness - 1;
    for (let y = from; y <= to; y++) setMirrored(bitmap, x, y);
  }
}

/** A 128 × 64 frame, row-major, 1 = lit pixel. */
export function faceBitmap(expression: Expression): Uint8Array {
  const bitmap = new Uint8Array(OLED_WIDTH * OLED_HEIGHT);
  drawEyes(bitmap, expression);
  drawSmile(bitmap);
  return bitmap;
}
