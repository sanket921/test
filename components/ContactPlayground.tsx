'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,RotateCcw} from 'lucide-react';
export default function ContactPlayground({onStart}:{onStart:()=>void}){
 const root=useRef<HTMLElement>(null),geometry=useRef<HTMLDivElement>(null);
 const [aligned,setAligned]=useState(false),[running,setRunning]=useState(false),[reduced,setReduced]=useState(false);
 useEffect(()=>{const mq=matchMedia('(prefers-reduced-motion:reduce)');const sync=()=>setReduced(mq.matches);sync();mq.addEventListener('change',sync);const observer=new IntersectionObserver(([e])=>setRunning(e.isIntersecting&&!document.hidden),{threshold:.12});if(root.current)observer.observe(root.current);const visibility=()=>{if(document.hidden)setRunning(false);else if(root.current){const r=root.current.getBoundingClientRect();setRunning(r.top<innerHeight&&r.bottom>0)}};document.addEventListener('visibilitychange',visibility);return()=>{mq.removeEventListener('change',sync);observer.disconnect();document.removeEventListener('visibilitychange',visibility)}},[]);
 const center=()=>{geometry.current?.style.setProperty('--idea-x','0deg');geometry.current?.style.setProperty('--idea-y','0deg')};
 return <section className="contact-playground section-pad" id="contact" ref={root}>
  <div className="contact-playground-top"><span className="section-label">07 / YOUR NEXT BIG IDEA</span><span className="micro">IDEAS DON’T STAND STILL. NEITHER DO WE.</span></div>
  <div className="contact-playground-grid"><div className="contact-playground-copy"><h2 className="reveal">LET’S CREATE<br/>SOMETHING<br/><em>EXTRAORDINARY.</em></h2><p>Every extraordinary experience starts with an idea. Tell us yours.</p><button className="contact-playground-cta" data-conversation-trigger onClick={onStart}><span>START THE CONVERSATION</span><ArrowUpRight size={27}/></button></div>
   <div className={`ideas-playground ${aligned?'ideas-aligned':''}`} data-running={running&&!reduced?'true':'false'}>
    <div className="ideas-geometry" ref={geometry} tabIndex={0} role="group" aria-label="Ideas in motion. Move your pointer or use the arrow keys to tilt the graphic." onPointerMove={e=>{if(reduced||e.pointerType==='touch'||!matchMedia('(pointer:fine)').matches)return;const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--idea-y',`${((e.clientX-r.left)/r.width-.5)*14}deg`);e.currentTarget.style.setProperty('--idea-x',`${-((e.clientY-r.top)/r.height-.5)*10}deg`)}} onPointerLeave={center} onBlur={center} onKeyDown={e=>{if(reduced)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key)){e.preventDefault();if(e.key==='Home')center();else{e.currentTarget.style.setProperty('--idea-y',e.key==='ArrowLeft'?'-7deg':e.key==='ArrowRight'?'7deg':'0deg');e.currentTarget.style.setProperty('--idea-x',e.key==='ArrowUp'?'-5deg':e.key==='ArrowDown'?'5deg':'0deg')}}}}>
     <div className="ideas-tilt"><svg viewBox="0 0 520 520" fill="none" aria-hidden="true">
      <path d="M260 15v20m0 450v20M15 260h20m450 0h20" stroke="#7f7b78" strokeWidth=".7"/>
      <circle cx="260" cy="260" r="220" stroke="#6d6a69" strokeWidth=".6" strokeDasharray="1 12"/>
      <g className="idea-ring idea-ring-one"><path d="M83 157a205 205 0 0 1 359 9M437 363A205 205 0 0 1 78 354" stroke="#c1bcb1" strokeWidth="1"/><circle cx="455" cy="197" r="4" fill="#f7a504"/></g>
      <g className="idea-ring idea-ring-two"><ellipse cx="260" cy="260" rx="166" ry="68" stroke="#d2cbbd" strokeWidth=".8"/><ellipse cx="260" cy="260" rx="166" ry="68" transform="rotate(60 260 260)" stroke="#d2cbbd" strokeWidth=".8"/><ellipse cx="260" cy="260" rx="166" ry="68" transform="rotate(120 260 260)" stroke="#d2cbbd" strokeWidth=".8"/></g>
      <g className="idea-links" stroke="#b8a17b" strokeWidth=".65"><path d="M95 260L260 95L425 260L260 425Z"/><path d="M95 260H425M260 95V425" opacity=".5"/></g>
      <g className="idea-node-track"><circle cx="260" cy="260" r="125" stroke="#f7a504" strokeOpacity=".28" strokeWidth=".7" strokeDasharray="180 605"/><circle cx="385" cy="260" r="4" fill="#f7a504"/></g>
      <g className="idea-centre"><circle cx="260" cy="260" r="14" stroke="#f7a504" strokeWidth=".8"/><circle cx="260" cy="260" r="3.5" fill="#f7a504"/><path d="M239 260h-16m58 0h16m-37-21v-16m0 58v16" stroke="#f7a504" strokeWidth=".7"/></g>
     </svg></div>
    </div>
    <div className="ideas-controls"><button className="ideas-gather" onClick={()=>setAligned(v=>!v)} aria-pressed={aligned}>{aligned?'RELEASE THE POSSIBILITIES':'BRING IDEAS TOGETHER'}<span aria-hidden="true">{aligned?'−':'+'}</span></button><button className="ideas-reset" aria-label="Reset ideas graphic" onClick={()=>{setAligned(false);center()}}><RotateCcw size={15}/></button></div>
    <p className="ideas-status micro" role="status">{aligned?'IDEAS, ALIGNED. YOUR VISION IS NEXT.':'MOVE TO EXPLORE / CLICK TO CONNECT THE DOTS'}</p>
   </div>
  </div>
  <div className="contact-bottom micro"><span>CREATIVITY MEETS POSSIBILITY.</span><span>YOUR VISION. OUR NEXT CHALLENGE.</span></div>
 </section>;
}
