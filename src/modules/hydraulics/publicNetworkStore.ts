export type PublicNode={
  id:number; kind:string; x:number; y:number; label:string;
  ground?:number; invert?:number
}
export type PublicEdge={
  id:number; a:number; b:number; L:number; slope:number; q:number; dnMin:number
}
export type PublicGraph={nodes:PublicNode[];edges:PublicEdge[]}
const KEY='smartstruct:public-sewer-graph'
export function savePublicGraph(g:PublicGraph){
  try{localStorage.setItem(KEY,JSON.stringify(g))}catch{}
}
export function loadPublicGraph():PublicGraph|null{
  try{const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw):null}catch{return null}
}
