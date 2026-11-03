'use client';
import { useEffect, type RefObject } from 'react';
import { clamp, type MotionRef } from './motion';
export function usePointerController(element: RefObject<HTMLDivElement | null>, motion: MotionRef, enabled: boolean) {
  useEffect(() => {
    const el = element.current;
    if (!el || !enabled) return;
    let startX = 0, startY = 0, previousX = 0, previousY = 0, lastTime = 0;
    let pointerId: number | null = null, touch = false;
    const canInspect = () => motion.current.progress > .37 && motion.current.progress < .73;
    const down = (e: PointerEvent) => {
      if (!canInspect() || e.button !== 0) return;
      startX = previousX = e.clientX; startY = previousY = e.clientY;
      pointerId = e.pointerId; touch = e.pointerType === 'touch'; lastTime = performance.now();
      motion.current.velocityX = motion.current.velocityY = 0;
      if (!touch) { motion.current.dragging = true; el.setPointerCapture(e.pointerId); }
    };
    const move = (e: PointerEvent) => {
      const box = el.getBoundingClientRect();
      motion.current.pointerX = (e.clientX - box.left) / box.width * 2 - 1;
      motion.current.pointerY = (e.clientY - box.top) / box.height * 2 - 1;
      if (pointerId !== e.pointerId || !canInspect()) return;
      if (touch && !motion.current.dragging) {
        if (Math.abs(e.clientY - startY) > Math.abs(e.clientX - startX) && Math.abs(e.clientY - startY) > 7) { pointerId = null; return; }
        if (Math.abs(e.clientX - startX) < 9) return;
        motion.current.dragging = true; el.setPointerCapture(e.pointerId);
      }
      if (!motion.current.dragging) return;
      const now = performance.now(), dt = Math.max(.008, (now - lastTime) / 1000);
      const dx = (e.clientX - previousX) * .005, dy = (e.clientY - previousY) * .003;
      motion.current.dragX += dx; motion.current.dragY = clamp(motion.current.dragY + dy, -.65, .65);
      motion.current.velocityX = clamp(dx / dt, -2, 2); motion.current.velocityY = clamp(dy / dt, -1, 1);
      motion.current.lastInteraction = now;
      previousX = e.clientX; previousY = e.clientY; lastTime = now;
    };
    const up = () => { motion.current.dragging = false; pointerId = null; };
    const keyboard = (e: KeyboardEvent) => {
      if (!canInspect() || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(e.key)) return;
      e.preventDefault();
      if (e.key === 'Home') motion.current.reset++;
      else if (e.key === 'ArrowLeft') motion.current.dragX -= .14;
      else if (e.key === 'ArrowRight') motion.current.dragX += .14;
      else motion.current.dragY += e.key === 'ArrowUp' ? -.12 : .12;
    };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up); el.addEventListener('keydown', keyboard);
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); el.removeEventListener('lostpointercapture', up); el.removeEventListener('keydown', keyboard); motion.current.dragging = false; };
  }, [element, motion, enabled]);
}
