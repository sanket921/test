'use client';
import {useEffect,useRef} from 'react';
import styles from './InteractiveHeroField.module.css';

const vertex = `
precision highp float;
attribute vec2 aPoint;
uniform vec2 uResolution;
uniform float uTime,uDpr,uMotion,uIntensity,uQuality;
uniform vec4 uTrail[20];
varying float vLight,vHeat,vAmber;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}
void main(){
 vec2 uv=aPoint,q=vec2(uv.x*uResolution.x/uResolution.y,uv.y)*3.8;
 float t=uTime*.028*uMotion;
 float n=noise(q*.78+vec2(t*.08,-t*.06));
 float region=smoothstep(.25,.85,noise(q*.55));
 vec2 warp=vec2(sin(q.y*2.1+q.x*.7)*.053+sin(q.x*1.9-q.y*1.5)*.030,
                sin(q.x*2.3+sin(q.y*1.6)*1.8)*.052+cos(q.y*1.8+q.x*.6)*.026);
 warp+=vec2(sin(q.y*1.8+t),cos(q.x*1.5-t*.7))*.008*region*uMotion;
 vec2 pixel=((uv-.5)*(1.+(n-.5)*.13)+.5+warp*uQuality)*uResolution;
 float heat=0.;vec2 displacement=vec2(0.);
 for(int i=0;i<20;i++){
  if(uTrail[i].z<.001)continue;
  vec2 delta=pixel-uTrail[i].xy;
  float radius=65.+uTrail[i].w*45.;
  float distance=length(delta)/radius;
  float influence=pow(max(0.,1.-distance*distance),3.)*uTrail[i].z;
  if(influence>heat){heat=influence;displacement=(-delta*.13+vec2(-delta.y,delta.x)*.18)*influence;}
 }
 pixel+=displacement*uIntensity;
 float seed=hash(aPoint*vec2(831.,543.));
 float crease=.5+.5*sin(q.x*3.2+q.y*1.4+n*7.5);
 float breath=(.5+.5*sin(q.x*1.6-q.y*1.2+uTime*.25))*.07*region*uMotion;
 float ambient=.28+.36*n+.15*crease+breath;
 float idleAmber=step(.9975,seed)*pow(max(0.,sin(uTime*.65+seed*200.)),10.)*.32*uMotion;
 vHeat=heat*uIntensity;
 vLight=clamp(ambient+vHeat*.85,.16,1.)*uIntensity;
 vAmber=max(smoothstep(.84,.88,seed)*smoothstep(.08,.38,vHeat),idleAmber);
 gl_Position=vec4(pixel/uResolution*2.-1.,0.,1.);
 gl_PointSize=(1.05+ambient*.48+vHeat*.6)*uDpr;
}`;
const fragment = `
precision mediump float;
varying float vLight,vHeat,vAmber;
void main(){
 float distance=length(gl_PointCoord-.5)*2.;
 float edge=1.-smoothstep(.48,1.,distance);if(edge<.01)discard;
 vec3 monochrome=mix(vec3(.4667,.4667,.4902),vec3(.94,.94,.92),smoothstep(.05,.9,vHeat));
 vec3 color=mix(monochrome,vec3(.9686,.6471,.0157),vAmber);
 gl_FragColor=vec4(color,edge*vLight);
}`;

type WakePoint={x:number;y:number;time:number;speed:number;gain:number};

