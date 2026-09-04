export type FixedProppedInput={L:number;q:number;P:number;a:number;E:number;I:number}
export function solveFixedPropped(i:FixedProppedInput){
 const L=Math.max(i.L,.01),a=Math.max(0,Math.min(i.a,L)),q=i.q||0,P=i.P||0
 const RB=3*q*L/8 + P*a*a*(3*L-a)/(2*L**3)
 const RA=q*L+P-RB
 const MA=-(q*L*L/2+P*a-RB*L)
 const V=(x:number)=>RA-q*x-(x>=a?P:0)
 const M=(x:number)=>MA+RA*x-q*x*x/2-(x>=a?P*(x-a):0)
 const n=160,points=[] as {x:number,V:number,M:number}[]
 for(let k=0;k<=n;k++){const x=L*k/n;points.push({x,V:V(x),M:M(x)})}
 const Vmax=Math.max(...points.map(p=>Math.abs(p.V))),Mmax=Math.max(...points.map(p=>Math.abs(p.M)))
 const dx=L/n,curv=points.map(p=>p.M*1000/Math.max(i.E*1e9*i.I,1e-12));let th=0,y=0;const raw=[{x:0,y:0}]
 for(let k=1;k<=n;k++){th+=.5*(curv[k-1]+curv[k])*dx;y+=th*dx;raw.push({x:points[k].x,y})}
 const drift=raw[raw.length-1].y,deflection=raw.map(p=>({x:p.x,y:p.y-drift*(p.x/L)})),ymax=Math.max(...deflection.map(p=>Math.abs(p.y)))
 return {RA,RB,MA,Vmax,Mmax,points,deflection,ymax}
}
