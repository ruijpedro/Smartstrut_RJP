export function eccentricFooting(N:number,Mx:number,My:number,B:number,L:number){
  const ex=My/Math.max(N,1e-9),ey=Mx/Math.max(N,1e-9),Beff=Math.max(B-2*Math.abs(ex),.01),Leff=Math.max(L-2*Math.abs(ey),.01)
  return {ex,ey,Beff,Leff,Aeff:Beff*Leff,qeff:N/(Beff*Leff)}
}
export function settlementLayered(q:number,B:number,layers:{H:number;E:number;nu:number}[]){
  const parts=layers.map(l=>q*B*(1-l.nu*l.nu)/Math.max(l.E,1e-9)*(1-Math.exp(-l.H/Math.max(B,.1))))
  return {parts,total:parts.reduce((a,b)=>a+b,0)}
}
export function pileAxial(Q:number,shaft:number,base:number,fs=2){
  const ultimate=shaft+base
  return {ultimate,allowable:ultimate/fs,util:Q/Math.max(ultimate/fs,1e-9)}
}
