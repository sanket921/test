'use client';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ease, range, type MotionRef } from './motion';
export default function Lighting({ motion, reduced, mobile }: { motion: MotionRef; reduced: boolean; mobile: boolean }) {
  const { gl, scene } = useThree();
  const key = useRef<THREE.SpotLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  const fill = useRef<THREE.PointLight>(null);
  useEffect(() => {
    const studio = new THREE.Scene();
    studio.background = new THREE.Color('#121318');
    const sources = [
      { p: [-5, 4, 3], scale: [3, 8, 1], color: '#ffffff', intensity: 4 },
      { p: [4, 2, -2], scale: [2, 6, 1], color: '#bfcbe1', intensity: 3 },
      { p: [0, 7, 0], scale: [6, 2, 1], color: '#fff2d8', intensity: 3 },
    ];
    const panels: THREE.Mesh[] = [];
    sources.forEach(s => {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(...s.scale.slice(0, 2) as [number, number]), new THREE.MeshBasicMaterial({ color: new THREE.Color(s.color).multiplyScalar(s.intensity), side: THREE.DoubleSide }));
      panel.position.set(...s.p as [number, number, number]); panel.lookAt(0, 0, 0); studio.add(panel); panels.push(panel);
    });
    const generator = new THREE.PMREMGenerator(gl);
    const environment = generator.fromScene(studio, .035);
    const previous = scene.environment;
    scene.environment = environment.texture;
    scene.environmentIntensity = .8;
    return () => { scene.environment = previous; environment.dispose(); generator.dispose(); panels.forEach(p => { p.geometry.dispose(); (p.material as THREE.Material).dispose(); }); };
  }, [gl, scene]);
  useFrame(() => {
    const p = reduced ? .52 : motion.current.progress;
    const reveal = ease(range(p, .2, .41));
    if (key.current) key.current.intensity = reveal * 65;
    if (fill.current) { fill.current.intensity = reveal * 18; fill.current.position.x = -4 + motion.current.pointerX * .5; }
    if (rim.current) { rim.current.intensity = reveal * (12 + Math.sin(p * Math.PI) * 8); rim.current.position.x = 3 + Math.sin(p * Math.PI) * 2; }
  });
  return <>
    <ambientLight intensity={.08}/>
    <spotLight ref={key} position={[-3, 6, 5]} angle={.58} penumbra={1} color="#f5f3ef" intensity={0} castShadow={!mobile} shadow-mapSize={[1024, 1024]} shadow-bias={-.001} shadow-radius={5}/>
    <pointLight ref={fill} position={[-4, 0, 3]} color="#c0d0e8" intensity={0}/>
    <pointLight ref={rim} position={[4, 2, -3]} color="#ffb03c" intensity={0}/>
  </>;
}
