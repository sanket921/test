'use client';
import {Canvas,useFrame} from '@react-three/fiber';
import {memo,useMemo,useRef,type MutableRefObject} from 'react';
import * as THREE from 'three';
import Lighting from '../cinematic/Lighting';
import type {MotionState} from '../cinematic/motion';
import type {GalleryMotion} from './data';
const silver={color:'#b9bec6',metalness:.9,roughness:.3};
const black={color:'#353840',metalness:.92,roughness:.24};
function Concept({index}:{index:number}){
  // These stationary compositions are design studies, not product models or mechanical simulations.
  if(index===0)return <group rotation={[.35,.4,-.3]}>{[1.5,1.18,.85].map((r,i)=><mesh key={r} rotation={[i*.6,i*.45,0]}><torusGeometry args={[r,.065,12,80]}/><meshStandardMaterial {...(i===1?black:silver)}/></mesh>)}<mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[1.7,.018,8,80,4.7]}/><meshStandardMaterial color="#dca544" emissive="#f7a504" emissiveIntensity={.4}/></mesh></group>;
  if(index===1)return <group>{Array.from({length:22},(_,i)=><mesh key={i} position={[0,(i-10.5)*.14,0]} rotation={[0,i*.17,.1]}><boxGeometry args={[2.3,.055,.5]}/><meshStandardMaterial {...(i%4===0?black:silver)}/></mesh>)}</group>;
  if(index===2)return <group>{Array.from({length:18},(_,i)=>{const a=i*.35,y=(i-8.5)*.19;return <group key={i} position={[0,y,0]} rotation={[0,a,0]}><mesh><boxGeometry args={[1.8,.035,.035]}/><meshStandardMaterial {...black}/></mesh>{[-1,1].map(d=><mesh key={d} position={[d*.9,0,0]}><octahedronGeometry args={[.105,1]}/><meshStandardMaterial {...silver}/></mesh>)}</group>})}</group>;
  if(index===3)return <group rotation={[.15,-.35,.1]}>{[-1,0,1].map((x,i)=><mesh key={i} position={[x*.95,Math.sin(i*2)*.5,0]} rotation={[0,i*.3,0]}><boxGeometry args={[.8,2.5,.65]}/><meshStandardMaterial {...(i===1?black:silver)}/></mesh>)}</group>;
  if(index===4)return <group>{Array.from({length:7},(_,i)=><group key={i} position={[(i-3)*.42,Math.sin(i*.8)*.5,0]}><mesh><boxGeometry args={[.22,1.6,.8]}/><meshStandardMaterial {...(i%2?black:silver)}/></mesh><mesh position={[0,.9,0]}><boxGeometry args={[.02,1.2,.02]}/><meshStandardMaterial color="#696b70" metalness={.8} roughness={.4}/></mesh></group>)}</group>;
  return <group rotation={[0,-.25,0]}>{Array.from({length:7},(_,i)=><group key={i} position={[0,0,(i-3)*.32]} scale={1-i*.07}>{[-1,1].map(d=><group key={d}><mesh position={[d*1.35,0,0]}><boxGeometry args={[.07,2.7,.08]}/><meshStandardMaterial {...silver}/></mesh><mesh position={[0,d*1.35,0]}><boxGeometry args={[2.7,.07,.08]}/><meshStandardMaterial {...silver}/></mesh></group>)}</group>)}</group>;
}
function World({motion,mobile,reduced,selected}:{motion:MutableRefObject<GalleryMotion>;mobile:boolean;reduced:boolean;selected?:number}){
 const {curve,targets}=useMemo(()=>{
 const poses=[[.2,2.4,9.5],[14,2.9,8],[22.5,2.4,9],[38,2.6,8.6],[46,3.2,8.5],[62,2.5,9.5]];
 return {curve:new THREE.CatmullRomCurve3(poses.map(p=>new THREE.Vector3(...p as [number,number,number])),false,'centripetal'),targets:new THREE.CatmullRomCurve3(Array.from({length:6},(_,i)=>new THREE.Vector3(i*12,1.6,0)),false,'centripetal')};},[]);
 const rig=useRef<THREE.Group>(null);
 const point=useMemo(()=>new THREE.Vector3(),[]),target=useMemo(()=>new THREE.Vector3(),[]);
 const lightMotion=useRef<MotionState>({progress:.55,paused:true,dragX:0,dragY:0,velocityX:0,velocityY:0,dragging:false,pointerX:0,pointerY:0,lastInteraction:0,reset:0});
 useFrame(({camera},delta)=>{
  const p=reduced?(selected??0)/5:THREE.MathUtils.clamp(motion.current.progress,0,1);
  curve.getPoint(p,point);targets.getPoint(p,target);
  if(mobile){point.x=target.x+.5;point.y=2.5;point.z=12.5;}
  const enter=1-THREE.MathUtils.smoothstep(p,0,.065),exit=THREE.MathUtils.smoothstep(p,.955,1);
  point.z+=enter*2+exit*2;
  point.x+=motion.current.pointerX*(mobile?0:.2);point.y+=motion.current.pointerY*(mobile?0:.1);
  if(reduced)camera.position.copy(point);else camera.position.lerp(point,1-Math.exp(-Math.min(delta,.05)*10));
  camera.up.set(Math.sin(p*Math.PI*3)*.016,1,0);camera.lookAt(target);
  if(rig.current)rig.current.position.x=target.x;
  lightMotion.current.pointerX=motion.current.pointerX;
 });
 return <><color attach="background" args={['#0b0b0e']}/><fog attach="fog" args={['#0b0b0e',18,44]}/><group ref={rig}><Lighting motion={lightMotion} reduced mobile={mobile}/></group>
 <mesh rotation={[-Math.PI/2,0,0]} position={[30,-.06,0]} receiveShadow><planeGeometry args={[100,40]}/><meshStandardMaterial color="#18181c" roughness={.34} metalness={.6}/></mesh>
 {Array.from({length:6},(_,i)=><group position={[i*12,0,0]} key={i}><group position={[0,2,0]}><Concept index={i}/></group><mesh position={[0,.13,0]} receiveShadow><cylinderGeometry args={[2.1,2.18,.26,64]}/><meshStandardMaterial color="#25262b" roughness={.3} metalness={.75}/></mesh><mesh position={[0,.27,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[2.04,.009,6,80]}/><meshStandardMaterial color="#e2a136" emissive="#f7a504" emissiveIntensity={.5}/></mesh><mesh position={[-4.4,2.5,-2.4]}><boxGeometry args={[.06,5,.1]}/><meshStandardMaterial color="#777c85" metalness={.85} roughness={.4}/></mesh><mesh position={[4.4,2.5,-2.4]}><boxGeometry args={[.06,5,.1]}/><meshStandardMaterial color="#777c85" metalness={.85} roughness={.4}/></mesh><mesh position={[0,4.1,-2.5]}><boxGeometry args={[2,.018,.03]}/><meshStandardMaterial color="#f7a504" emissive="#f7a504" emissiveIntensity={1}/></mesh></group>)}
 </>;
}
export default memo(function ExhibitionScene({motion,mobile,visible,reduced,selected}:{motion:MutableRefObject<GalleryMotion>;mobile:boolean;visible:boolean;reduced:boolean;selected?:number}){
 return <Canvas dpr={[1,mobile?1.15:1.4]} camera={{position:[0,2.4,11.5],fov:45,near:.1,far:70}} gl={{antialias:true,powerPreference:'high-performance'}} frameloop={visible&&!reduced?'always':'demand'}><World motion={motion} mobile={mobile} reduced={reduced} selected={selected}/></Canvas>;
});
