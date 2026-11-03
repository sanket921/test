'use client';
import {useEffect,useLayoutEffect,useRef,useState,type FormEvent} from 'react';
import gsap from 'gsap';
import {ArrowUpRight,ArrowDown,X} from 'lucide-react';
const types=['Kinetic Installation','Immersive Experience','Interactive Technology','AI Experience','Robotics','AR / VR / XR','Something Else'];
type Fields={name:string;company:string;email:string;type:string;idea:string};
export default function ConversationPanel({open,onClose}:{open:boolean;onClose:()=>void}){
 const [mounted,setMounted]=useState(false),[errors,setErrors]=useState<Partial<Record<keyof Fields,string>>>({}),[prepared,setPrepared]=useState(false),[reduced,setReduced]=useState(false);
 const [fields,setFields]=useState<Fields>({name:'',company:'',email:'',type:'',idea:''});
 const root=useRef<HTMLDivElement>(null),form=useRef<HTMLFormElement>(null),timeline=useRef<gsap.core.Timeline|null>(null),opener=useRef<HTMLElement|null>(null),close=useRef(onClose);
 close.current=onClose;
 useEffect(()=>{const mq=matchMedia('(prefers-reduced-motion:reduce)');const sync=()=>setReduced(mq.matches);sync();mq.addEventListener('change',sync);return()=>mq.removeEventListener('change',sync)},[]);
 useEffect(()=>{if(open){if(!mounted){opener.current=document.activeElement as HTMLElement;setMounted(true);setPrepared(false);}}},[open,mounted]);
 useLayoutEffect(()=>{
  if(!mounted)return;
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  const context=gsap.context(()=>{
   if(reduced)return;
   timeline.current=gsap.timeline({paused:true,defaults:{ease:'power3.inOut'}})
    .from('.conversation-shade',{opacity:0,duration:.35},0)
    .from('.conversation-boundary',{scaleX:0,transformOrigin:'left',duration:.45},.05)
    .from('.conversation-panel',{clipPath:'inset(50% 0 50% 0)',duration:.7},.25)
    .from('.conversation-statement .line-inner',{yPercent:110,duration:.65,stagger:.08},.6)
    .from('.conversation-field,.conversation-submit,.conversation-prototype',{opacity:0,y:16,duration:.5,stagger:.055},.7);
   gsap.to('.conversation-orbits',{rotation:18,duration:8,yoyo:true,repeat:-1,ease:'sine.inOut'});
  },root);
  root.current?.querySelector<HTMLElement>('.conversation-close')?.focus();
  const key=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();close.current();}
   if(e.key==='Tab'&&root.current){const list=Array.from(root.current.querySelectorAll<HTMLElement>('button,a,input,select,textarea,[tabindex="0"]')).filter(e=>!e.hasAttribute('disabled')&&e.getClientRects().length>0);const first=list[0],last=list[list.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}
  };
  document.addEventListener('keydown',key);
  return()=>{context.revert();timeline.current=null;document.body.style.overflow=previous;document.removeEventListener('keydown',key);const target=opener.current?.isConnected?opener.current:document.querySelector<HTMLElement>('[data-conversation-trigger]');target?.focus({preventScroll:true})};
 },[mounted,reduced]);
 useEffect(()=>{if(!mounted)return;if(open){timeline.current?.eventCallback('onReverseComplete',null);timeline.current?.play();}else if(reduced||!timeline.current){setMounted(false);}else{timeline.current.eventCallback('onReverseComplete',()=>setMounted(false));timeline.current.reverse();}},[open,mounted,reduced]);
 const change=(key:keyof Fields,value:string)=>{setFields(old=>({...old,[key]:value}));setErrors(old=>({...old,[key]:undefined}));setPrepared(false)};
 const submit=(e:FormEvent)=>{e.preventDefault();const next:Partial<Record<keyof Fields,string>>={};if(!fields.name.trim())next.name='Please enter your name.';if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()))next.email='Enter a valid email address.';if(!fields.type)next.type='Choose a project type.';if(fields.idea.trim().length<10)next.idea='Tell us a little more about your idea (at least 10 characters).';setErrors(next);if(Object.keys(next).length){form.current?.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();return;}setPrepared(true)};
 const download=()=>{const text=`CRAFTECH360 / PROJECT BRIEF\n\nName: ${fields.name.trim()}\nCompany: ${fields.company.trim()||'Not specified'}\nWork email: ${fields.email.trim()}\nProject type: ${fields.type}\n\nTHE IDEA\n${fields.idea.trim()}\n\nPrepared locally. No enquiry has been sent.`;const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='craftech360-project-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 const feedback=(key:keyof Fields)=>errors[key]?<span className="conversation-error" id={`enquiry-${key}-error`}>{errors[key]}</span>:null;
 if(!mounted)return null;
 return <div className="conversation" ref={root}>
  <div className="conversation-shade" onClick={()=>close.current()}/>
  <section className="conversation-panel" role="dialog" aria-modal="true" aria-labelledby="conversation-title" aria-describedby="conversation-description">
   <div className="conversation-boundary"/>
   <button className="conversation-close" aria-label="Close conversation" onClick={()=>close.current()}><span className="micro">CLOSE</span><X size={20}/></button>
   <div className="conversation-left" onPointerMove={e=>{if(reduced)return;const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--px',`${((e.clientX-r.left)/r.width-.5)*12}deg`);e.currentTarget.style.setProperty('--py',`${((e.clientY-r.top)/r.height-.5)*8}deg`);}} onPointerLeave={e=>{e.currentTarget.style.setProperty('--px','0deg');e.currentTarget.style.setProperty('--py','0deg')}}>
    <span className="micro conversation-label">A NEW POSSIBILITY / LET’S BUILD SOMETHING EXTRAORDINARY.</span>
    <h2 id="conversation-title" className="conversation-statement">{['BIG IDEAS','START WITH A','CONVERSATION.'].map((s,i)=><span className="conversation-line" key={s}><span className="line-inner">{i===2?<em>{s}</em>:s}</span></span>)}</h2>
    <p id="conversation-description">Tell us what you’re imagining. Let’s explore how technology can bring it to life.</p>
    <div className="conversation-graphic" aria-hidden="true"><svg className="conversation-orbits" viewBox="0 0 400 240"><g fill="none" stroke="currentColor" strokeWidth=".6">{[0,30,60,90,120,150].map(a=><ellipse key={a} cx="200" cy="120" rx="120" ry="48" transform={`rotate(${a} 200 120)`}/>)}</g><circle cx="200" cy="120" r="6" fill="#f7a504"/><path d="M 20 120 H 80 M 320 120 H 380 M 200 10 V 35 M 200 205 V 230" stroke="#f7a504" strokeWidth=".7"/></svg><span className="micro">THINK IT. SHAPE IT. MAKE IT REAL.</span></div>
   </div>
   <div className="conversation-right"><span className="micro conversation-form-label">YOUR NEXT BIG IDEA STARTS HERE ↙</span>
    <form ref={form} noValidate onSubmit={submit}>
     <div className="conversation-field-pair">
      <label className="conversation-field">Your Name <span aria-hidden="true">*</span><input name="name" autoComplete="name" value={fields.name} onChange={e=>change('name',e.target.value)} required aria-invalid={!!errors.name} aria-describedby={errors.name?'enquiry-name-error':undefined}/>{feedback('name')}</label>
      <label className="conversation-field">Company / Organization <small>optional</small><input name="company" autoComplete="organization" value={fields.company} onChange={e=>change('company',e.target.value)}/></label>
     </div>
     <label className="conversation-field">Work Email <span aria-hidden="true">*</span><input name="email" type="email" autoComplete="email" value={fields.email} onChange={e=>change('email',e.target.value)} required aria-invalid={!!errors.email} aria-describedby={errors.email?'enquiry-email-error':undefined}/>{feedback('email')}</label>
     <label className="conversation-field">Project Type <span aria-hidden="true">*</span><select name="type" value={fields.type} onChange={e=>change('type',e.target.value)} required aria-invalid={!!errors.type} aria-describedby={errors.type?'enquiry-type-error':undefined}><option value="">Select a possibility</option>{types.map(t=><option key={t}>{t}</option>)}</select>{feedback('type')}</label>
     <label className="conversation-field">Tell Us About Your Idea <span aria-hidden="true">*</span><textarea name="idea" rows={3} value={fields.idea} onChange={e=>change('idea',e.target.value)} required aria-invalid={!!errors.idea} aria-describedby={errors.idea?'enquiry-idea-error':undefined}/>{feedback('idea')}</label>
     <div className="conversation-prototype micro">FRONTEND PROTOTYPE / DELIVERY NOT CONNECTED<br/>Your details stay in this panel. Nothing is sent.</div>
     <button type="submit" className="conversation-submit">LET’S CONNECT <ArrowUpRight size={25}/></button>
     {prepared&&<div className="conversation-prepared" role="status"><p>Brief prepared locally. No enquiry has been sent.</p><button type="button" onClick={download}>Download your project brief <ArrowDown size={16}/></button></div>}
    </form>
   </div>
  </section>
 </div>;
}
