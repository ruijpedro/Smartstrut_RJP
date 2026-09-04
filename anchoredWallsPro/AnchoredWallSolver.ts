export function rankineKa(phi:number){const s=Math.sin(phi*Math.PI/180);return (1-s)/(1+s)}
export function anchoredWall(H:number,gamma:number,phi:number,q:number,levels:number,spacing:number){
  const Ka=rankineKa(phi)
  const PaSoil=.5*Ka*gamma*H*H
  const PaQ=Ka*q*H
  const total=PaSoil+PaQ
  const n=Math.max(1,Math.round(levels))
  const anchorLine=total/n
  const anchorEach=anchorLine*spacing
  const Mmax=total*H/8
  return {Ka,total,anchorLine,anchorEach,Mmax}
}
export function bondLength(T:number,dGrout:number,tau:number){
  return T/Math.max(Math.PI*dGrout*tau,1e-9)
}
