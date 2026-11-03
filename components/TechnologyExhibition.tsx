'use client';
import {Component,useEffect,useRef,useState,type ReactNode} from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {ArrowDown,ArrowUpRight,ArrowLeft,ArrowRight} from 'lucide-react';
import {technologies,type GalleryMotion} from './technologies/data';
const Scene=dynamic(()=>import('./technologies/ExhibitionScene'),{ssr:false});
class GalleryBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true}}render(){return this.state.failed?this.props.fallback:this.props.children}}
export default function TechnologyExhibition({onExplore}:{onExplore:(title:string,body:string)=>void}){
 const root=useRef<HTMLElement>(null),frame=useRef<HTMLDivElement>(null),trigger=useRef<ScrollTrigger|null>(null),bar=useRef<HTMLSpanElement>(null);
 const lastActive=useRef(0);
 const motion=useRef<GalleryMotion>({progress:0,pointerX:0,pointerY:0});
 const [mode,setMode]=useState({ready:false,mobile:false,reduced:false,webgl:false});
 const [active,setActive]=useState(0),[visible,setVisible]=useState(false);
 useEffect(()=>{const narrow=matchMedia('(max-width:899px)'),reduce=matchMedia('(prefers-reduced-motion:reduce)');let webgl=false;try{const ctx=document.createElement('canvas').getContext('webgl2');webgl=!!ctx;ctx?.getExtension('WEBGL_lose_context')?.loseContext();}catch{}const sync=()=>setMode({ready:true,mobile:narrow.matches,reduced:reduce.matches,webgl});sync();narrow.addEventListener('change',sync);reduce.addEventListener('change',sync);return()=>{narrow.removeEventListener('change',sync);reduce.removeEventListener('change',sync)}},[]);
 useEffect(()=>{if(!root.current)return;const observer=new IntersectionObserver(([e])=>setVisible(e.isIntersecting),{rootMargin:'150px'});observer.observe(root.current);return()=>observer.disconnect()},[]);
 useEffect(()=>{if(!mode.ready)return;gsap.registerPlugin(ScrollTrigger);const ctx=gsap.context(()=>{
  if(mode.mobile||mode.reduced){motion.current.progress=active/5;return;}
  const tl=gsap.timeline({scrollTrigger:{trigger:root.current,pin:frame.current,start:'top top',end:()=>`+=${innerHeight*5}`,scrub:.7,refreshPriority:5,invalidateOnRefresh:true,anticipatePin:1,onRefresh:self=>{if(frame.current){frame.current.dataset.scrollStart=String(self.start);frame.current.dataset.scrollEnd=String(self.end);}}}});
  trigger.current=tl.scrollTrigger??null;
  tl.fromTo(motion.current,{progress:0},{progress:1,duration:1,ease:'none',onUpdate:()=>{const p=motion.current.progress;const next=Math.min(5,Math.round(p*5));if(next!==lastActive.current){lastActive.current=next;setActive(next);}if(bar.current)bar.current.style.transform=`scaleX(${p})`}},0);
  tl.fromTo('.exhibit-heading-inner',{yPercent:110},{yPercent:0,duration:.07},0);
  tl.to('.exhibit-stage',{scale:.94,opacity:.65,duration:.06},.94);
  const refresh=requestAnimationFrame(()=>{ScrollTrigger.sort();ScrollTrigger.refresh()});return()=>{cancelAnimationFrame(refresh);trigger.current=null};
 },root);return()=>ctx.revert()},[mode.ready,mode.mobile,mode.reduced]); // Active changes only at exhibit boundaries, never every scroll frame.
 const select=(index:number)=>{const i=Math.min(5,Math.max(0,index));if(trigger.current){window.scrollTo({top:trigger.current.start+(trigger.current.end-trigger.current.start)*(i/5),behavior:'smooth'})}else{setActive(i);gsap.to(motion.current,{progress:i/5,duration:mode.reduced?0:1.1,ease:'power2.inOut',overwrite:true})}};
 useEffect(()=>()=>{gsap.killTweensOf(motion.current)},[]);
 const fallback=<div className={`exhibit-fallback concept-${active}`} aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} style={{'--i':i} as React.CSSProperties}/>)}</div>;
 const product=technologies[active];
 return <section ref={root} id="technologies" className={`exhibition ${mode.mobile||mode.reduced?'exhibition-simple':''}`} aria-label="Technology exhibition"><div ref={frame} className="exhibition-frame">
  <div className="exhibit-stage" onPointerMove={e=>{const r=e.currentTarget.getBoundingClientRect();motion.current.pointerX=(e.clientX-r.left)/r.width*2-1;motion.current.pointerY=(e.clientY-r.top)/r.height*2-1;}} onPointerLeave={()=>{motion.current.pointerX=0;motion.current.pointerY=0}}>
  {mode.ready&&mode.webgl?<GalleryBoundary fallback={fallback}><Scene motion={motion} mobile={mode.mobile} reduced={mode.reduced} visible={visible} selected={mode.reduced?active:undefined}/></GalleryBoundary>:fallback}</div>
  <div className="exhibit-top"><span className="section-label">02 / SIGNATURE TECHNOLOGIES</span><span className="micro">AN EXHIBITION OF POSSIBILITIES</span></div>
  <h2 className="exhibit-heading"><span><span className="exhibit-heading-inner">TECHNOLOGY</span></span><span><span className="exhibit-heading-inner">THAT <em>MOVES.</em></span></span></h2>
  <span className="exhibit-study micro">ORIGINAL CONCEPT STUDIES<br/>NOT PRODUCT MODELS OR MECHANICAL DEMONSTRATIONS</span>
  <div className="exhibit-copy" aria-live="polite" aria-atomic="true"><span className="micro">0{active+1} / {product.category.toUpperCase()}</span><h3 key={product.name}>{product.name}</h3><p>{product.description}</p><button onClick={()=>onExplore(product.name,product.description+' This original static composition is a conceptual placeholder. The camera moves through the exhibition; it does not demonstrate the mechanics of this product. Authentic assets and verified details are still required.')} className="exhibit-explore">Explore {product.name} <ArrowUpRight size={18}/></button></div>
  <div className="exhibit-counter"><span>0{active+1}</span><small>/ 06</small></div>
  <div className="exhibit-bottom"><div className="exhibit-index" aria-label="Choose a technology">{technologies.map((p,i)=><button key={p.name} aria-label={`View ${p.name}`} aria-current={i===active?'true':undefined} onClick={()=>select(i)}><small>0{i+1}</small><span>{p.name}</span></button>)}</div><div className="exhibit-arrows"><button aria-label="Previous technology" disabled={active===0} onClick={()=>select(active-1)}><ArrowLeft size={18}/></button><button aria-label="Next technology" disabled={active===5} onClick={()=>select(active+1)}><ArrowRight size={18}/></button></div><a href="#work" className="micro">CONTINUE TO OUR WORK <ArrowDown size={13}/></a></div>
  <div className="exhibit-progress"><span ref={bar} style={{transform:`scaleX(${active/5})`}}/></div>
 </div></section>;
}
