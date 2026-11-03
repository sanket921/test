'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ease, range, type MotionRef } from './motion';

// Annular, bevelled segments retain a genuine open passage through the assembly.
function sector(inner: number, outer: number, arc: number, depth: number) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, -arc / 2, arc / 2, false);
  shape.lineTo(inner * Math.cos(arc / 2), inner * Math.sin(arc / 2));
  shape.absarc(0, 0, inner, arc / 2, -arc / 2, true);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .018, bevelThickness: .018, curveSegments: 14 });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}
function MechanicalRing({ radius, count = 12, dark = false }: { radius: number; count?: number; dark?: boolean }) {
  const geometry = useMemo(() => sector(radius - .16, radius, Math.PI * 2 / count - .035, .13), [radius, count]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <group>{Array.from({ length: count }, (_, i) => {
    const a = i * Math.PI * 2 / count;
    return <group key={i} rotation={[0, 0, a]}>
      <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={dark ? '#42454a' : '#a5a9ae'} metalness={.96} roughness={dark ? .24 : .36}/></mesh>
      <mesh position={[radius - .08, 0, .09]}><cylinderGeometry args={[.027, .027, .025, 8]}/><meshStandardMaterial color="#202126" metalness={.85} roughness={.32}/></mesh>
      {i % 3 === 0 && <mesh position={[radius - .075, .13, .084]} rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[.13, .018, .014]}/><meshStandardMaterial color="#f7a504" emissive="#f7a504" emissiveIntensity={2.2} toneMapped={false}/></mesh>}
    </group>;
  })}</group>;
}
export default function KineticCore({ motion, reduced }: { motion: MotionRef; reduced: boolean }) {
  const root = useRef<THREE.Group>(null);
  const inspect = useRef<THREE.Group>(null);
  const outer = useRef<THREE.Group>(null);
  const middle = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
  const state = useRef({ x: 0, y: 0, idle: 0, lastProgress: 0, reset: 0 });
  const panel = useMemo(() => sector(.73, 1.38, Math.PI / 6 - .055, .38), []);
  useEffect(() => () => panel.dispose(), [panel]);
  useFrame((_, delta) => {
    const m = motion.current;
    const p = reduced ? .52 : m.progress;
    if (!root.current || !inspect.current || !outer.current || !middle.current || !inner.current || !core.current) return;
    root.current.visible = reduced || (p > .19 && p < .965);
    if (!root.current.visible) return;
    const dt = Math.min(delta, .04);
    const rotation = ease(range(p, .39, .72));
    const passage = ease(range(p, .71, .9));
    const scrolling = Math.abs(p - state.current.lastProgress) > .00012;
    state.current.lastProgress = p;
    if (m.reset !== state.current.reset || scrolling) {
      m.dragX *= Math.exp(-dt * 5); m.dragY *= Math.exp(-dt * 5);
      m.velocityX = 0; m.velocityY = 0;
      state.current.reset = m.reset;
    } else if (!m.dragging) {
      m.dragX += m.velocityX * dt; m.dragY += m.velocityY * dt;
      m.velocityX *= Math.exp(-dt * 6); m.velocityY *= Math.exp(-dt * 6);
    }
    m.dragY = THREE.MathUtils.clamp(m.dragY, -.65, .65);
    state.current.x = THREE.MathUtils.damp(state.current.x, m.dragY, 10, dt);
    state.current.y = THREE.MathUtils.damp(state.current.y, m.dragX, 10, dt);
    if (!m.paused && !reduced) state.current.idle += dt;
    const idle = Math.sin(state.current.idle * .35) * .018;
    inspect.current.rotation.set(state.current.x, state.current.y, 0);
    root.current.position.y = -.4 * (1 - ease(range(p, .2, .4)));
    // Rings open into a camera-aligned passage, rather than intersecting the lens.
    outer.current.rotation.set(.22 * (1 - passage), (.3 + rotation * 1.5) * (1 - passage), -.38 + rotation * .7);
    middle.current.rotation.set((-.6 + rotation * 1.7) * (1 - passage), -.16 * (1 - passage), .5 - rotation * 1.2);
    inner.current.rotation.set((.4 - rotation * 1.0) * (1 - passage), (.45 + rotation * .4) * (1 - passage), rotation * .8);
    core.current.rotation.set(.1 * (1 - passage), -.15 * (1 - passage), -.2 + rotation * .55 + idle);
    core.current.position.z = Math.sin(rotation * Math.PI) * .2;
  });
  return <group ref={root}><group ref={inspect}>
    <group ref={outer}><MechanicalRing radius={2.8} count={18}/><MechanicalRing radius={2.58} count={18} dark/>
      {[0, Math.PI].map(a => <group rotation={[0, 0, a]} key={a}><mesh position={[2.48, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[.11, .11, .43, 20]}/><meshStandardMaterial color="#646970" roughness={.32} metalness={1}/></mesh></group>)}
    </group>
    <group ref={middle}><MechanicalRing radius={2.28} count={14} dark/><MechanicalRing radius={2.12} count={14}/></group>
    <group ref={inner}><MechanicalRing radius={1.82} count={12}/></group>
    <group ref={core}>{Array.from({ length: 12 }, (_, i) => <group key={i} rotation={[0, 0, i * Math.PI / 6]}>
      <mesh geometry={panel} position={[0, 0, i % 2 ? .05 : -.05]} castShadow receiveShadow><meshPhysicalMaterial color={i % 2 ? '#999da3' : '#40454c'} metalness={.95} roughness={.33} clearcoat={.15}/></mesh>
      <mesh position={[1.06, 0, .27]}><boxGeometry args={[.32, .035, .04]}/><meshStandardMaterial color="#121317" metalness={.8} roughness={.28}/></mesh>
      <mesh position={[.8, .04, .25]}><boxGeometry args={[.08, .025, .025]}/><meshStandardMaterial color="#f7a504" emissive="#f7a504" emissiveIntensity={1.8} toneMapped={false}/></mesh>
      <mesh position={[1.53, 0, 0]} castShadow><boxGeometry args={[.42, .045, .045]}/><meshStandardMaterial color="#555b61" metalness={.9} roughness={.28}/></mesh>
    </group>)}<group position={[0, 0, -.25]}><MechanicalRing radius={1.12} count={12} dark/></group></group>
  </group></group>;
}
