import { describe, expect, it } from "vitest";
import { OLED_HEIGHT, OLED_WIDTH, faceBitmap } from "../face";

const lit = (bitmap: Uint8Array, x0 = 0, y0 = 0, x1 = OLED_WIDTH, y1 = OLED_HEIGHT) => {
  let count = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) count += bitmap[y * OLED_WIDTH + x];
  return count;
};

describe("faceBitmap", () => {
  const open = faceBitmap("open");
  const blink = faceBitmap("blink");

  it("is a 128 × 64 one-bit frame", () => {
    expect(OLED_WIDTH).toBe(128);
    expect(OLED_HEIGHT).toBe(64);
    expect(open).toHaveLength(128 * 64);
    expect(open.every((px) => px === 0 || px === 1)).toBe(true);
  });

  it("draws two eyes in the upper half, one on each side", () => {
    const leftEye = lit(open, 0, 0, 64, 38);
    const rightEye = lit(open, 64, 0, 128, 38);
    expect(leftEye).toBeGreaterThan(150);
    expect(rightEye).toBe(leftEye);
  });

  it("draws a smile below the eyes that curves up at the corners", () => {
    expect(lit(open, 0, 38, 128, 64)).toBeGreaterThan(60);
    const lowestRow = (x: number) => {
      for (let y = OLED_HEIGHT - 1; y >= 38; y--) if (open[y * OLED_WIDTH + x]) return y;
      return -1;
    };
    expect(lowestRow(64)).toBeGreaterThan(lowestRow(50)); // middle dips lower than the corners
  });

  it("is mirror-symmetric", () => {
    for (let y = 0; y < OLED_HEIGHT; y++) {
      for (let x = 0; x < OLED_WIDTH / 2; x++) {
        expect(open[y * OLED_WIDTH + x]).toBe(open[y * OLED_WIDTH + (OLED_WIDTH - 1 - x)]);
      }
    }
  });

  it("closes the eyes to thin lines when blinking but keeps the smile", () => {
    expect(lit(blink, 0, 0, 128, 38)).toBeLessThan(lit(open, 0, 0, 128, 38) / 4);
    expect(lit(blink, 0, 38, 128, 64)).toBe(lit(open, 0, 38, 128, 64));
  });
});

describe("faceBitmap moods", () => {
  const happy = faceBitmap("open", "happy");
  const eyes = (b: Uint8Array) => lit(b, 0, 0, 128, 38);
  const mouth = (b: Uint8Array) => lit(b, 0, 38, 128, 64);

  it("defaults to the happy face", () => {
    expect(faceBitmap("open")).toEqual(happy);
  });

  it("narrows the eyes and flattens the mouth when focused", () => {
    const focus = faceBitmap("open", "focus");
    expect(eyes(focus)).toBeLessThan(eyes(happy));
    expect(eyes(focus)).toBeGreaterThan(eyes(happy) / 2);
    expect(mouth(focus)).toBeGreaterThan(0);
    expect(mouth(focus)).not.toBe(mouth(happy));
  });

  it("tilts the mouth when unsure, so the face is no longer symmetric", () => {
    const unsure = faceBitmap("open", "unsure");
    const mirrored = (x: number, y: number) => unsure[y * OLED_WIDTH + (OLED_WIDTH - 1 - x)];
    let asymmetric = 0;
    for (let y = 38; y < OLED_HEIGHT; y++) for (let x = 0; x < 64; x++) asymmetric += Number(unsure[y * OLED_WIDTH + x] !== mirrored(x, y));
    expect(asymmetric).toBeGreaterThan(10);
  });

  it("keeps the eyes shut when sleepy, even between blinks", () => {
    const sleepy = faceBitmap("open", "sleepy");
    expect(eyes(sleepy)).toBeLessThan(eyes(happy) / 4);
    expect(faceBitmap("blink", "sleepy")).toEqual(sleepy);
  });
});
