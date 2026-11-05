type ProductInput={id:string;name:string;file?:string;note:string};
export type Product=ProductInput & {mobileFile?:string;animations:string[];orientation:[number,number,number];fitHeight:number;lighting:'studio';availability:'available'|'missing'};
const pending='Authentic model asset pending. This empty display bay is reserved for the approved product.';
const entries:ProductInput[][]=[
 [{id:'orbit',name:'The Orbit',file:'orbit.glb',note:'Supplied Orbit model with the approved bearing choreography and LED treatment.'}],
 [{id:'helix',name:'HELIX',file:'helix-web.glb',note:'Authentic supplied assembly. Static product study; mechanical motion reference pending.'},{id:'tri-helix',name:'Tri-Helix',file:'tri-helix-web.glb',note:'Authentic supplied three-column assembly. Static product study; motion reference pending.'}],
 [{id:'dna-b2b',name:'DNA Back-to-Back · 4 Units',note:pending},{id:'dna-single',name:'DNA Single Unit',note:pending},{id:'sliding-dna',name:'Sliding DNA · 4 Units',note:pending},{id:'dna-supplied',name:'DNA · supplied assembly',file:'dna-supplied-web.glb',note:'Authentic DNA.glb. Variant identity awaits confirmation; no mechanical motion has been invented.'}],
 [{id:'hexora',name:'Hexora',file:'hexora-web.glb',note:'Authentic supplied Hexora assembly. Static product study; mechanical motion reference pending.'},{id:'tri-block-1',name:'Tri-Block V1',note:pending},{id:'tri-block-2',name:'Tri-Block V2',note:pending},{id:'matrix-3',name:'Matrix 3 × 3',note:pending},{id:'matrix-6',name:'Matrix 6 × 3',note:pending}],
 [{id:'hmrs-5',name:'HMRS · 5 Panel / Curved',note:pending},{id:'hmrs-4',name:'HMRS · 4 Panel / Sliding LED',note:pending}],
 [{id:'holofan',name:'Holofan on NovaBot',note:pending},{id:'kuka',name:'KUKA + Display',note:pending}],
];

export const catalogue:Product[][]=entries.map(group=>group.map(p=>({...p,mobileFile:p.file?.replace("-web.glb","-mobile.glb"),animations:[],orientation:[0,0,0],fitHeight:3.6,lighting:"studio",availability:p.file?"available":"missing"})));
