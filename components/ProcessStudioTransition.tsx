'use client';
import {useLayoutEffect,useRef,type ReactNode} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import styles from './ProcessStudioTransition.module.css';

/** A camera illusion across the existing 05/06 boundary; no pin or added canvas. */
export default function ProcessStudioTransition({children}:{children:ReactNode}){
 const root=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  gsap.registerPlugin(ScrollTrigger);
  const media=gsap.matchMedia();
  const context=gsap.context(()=>{
   media.add({desktop:'(min-width: 900px)',mobile:'(max-width: 899px)',motion:'(prefers-reduced-motion: no-preference)'},scope=>{
    if(!scope.conditions?.motion)return;
    const desktop=!!scope.conditions.desktop;
    const process=root.current?.querySelector<HTMLElement>('#process'),studio=root.current?.querySelector<HTMLElement>('#about');
    if(!process||!studio)return;
    const path=gsap.timeline({scrollTrigger:{trigger:process,start:'bottom 95%',endTrigger:studio,end:'top 12%',scrub:.65,invalidateOnRefresh:true},defaults:{ease:'sine.inOut'}});
    path.to(process,{xPercent:desktop?-2:-.4,z:desktop?70:0,rotationY:desktop?-4:0,rotationX:desktop?1.5:0,transformOrigin:'50% 85%',duration:1},0)
      .to(process.querySelector('.section-heading'),{xPercent:desktop?-2:0,y:desktop?-16:-5,opacity:.35,duration:.9},.1)
      .to(process.querySelector('.timeline'),{xPercent:desktop?-1:.2,z:desktop?35:0,y:desktop?-9:-3,opacity:.55,duration:.9},.1)
      .fromTo(studio,{xPercent:desktop?2:.4,z:desktop?-90:0,rotationY:desktop?4:0,rotationX:desktop?-.7:0,transformOrigin:'45% 15%'},{xPercent:0,z:0,rotationY:0,rotationX:0,duration:1},.08)
      .fromTo(studio.querySelector('h2'),{clipPath:'inset(0% 0% 100% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.6},.35)
      .fromTo(studio.querySelector('.studio-visual'),{xPercent:desktop?3:0,z:desktop?-60:0,rotationY:desktop?-3:0},{xPercent:0,z:0,rotationY:0,duration:.8},.28);
    const refresh=requestAnimationFrame(()=>{ScrollTrigger.sort();ScrollTrigger.refresh();});
    return()=>cancelAnimationFrame(refresh);
   });
  },root);
  return()=>{media.revert();context.revert();};
 },[]);
 return <div ref={root} className={styles.stage}>{children}</div>;
}
