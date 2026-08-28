export type BeamDiagramInput={L:number;q:number;P:number;a:number;RA:number}
export type DiagramPoint={x:number,V:number,M:number}
export function beamDiagram(i:BeamDiagramInput,n=60):DiagramPoint[]{
  const pts:DiagramPoint[]=[]
  for(let k=0;k<=n;k++){
    const x=i.L*k/n
    const pointLoad=x>=i.a?i.P:0
    const V=i.RA-i.q*x-pointLoad
    const M=i.RA*x-i.q*x*x/2-(x>=i.a?i.P*(x-i.a):0)
    pts.push({x,V,M})
  }
  return pts
}
export function extrema(points:DiagramPoint[]){
  return {Vmax:Math.max(...points.map(p=>Math.abs(p.V))),Mmax:Math.max(...points.map(p=>Math.abs(p.M)))}
}
