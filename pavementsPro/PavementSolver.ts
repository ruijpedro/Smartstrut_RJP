export type Layer={name:string,t:number,density:number}
export function pavementVolume(area:number,layers:Layer[]){
  return layers.map(l=>({...l,volume:area*l.t,mass:area*l.t*l.density}))
}
export function totalThickness(layers:Layer[]){
  return layers.reduce((s,l)=>s+l.t,0)
}
export function equivalentStructuralIndex(layers:Layer[],coeffs:number[]){
  return layers.reduce((s,l,i)=>s+l.t*1000*(coeffs[i]||1),0)
}
