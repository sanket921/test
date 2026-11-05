'use client';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { ease, range, type MotionRef } from './motion';
export default function Lighting({ motion, reduced, mobile }: { motion: MotionRef; reduced: boolean; mobile: boolean }) {
  const { gl, scene } = useThree();
  const softbox = useRef<THREE.RectAreaLight>(null);
  const amber = useRef<THREE.PointLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  const fill = useRef<THREE.PointLight>(null);
  useEffect(() => {
    RectAreaLightUniformsLib.init();
    softbox.current?.lookAt(0, 0, 0);
    const studio = new THREE.Scene();
    studio.background = new THREE.Color('#171c27');
    const sources = [
      { p: [-5, 4, 3], scale: [3, 9, 1], color: '#e9efff', intensity: 7 },
      { p: [4, 2, -2], scale: [2, 8, 1], color: '#5fa9cf', intensity: 5 },
      { p: [-4, 1, -4], scale: [1.3, 6, 1], color: '#ffc477', intensity: 4 },
      { p: [1, 1, 6], scale: [2, 6, 1], color: '#e2e8fa', intensity: 1.4 },
      { p: [0, -2, -5], scale: [6, 2, 1], color: '#a4a9d5', intensity: 2 },
    ];
    const panels: THREE.Mesh[] = [];
    sources.forEach(s => {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(...s.scale.slice(0, 2) as [number, number]), new THREE.MeshBasicMaterial({ color: new THREE.Color(s.color).multiplyScalar(s.intensity), side: THREE.DoubleSide }));
      panel.position.set(...s.p as [number, number, number]); panel.lookAt(0, 0, 0); studio.add(panel); panels.push(panel);
    });
    const generator = new THREE.PMREMGenerator(gl);
    const environment = generator.fromScene(studio, .03);
    const previous = scene.environment;
    scene.environment = environment.texture;
    scene.environmentIntensity = .8;
    return () => { scene.environment = previous; environment.dispose(); generator.dispose(); panels.forEach(p => { p.geometry.dispose(); (p.material as THREE.Material).dispose(); }); };
  }, [gl, scene]);
  useFrame(() => {
    const p = reduced ? .52 : motion.current.progress;
    const reveal = ease(range(p, .2, .41));
    // Slow, reversible emphasis uses the approved progress, not an independent timeline.
    const close = ease(range(p, .53, .75));
    if (softbox.current) softbox.current.intensity = reveal * (2.7 - close * .4);
    if (key.current) key.current.intensity = reveal * .75;
    if (amber.current) amber.current.intensity = reveal * (5 + 2 * Math.sin(p * Math.PI));
    if (fill.current) { fill.current.intensity = reveal * (20 + close * 5); }
    if (rim.current) { rim.current.intensity = reveal * (16 + close * 5); }
  });
  return <>
    <hemisphereLight args={['#b8c8e0', '#17131c', .35]}/>
    <rectAreaLight ref={softbox} position={[-4, 4, 6]} color="#e4ebfa" width={6} height={8} intensity={0}/>
    <directionalLight ref={key} position={[-3, 5, 6]} color="#e4ebfa" intensity={0} castShadow={!mobile} shadow-mapSize={[1024,1024]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-normalBias={.03} shadow-bias={-.0002} shadow-radius={4}/>
    <pointLight ref={fill} position={[1, .2, 4]} color="#dce4f0" intensity={0} decay={2}/>
    <pointLight ref={rim} position={[4, 2, -3]} color="#52bce5" intensity={0} decay={2}/>
    <pointLight ref={amber} position={[-3,1,-2]} color="#f7a504" intensity={0} decay={2}/>
  </>;
}
