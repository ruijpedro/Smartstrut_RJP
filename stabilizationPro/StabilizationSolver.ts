export function soilNailCapacity(d:number,Lb:number,tau:number,fy:number){
  const bond=Math.PI*d*Lb*tau
  const steel=Math.PI*d*d/4*fy*1000
  return {bond,steel,capacity:Math.min(bond,steel)}
}
export function anchorCapacity(dGrout:number,Lb:number,tau:number,steelCap:number){
  const bond=Math.PI*dGrout*Lb*tau
  return {bond,capacity:Math.min(bond,steelCap)}
}
export function shotcreteVolume(area:number,t:number,waste:number){
  return {volume:area*t*(1+waste)}
}
export function drainCount(width:number,spacing:number){
  return {count:Math.max(1,Math.ceil(width/Math.max(spacing,.1)))}
}
