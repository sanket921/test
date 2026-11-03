'use client';
import {Canvas,useFrame,useLoader} from '@react-three/fiber';
import {memo,Suspense,useMemo,useRef,type MutableRefObject} from 'react';
import * as THREE from 'three';
import {selectedProjects,type WorkMotion} from './data';
// Flat media planes preserve the truth of the source image. Their arrangement
// and camera create spatial storytelling; the artwork is never extruded.
const locations:[number,number,number][]=[[0,0,0],[10,1.7,-12],[-4,4,-26],[11,-.6,-39],[0,2,-55]];
const angles=[0,-.2,.12,-.24,.05];
function GalleryWorld({motion}:{motion:MutableRefObject<WorkMotion>}){
 const maps=useLoader(THREE.TextureLoader,selectedProjects.map(p=>`/assets/projects/${p.slug}-concept.svg`));
 const {path,look}=useMemo(()=>({
  path:new THREE.CatmullRomCurve3([new THREE.Vector3(0,.15,8),new THREE.Vector3(12,2.3,-3),new THREE.Vector3(-5,5,-16),new THREE.Vector3(13,.2,-30),new THREE.Vector3(1,3,-42)],false,'centripetal'),
  look:new THREE.CatmullRomCurve3(locations.map(p=>new THREE.Vector3(...p)),false,'centripetal'),
 }),[]);
 const position=useMemo(()=>new THREE.Vector3(),[]),target=useMemo(()=>new THREE.Vector3(),[]);
 const atmosphere=useRef<THREE.Group>(null);
 useFrame(({camera},delta)=>{
  const p=THREE.MathUtils.clamp(motion.current.progress,0,1);
  path.getPoint(p,position);look.getPoint(p,target);
  position.x+=motion.current.pointerX*.13;position.y+=motion.current.pointerY*.08;
  // Pull back into the final wide shot; camera remains in front of every plane.
  position.z+=THREE.MathUtils.smoothstep(p,.92,1)*1.5;
  camera.position.lerp(position,1-Math.exp(-Math.min(delta,.04)*12));
  camera.up.set(Math.sin(p*Math.PI*2)*.012,1,0);camera.lookAt(target);
  if(atmosphere.current)atmosphere.current.position.copy(target);
 });
 return <><color attach="background" args={['#101015']}/><fog attach="fog" args={['#101015',25,75]}/>
 {locations.map((position,i)=><group key={i} position={position} rotation={[0,angles[i],0]}>
  <mesh position={[0,0,-.08]}><boxGeometry args={[10.3,5.86,.1]}/><meshBasicMaterial color="#34343c"/></mesh>
  <mesh><planeGeometry args={[10.15,5.71]}/><meshBasicMaterial map={maps[i]} toneMapped={false}/></mesh>
  <mesh position={[-4.8,3.05,-.02]}><planeGeometry args={[.5,.025]}/><meshBasicMaterial color="#f7a504"/></mesh>
  <mesh position={[.4,-.3,-2.6]}><planeGeometry args={[10.15,5.71]}/><meshBasicMaterial map={maps[i]} transparent opacity={.1} toneMapped={false}/></mesh>
 </group>)}
 <group ref={atmosphere}><mesh position={[0,-3.4,-1]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[90,90]}/><meshBasicMaterial color="#14141a"/></mesh></group>
 </>;
}
export default memo(function WorkJourneyScene({motion,visible}:{motion:MutableRefObject<WorkMotion>;visible:boolean}){
 return <Canvas dpr={[1,1.35]} camera={{position:[0,.15,8],fov:44,near:.1,far:100}} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}} frameloop={visible?'always':'demand'}><Suspense fallback={null}><GalleryWorld motion={motion}/></Suspense></Canvas>;
});
