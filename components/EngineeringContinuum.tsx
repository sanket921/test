'use client';
import {useLayoutEffect,useRef} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import styles from './EngineeringContinuum.module.css';
export default function EngineeringContinuum(){
 const root=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  gsap.registerPlugin(ScrollTrigger);const media=gsap.matchMedia();
  media.add('(prefers-reduced-motion:no-preference)',()=>{
   gsap.timeline({scrollTrigger:{trigger:root.current,start:'top 90%',end:'bottom 45%',scrub:.6}})
    .from('[data-draw]',{strokeDashoffset:1,autoRound:false,duration:1,stagger:.06},0)
    .from('[data-node]',{fill:'#b7b7b7',opacity:.3,duration:.25,stagger:.1},.2)
    .fromTo('[data-transmit]',{x:210},{x:790,duration:1,ease:'none'},.1);
  },root);return()=>media.revert();
 },[]);
 return <div ref={root} className={styles.diagram}>
  <div className={styles.label}><span>THE CONTINUUM / IMAGINATION TO ENGINEERING</span><span>CONCEPTUAL PROCESS DIAGRAM</span></div>
  <svg viewBox="0 0 1000 280" role="img" aria-label="A creative spark connects to an engineered ring structure through a horizontal network of technical lines">
   <g fill="none" stroke="currentColor" strokeWidth=".7"><circle data-draw pathLength="1" strokeDasharray="1" cx="210" cy="130" r="65"/><circle data-draw pathLength="1" strokeDasharray="1" cx="210" cy="130" r="44"/><path data-draw pathLength="1" strokeDasharray="1" d="M210 65V35H790V65M275 130H725M210 195V225H790V195M330 130L430 75H570L670 130M330 130L430 185H570L670 130"/><path className={styles.guide} d="M80 130H920M500 30V235M130 250H870M130 243V257M870 243V257"/>{[0,1,2].map(i=><ellipse key={i} data-draw pathLength="1" strokeDasharray="1" cx="790" cy="130" rx="68" ry={65-i*20} transform={`rotate(${i*55} 790 130)`}/>)}</g>
   <g fill="#f7a504">{[210,330,500,670,790].map(x=><circle key={x} data-node cx={x} cy="130" r="2.5"/>)}<circle data-transmit cy="130" r="3.5"/></g>
   <g className={styles.type}><text x="210" y="275">CREATIVE INTENT</text><text x="790" y="275">ENGINEERED EXPERIENCE</text><text x="500" y="255">A SHARED LINE OF THINKING</text></g>
  </svg>
 </div>;
}
