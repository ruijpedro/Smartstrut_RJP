import {activeResultant} from '../../engineering/earthPressure'
export type GravityWallInput={H:number;B:number;top:number;gammaWall:number;gamma:number;phi:number;q:number;mu:number;qAllow:number}
export function solveGravityWall(i:GravityWallInput){
  const ep=activeResultant(i.gamma,i.H,i.phi,i.q)
  const area=(i.B+i.top)*i.H/2
  const W=area*i.gammaWall
  const Pa=ep.total
  const fsSlide=i.mu*W/Math.max(Pa,1e-9)
  const mr=W*i.B*0.45
  const mo=Pa*i.H/3
  const fsOT=mr/Math.max(mo,1e-9)
  const qAvg=W/Math.max(i.B,1e-9)
  return {ep,area,W,Pa,fsSlide,fsOT,qAvg}
}
