import type { MutableRefObject } from 'react';
export type MotionState = {
  progress: number;
  paused: boolean;
  dragX: number;
  dragY: number;
  velocityX: number;
  velocityY: number;
  dragging: boolean;
  pointerX: number;
  pointerY: number;
  lastInteraction: number;
  reset: number;
};
export type MotionRef = MutableRefObject<MotionState>;
export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
export const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
export const ease = (p: number) => p * p * (3 - 2 * p);
