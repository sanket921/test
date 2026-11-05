'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,Menu,X,Plus} from 'lucide-react';
import styles from './Navigation.module.css';
const main=[['Home','home'],['Technologies','technologies'],['Our Work','work'],['Capabilities','capabilities'],['About','about'],['Contact','contact']];
const extra=[['Our Philosophy','intro'],['Clients','clients'],['Our Process','process']];
export default function Navigation(){
 const [compact,setCompact]=useState(false),[active,setActive]=useState('home'),[menu,setMenu]=useState(false),[more,setMore]=useState(false);
 const panel=useRef<HTMLDivElement>(null),toggle=useRef<HTMLButtonElement>(null),moreRoot=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let frame=0;
  const update=()=>{frame=0;setCompact(scrollY>32);let id='home';for(const [,key]of [...extra,...main]){const e=document.getElementById(key);if(!e)continue;const r=e.getBoundingClientRect();if(r.top<=150&&r.bottom>150)id=key;}setActive(id);};
  const scroll=()=>{if(!frame)frame=requestAnimationFrame(update)};update();addEventListener('scroll',scroll,{passive:true});return()=>{removeEventListener('scroll',scroll);cancelAnimationFrame(frame)};
 },[]);
 useEffect(()=>{
  if(!more)return;const outside=(e:PointerEvent)=>{if(!moreRoot.current?.contains(e.target as Node))setMore(false)};
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMore(false);moreRoot.current?.querySelector('button')?.focus()}};
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key)};
 },[more]);
 useEffect(()=>{
  if(!menu)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMenu(false);toggle.current?.focus({preventScroll:true})}if(e.key==='Tab'){const items=Array.from(panel.current?.querySelectorAll<HTMLElement>('a,button')??[]),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}};
  document.addEventListener('keydown',key);return()=>{document.body.style.overflow=old;document.removeEventListener('keydown',key)};
 },[menu]);
 const link=(item:string[],secondary=false)=><a key={item[1]} href={`#${item[1]}`} aria-current={active===item[1]?'location':undefined} className={secondary?styles.secondary:undefined} onClick={()=>{setMenu(false);setMore(false)}}>{item[0]}<ArrowUpRight size={secondary?13:16}/></a>;
 return <><header className={styles.header} data-compact={compact}>
  <a href="#home" className={styles.brand} aria-label="Craftech360 home"><img src="/assets/brand/craftech360-logo.png" width="24" height="29" alt=""/><span>craftech360</span></a>
  <nav aria-label="Main navigation" className={styles.primary}>{main.map(item=>link(item))}<div className={styles.more} ref={moreRoot}><button aria-label="More destinations" aria-expanded={more} aria-controls="nav-more" onClick={()=>setMore(!more)}>More <Plus size={12}/></button>{more&&<div id="nav-more" className={styles.dropdown}>{extra.map(item=>link(item,true))}</div>}</div></nav>
  <a href="#contact" className={styles.cta}>LET’S TALK <ArrowUpRight size={16}/></a>
  <button ref={toggle} className={styles.toggle} aria-label="Open menu" aria-expanded={menu} aria-controls="navigation-panel" onClick={()=>setMenu(true)}><Menu size={23}/></button>
 </header>
 {menu&&<div ref={panel} id="navigation-panel" role="dialog" aria-modal="true" aria-label="Navigation" className={styles.panel}><div className={styles.panelTop}><span>CRAFTECH360 / EXPLORE</span><button aria-label="Close menu" onClick={()=>{setMenu(false);toggle.current?.focus({preventScroll:true})}}><X size={24}/></button></div><nav aria-label="Mobile main navigation">{main.map(item=>link(item))}</nav><div className={styles.secondaryLinks}>{extra.map(item=>link(item,true))}</div><a href="#contact" className={styles.panelCta} onClick={()=>setMenu(false)}>LET’S CREATE SOMETHING EXTRAORDINARY <ArrowUpRight size={20}/></a></div>}
 </>;
}
