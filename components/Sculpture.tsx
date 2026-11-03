'use client';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import KineticCore from './cinematic/KineticCore';
import CameraRig from './cinematic/CameraRig';
import Lighting from './cinematic/Lighting';
import PostEffects from './cinematic/PostEffects';
import type { MotionRef } from './cinematic/motion';
export default function Sculpture({ motion, reduced, mobile, visible }: { motion: MotionRef; reduced: boolean; mobile: boolean; visible: boolean }) {
  return <Canvas dpr={mobile ? [1, 1.25] : [1, 1.5]} shadows={mobile ? false : 'soft'} camera={{position:[0, .15, 12], fov:42, near:.04, far:60}} gl={{alpha:true, antialias:true, powerPreference:'high-performance'}} frameloop={visible && !reduced ? 'always' : 'demand'} onCreated={({gl}) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}>
    <Lighting motion={motion} reduced={reduced} mobile={mobile}/>
    <CameraRig motion={motion} reduced={reduced} mobile={mobile}/>
    <KineticCore motion={motion} reduced={reduced}/>
    <mesh position={[0, -3.25, 0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[50,50]}/><shadowMaterial opacity={.18}/></mesh>
    {!mobile && !reduced && <PostEffects/>}
  </Canvas>;
}