/** Isolated first-frame halftone material. No React updates or ScrollTriggers per frame. */
export default function InteractiveHeroField(){
 const root=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const element=root.current,screen=canvas.current,opening=element?.closest<HTMLElement>('.cinema-opening');
  if(!element||!screen||!opening)return;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const memory=(navigator as Navigator & {deviceMemory?:number}).deviceMemory??8;
  if(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=2){element.dataset.renderer='static-fallback';element.dataset.motion='static';return;}
  const gl=screen.getContext('webgl',{alpha:true,antialias:false,depth:false,stencil:false,powerPreference:'low-power',preserveDrawingBuffer:true});
  if(!gl){element.dataset.renderer='static-fallback';return;}
  const shaders:WebGLShader[]=[];
  let program:WebGLProgram|null=null,buffer:WebGLBuffer|null=null;
  const release=()=>{if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);shaders.forEach(shader=>gl.deleteShader(shader));};
  const compile=(type:number,source:string)=>{
   const shader=gl.createShader(type);if(!shader)throw new Error('Unavailable shader');shaders.push(shader);
   gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error('Unavailable shader');return shader;
  };
  try{
   const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);
   program=gl.createProgram();if(!program)throw new Error('Unavailable program');
   gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Unavailable program');
   buffer=gl.createBuffer();if(!buffer)throw new Error('Unavailable buffer');
  }catch{release();element.dataset.renderer='static-fallback';return;}
  gl.useProgram(program);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  const attribute=gl.getAttribLocation(program,'aPoint');gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
  const uniform={resolution:gl.getUniformLocation(program,'uResolution'),time:gl.getUniformLocation(program,'uTime'),dpr:gl.getUniformLocation(program,'uDpr'),motion:gl.getUniformLocation(program,'uMotion'),intensity:gl.getUniformLocation(program,'uIntensity'),quality:gl.getUniformLocation(program,'uQuality'),trail:gl.getUniformLocation(program,'uTrail[0]')};
  let width=1,height=1,dpr=1,count=0,frame=0,intersects=true,progress=0,lost=false;
  let reduced=preference.matches,lowPower=false,lastDraw=0,elapsed=0,lastSample=0,lastPointer=0,samples=0;
  let fpsStart=0,frames=0,totalFrames=0,measuredFrames=0;
  let trail:WakePoint[]=[];
  const packed=new Float32Array(80);
  const pointer={x:0,y:0,targetX:0,targetY:0,speed:0,targetSpeed:0,gain:0,initialized:false,inside:false};
  const active=()=>intersects&&!document.hidden&&!opening.inert&&progress<.72&&!lost;
  const setState=(key:string,value:string)=>{if(element.dataset[key]!==value)element.dataset[key]=value;};
  const draw=(now:number)=>{
   frame=0;if(!active()){setState('running','false');return;}
   const interval=lowPower?1000/30:1000/60;
   if(!reduced&&lastDraw&&now-lastDraw<interval-1){frame=requestAnimationFrame(draw);return;}
   const dt=lastDraw?Math.min(.05,(now-lastDraw)/1000):1/60;lastDraw=now;
   if(!reduced)elapsed+=dt;
   const follow=1-Math.exp(-13*dt),cool=1-Math.exp(-3*dt);
   pointer.x+=(pointer.targetX-pointer.x)*follow;pointer.y+=(pointer.targetY-pointer.y)*follow;
   pointer.speed+=(pointer.targetSpeed-pointer.speed)*follow;
   const moving=pointer.inside&&now-lastPointer<140&&!reduced;
   const desired=moving?.65+pointer.speed*.35:0;
   pointer.gain+=(desired-pointer.gain)*(moving?follow:cool);
   const last=trail[trail.length-1];
   const travelling=last?Math.hypot(pointer.x-last.x,pointer.y-last.y)>.6:true;
   if(!reduced&&pointer.initialized&&pointer.gain>.04&&now-lastSample>32&&(travelling||moving)){
    trail.push({x:pointer.x,y:pointer.y,time:now,speed:pointer.speed,gain:pointer.gain});if(trail.length>20)trail.shift();lastSample=now;
   }
   trail=trail.filter(point=>now-point.time<1450);packed.fill(0);
   let wakeEnergy=0;
   for(let i=0;i<trail.length;i++){
    const point=trail[i],gain=Math.pow(1-(now-point.time)/1450,1.4)*point.gain;
    packed[i*4]=point.x;packed[i*4+1]=height-point.y;packed[i*4+2]=gain;packed[i*4+3]=point.speed;wakeEnergy=Math.max(wakeEnergy,gain);
   }
   const fade=1-Math.max(0,Math.min(1,(progress-.25)/.47));
   gl.uniform4fv(uniform.trail,packed);gl.uniform2f(uniform.resolution,width,height);gl.uniform1f(uniform.time,reduced?0:elapsed);
   gl.uniform1f(uniform.dpr,dpr);gl.uniform1f(uniform.motion,reduced?0:1);gl.uniform1f(uniform.intensity,fade);gl.uniform1f(uniform.quality,lowPower?.82:1);
   gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.POINTS,0,count);
   setState('renderer','webgl');setState('ready','true');setState('interaction',wakeEnergy>.04?(moving?'moving':'settling'):'idle');setState('motion',reduced?'reduced':'full');
   totalFrames++;frames++;
   if(!fpsStart)fpsStart=now;
   if(now-fpsStart>=1000){measuredFrames=Math.round(frames*1000/(now-fpsStart));element.dataset.fps=String(measuredFrames);element.dataset.frames=String(totalFrames);element.dataset.wakeEnergy=wakeEnergy.toFixed(2);fpsStart=now;frames=0;}
   setState('running',reduced?'false':'true');
   if(!reduced)frame=requestAnimationFrame(draw);
  };
  const schedule=()=>{if(!frame&&active())frame=requestAnimationFrame(draw);};
  const resize=()=>{
   const bounds=element.getBoundingClientRect();width=Math.max(1,bounds.width);height=Math.max(1,bounds.height);
   lowPower=width<900||memory<=4||(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4);
   dpr=Math.min(devicePixelRatio||1,lowPower?1.25:1.5);screen.width=Math.round(width*dpr);screen.height=Math.round(height*dpr);gl.viewport(0,0,screen.width,screen.height);
   const step=lowPower?7:4.8,cols=Math.ceil(width/step),rows=Math.ceil(height/step),capacity=(cols+30)*(rows+30);
   const scale=Math.min(1,Math.sqrt((lowPower?24000:85000)/capacity));
   const xCount=Math.max(1,Math.round(cols*scale)),yCount=Math.max(1,Math.round(rows*scale));
   const points=new Float32Array((xCount+30)*(yCount+30)*2);let index=0;
   for(let y=-15;y<yCount+15;y++)for(let x=-15;x<xCount+15;x++){points[index++]=x/xCount;points[index++]=y/yCount;}
   count=index/2;gl.bufferData(gl.ARRAY_BUFFER,points,gl.STATIC_DRAW);element.dataset.dots=String(count);element.dataset.quality=lowPower?'simplified':'desktop';element.dataset.targetFps=lowPower?'30':'60';lastDraw=0;schedule();
  };
  const move=(event:PointerEvent)=>{
   if(event.pointerType==='touch'||reduced||!active())return;
   const bounds=element.getBoundingClientRect(),now=performance.now(),x=event.clientX-bounds.left,y=event.clientY-bounds.top;
   if(x<0||x>width||y<0||y>height||(event.target instanceof Element&&event.target.closest('header,[role="dialog"]'))){pointer.inside=false;return;}
   const distance=pointer.initialized?Math.hypot(x-pointer.targetX,y-pointer.targetY):0;
   const delta=Math.max(8,Math.min(100,now-lastPointer));
   pointer.targetSpeed=Math.min(1,distance/delta/1.8);pointer.targetX=x;pointer.targetY=y;pointer.inside=true;
   if(!pointer.initialized){pointer.x=x;pointer.y=y;pointer.initialized=true;}
   lastPointer=now;element.dataset.pointerSamples=String(++samples);element.dataset.pointerPosition=`${Math.round(x)},${Math.round(y)}`;schedule();
  };
  const leave=()=>{pointer.inside=false;};
  const visibility=()=>{
   progress=parseFloat(getComputedStyle(opening).getPropertyValue('--opening-progress'))||0;
   if(!active()){cancelAnimationFrame(frame);frame=0;trail=[];pointer.gain=0;pointer.inside=false;pointer.initialized=false;lastDraw=0;setState('running','false');setState('interaction','idle');}
   else schedule();
  };
  const preferenceChanged=()=>{reduced=preference.matches;trail=[];pointer.gain=0;pointer.initialized=false;pointer.inside=false;lastDraw=0;visibility();};
  const contextLost=(event:Event)=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;setState('renderer','static-fallback');setState('running','false');};
  const observer=new IntersectionObserver(([entry])=>{intersects=entry.isIntersecting;visibility();});observer.observe(element);
  const states=new MutationObserver(visibility);states.observe(opening,{attributes:true,attributeFilter:['style','inert']});
  const sizing=new ResizeObserver(resize);sizing.observe(element);
  screen.addEventListener('webglcontextlost',contextLost);window.addEventListener('pointermove',move,{passive:true});opening.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',visibility);preference.addEventListener('change',preferenceChanged);
  visibility();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();states.disconnect();sizing.disconnect();window.removeEventListener('pointermove',move);opening.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',visibility);preference.removeEventListener('change',preferenceChanged);screen.removeEventListener('webglcontextlost',contextLost);release();};
 },[]);
 return <div ref={root} className={`opening-dotfield ${styles.root}`} data-field="kinetic-halftone" data-renderer="initializing" aria-hidden="true"><canvas ref={canvas} className={styles.canvas}/><div className={`opening-dotfield-shade ${styles.shade}`}/></div>;
}
