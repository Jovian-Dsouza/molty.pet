"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { DriveInput } from "./physics";

const FORWARD_KEYS = new Set(["w", "arrowup"]);
const BACK_KEYS = new Set(["s", "arrowdown"]);
const LEFT_KEYS = new Set(["a", "arrowleft"]);
const RIGHT_KEYS = new Set(["d", "arrowright"]);
const DRIVE_KEYS = new Set([...FORWARD_KEYS, ...BACK_KEYS, ...LEFT_KEYS, ...RIGHT_KEYS]);

/**
 * Merges keyboard (WASD / arrows) and on-screen joystick into one drive input ref.
 * Keys are only captured while `target` has focus, so arrow keys keep scrolling
 * the page everywhere else.
 */
export function useDriveControls(target: RefObject<HTMLElement | null>, active: boolean) {
  const keys = useRef(new Set<string>());
  const stick = useRef<DriveInput>({ forward: 0, turn: 0 });

  useEffect(() => {
    const node = target.current;
    if (!active || !node) return;
    const pressed = keys.current;
    const down = (e: KeyboardEvent) => {
      // macOS never sends keyup for W/A/S/D held with Cmd, so they'd stick.
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (!DRIVE_KEYS.has(k)) return;
      e.preventDefault();
      pressed.add(k);
    };
    const up = (e: KeyboardEvent) => pressed.delete(e.key.toLowerCase());
    const clear = () => pressed.clear();
    node.addEventListener("keydown", down);
    node.addEventListener("keyup", up);
    node.addEventListener("blur", clear);
    window.addEventListener("blur", clear);
    return () => {
      node.removeEventListener("keydown", down);
      node.removeEventListener("keyup", up);
      node.removeEventListener("blur", clear);
      window.removeEventListener("blur", clear);
      pressed.clear();
    };
  }, [target, active]);

  const read = (): DriveInput => {
    const has = (set: Set<string>) => [...set].some((k) => keys.current.has(k));
    const kbForward = (has(FORWARD_KEYS) ? 1 : 0) - (has(BACK_KEYS) ? 1 : 0);
    const kbTurn = (has(LEFT_KEYS) ? 1 : 0) - (has(RIGHT_KEYS) ? 1 : 0);
    return {
      forward: kbForward || stick.current.forward,
      turn: kbTurn || stick.current.turn,
    };
  };

  const setStick = (input: DriveInput) => {
    stick.current = input;
  };

  return { read, setStick };
}
