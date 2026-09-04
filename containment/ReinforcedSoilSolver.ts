import {activeResultant} from '../../engineering/earthPressure'
export type ReinforcedSoilInput={H:number;L:number;Sv:number;Sh:number;gamma:number;phi:number;q:number;tensile:number}
export function solveReinforcedSoil(i:ReinforcedSoilInput){
  const ep=activeResultant(i.gamma,i.H,i.phi,i.q)
  const layers=Math.max(1,Math.ceil(i.H/Math.max(i.Sv,0.1)))
  const demandPerLayer=ep.total/Math.max(layers,1)
  const capacity=i.tensile*Math.max(i.Sh,0.1)
  const fs=capacity/Math.max(demandPerLayer,1e-9)
  const Lratio=i.L/Math.max(i.H,1e-9)
  return {ep,layers,demandPerLayer,capacity,fs,Lratio}
}
