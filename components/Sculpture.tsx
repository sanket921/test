'use client';
import { useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import KineticCore from './cinematic/KineticCore';
import CameraRig from './cinematic/CameraRig';
import Lighting from './cinematic/Lighting';
import PostEffects from './cinematic/PostEffects';
import type { MotionRef } from './cinematic/motion';
export default function Sculpture({ motion, reduced, mobile, visible }: { motion: MotionRef; reduced: boolean; mobile: boolean; visible: boolean }) {
  const floorFade = useMemo(() => {
    const size = 128, data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const distance = Math.hypot(x / (size - 1) - .5, y / (size - 1) - .5);
      const fade = 1 - THREE.MathUtils.smoothstep(distance, .045, .16);
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = Math.round(fade * 255); data[i + 3] = 255;
    }
    const texture = new THREE.DataTexture(data, size, size);
    texture.magFilter = texture.minFilter = THREE.LinearFilter; texture.needsUpdate = true;
    return texture;
  }, []);
  useEffect(() => () => floorFade.dispose(), [floorFade]);
  return <Canvas dpr={mobile ? [1, 1.25] : [1, 1.5]} shadows={mobile ? false : 'soft'} camera={{position:[0, .15, 12], fov:42, near:.04, far:60}} gl={{alpha:true, antialias:true, powerPreference:'high-performance'}} frameloop={visible && !reduced ? 'always' : 'demand'} onCreated={({gl}) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}>
    <Lighting motion={motion} reduced={reduced} mobile={mobile}/>
    <CameraRig motion={motion} reduced={reduced} mobile={mobile}/>
    <KineticCore motion={motion} reduced={reduced}/>
    <mesh position={[0, -3.3, 0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[50,50]}/><meshStandardMaterial color="#090b10" metalness={.25} roughness={.48} transparent opacity={.32} alphaMap={floorFade} depthWrite={false}/></mesh>
    {!mobile && !reduced && <PostEffects/>}
  </Canvas>;
}
