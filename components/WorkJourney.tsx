'use client';
import {Component,useEffect,useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {ArrowUpRight,ArrowDown,ArrowLeft,ArrowRight} from 'lucide-react';
import {selectedProjects,previewDisclaimer,type WorkMotion} from './work/data';
const Scene=dynamic(()=>import('./work/WorkJourneyScene'),{ssr:false});
class WorkBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true}}render(){return this.state.failed?this.props.fallback:this.props.children}}
export default function WorkJourney({onExplore}:{onExplore:(title:string,body:string)=>void}){
 const root=useRef<HTMLElement>(null),frame=useRef<HTMLDivElement>(null),meter=useRef<HTMLSpanElement>(null),caption=useRef<HTMLDivElement>(null),trigger=useRef<ScrollTrigger|null>(null),index=useRef(0);
 const motion=useRef<WorkMotion>({progress:0,pointerX:0,pointerY:0});
 const [mode,setMode]=useState({ready:false,simple:true,webgl:false}),[active,setActive]=useState(0),[visible,setVisible]=useState(false);
 useEffect(()=>{const mobile=matchMedia('(max-width:899px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');let webgl=false;try{const gl=document.createElement('canvas').getContext('webgl2');webgl=!!gl;gl?.getExtension('WEBGL_lose_context')?.loseContext()}catch{}const update=()=>setMode({ready:true,simple:mobile.matches||reduced.matches,webgl});update();mobile.addEventListener('change',update);reduced.addEventListener('change',update);return()=>{mobile.removeEventListener('change',update);reduced.removeEventListener('change',update)}},[]);
 useEffect(()=>{if(!root.current)return;const observer=new IntersectionObserver(([e])=>setVisible(e.isIntersecting),{rootMargin:'100px'});observer.observe(root.current);return()=>observer.disconnect()},[]);
 useLayoutEffect(()=>{
  if(!mode.ready||mode.simple)return;
  gsap.registerPlugin(ScrollTrigger);
  const ctx=gsap.context(()=>{
   const tl=gsap.timeline({scrollTrigger:{trigger:root.current,pin:frame.current,start:'top top',end:()=>`+=${innerHeight*4}`,scrub:.8,refreshPriority:2,invalidateOnRefresh:true,anticipatePin:1,onRefresh:self=>{if(frame.current){frame.current.dataset.scrollStart=String(self.start);frame.current.dataset.scrollEnd=String(self.end)}}}});
   trigger.current=tl.scrollTrigger??null;
   tl.fromTo(motion.current,{progress:0},{progress:1,duration:1,ease:'none',onUpdate:()=>{const p=motion.current.progress,next=Math.min(4,Math.round(p*4));if(next!==index.current){index.current=next;setActive(next);}if(meter.current)meter.current.style.transform=`scaleX(${p})`;}},0)
    .fromTo('.work-journey-head .journey-heading-inner',{yPercent:110},{yPercent:0,duration:.045},0)
    .fromTo('.work-journey-stage',{opacity:.4,clipPath:'inset(5% 8% 5% 8%)'},{opacity:1,clipPath:'inset(0% 0% 0% 0%)',duration:.09},0)
    .to('.work-journey-stage',{scale:.95,opacity:.4,duration:.055},.945)
    .to('.work-journey-caption',{opacity:0,y:-12,duration:.025},.975);
   const seekWork=(e:MouseEvent)=>{const a=(e.target as HTMLElement).closest<HTMLAnchorElement>('a[href="#work"]');if(!a||!trigger.current)return;e.preventDefault();history.replaceState(null,'','#work');window.scrollTo({top:trigger.current.start+(trigger.current.end-trigger.current.start)*.03,behavior:'smooth'});};
   document.addEventListener('click',seekWork);
   const refresh=requestAnimationFrame(()=>{ScrollTrigger.sort();ScrollTrigger.refresh()});return()=>{cancelAnimationFrame(refresh);document.removeEventListener('click',seekWork);trigger.current=null};
  },root);return()=>ctx.revert();
 },[mode.ready,mode.simple]);
 const select=(i:number)=>{if(!trigger.current)return;const p=Math.min(.95,Math.max(.03,i/4));window.scrollTo({top:trigger.current.start+(trigger.current.end-trigger.current.start)*p,behavior:'smooth'})};
 const current=selectedProjects[active];
 return <section id="work" className={`work-journey ${mode.simple?'work-journey-simple':''}`} ref={root} aria-label="Cinematic selected projects">
  <div className="work-journey-frame" ref={frame}>
   <div className="work-journey-head"><div className="section-label">SELECTED WORK / CRAFTECH360</div><h2 aria-label="Experiences we’ve brought to life."><span><span className="journey-heading-inner">EXPERIENCES WE’VE</span></span><span><span className="journey-heading-inner">BROUGHT TO LIFE.</span></span></h2><p className="micro">FIVE PROJECTS.<br/>A JOURNEY THROUGH POSSIBILITY.</p></div>
   {!mode.simple&&<>
    <div className="work-journey-stage" onPointerMove={e=>{const r=e.currentTarget.getBoundingClientRect();motion.current.pointerX=(e.clientX-r.left)/r.width*2-1;motion.current.pointerY=(e.clientY-r.top)/r.height*2-1}} onPointerLeave={()=>{motion.current.pointerX=0;motion.current.pointerY=0}}>
     {mode.webgl?<WorkBoundary fallback={<Image src={`/assets/projects/${current.slug}-concept.svg`} alt="Original graphic placeholder; authentic project media pending" fill unoptimized/>}><Scene motion={motion} visible={visible}/></WorkBoundary>:<Image src={`/assets/projects/${current.slug}-concept.svg`} alt="Original graphic placeholder; authentic project media pending" fill unoptimized/>}
    </div>
    <div className="work-journey-caption" ref={caption} aria-live="polite" aria-atomic="true"><div className="journey-project-name"><span className="micro">0{active+1} / PROJECT PREVIEW</span><h3 key={current.name}>{current.name}</h3><button onClick={()=>onExplore(current.name,previewDisclaimer)}>EXPLORE PROJECT <ArrowUpRight size={19}/></button></div><div className="journey-project-info"><p>{current.note}</p><span className="micro journey-disclosure">PLACEHOLDER MEDIA / NOT PROJECT FOOTAGE</span></div><span className="journey-counter" aria-hidden="true">0{active+1}<small>/ 05</small></span></div>
    <div className="work-journey-bottom"><div aria-label="Choose a project">{selectedProjects.map((p,i)=><button key={p.slug} aria-label={`View project ${p.name}`} aria-current={active===i?'true':undefined} onClick={()=>select(i)}><small>0{i+1}</small>{p.short}</button>)}</div><div className="journey-arrows"><button aria-label="Previous project" disabled={active===0} onClick={()=>select(active-1)}><ArrowLeft size={16}/></button><button aria-label="Next project" disabled={active===4} onClick={()=>select(active+1)}><ArrowRight size={16}/></button></div><a href="#capabilities" className="micro">CONTINUE THE EXPERIENCE <ArrowDown size={13}/></a></div>
    <div className="work-journey-progress"><span ref={meter}/></div>
   </>}
   {mode.simple&&<div className="journey-vertical">{selectedProjects.map((p,i)=><article key={p.slug}><div className="journey-mobile-image"><Image src={`/assets/projects/${p.slug}-concept.svg`} alt={`Original graphic placeholder for ${p.name}; not project footage`} width={1200} height={675} unoptimized sizes="100vw"/></div><span className="micro">0{i+1} / PROJECT PREVIEW</span><h3>{p.name}</h3><button onClick={()=>onExplore(p.name,previewDisclaimer)}>EXPLORE PROJECT <ArrowUpRight size={18}/></button><p>{p.note}</p><span className="micro journey-disclosure">PLACEHOLDER MEDIA / NOT PROJECT FOOTAGE</span></article>)}</div>}
  </div>
 </section>;
}
