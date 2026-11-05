'use client';
import {useEffect,useRef,useState} from 'react';
import gsap from 'gsap';
import {createPortal} from 'react-dom';
import styles from './OrbitEntrance.module.css';
export default function OrbitEntrance(){
 const root=useRef<HTMLDivElement>(null);
 const [show,setShow]=useState(false);
 useEffect(()=>{
  let seen=false;try{seen=!!sessionStorage.getItem('c360-entered')}catch{}
  if(seen||location.hash||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  setShow(true);
 },[]);
 useEffect(()=>{
  if(!show||!root.current)return;
  const context=gsap.context(()=>{
   gsap.timeline({onComplete:()=>setShow(false)})
    .from('ellipse',{strokeDashoffset:1,autoRound:false,stagger:.1,duration:.7,ease:'power2.out'},0)
    .from('[data-brand]',{clipPath:'inset(0 0 100% 0)',opacity:0,y:10,duration:.45},.45)
    .to('[data-rings]',{scale:1.18,rotation:12,duration:.6,ease:'power2.inOut'},.9)
    .to(root.current,{opacity:0,duration:.45,pointerEvents:'none'},1.15);
  },root);
  const pointer=(event:PointerEvent)=>{
   if(event.pointerType!=='mouse'||!root.current)return;
   root.current.style.setProperty('--x',`${(event.clientX/innerWidth-.5)*12}px`);
   root.current.style.setProperty('--y',`${(event.clientY/innerHeight-.5)*8}px`);
  };
  window.addEventListener('pointermove',pointer,{passive:true});
  try{sessionStorage.setItem('c360-entered','1')}catch{}
  return()=>{window.removeEventListener('pointermove',pointer);context.revert();};
 },[show]);
 if(!show)return null;
 return createPortal(<div ref={root} className={styles.entrance} role="region" aria-label="Craftech360 opening animation" onPointerMove={e=>{if(e.pointerType!=='mouse')return;e.currentTarget.style.setProperty('--x',`${(e.clientX/innerWidth-.5)*12}px`);e.currentTarget.style.setProperty('--y',`${(e.clientY/innerHeight-.5)*8}px`)}}>
  <div className={styles.art}><svg data-rings viewBox="0 0 300 300" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth=".65">{[0,1,2].map(i=><ellipse key={i} cx="150" cy="150" rx={110-i*24} ry={110-i*24} transform={`rotate(${i*45} 150 150) matrix(1 0 .2 ${1-i*.18} -30 ${i*27})`} pathLength="1" strokeDasharray="1"/>)}<circle cx="150" cy="40" r="2" fill="#F7A504" stroke="none"/></g></svg><div data-brand className={styles.brand}><img src="/assets/brand/craftech360-logo.png" width="23" height="28" alt=""/><span>CRAFTECH360</span><small>DESIGN × ENGINEERING × EXPERIENCE</small></div></div>
  <button onClick={()=>setShow(false)}>ENTER THE EXPERIENCE ↗</button>
 </div>,document.body);
}
