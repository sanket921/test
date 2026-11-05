'use client';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ease, range, type MotionRef } from './motion';
import { createOrbitLED } from './OrbitLED';

function Orbit({ motion, reduced, assetUrl = "/assets/models/the-orbit.glb" }: { motion: MotionRef; reduced: boolean; assetUrl?:string }) {
  const asset = useLoader(GLTFLoader, assetUrl,loader=>loader.setMeshoptDecoder(MeshoptDecoder));
  // Keep the supplied geometry, materials, unit conversion and mechanical hierarchy intact.
  const model = useMemo(() => {
    const scene = asset.scene.clone(true);
    let displayIndex = 0;
    scene.traverse(object => {
      if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial && object.material.name.startsWith('LED')) {
        object.material = createOrbitLED(object.geometry, displayIndex++ * 1.7, object.material.name.startsWith('LED-1'));
      } else if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial) {
        object.material = object.material.clone();
        const base = object.material.name.startsWith('Grey');
        object.material.color.set(base ? '#242832' : '#2e333c');
        object.material.metalness = base ? .7 : .88;
        object.material.roughness = base ? .34 : .29;
        object.material.envMapIntensity = 1.0;
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    // Low-power emitter proxies follow the authentic bearings, so nearby metal
    // receives localized LED spill as the assembly and inspection group rotate.
    const middleBearing = scene.getObjectByName('Gyro_ring_Middle001');
    const innerBearing = scene.getObjectByName('Gyro_ring_Inner003');
    const cyanSpill = new THREE.PointLight('#27b6ff', 1.6, 2.5, 2);
    cyanSpill.position.set(0, 950, 130);
    middleBearing?.add(cyanSpill);
    const violetSpill = new THREE.PointLight('#b334ed', .9, 1.8, 2);
    violetSpill.position.set(460, 0, 100);
    innerBearing?.add(violetSpill);
    return scene;
  }, [asset.scene]);
  const displays = useMemo(() => {
    const materials: THREE.ShaderMaterial[] = [];
    model.traverse(object => {
      if (object instanceof THREE.Mesh && object.material instanceof THREE.ShaderMaterial && object.material.name.startsWith('Orbit LED')) materials.push(object.material);
    });
    return materials;
  }, [model]);
  useEffect(() => () => displays.forEach(material => material.dispose()), [displays]);
  const middle = useMemo(() => model.getObjectByName('Gyro_ring_Middle001'), [model]);
  const inner = useMemo(() => model.getObjectByName('Gyro_ring_Inner003'), [model]);
  const root = useRef<THREE.Group>(null);
  const inspect = useRef<THREE.Group>(null);
  const state = useRef({ x: 0, y: 0, idle: 0, lastProgress: 0, reset: 0 });
  useFrame((_, delta) => {
    const m = motion.current;
    const p = reduced ? .52 : m.progress;
    if (!root.current || !inspect.current) return;
    root.current.visible = reduced || (p > .19 && p < .965);
    if (!root.current.visible) return;
    const dt = Math.min(delta, .04);
    // Reuse R3F's existing loop. Content time is independent of bearing motion.
    if (!m.paused && !reduced) state.current.idle += dt;
    for (const material of displays) {
      material.uniforms.uTime.value = reduced ? 0 : state.current.idle;
      material.uniforms.uProgress.value = p;
    }
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
    inspect.current.rotation.set(state.current.x, state.current.y, 0);
    root.current.position.y = -.4 * (1 - ease(range(p, .2, .4)));
    // Only the two bearing-supported axes move. The pedestal and outer ring stay fixed.
    // Deterministic scroll poses retrace exactly; no invented idle spin or translations.
    const turn = ease(range(p, .39, .72));
    const aperture = 1 - ease(range(p, .71, .9));
    if (middle) middle.rotation.x = (reduced ? .45 : turn * Math.PI * 2) * aperture;
    if (inner) inner.rotation.y = (reduced ? -.5 : -turn * Math.PI * 2) * aperture;
  });
  // Fit the real ring centre to the existing camera target; retain its fixed base below.
  return <group ref={root}><group ref={inspect}>
    <group scale={1.35} position={[0, -2.4603857 * 1.35, 0]}>
      <primitive object={model} dispose={null}/>
    </group>
  </group></group>;
}
export default function KineticCore(props: { motion: MotionRef; reduced: boolean; assetUrl?:string }) {
  return <Suspense fallback={null}><Orbit {...props}/></Suspense>;
}
