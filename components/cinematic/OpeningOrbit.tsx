'use client';
import {useEffect,useRef} from 'react';
import styles from './OpeningSignal.module.css';
/** A lightweight, original SVG motion study. No additional WebGL canvas. */
export default function OpeningOrbit() {
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    let frame=0;
    const update=()=>{frame=0;const element=root.current,opening=element?.closest<HTMLElement>('.cinema-opening');if(!element||!opening)return;const progress=parseFloat(getComputedStyle(opening).getPropertyValue('--opening-progress'))||0;const bounds=opening.getBoundingClientRect();element.dataset.active=String(progress<.34&&bounds.bottom>0&&bounds.top<innerHeight&&!document.hidden);};
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    window.addEventListener('scroll',schedule,{passive:true});document.addEventListener('visibilitychange',schedule);update();
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);document.removeEventListener('visibilitychange',schedule);};
  },[]);
  return <div ref={root} className={`opening-orbit ${styles.root}`} aria-hidden="true"><div className={styles.signal}>
    <div className="opening-orbit-tilt">
      <svg viewBox="0 0 320 320" fill="none">
        <path d="M160 8v16m0 272v16M8 160h16m272 0h16" stroke="#77777d" strokeWidth=".7"/>
        <circle cx="160" cy="160" r="130" stroke="#77777d" strokeWidth=".5" strokeDasharray="1 10"/>
        <g className="orbit-path-one"><path d="M48 95a130 130 0 0 1 230 13M272 225A130 130 0 0 1 42 212" stroke="#adaaa2" strokeWidth=".8"/></g>
        <g className="orbit-path-two"><ellipse cx="160" cy="160" rx="94" ry="40" transform="rotate(-35 160 160)" stroke="#a8a59d" strokeWidth=".7"/><path d="M151 160h18m-9-9v18" stroke="#f7a504" strokeWidth=".8"/></g>
        <g className={styles.calibration}><circle cx="160" cy="160" r="112" stroke="#99958a" strokeWidth=".5" strokeDasharray="28 42 7 60"/><path d="M160 41v9M160 270v9M41 160h9M270 160h9" stroke="#f7a504" strokeWidth=".7"/></g>
        <g className={styles.secondaryPoint}><circle cx="160" cy="48" r="1.8" fill="#f7a504"/></g>
        <g className="orbit-tracking-point"><circle cx="290" cy="160" r="3" fill="#f7a504"/><circle cx="290" cy="160" r="8" stroke="#f7a504" strokeOpacity=".3" strokeWidth=".6"/></g>
        <circle cx="160" cy="160" r="2" fill="#b8b5ae"/>
      </svg>
    </div>
    <span className="micro">STUDY 001 / KINETIC SIGNAL</span>
  </div></div>;
}
