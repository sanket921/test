'use client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {memo,useMemo,useRef,type MutableRefObject} from 'react';
import * as THREE from 'three';
import Lighting from '../cinematic/Lighting';
import type {MotionState} from '../cinematic/motion';
import type {GalleryMotion} from './data';
import ProductModel from './ProductModel';
import KineticCore from '../cinematic/KineticCore';
import {cacheStats,preloadModel,clearUnusedModels} from './modelCache';
import {catalogue} from './catalogue';
import {useEffect} from 'react';
import type {Product} from './catalogue';
function World({motion,mobile,reduced,selected,active,product,onStatus}:{active:number;product:Product;onStatus:(status:string)=>void;motion:MutableRefObject<GalleryMotion>;mobile:boolean;reduced:boolean;selected?:number}){
 const invalidate=useThree(s=>s.invalidate);
 useEffect(()=>{motion.current.invalidate=invalidate;const wake=()=>invalidate();addEventListener('scroll',wake,{passive:true});addEventListener('pointermove',wake,{passive:true});return()=>{if(motion.current.invalidate===invalidate)delete motion.current.invalidate;removeEventListener('scroll',wake);removeEventListener('pointermove',wake)}},[invalidate,motion]);
 const {curve,targets}=useMemo(()=>{
 const poses=[[.2,2.4,9.5],[14,2.9,8],[22.5,2.4,9],[38,2.6,8.6],[46,3.2,8.5],[62,2.5,9.5]];
 return {curve:new THREE.CatmullRomCurve3(poses.map(p=>new THREE.Vector3(...p as [number,number,number])),false,'centripetal'),targets:new THREE.CatmullRomCurve3(Array.from({length:6},(_,i)=>new THREE.Vector3(i*12,1.6,0)),false,'centripetal')};},[]);
 useEffect(()=>{const next=catalogue[active+1]?.find(p=>p.file);if(!next)return;const timer=setTimeout(()=>preloadModel(`/models/optimized/${mobile?next.mobileFile:next.file}`),1600);return()=>clearTimeout(timer)},[active,mobile]);
 useEffect(()=>()=>{setTimeout(clearUnusedModels,0)},[]);
 const telemetry=useRef(0);
 const rig=useRef<THREE.Group>(null);
 const point=useMemo(()=>new THREE.Vector3(),[]),target=useMemo(()=>new THREE.Vector3(),[]);
 const lightMotion=useRef<MotionState>({progress:.55,paused:true,dragX:0,dragY:0,velocityX:0,velocityY:0,dragging:false,pointerX:0,pointerY:0,lastInteraction:0,reset:0});
 useFrame(({camera,gl,scene},delta)=>{
  telemetry.current+=1;{const el=gl.domElement;el.dataset.renderFrames=String(telemetry.current);el.dataset.drawCalls=String(gl.info.render.calls);el.dataset.triangles=String(gl.info.render.triangles);el.dataset.geometries=String(gl.info.memory.geometries);el.dataset.textures=String(gl.info.memory.textures);el.dataset.modelCache=JSON.stringify(cacheStats());el.dataset.sceneObjects=String(scene.children.length)}
  const p=reduced?(selected??0)/5:THREE.MathUtils.clamp(motion.current.progress,0,1);
  curve.getPoint(p,point);targets.getPoint(p,target);
  if(mobile){point.x=target.x+.5;point.y=2.5;point.z=12.5;}
  const enter=1-THREE.MathUtils.smoothstep(p,0,.065),exit=THREE.MathUtils.smoothstep(p,.955,1);
  point.z+=enter*2+exit*2;
  point.x+=motion.current.pointerX*(mobile?0:.2);point.y+=motion.current.pointerY*(mobile?0:.1);
  if(reduced)camera.position.copy(point);else camera.position.lerp(point,1-Math.exp(-Math.min(delta,.05)*10));
  camera.up.set(Math.sin(p*Math.PI*3)*.016,1,0);camera.lookAt(target);
  if(!reduced&&camera.position.distanceToSquared(point)>.000001)invalidate();
  if(rig.current)rig.current.position.x=target.x;
  lightMotion.current.pointerX=motion.current.pointerX;
  lightMotion.current.progress=reduced?.52:.39+THREE.MathUtils.clamp(motion.current.progress*5,0,1)*.32;lightMotion.current.paused=false;
 });
 return <><color attach="background" args={['#0b0b0e']}/><fog attach="fog" args={['#0b0b0e',18,44]}/><group ref={rig}><Lighting motion={lightMotion} reduced mobile={mobile}/><ambientLight intensity={.6}/><directionalLight position={[-4,6,5]} intensity={3} color="#edf2ff"/><directionalLight position={[4,3,-3]} intensity={4} color="#f4c27a"/></group>
 <mesh rotation={[-Math.PI/2,0,0]} position={[30,-.06,0]} receiveShadow><planeGeometry args={[100,40]}/><meshStandardMaterial color="#18181c" roughness={.34} metalness={.6}/></mesh>
 {Array.from({length:6},(_,i)=><group position={[i*12,0,0]} key={i}>{i===active&&product.file&&(product.id==='orbit'?<group position={[0,2.46,0]} scale={.65}><KineticCore motion={lightMotion} reduced={reduced} assetUrl="/models/optimized/orbit.glb"/></group>:<ProductModel key={product.id+(mobile?"-mobile":"-web")} product={product} mobile={mobile} motion={motion} active={active} reduced={reduced} onStatus={onStatus}/>)}<mesh position={[0,.13,0]} receiveShadow><cylinderGeometry args={[2.1,2.18,.26,64]}/><meshStandardMaterial color="#25262b" roughness={.3} metalness={.75}/></mesh><mesh position={[0,.27,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[2.04,.009,6,80]}/><meshStandardMaterial color="#e2a136" emissive="#f7a504" emissiveIntensity={.5}/></mesh><mesh position={[-4.4,2.5,-2.4]}><boxGeometry args={[.06,5,.1]}/><meshStandardMaterial color="#777c85" metalness={.85} roughness={.4}/></mesh><mesh position={[4.4,2.5,-2.4]}><boxGeometry args={[.06,5,.1]}/><meshStandardMaterial color="#777c85" metalness={.85} roughness={.4}/></mesh><mesh position={[0,4.1,-2.5]}><boxGeometry args={[2,.018,.03]}/><meshStandardMaterial color="#f7a504" emissive="#f7a504" emissiveIntensity={1}/></mesh></group>)}
 </>;
}
export default memo(function ExhibitionScene({motion,mobile,visible,reduced,selected,active,product,onStatus}:{active:number;product:Product;onStatus:(status:string)=>void;motion:MutableRefObject<GalleryMotion>;mobile:boolean;visible:boolean;reduced:boolean;selected?:number}){
 return <Canvas dpr={[1,mobile?1.15:1.4]} camera={{position:[0,2.4,11.5],fov:45,near:.1,far:70}} gl={{antialias:true,powerPreference:'high-performance'}} frameloop={visible&&!reduced&&product.id==='orbit'?'always':'demand'}><World motion={motion} mobile={mobile} reduced={reduced} selected={selected} active={active} product={product} onStatus={onStatus}/></Canvas>;
});
