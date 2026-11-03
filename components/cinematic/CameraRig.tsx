'use client';
import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ease, range, type MotionRef } from './motion';
export default function CameraRig({ motion, reduced, mobile }: { motion: MotionRef; reduced: boolean; mobile: boolean }) {
  const { camera } = useThree();
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, .15, 12),
    new THREE.Vector3(.4, .2, 9.5),
    new THREE.Vector3(3.6, 1.4, 8.6),
    new THREE.Vector3(6.3, 2, 6.8),
    new THREE.Vector3(3.5, 1.1, 4.4),
    new THREE.Vector3(.1, .03, 2.1),
    new THREE.Vector3(0, 0, .5),
    new THREE.Vector3(0, 0, -3.5),
  ], false, 'centripetal'), []);
  const point = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const p = reduced ? .5 : motion.current.progress;
    if (p < .18 && !reduced) return;
    // Continuous spline travel: reveal → 45° orbit → front aperture → beyond.
    const travel = ease(range(p, .24, .94));
    curve.getPoint(travel, point);
    if (mobile) {
      const t = ease(range(p, .25, .87));
      point.set(Math.sin(t * Math.PI) * .8, .3, 19 - t * 3.8);
    }
    const lensTravel = mobile ? 0 : ease(range(p, .69, .87));
    target.set(0, mobile ? .55 : 0, -5 * lensTravel);
    camera.position.copy(point);
    camera.up.set(Math.sin(Math.PI * travel) * (mobile ? .015 : .045), 1, 0);
    camera.lookAt(target);
  });
  return null;
}
