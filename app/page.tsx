'use client';
import {memo,useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import {selectedProjects} from '../components/work/data';
import Navigation from '../components/Navigation';
import ClientPrelude from '../components/ClientPrelude';
import CapabilityExperience from '../components/CapabilityExperience';
import CinematicHero from '../components/CinematicHero';
import TechnologyExhibition from '../components/TechnologyExhibition';
import ConversationPanel from '../components/ConversationPanel';
import WorkJourney from '../components/WorkJourney';
import ContactPlayground from '../components/ContactPlayground';
import IntersectionIntro from '../components/IntersectionIntro';
import ProcessEvolution from '../components/ProcessEvolution';
import ProcessStudioTransition from '../components/ProcessStudioTransition';
import {ArrowUpRight,Plus,X} from 'lucide-react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
const steps=['Ideate','Design','Engineer','Develop','Deploy'];
function Mark(){return <span className="brand">craftech<span className="brand360">360</span><i>✳</i></span>}
const Art=memo(function Art({variant=0}:{variant?:number}){return <div aria-hidden="true" className={`art art-${variant%6}`}><div className="art-grid"/>{Array.from({length:16},(_,i)=><i key={i} style={{'--i':i} as React.CSSProperties}/>)}<div className="art-base"/></div>});
export default function Home(){const root=useRef<HTMLDivElement>(null);const [detail,setDetail]=useState<{title:string;body:string}|null>(null);const [enquiry,setEnquiry]=useState(false);
useEffect(()=>{gsap.registerPlugin(ScrollTrigger);const mm=gsap.matchMedia();const ctx=gsap.context(()=>{mm.add('(prefers-reduced-motion: no-preference)',()=>{gsap.utils.toArray<HTMLElement>('.reveal').forEach(el=>gsap.from(el,{opacity:0,y:45,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 91%',once:true}}));});},root);return()=>{mm.revert();ctx.revert()}},[]);
useEffect(()=>{if(!detail)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';const el=document.querySelector<HTMLElement>('[role="dialog"]');const prior=document.activeElement as HTMLElement;el?.querySelector<HTMLElement>('button,input,a')?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setDetail(null)}if(e.key==='Tab'&&el){const f=Array.from(el.querySelectorAll<HTMLElement>('button,a,input,textarea'));const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=old;document.removeEventListener('keydown',key);prior?.focus({preventScroll:true})}},[detail]);
const nav=[['Home','home'],['Experiences','capabilities'],['Technologies','technologies'],['Our Work','work'],['About','about'],['Contact','contact']];
return <div ref={root}><a className="skip" href="#intro">Skip to content</a><Navigation/>
<main><CinematicHero>
<IntersectionIntro/>
</CinematicHero>
<ClientPrelude/>
<TechnologyExhibition onExplore={(title,body)=>setDetail({title,body})}/>
<WorkJourney onExplore={(title,body)=>setDetail({title,body})}/>
<CapabilityExperience/>
<ProcessStudioTransition>
<section className="process section-pad" id="process"><div className="section-label">05 / OUR PROCESS</div><div className="section-heading"><h2 className="reveal">FROM IDEA<br/>TO <em>EXPERIENCE.</em></h2><p>Curiosity starts it.<br/>Craft brings it to life.</p></div><ProcessEvolution/><div className="timeline">{steps.map((s,i)=><article className="reveal" key={s}><div className="step-line"><span>0{i+1}</span><Plus size={16}/></div><h3>{s}</h3><p>{['Find the spark. Understand your audience and the story you want to tell.','Shape the vision through concepts, spatial thinking, and interaction.','Translate creative ambition into precise physical and digital systems.','Prototype, build, and refine the experience through iteration.','Bring it all together on site, ready for the audience.'][i]}</p></article>)}</div></section>
<section className="people section-pad" id="about"><div className="section-label">06 / THE MINDS BEHIND THE MOVEMENT</div><div className="people-grid"><div><h2 className="reveal">BUILT BY PEOPLE<br/>WHO THINK<br/><em>BEYOND.</em></h2><p>Designers. Developers. Engineers. Makers.<br/>Different disciplines, one shared curiosity.</p><p>From the first sketch to the final installation, we bring creative design, software, engineering, prototyping, R&D, and project execution together.</p><a className="text-link" href="#contact">Build something with us <ArrowUpRight size={18}/></a></div><div className="studio-visual reveal"><div className="blueprint"><Art variant={4}/></div><span className="micro">THE STUDIO / CREATIVE ENGINEERING<br/>ABSTRACT STUDIO STUDY · TEAM PHOTOGRAPHY TO COME</span><span className="studio-cross">+</span></div></div></section>
</ProcessStudioTransition>
<ContactPlayground onStart={()=>setEnquiry(true)}/>
</main><footer><div><a href="#home" aria-label="Back to home"><Mark/></a><p>Technology, made experiential.</p></div><div className="footer-nav">{nav.slice(1).map(([s,id])=><a href={'#'+id} key={id}>{s}</a>)}</div><div className="footer-bottom micro"><span>© {new Date().getFullYear()} CRAFTECH360</span><span>DESIGNED TO MOVE YOU. <span className="orange">✳</span></span><a href="#home">BACK TO TOP ↑</a></div></footer>

{detail&&<div className="modal-backdrop" onClick={()=>setDetail(null)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e=>e.stopPropagation()}><button className="close" aria-label="Close dialog" onClick={()=>setDetail(null)}><X/></button><span className="section-label">EXPERIENCE PREVIEW</span><h2 id="modal-title">{detail.title}</h2>{selectedProjects.some(p=>p.name===detail.title)?<Image src={`/assets/projects/${selectedProjects.find(p=>p.name===detail.title)!.slug}-concept.svg`} alt="Original project media placeholder; not project footage" width={1200} height={675} unoptimized className="project-preview-media"/>:<div className="product-detail-note micro">PRODUCT STUDY / TECHNICAL DETAILS AVAILABLE ON REQUEST</div>}<p>{detail.body}</p><button className="button orange-button" onClick={()=>{setDetail(null);setEnquiry(true)}}>Discuss an experience <ArrowUpRight size={18}/></button></section></div>}
<ConversationPanel open={enquiry} onClose={()=>setEnquiry(false)}/>
</div>}
