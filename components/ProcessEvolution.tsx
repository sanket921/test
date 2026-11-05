'use client';
import {useLayoutEffect,useRef} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import styles from './ProcessEvolution.module.css';
export default function ProcessEvolution(){
 const root=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  gsap.registerPlugin(ScrollTrigger);const media=gsap.matchMedia();
  media.add('(prefers-reduced-motion:no-preference)',()=>{
   const timeline=gsap.timeline({scrollTrigger:{trigger:root.current,start:'top 90%',end:'bottom 30%',scrub:.6}});
   const headline=root.current?.closest('section')?.querySelector('h2');
   if(headline)timeline.from(headline,{clipPath:'inset(0% 0% 100% 0%)',duration:.25},0);
   timeline.from('[data-route]',{strokeDashoffset:1,autoRound:false,duration:.65,ease:'none'},0)
    .from('[data-form]',{opacity:.1,scale:.72,stagger:.12,transformOrigin:'50% 50%',duration:.3},.05)
    .from('[data-detail]',{strokeDashoffset:1,autoRound:false,stagger:.04,duration:.35},.2)
    .fromTo('[data-signal]',{x:55},{x:1020,duration:1,ease:'none'},0)
    .to('[data-final]',{stroke:'#f7a504',duration:.3},.55);
  },root);return()=>media.revert();
 },[]);
 return <div className={styles.evolution} ref={root} onPointerMove={e=>{if(e.pointerType!=='mouse'||matchMedia('(prefers-reduced-motion:reduce)').matches)return;const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--pan',`${((e.clientX-r.left)/r.width-.5)*8}px`)}} onPointerLeave={e=>e.currentTarget.style.setProperty('--pan','0px')}>
  <div className={styles.caption}><span>THE TRANSFORMATION / AN INTERACTIVE PROCESS STUDY</span><span>IDEA → EXPERIENCE</span></div>
  <svg viewBox="0 0 1100 270" role="img" aria-label="An idea develops from a single point through exploration and a structured wireframe into an interconnected experience">
   <path className={styles.route} data-route pathLength="1" strokeDasharray="1" d="M55 135H1045"/>
   <g data-form className={styles.first}><circle cx="90" cy="135" r="4"/><circle cx="90" cy="135" r="28"/><path d="M90 92V105M90 165V178M48 135H62M120 135H132"/></g>
   <g data-form><path data-detail pathLength="1" strokeDasharray="1" d="M285 135L340 85L390 135L340 185ZM285 135L340 135L340 85M340 135L390 135M340 135V185"/><circle cx="285" cy="135" r="3"/><circle cx="340" cy="85" r="3"/><circle cx="390" cy="135" r="3"/></g>
   <g data-form><path data-detail pathLength="1" strokeDasharray="1" d="M590 65L650 96V167L590 202L530 169V98ZM530 98L590 131L650 96M590 131V202M590 65V135M530 169L590 135L650 167"/><path className={styles.ghost} d="M512 210H670M513 205V215M670 205V215"/></g>
   <g data-form data-final><ellipse cx="900" cy="135" rx="76" ry="32"/><ellipse cx="900" cy="135" rx="76" ry="32" transform="rotate(60 900 135)"/><ellipse cx="900" cy="135" rx="76" ry="32" transform="rotate(-60 900 135)"/><circle cx="900" cy="135" r="5"/></g>
   <circle data-signal className={styles.signal} cy="135" r="3"/>
   <g className={styles.labels}><text x="90" y="250">01 / SPARK</text><text x="340" y="250">02 / EXPLORE</text><text x="590" y="250">03 / STRUCTURE</text><text x="900" y="250">04 / EXPERIENCE</text></g>
  </svg>
 </div>;
}
