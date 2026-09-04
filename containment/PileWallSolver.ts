import {activeResultant,rankineKp} from '../../engineering/earthPressure'
export type PileWallInput={H:number;embed:number;spacing:number;diameter:number;gamma:number;phi:number;q:number}
export function solvePileWall(i:PileWallInput){
  const ep=activeResultant(i.gamma,i.H,i.phi,i.q)
  const Kp=rankineKp(i.phi)
  const passive=0.5*Kp*i.gamma*i.embed*i.embed
  const activeLine=ep.total*i.spacing
  const passiveLine=passive*i.spacing
  const ratio=passiveLine/Math.max(activeLine,1e-9)
  return {ep,Kp,activeLine,passiveLine,ratio}
}
