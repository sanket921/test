'use client';
import { Component, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ArrowDown, ArrowUpRight, Pause, Play, RotateCcw } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MotionState } from './cinematic/motion';
import { usePointerController } from './cinematic/PointerController';
import HeroShowreel from './HeroShowreel';
import OrbitEntrance from './OrbitEntrance';
import InteractiveHeroField from './cinematic/InteractiveHeroField';
const Sculpture = dynamic(() => import('./Sculpture'), { ssr: false });
function CoreFallback() {
  return <div className="core-fallback"><img src="/assets/models/the-orbit-poster.jpg" alt="The Orbit: still from the supplied Craftech360 product film" style={{width:'100%',height:'100%',objectFit:'contain'}}/><span className="micro">THE ORBIT / STATIC PRODUCT REFERENCE</span></div>;
}
class SceneBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <CoreFallback/> : this.props.children; }
}
export default function CinematicHero({children}:{children:ReactNode}) {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const openingLayer = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const stage = useRef<HTMLSpanElement>(null);
  const meter = useRef<HTMLSpanElement>(null);
  const motion = useRef<MotionState>({progress:0, paused:false, dragX:0, dragY:0, velocityX:0, velocityY:0, dragging:false, pointerX:0, pointerY:0, lastInteraction:0, reset:0});
  const [ready,setReady] = useState(false);
  const introHashApplied = useRef(false);
  const [webgl,setWebgl] = useState(false);
  const [reduced,setReduced] = useState(false);
  const [mobile,setMobile] = useState(false);
  const [visible,setVisible] = useState(true);
  const [paused,setPaused] = useState(false);
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = matchMedia('(max-width: 899px)');
    const sync = () => { setReduced(reduce.matches); setMobile(narrow.matches); };
    sync(); reduce.addEventListener('change',sync); narrow.addEventListener('change',sync);
    try { const probe=document.createElement('canvas'); const context=probe.getContext('webgl2'); setWebgl(!!context); context?.getExtension('WEBGL_lose_context')?.loseContext(); } catch { setWebgl(false); }
    setReady(true);
    return () => { reduce.removeEventListener('change',sync); narrow.removeEventListener('change',sync); };
  }, []);
  useEffect(() => {
    const element=root.current;
    if(!element)return;
    let intersects=true;
    const update=()=>setVisible(intersects&&!document.hidden);
    const observer=new IntersectionObserver(([entry])=>{intersects=entry.isIntersecting;update()},{rootMargin:'100px'});
    observer.observe(element);document.addEventListener('visibilitychange',update);
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update)};
  }, []);
  usePointerController(scene,motion,ready&&!reduced);
  useLayoutEffect(() => {
    if(!ready)return;
    motion.current.progress = reduced ? .52 : 0;
    if(openingLayer.current){openingLayer.current.inert=false;openingLayer.current.style.setProperty('--opening-progress','0');}
    if(frame.current)frame.current.dataset.phase='0';
    if(controls.current){controls.current.style.visibility='hidden';controls.current.style.opacity='0';}
    if(scene.current){scene.current.tabIndex=-1;scene.current.style.pointerEvents='none';}
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.set(openingLayer.current,{visibility:'visible'});
      if(reduced){motion.current.progress=.52;return;}
      let entryDelay=0;try{if(!location.hash&&!sessionStorage.getItem('c360-entered'))entryDelay=.75}catch{}
      const opening=gsap.timeline({delay:entryDelay,defaults:{ease:'power3.out'}});
      opening.from('.cinema-kicker',{autoAlpha:0,x:-12,duration:.5},.1)
        .from('.cinema-line-one .line-inner',{yPercent:115,duration:.85},.34)
        .from('.cinema-line-two .line-inner',{yPercent:115,duration:.95},.62)
        .from('.cinema-description',{opacity:0,y:14,duration:.65},1.6)
        .from('.cinema-opening-bottom',{opacity:0,y:10,duration:.6},2.03);
      const sequence=gsap.timeline({scrollTrigger:{
        trigger:root.current, pin:frame.current, start:'top top', end:()=>`+=${innerHeight*(mobile?1.65:4)}`,
        scrub:mobile?.5:.8, anticipatePin:1, invalidateOnRefresh:true, refreshPriority:10,
        onUpdate:self=>{if(meter.current)meter.current.style.transform=`scaleX(${self.progress})`;if(openingLayer.current)openingLayer.current.style.setProperty('--opening-progress',String(Math.min(1,self.progress/.34)));},
      }});
      trigger.current=sequence.scrollTrigger??null;
      sequence.to(motion.current,{progress:1,ease:'none',duration:1},0)
        .to('.cinema-opening',{yPercent:-32,opacity:0,ease:'power2.in',duration:.17},.17)
        .fromTo('.opening-dotfield',{opacity:1},{opacity:0,immediateRender:false,ease:'power2.inOut',duration:.12},.12)
        .fromTo('.cinema-scene',{autoAlpha:0},{autoAlpha:1,duration:.12,ease:'none'},.205)
        .fromTo('.cinema-caption',{autoAlpha:0,y:15},{autoAlpha:1,y:0,duration:.07},.31)
        .to('.cinema-caption',{autoAlpha:0,y:-15,duration:.06},.74)
        .to('.cinema-scene',{autoAlpha:0,duration:.04},.95)
        .fromTo('.blueprint-bridge',{autoAlpha:0},{autoAlpha:1,duration:.06},.78)
        .fromTo('.bridge-trace ellipse,.bridge-trace path',{strokeDashoffset:1},{strokeDashoffset:0,autoRound:false,duration:.2,ease:'none'},.78)
        .fromTo('.bridge-wash',{clipPath:'circle(0% at 50% 50%)'},{clipPath:'circle(150% at 50% 50%)',duration:.14,ease:'power2.inOut'},.86)
        .fromTo('.blueprint-bridge svg',{scale:.8,rotation:-12},{scale:1.15,rotation:0,duration:.22,ease:'sine.inOut'},.78)
        .fromTo('.cinema-intro',{autoAlpha:0,clipPath:'circle(0% at 50% 50%)',scale:1},{autoAlpha:1,clipPath:'circle(150% at 50% 50%)',scale:1,duration:.12,ease:'power2.inOut'},.88);
      const phases=['01 / THE POSSIBILITY','02 / THE REVEAL','03 / THE ORBIT','04 / INTO THE UNEXPECTED','05 / THE INTERSECTION'];
      let previousPhase=-1;
      sequence.eventCallback('onUpdate',()=>{
        const p=motion.current.progress;
        const phase=p<.2?0:p<.4?1:p<.7?2:p<.9?3:4;
        if(phase!==previousPhase){if(stage.current)stage.current.textContent=phases[phase];if(frame.current)frame.current.dataset.phase=String(phase);previousPhase=phase;}
        const interactive=p>.38&&p<.72;
        if(openingLayer.current)openingLayer.current.inert=p>.35;
        if(scene.current){scene.current.style.pointerEvents=interactive?'auto':'none';scene.current.tabIndex=interactive?0:-1;}
        if(controls.current){controls.current.style.visibility=interactive?'visible':'hidden';controls.current.style.opacity=interactive?'1':'0';}
      });
      const skip=(e:MouseEvent)=>{const a=(e.target as HTMLElement).closest<HTMLAnchorElement>('a[href="#intro"]');if(!a||!trigger.current)return;e.preventDefault();history.replaceState(null,'','#intro');window.scrollTo({top:trigger.current.end,behavior:'smooth'});};
      document.addEventListener('click',skip);
      const refresh = requestAnimationFrame(()=>{ ScrollTrigger.sort(); ScrollTrigger.refresh(); if(location.hash==='#intro'&&!introHashApplied.current){introHashApplied.current=true;window.scrollTo({top:trigger.current?.end??0,behavior:'instant'});} });
      let alive = true;
      document.fonts.ready.then(()=>{if(alive){ScrollTrigger.sort();ScrollTrigger.refresh();}});
      return()=>{alive=false;cancelAnimationFrame(refresh);document.removeEventListener('click',skip);trigger.current=null;};
    },root);
    return()=>{context.revert();motion.current.progress=0;};
  },[ready,reduced,mobile]);
  const explore = () => { if(trigger.current)window.scrollTo({top:trigger.current.start+(trigger.current.end-trigger.current.start)*.48,behavior:reduced?'auto':'smooth'}); };
  return <section ref={root} id="home" className={`cinema ${reduced?'cinema-reduced':''}`} aria-label="Craftech360 cinematic introduction">
    <noscript><style>{`.cinema .cinema-opening{visibility:visible!important}`}</style></noscript>
    <OrbitEntrance/>
    <div ref={frame} className="cinema-frame" data-phase="0">
      <div ref={openingLayer} className="cinema-opening" onPointerMove={e=>{if(mobile||reduced||e.pointerType==='touch')return;const r=e.currentTarget.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;e.currentTarget.style.setProperty('--orbit-tilt-x',`${-y*8}deg`);e.currentTarget.style.setProperty('--orbit-tilt-y',`${x*10}deg`);e.currentTarget.style.setProperty('--grid-x',`${x*5}px`);e.currentTarget.style.setProperty('--grid-y',`${y*5}px`);}} onPointerLeave={e=>{['--orbit-tilt-x','--orbit-tilt-y','--grid-x','--grid-y'].forEach(key=>e.currentTarget.style.removeProperty(key))}}>
        <HeroShowreel/>
        <InteractiveHeroField/>
        <div className="cinema-kicker micro"><span><b className="status"/> CRAFTECH360 / CREATIVE TECHNOLOGY</span><span>IMAGINATION, IN MOTION.</span></div>
        <div className="cinema-editorial">
          <div className="cinema-title-wrap">
            <h1><span className="cinema-line cinema-line-one"><span className="line-inner">WE MAKE TECHNOLOGY</span></span><span className="cinema-line cinema-line-two"><span className="line-inner">AN <em>EXPERIENCE</em></span></span></h1>

          </div>
          <div className="cinema-description"><p>We design, engineer, and bring extraordinary experiences to life through kinetic innovation, immersive technology, and intelligent interactions.</p><a href="#work">Explore our work <ArrowUpRight size={17}/></a></div>
        </div>
        <div className="cinema-opening-bottom"><span className="micro">DESIGN × ENGINEERING<br/>× EXPERIENCE</span><button onClick={explore} className="cinema-scroll" aria-label="Scroll to reveal The Orbit"><span>SCROLL TO<br/>EXPLORE</span><span className="cinema-scroll-icon"><ArrowDown size={21}/></span></button><a className="micro cinema-skip" href="#intro">SKIP THE INTRO ↗</a></div>
      </div>
      <div ref={scene} className="cinema-scene" role="group" aria-label="Interactive Craftech360 Orbit product model. Drag horizontally or use arrow keys to rotate. Home resets orientation." tabIndex={-1}>
        <div className="cinema-halo"/>
        {ready&&webgl?<SceneBoundary><Sculpture motion={motion} reduced={reduced} mobile={mobile} visible={visible}/></SceneBoundary>:<CoreFallback/>}
      </div>
      <div className="cinema-caption" aria-hidden="true"><div><span className="micro">MOTION STUDY / C—001</span><h2>THE<br/><span>Orbit.</span></h2></div><p className="micro">THOUGHT IN MOTION.<br/>PRECISION IN EVERY DIMENSION.<br/><span>CRAFTECH360 / THE ORBIT</span></p></div>
      <div ref={controls} className="cinema-controls"><span className="micro">↔ DRAG TO EXPLORE</span><button onClick={()=>{motion.current.paused=!paused;setPaused(!paused)}} aria-label={paused?'Resume idle motion':'Pause idle motion'} aria-pressed={paused}>{paused?<Play size={14}/>:<Pause size={14}/>}</button><button onClick={()=>motion.current.reset++} aria-label="Reset sculpture orientation"><RotateCcw size={14}/></button></div>
      <div className="blueprint-bridge" aria-hidden="true"><div className="bridge-wash"/><svg viewBox="0 0 900 900" preserveAspectRatio="xMidYMid meet"><g className="bridge-trace" fill="none" stroke="#f7a504" strokeWidth=".8" pathLength="1"><ellipse cx="450" cy="450" rx="260" ry="310" pathLength="1" strokeDasharray="1"/><ellipse cx="450" cy="450" rx="180" ry="250" transform="rotate(35 450 450)" pathLength="1" strokeDasharray="1"/><path d="M450 110V790M120 450H780M240 780H660" pathLength="1" strokeDasharray="1"/></g></svg></div>
      <div className="cinema-tracker micro" aria-hidden="true"><span ref={stage}>01 / THE POSSIBILITY</span><span>SCROLL TO TRANSFORM <ArrowDown size={12}/></span></div>
    </div>
    <div className="cinema-intro">{children}</div>
  </section>;
}
