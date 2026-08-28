export function deg(v:number){ return v*Math.PI/180 }
export function rankineKa(phiDeg:number){
  const s=Math.sin(deg(phiDeg))
  return (1-s)/(1+s)
}
export function rankineKp(phiDeg:number){
  const s=Math.sin(deg(phiDeg))
  return (1+s)/(1-s)
}
export function activeResultant(gamma:number,H:number,phiDeg:number,q=0){
  const Ka=rankineKa(phiDeg)
  const soil=0.5*Ka*gamma*H*H
  const surcharge=Ka*q*H
  return {Ka,soil,surcharge,total:soil+surcharge}
}
