import {activeResultant} from '../../engineering/earthPressure'
export type GabionInput={H:number;rows:number;boxH:number;boxW:number;gammaFill:number;gamma:number;phi:number;q:number;mu:number}
export function solveGabion(i:GabionInput){
  const rows=Math.max(1,Math.round(i.rows))
  const widthBottom=i.boxW+Math.max(0,rows-1)*0.25
  const volume=rows*i.boxW*i.boxH
  const W=volume*i.gammaFill
  const ep=activeResultant(i.gamma,i.H,i.phi,i.q)
  const fsSlide=i.mu*W/Math.max(ep.total,1e-9)
  const fsOT=(W*widthBottom*0.45)/Math.max(ep.total*i.H/3,1e-9)
  return {rows,widthBottom,volume,W,ep,fsSlide,fsOT}
}
