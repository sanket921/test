'use client';

import {useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import {ArrowUpRight} from 'lucide-react';
import styles from './IntersectionIntro.module.css';

// Supply an approved, compressed Craftech360 showreel here when available.
// No fabricated project footage or missing-file requests in the placeholder state.
const showreel: {desktop:string|null;mobile:string|null}={desktop:null,mobile:null};
const poster='/assets/showreel/intersection-poster.svg';

export default function IntersectionIntro(){
 const root=useRef<HTMLElement>(null),video=useRef<HTMLVideoElement>(null);
 const [visible,setVisible]=useState(false),[reduced,setReduced]=useState(false),[failed,setFailed]=useState(false),[ready,setReady]=useState(false);
 useEffect(()=>{
  const element=root.current;if(!element)return;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const sync=()=>setReduced(preference.matches);sync();preference.addEventListener('change',sync);
  // The section lives inside the existing hero's clip reveal. IO v2 also checks
  // ancestor visibility; the fallback inspects just that existing wrapper.
  const update=(intersecting:boolean)=>{
   const wrapper=element.parentElement;
   const shown=!wrapper||Number(getComputedStyle(wrapper).opacity)>.05;
   setVisible(intersecting&&shown&&!document.hidden);
  };
  let intersecting=false;
  const observer=new IntersectionObserver(entries=>{intersecting=entries[0].isIntersecting;update(intersecting);},{threshold:.12});
  observer.observe(element);
  const wrapperObserver=new MutationObserver(()=>update(intersecting));
  if(element.parentElement)wrapperObserver.observe(element.parentElement,{attributes:true,attributeFilter:['style','class']});
  const visibility=()=>update(intersecting);document.addEventListener('visibilitychange',visibility);
  return()=>{observer.disconnect();wrapperObserver.disconnect();preference.removeEventListener('change',sync);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 useEffect(()=>{
  const element=video.current;if(!element)return;
  if(visible&&!reduced&&!failed){element.muted=true;void element.play().catch(()=>setFailed(true));}
  else element.pause();
 },[visible,reduced,failed]);
 const placeholder=!showreel.desktop;
 return <section className={`intro light section-pad ${styles.section}`} id="intro" ref={root} data-visible={visible} data-reduced={reduced} data-media={placeholder?'placeholder':failed?'fallback':'showreel'}>
  <div className={styles.media} aria-hidden="true">
   <Image src={poster} alt="" fill unoptimized sizes="100vw" className={styles.poster}/>
   {showreel.desktop&&!failed&&!reduced&&<video ref={video} className={styles.video} data-ready={ready} muted autoPlay loop playsInline preload="none" poster={poster} onCanPlay={()=>setReady(true)} onError={()=>setFailed(true)}>
    {showreel.mobile&&<source src={showreel.mobile} type="video/mp4" media="(max-width: 600px)"/>}<source src={showreel.desktop} type="video/mp4"/>
   </video>}
   <div className={styles.veil}/>
   {placeholder&&<div className={styles.lightSweep}/>}
  </div>
  <div className={`section-label ${styles.label}`}>01 / THE INTERSECTION <span className={styles.disclosure}>{placeholder?'SHOWREEL PLACEHOLDER / FOOTAGE TO COME':failed?'SHOWREEL UNAVAILABLE / POSTER PREVIEW':'CRAFTECH360 / SHOWREEL'}</span></div>
  <div className="intro-grid"><h2>WHERE <span className={styles.creativity}>CREATIVITY</span><br/>MEETS <span className={`muted ${styles.engineering}`}>ENGINEERING.</span><sup className={styles.logo}><Image src="/assets/brand/craftech360-logo.png" alt="Craftech360" width={60} height={72} unoptimized/></sup></h2><div className="intro-copy"><span className="orange small-cross">+</span><p>We combine creative thinking, advanced technology, and engineering expertise to transform ideas into experiences that move people.</p><a className="text-link" href="#about">Meet the minds behind the movement <ArrowUpRight size={18}/></a></div></div>
  <div className="intro-tags micro"><span>IMAGINATION WITHOUT LIMITS.</span><span>PRECISION WITHOUT COMPROMISE.</span></div>
 </section>;
}
