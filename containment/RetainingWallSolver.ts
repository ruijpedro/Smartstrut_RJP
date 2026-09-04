import {activeResultant} from '../../engineering/earthPressure'
import type {BaseSoil,WallCheck} from './types'

export type RCWallInput = BaseSoil & {
  H:number; B:number; toe:number; stem:number; baseT:number;
  gammaConcrete:number; waterH:number
}

export function solveRCWall(i:RCWallInput){
  const ep=activeResultant(i.gamma,i.H,i.phi,i.q)
  const Pa=ep.total
  const armSoil= i.H/3
  const stemW=i.stem*i.H*i.gammaConcrete
  const baseW=i.B*i.baseT*i.gammaConcrete
  const heel=Math.max(i.B-i.toe-i.stem,0)
  const soilW=heel*i.H*i.gamma
  const resistingMoment =
    stemW*(i.toe+i.stem/2)+baseW*(i.B/2)+soilW*(i.toe+i.stem+heel/2)
  const overturningMoment=Pa*armSoil
  const vertical=stemW+baseW+soilW
  const fsSlide=(i.mu*vertical)/Math.max(Pa,1e-9)
  const fsOT=resistingMoment/Math.max(overturningMoment,1e-9)
  const xR=(resistingMoment-overturningMoment)/Math.max(vertical,1e-9)
  const e=i.B/2-xR
  const qAvg=vertical/Math.max(i.B,1e-9)
  const qMax=qAvg*(1+6*e/i.B)
  const qMin=qAvg*(1-6*e/i.B)
  const checks:WallCheck[]=[
    {label:'Deslizamento',value:fsSlide,limit:1.5,ok:fsSlide>=1.5},
    {label:'Derrubamento',value:fsOT,limit:1.5,ok:fsOT>=1.5},
    {label:'Tensão máxima',value:qMax,limit:i.qAllow,ok:qMax<=i.qAllow,unit:'kPa'},
    {label:'Sem tração na base',value:qMin,limit:0,ok:qMin>=0,unit:'kPa'}
  ]
  return {ep,Pa,vertical,fsSlide,fsOT,e,qAvg,qMax,qMin,checks}
}

export function estimateStemSteel(MkNm:number,dM:number,fyd=435){
  const z=0.9*dM
  return (MkNm*1e6)/(Math.max(z*1000*fyd,1e-9))*1e6
}
