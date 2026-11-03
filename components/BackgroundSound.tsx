'use client';

import {useEffect,useRef,useState} from 'react';
import {SlidersHorizontal,Volume2,VolumeX} from 'lucide-react';
import styles from './BackgroundSound.module.css';

export default function BackgroundSound(){
 const audio=useRef<HTMLAudioElement|null>(null);
 const engine=useRef<AudioContext|null>(null);
 const gain=useRef<GainNode|null>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const desired=useRef(false);
 const level=useRef(.2);
 const generation=useRef(0);
 const [playing,setPlaying]=useState(false),[pending,setPending]=useState(false);
 const [volume,setVolume]=useState(20),[expanded,setExpanded]=useState(false);
 const [error,setError]=useState(''),[obscured,setObscured]=useState(false);
 const root=useRef<HTMLDivElement>(null);

 useEffect(()=>{
  // Exactly one element for this persistent root-layout component. No autoplay.
  const element=audio.current;if(!element)return;
  const fail=()=>{desired.current=false;generation.current++;setPlaying(false);setPending(false);setError('Sound unavailable. Please try again.');element.pause();};
  const pause=()=>setPlaying(false);
  element.addEventListener('error',fail);element.addEventListener('pause',pause);
  let frame=0;
  const position=()=>{
   frame=0;const box=root.current;if(!box||box.hidden)return;
   const rect=box.getBoundingClientRect();
   const obstacles=Array.from(document.querySelectorAll<HTMLElement>('button,a,input,select,textarea')).filter(el=>!box.contains(el)).map(el=>el.getBoundingClientRect()).filter(r=>r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0);
   const safeBottom=Number.parseFloat(getComputedStyle(box).paddingBottom)||0;
   for(const offset of [16,78,140,202,264]){
    const bottom=innerHeight-offset-safeBottom,top=bottom-rect.height;
    if(!obstacles.some(r=>r.left<rect.right+8&&r.right>rect.left-8&&r.top<bottom+8&&r.bottom>top-8)){
     box.style.bottom=`calc(${offset}px + env(safe-area-inset-bottom))`;break;
    }
   }
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(position);};
  const sync=()=>{setObscured(!!document.querySelector('[role="dialog"],.mobile-menu'));schedule();};
  const observer=new MutationObserver(sync);observer.observe(document.body,{childList:true,subtree:true});const sizing=new ResizeObserver(schedule);if(root.current)sizing.observe(root.current);window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);sync();
  return()=>{generation.current++;desired.current=false;if(timer.current)clearTimeout(timer.current);observer.disconnect();sizing.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);element.pause();element.removeEventListener('error',fail);element.removeEventListener('pause',pause);void engine.current?.close();engine.current=null;gain.current=null;};
 },[]);

 const fade=(target:number,seconds:number)=>{
  const context=engine.current,node=gain.current;if(!context||!node)return;
  const now=context.currentTime;
  node.gain.cancelAndHoldAtTime(now);
  node.gain.linearRampToValueAtTime(target,now+seconds);
 };
 const toggle=async()=>{
  const element=audio.current;if(!element)return;
  const token=++generation.current;
  if(timer.current){clearTimeout(timer.current);timer.current=null;}
  setError('');
  if(desired.current){desired.current=false;setPending(false);fade(0,.7);timer.current=setTimeout(()=>{if(!desired.current){element.pause();setPlaying(false);}},700);return;}
  desired.current=true;setPending(true);
  try{
   if(!engine.current){
    const context=new AudioContext();const node=context.createGain();node.gain.value=0;
    context.createMediaElementSource(element).connect(node);node.connect(context.destination);
    engine.current=context;gain.current=node;
   }
   // Both are requested directly from the explicit user gesture (including iOS).
   if(element.error)element.load();
   const resume=engine.current.resume();const play=element.play();
   await Promise.all([resume,play]);
   if(token!==generation.current||!desired.current)return;
   setPending(false);setPlaying(true);fade(level.current,1);
  }catch{
   if(token!==generation.current)return;
   desired.current=false;element.pause();setPending(false);setPlaying(false);
   setError('Sound unavailable. Please try again.');
  }
 };
 const changeVolume=(value:number)=>{setVolume(value);level.current=value/100;if(desired.current)fade(level.current,.08);};
 return <div ref={root} className={styles.control} hidden={obscured} data-playing={playing&&volume>0} onKeyDown={e=>{if(e.key==='Escape'){setExpanded(false);root.current?.querySelector<HTMLButtonElement>('[data-volume-toggle]')?.focus();}}}>
  <audio ref={audio} src="/assets/audio/craftech-atmosphere.wav" loop preload="none" hidden/>
  {expanded&&<div className={styles.panel} id="craftech-sound-volume"><label htmlFor="craftech-volume">VOLUME <output htmlFor="craftech-volume">{volume}%</output></label><input id="craftech-volume" aria-label="Background music volume" type="range" min="0" max="100" step="1" value={volume} onChange={e=>changeVolume(Number(e.target.value))}/><span>ORIGINAL AMBIENT / NO VOCALS</span></div>}
  {error&&<p className={styles.error} role="status">{error}</p>}
  <div className={styles.row}>
   <button className={styles.toggle} type="button" onClick={()=>void toggle()} aria-label={playing?'Mute background music':'Enable background music'} aria-pressed={playing} aria-busy={pending}>
    {playing&&volume>0?<Volume2 size={15}/>:<VolumeX size={15}/>}
    <span>{pending?'LOADING':playing&&volume>0?'SOUND ON':'SOUND OFF'}</span>
    <span className={styles.bars} aria-hidden="true"><i/><i/><i/></span>
   </button>
   <button data-volume-toggle className={styles.settings} type="button" aria-label="Adjust music volume" aria-expanded={expanded} aria-controls="craftech-sound-volume" onClick={()=>setExpanded(v=>!v)}><SlidersHorizontal size={14}/></button>
  </div>
 </div>;
}
