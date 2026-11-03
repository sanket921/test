'use client';
import { Component, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ArrowDown, ArrowUpRight, Pause, Play, RotateCcw } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MotionState } from './cinematic/motion';
import { usePointerController } from './cinematic/PointerController';
import OpeningOrbit from './cinematic/OpeningOrbit';
const Sculpture = dynamic(() => import('./Sculpture'), { ssr: false });
function CoreFallback() {
  return <div className="core-fallback"><svg viewBox="0 0 600 600" role="img" aria-label="Static illustration of the conceptual segmented Kinetic Core"><defs><linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f0f0eb"/><stop offset=".4" stopColor="#4b5059"/><stop offset=".7" stopColor="#9399a2"/><stop offset="1" stopColor="#1f2228"/></linearGradient></defs><g fill="none" stroke="url(#metal)">{[245,225,193,155,112].map((r,i)=><circle key={r} cx="300" cy="300" r={r} strokeWidth={i===4?32:12} strokeDasharray={i===4?'42 8':'83 5'} transform={`rotate(${i*19} 300 300)`}/>)}</g><g stroke="#f7a504" strokeWidth="3">{[0,60,120,180,240,300].map(a=><path key={a} d="M 535 300 L 545 300" transform={`rotate(${a} 300 300)`}/>)}</g></svg><span className="micro">STATIC CONCEPT / WEBGL UNAVAILABLE</span></div>;
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
      const opening=gsap.timeline({defaults:{ease:'power3.out'}});
      opening.from('.cinema-kicker',{autoAlpha:0,x:-12,duration:.5},.1)
        .from('.cinema-line-one .line-inner',{yPercent:115,duration:.85},.34)
        .from('.cinema-line-two .line-inner',{yPercent:115,duration:.95},.62)
        .from('.cinema-description',{opacity:0,y:14,duration:.65},1.6)
        .from('.opening-editorial-rule',{scaleX:0,transformOrigin:'left',duration:.75},1.45)
        .from('.opening-orbit,.editorial-grid',{opacity:0,duration:.8,stagger:.08},1.65)
        .from('.cinema-opening-bottom',{opacity:0,y:10,duration:.6},2.03);
      const sequence=gsap.timeline({scrollTrigger:{
        trigger:root.current, pin:frame.current, start:'top top', end:()=>`+=${innerHeight*(mobile?1.65:4)}`,
        scrub:mobile?.5:.8, anticipatePin:1, invalidateOnRefresh:true, refreshPriority:10,
        onUpdate:self=>{if(meter.current)meter.current.style.transform=`scaleX(${self.progress})`;if(openingLayer.current)openingLayer.current.style.setProperty('--opening-progress',String(Math.min(1,self.progress/.34)));},
      }});
      trigger.current=sequence.scrollTrigger??null;
      sequence.to(motion.current,{progress:1,ease:'none',duration:1},0)
        .to('.cinema-opening',{yPercent:-32,opacity:0,ease:'power2.in',duration:.17},.17)
        .to('.opening-orbit',{xPercent:30,yPercent:-12,rotation:28,ease:'power2.inOut',duration:.18},.16)
        .to('.opening-editorial-rule',{xPercent:10,ease:'none',duration:.16},.17)
        .fromTo('.cinema-scene',{autoAlpha:0},{autoAlpha:1,duration:.12,ease:'none'},.205)
        .fromTo('.cinema-caption',{autoAlpha:0,y:15},{autoAlpha:1,y:0,duration:.07},.31)
        .to('.cinema-caption',{autoAlpha:0,y:-15,duration:.06},.74)
        .to('.cinema-scene',{autoAlpha:0,duration:.04},.95)
        .fromTo('.cinema-intro',{autoAlpha:0,clipPath:'circle(0% at 50% 50%)',scale:1.08},{autoAlpha:1,clipPath:'circle(150% at 50% 50%)',scale:1,duration:.12,ease:'power2.inOut'},.88);
      const phases=['01 / THE POSSIBILITY','02 / THE REVEAL','03 / THE KINETIC CORE','04 / INTO THE UNEXPECTED','05 / THE INTERSECTION'];
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
      const refresh = requestAnimationFrame(()=>{ ScrollTrigger.sort(); ScrollTrigger.refresh(); });
      let alive = true;
      document.fonts.ready.then(()=>{if(alive){ScrollTrigger.sort();ScrollTrigger.refresh();}});
      return()=>{alive=false;cancelAnimationFrame(refresh);document.removeEventListener('click',skip);trigger.current=null;};
    },root);
    return()=>{context.revert();motion.current.progress=0;};
  },[ready,reduced,mobile]);
  const explore = () => { if(trigger.current)window.scrollTo({top:trigger.current.start+(trigger.current.end-trigger.current.start)*.48,behavior:reduced?'auto':'smooth'}); };
  return <section ref={root} id="home" className={`cinema ${reduced?'cinema-reduced':''}`} aria-label="Craftech360 cinematic introduction">
    <noscript><style>{`.cinema .cinema-opening{visibility:visible!important}`}</style></noscript>
    <div ref={frame} className="cinema-frame" data-phase="0">
      <div ref={openingLayer} className="cinema-opening" onPointerMove={e=>{if(mobile||reduced||e.pointerType==='touch')return;const r=e.currentTarget.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;e.currentTarget.style.setProperty('--orbit-tilt-x',`${-y*8}deg`);e.currentTarget.style.setProperty('--orbit-tilt-y',`${x*10}deg`);e.currentTarget.style.setProperty('--grid-x',`${x*5}px`);e.currentTarget.style.setProperty('--grid-y',`${y*5}px`);}} onPointerLeave={e=>{['--orbit-tilt-x','--orbit-tilt-y','--grid-x','--grid-y'].forEach(key=>e.currentTarget.style.removeProperty(key))}}>
        <div className="editorial-grid" aria-hidden="true"/>
        <div className="cinema-kicker micro"><span><b className="status"/> CRAFTECH360 / CREATIVE TECHNOLOGY</span><span>IMAGINATION, IN MOTION.</span></div>
        <div className="cinema-editorial">
          <div className="cinema-title-wrap">
            <h1><span className="cinema-line cinema-line-one"><span className="line-inner">WE MAKE TECHNOLOGY</span></span><span className="cinema-line cinema-line-two"><span className="line-inner">AN <em>EXPERIENCE.</em></span></span></h1>
            <div className="opening-editorial-rule" aria-hidden="true"><span/></div>
          </div>
          <OpeningOrbit/>
          <div className="cinema-description"><p>We design, engineer, and bring extraordinary experiences to life through kinetic innovation, immersive technology, and intelligent interactions.</p><a href="#work">Explore our work <ArrowUpRight size={17}/></a></div>
        </div>
        <div className="cinema-opening-bottom"><span className="micro">DESIGN × ENGINEERING<br/>× EXPERIENCE</span><button onClick={explore} className="cinema-scroll" aria-label="Scroll to reveal the Kinetic Core"><span>SCROLL TO<br/>EXPLORE</span><span className="cinema-scroll-icon"><ArrowDown size={21}/><i aria-hidden="true"/></span></button><a className="micro cinema-skip" href="#intro">SKIP THE INTRO ↗</a></div>
      </div>
      <div ref={scene} className="cinema-scene" role="group" aria-label="Interactive conceptual Kinetic Core. Drag horizontally or use arrow keys to rotate. Home resets orientation." tabIndex={-1}>
        <div className="cinema-halo"/>
        {ready&&webgl?<SceneBoundary><Sculpture motion={motion} reduced={reduced} mobile={mobile} visible={visible}/></SceneBoundary>:<CoreFallback/>}
      </div>
      <div className="cinema-caption" aria-hidden="true"><div><span className="micro">MOTION STUDY / C—001</span><h2>C360<br/><span>Kinetic Core.</span></h2></div><p className="micro">THOUGHT IN MOTION.<br/>PRECISION IN EVERY DIMENSION.<br/><span>ORIGINAL CONCEPT / NOT AN EXISTING PRODUCT</span></p></div>
      <div ref={controls} className="cinema-controls"><span className="micro">↔ DRAG TO EXPLORE</span><button onClick={()=>{motion.current.paused=!paused;setPaused(!paused)}} aria-label={paused?'Resume idle motion':'Pause idle motion'} aria-pressed={paused}>{paused?<Play size={14}/>:<Pause size={14}/>}</button><button onClick={()=>motion.current.reset++} aria-label="Reset sculpture orientation"><RotateCcw size={14}/></button></div>
      <div className="cinema-tracker micro" aria-hidden="true"><span ref={stage}>01 / THE POSSIBILITY</span><span>SCROLL TO TRANSFORM <ArrowDown size={12}/></span></div>
      <div className="cinema-intro">{children}</div>
      <div className="cinema-progress" aria-hidden="true"><span ref={meter}/></div>
    </div>
  </section>;
}
