'use client';
import {useId,useLayoutEffect,useRef} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {ArrowUpRight} from 'lucide-react';
import EngineeringContinuum from './EngineeringContinuum';
import {orbitPaths} from './OrbitBlueprintPaths';
import styles from './IntersectionIntro.module.css';

export default function IntersectionIntro(){
 const root=useRef<HTMLElement>(null),drawing=useRef<HTMLDivElement>(null);
 const uid=useId().replace(/:/g,'');
 useLayoutEffect(()=>{
  if(!root.current)return;
  gsap.registerPlugin(ScrollTrigger);
  const media=gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)',()=>{
   const element=root.current!;
   const narrow=matchMedia('(max-width:600px)').matches;
   const paths=element.querySelectorAll('[data-construct]');
   const timeline=gsap.timeline({scrollTrigger:{trigger:element,start:'top 85%',end:'bottom 65%',scrub:.65,invalidateOnRefresh:true}});
   timeline.from('[data-word="where"]',{opacity:.3,y:8,duration:.08},0)
    .from('[data-word="creativity"]',{clipPath:narrow?'inset(0 0 0% 0)':'inset(0 0 100% 0)',y:22,duration:.11},.01)
    .from('[data-word="meets"]',{opacity:.3,x:-16,duration:.08},.05)
    .from('[data-word="engineering"]',{clipPath:narrow?'inset(0 0% 0 0)':'inset(0 100% 0 0)',y:12,duration:.12},.1)
    .fromTo(paths,{strokeDashoffset:1},{strokeDashoffset:0,autoRound:false,stagger:.025,duration:.45,ease:'none'},.05)
    .from('[data-outline]',{color:'transparent',webkitTextStroke:'1px #111111',duration:.1},.12)
    .fromTo('[data-connector]',{scaleX:0},{scaleX:1,duration:.15},.08)
    .fromTo('[data-scan]',{y:-120},{y:1000,duration:.7,ease:'none'},.2)
    .to('[data-word="creativity"]',{color:'#F7A504',duration:.12},.35)
    .to('[data-word="creativity"]',{color:'#111111',duration:.18},.5)
    .to('[data-word="engineering"]',{color:'#F7A504',duration:.12},.55)
    .to('[data-word="engineering"]',{color:'#111111',duration:.18},.72)
    .fromTo('[data-pan]',{x:-18,y:20,rotation:-3,scale:.97},{x:15,y:-14,rotation:2,scale:1.025,duration:.95,ease:'sine.inOut'},0)
    .from('[data-divider]',{scaleX:0,duration:.2},.6)
    .from('[data-editorial]',{opacity:.6,y:24,stagger:.1,duration:.22},.67);
   return()=>timeline.scrollTrigger?.kill();
  },root);
  const refresh=requestAnimationFrame(()=>{ScrollTrigger.sort();ScrollTrigger.refresh();});
  return()=>{cancelAnimationFrame(refresh);media.revert();};
 },[]);
 const pointer=(event:React.PointerEvent<HTMLDivElement>)=>{
  if(event.pointerType!=='mouse'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const bounds=event.currentTarget.getBoundingClientRect();
  const x=(event.clientX-bounds.left)/bounds.width,y=(event.clientY-bounds.top)/bounds.height;
  event.currentTarget.style.setProperty('--mx',`${(x-.5)*9}px`);
  event.currentTarget.style.setProperty('--my',`${(y-.5)*7}px`);
  event.currentTarget.style.setProperty('--px',`${x*100}%`);
  event.currentTarget.style.setProperty('--py',`${y*100}%`);
 };
 return <section ref={root} id="intro" className={styles.section} aria-labelledby="philosophy-heading">
  <div className={styles.topline}><span>01 / OUR PHILOSOPHY</span><span>IMAGINATION → REALISATION</span></div>
  <div className={styles.composition}>
   <div ref={drawing} className={styles.drawing} onPointerMove={pointer} onPointerLeave={event=>{event.currentTarget.style.setProperty('--mx','0px');event.currentTarget.style.setProperty('--my','0px');}}>
    <div className={styles.drawingMotion} data-pan>
     <svg viewBox="0 0 900 900" role="img" aria-label="Technical line illustration projected from the authentic Craftech360 Orbit model">
      <defs><g id={`${uid}-model`}>{orbitPaths.map((d,i)=><path key={i} d={d}/>)}</g><clipPath id={`${uid}-scan`}><rect data-scan x="0" y="0" width="900" height="95"/></clipPath></defs>
      <g className={styles.construction}><circle cx="450" cy="400" r="315"/><path d="M450 35V855M60 400H825M125 760H775M125 750V770M775 750V770M215 140L700 700"/><circle cx="450" cy="400" r="6"/></g>
      <use href={`#${uid}-model`} className={styles.ghost}/>
      <g className={styles.linework}>{orbitPaths.map((d,i)=><path data-construct key={i} d={d} pathLength="1" strokeDasharray="1"/>)}</g>
      <g className={styles.activated} clipPath={`url(#${uid}-scan)`}><use href={`#${uid}-model`}/><path data-scan d="M70 0H820"/></g>
      <g className={styles.annotations}><text x="110" y="115">A—01 / ORBIT ASSEMBLY</text><text x="610" y="795">FORM / MOTION / PRECISION</text><text x="110" y="825">MODEL-DERIVED STUDY · NOT TO SCALE</text><path d="M125 125L205 220M605 785L640 720"/></g>
     </svg>
    </div><span className={styles.tracker} aria-hidden="true"/>
    <div className={styles.figureLabel}><span>FIG. 01 — THE ORBIT</span><span>KINETIC ENGINEERING / CRAFTECH360</span></div>
   </div>
   <div className={styles.headlineBlock}>
    <h2 id="philosophy-heading" aria-label="WHERE CREATIVITY MEETS ENGINEERING.">
     <span data-word="where" className={styles.where}>WHERE</span>
     <span data-word="creativity" className={styles.creativity}>CREATIVITY</span>
     <span className={styles.connection}><i data-connector/><span data-word="meets">MEETS</span><small>IDEA → IMPACT</small></span>
     <span data-word="engineering" className={styles.engineering}><span data-outline>ENG</span>INEERING.</span>
    </h2>
    <p className={styles.standfirst}>An idea is only the beginning.<br/>We give it the engineering to move people.</p>
    <span className={styles.note}><i/> FROM IMAGINATION TO ENGINEERING</span>
   </div>
  </div>
  <div className={styles.editorial}>
   <div data-divider className={styles.divider}/>
   <article data-editorial><span className={styles.index}>01 / THE SPARK</span><h3>WE IMAGINE<br/>WHAT’S POSSIBLE.</h3><p>We explore ideas, challenge conventions, and imagine new ways for people to experience technology.</p></article>
   <article data-editorial><span className={styles.index}>02 / THE CRAFT</span><h3>WE ENGINEER IT<br/>INTO REALITY.</h3><p>Through creative technology, precision engineering, and interactive storytelling, we bring ambitious ideas to life.</p></article>
  </div>
  <EngineeringContinuum/>
  <div className={styles.bottom}><span>IMAGINATION WITHOUT LIMITS.<br/>PRECISION WITHOUT COMPROMISE.</span><a href="#about">Meet the minds behind the movement <ArrowUpRight size={17}/></a><span className={styles.endmark}>C360 / 01 — 02</span></div>
 </section>;
}
