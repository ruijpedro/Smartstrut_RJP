import {activeResultant} from '../../engineering/earthPressure'
export type BerlinInput={H:number;spacing:number;phi:number;gamma:number;q:number;anchorLevels:number;profileCap:number}
export function solveBerlin(i:BerlinInput){
  const ep=activeResultant(i.gamma,i.H,i.phi,i.q)
  const lineLoad=ep.total*i.spacing
  const levels=Math.max(0,Math.round(i.anchorLevels))
  const tributary=lineLoad/Math.max(levels+1,1)
  const maxMoment=lineLoad*i.H/8
  const utilization=maxMoment/Math.max(i.profileCap,1e-9)
  return {ep,lineLoad,levels,anchorLoad:tributary,maxMoment,utilization}
}
