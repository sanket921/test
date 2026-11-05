export const technologies = [
  {name:'Orbit',category:'Kinetic choreography',description:'A new perspective. In constant motion.'},
  {name:'Helix',category:'Kinetic installation',description:'Sculptural movement with a rhythm of its own.'},
  {name:'DNA',category:'Kinetic installation',description:'Connected movements. Unexpected possibilities.'},
  {name:'Modular kinetics',category:'Moving geometry',description:'A different dimension to your story.'},
  {name:'HMRS',category:'Engineered motion',description:'Ideas brought to life through coordinated movement.'},
  {name:'Robotics',category:'Kinetic display',description:'A canvas that moves beyond the expected.'},
];
export type GalleryMotion = { progress:number; pointerX:number; pointerY:number; invalidate?:()=>void };
