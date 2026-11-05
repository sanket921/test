'use client';
import {useEffect,useRef,useState} from 'react';
import styles from './HeroShowreel.module.css';
export default function HeroShowreel(){
 const root=useRef<HTMLDivElement>(null),video=useRef<HTMLVideoElement>(null);
 const [failed,setFailed]=useState(false),[ready,setReady]=useState(false);
 useEffect(()=>{
  const element=root.current;if(!element)return;
  const preference=matchMedia('(prefers-reduced-motion:reduce)');let intersecting=false;
  const sync=()=>{
   const film=video.current;if(!film)return;
   const opening=element.closest('.cinema-opening') as HTMLElement|null;
   const active=intersecting&&!document.hidden&&!preference.matches&&!opening?.inert;
   if(active&&film.paused){film.muted=true;void film.play().catch(error=>{if(error?.name!=='AbortError')setFailed(true)})}else if(!active&&!film.paused)film.pause();
  };
  const io=new IntersectionObserver(([entry])=>{intersecting=entry.isIntersecting;sync()});io.observe(element);
  const mo=new MutationObserver(sync);if(element.parentElement)mo.observe(element.parentElement,{attributes:true,attributeFilter:['style','inert']});
  preference.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  return()=>{io.disconnect();mo.disconnect();preference.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync)};
 },[]);
 return <div ref={root} className={styles.film} data-ready={ready} data-failed={failed}>
  <img className={styles.poster} src="/assets/showreel/hero-dummy-poster.jpg" alt=""/>
  {!failed&&<video ref={video} className={styles.video} muted autoPlay playsInline loop preload="metadata" poster="/assets/showreel/hero-dummy-poster.jpg" onCanPlay={()=>setReady(true)} onError={()=>setFailed(true)}><source src="/assets/showreel/hero-dummy.mp4" type="video/mp4"/></video>}
  <div className={styles.veil}/><span className={styles.label}>DUMMY SHOWREEL / ORBIT REFERENCE EDIT{failed?' · POSTER FALLBACK':''}</span>
 </div>;
}
