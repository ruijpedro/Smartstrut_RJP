export const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x))
export const rad=(deg:number)=>deg*Math.PI/180

export function solveTimber(p:{b:number;h:number;L:number;fmK:number;fvK:number;fc0K:number;Emean:number;kmod:number;gammaM:number;MEd:number;VEd:number;NEd:number;qSls:number}){
  const A=p.b*p.h
  const W=p.b*p.h*p.h/6
  const I=p.b*Math.pow(p.h,3)/12
  const fmD=p.kmod*p.fmK/p.gammaM
  const fvD=p.kmod*p.fvK/p.gammaM
  const fcD=p.kmod*p.fc0K/p.gammaM
  const MRd=W*fmD/1e6
  const VRd=(2/3)*A*fvD/1000
  const NRd=A*fcD/1000
  const etaM=p.MEd/Math.max(MRd,1e-9)
  const etaV=p.VEd/Math.max(VRd,1e-9)
  const etaN=p.NEd/Math.max(NRd,1e-9)
  const interaction=etaM+etaN
  const q=p.qSls // kN/m = N/mm
  const Lmm=p.L*1000
  const defl=5*q*Math.pow(Lmm,4)/(384*p.Emean*I)
  const limit=Lmm/300
  return {A,W,I,fmD,fvD,fcD,MRd,VRd,NRd,etaM,etaV,etaN,interaction,defl,limit,ok:Math.max(etaM,etaV,interaction,defl/limit)<=1}
}

export function solveMasonry(p:{t:number;L:number;H:number;fk:number;gammaM:number;phi:number;NEd:number;VEd:number;fvK:number}){
  const A=p.t*p.L*1000
  const fd=p.fk/p.gammaM
  const fvd=p.fvK/p.gammaM
  const slender=p.H*1000/Math.max(p.t,1)
  const reduction=clamp(p.phi,0.15,1)
  const NRd=A*fd*reduction/1000
  const VRd=A*fvd/1000
  const etaN=p.NEd/Math.max(NRd,1e-9)
  const etaV=p.VEd/Math.max(VRd,1e-9)
  return {A,fd,fvd,slender,reduction,NRd,VRd,etaN,etaV,ok:Math.max(etaN,etaV)<=1}
}

export function solveComposite(p:{Wsteel:number;fy:number;beff:number;tslab:number;fck:number;lever:number;MEd:number;VEd:number;studRd:number;longShear:number}){
  const Msteel=p.Wsteel*1000*p.fy/1e6
  const C=0.85*p.fck*p.beff*p.tslab/1000 // kN
  const Mconc=C*p.lever/1000 // kN.m (lever mm)
  const MRd=Msteel+Mconc
  const etaM=p.MEd/Math.max(MRd,1e-9)
  const nStud=Math.max(1,Math.ceil(p.longShear/Math.max(p.studRd,1e-9)))
  const connRatio=nStud*p.studRd/Math.max(p.longShear,1e-9)
  const VRd=0.6*p.fy*(p.Wsteel*1000/Math.max(p.lever,1))/1000
  const etaV=p.VEd/Math.max(VRd,1e-9)
  return {Msteel,Mconc,MRd,etaM,nStud,connRatio,VRd,etaV,ok:Math.max(etaM,etaV)<=1 && connRatio>=1}
}

export function solveSeismic(p:{mass:number;ag:number;S:number;q:number;T:number;TB:number;TC:number;TD:number;lambda:number;floors:number;height:number}){
  const T=Math.max(.01,p.T), ag=p.ag*9.81
  let shape=1
  if(T<=p.TB) shape=1+(T/p.TB)*(2.5/p.q-1)
  else if(T<=p.TC) shape=2.5/p.q
  else if(T<=p.TD) shape=(2.5/p.q)*(p.TC/T)
  else shape=(2.5/p.q)*(p.TC*p.TD/(T*T))
  const Sd=ag*p.S*Math.max(shape,0.2)
  const Fb=p.mass*Sd*p.lambda
  const n=Math.max(1,Math.round(p.floors))
  const forces=Array.from({length:n},(_,i)=>{
    const z=p.height*(i+1)/n
    return {floor:i+1,z,weight:p.mass*9.81/n}
  })
  const den=forces.reduce((s,f)=>s+f.weight*f.z,0)
  const distribution=forces.map(f=>({...f,F:Fb*(f.weight*f.z)/Math.max(den,1e-9)}))
  const sumF=distribution.reduce((s,f)=>s+f.F,0)
  return {Sd,Fb,distribution,sumF,ok:Number.isFinite(Fb)&&Fb>0}
}

export function solveDeepFoundation(p:{d:number;L:number;qb:number;fs:number;gammaR:number;NEd:number;nPile:number;groupEff:number;Es:number;settleLoad:number}){
  const Ab=Math.PI*p.d*p.d/4
  const As=Math.PI*p.d*p.L
  const Rb=Ab*p.qb
  const Rs=As*p.fs
  const Rd=(Rb+Rs)/p.gammaR
  const groupRd=Rd*Math.max(1,p.nPile)*clamp(p.groupEff,.4,1)
  const etaSingle=p.NEd/Math.max(Rd,1e-9)
  const etaGroup=p.NEd/Math.max(groupRd,1e-9)
  const settlement=(p.settleLoad*1000*p.L)/(Math.max(p.Es,1)*1e3*Math.max(Ab,1e-6))*0.001
  return {Ab,As,Rb,Rs,Rd,groupRd,etaSingle,etaGroup,settlement,ok:etaGroup<=1}
}

export function solveSlope(p:{c:number;phi:number;W:number;alpha:number;u:number;L:number;kh:number;reinforcement:number}){
  const a=rad(p.alpha), ph=rad(p.phi)
  const N=p.W*Math.cos(a)-p.u*p.L
  const drive=p.W*Math.sin(a)+p.kh*p.W*Math.cos(a)
  const resist=p.c*p.L+Math.max(0,N)*Math.tan(ph)+p.reinforcement
  const FS=resist/Math.max(drive,1e-9)
  const FSdry=(p.c*p.L+p.W*Math.cos(a)*Math.tan(ph)+p.reinforcement)/Math.max(p.W*Math.sin(a),1e-9)
  return {N,drive,resist,FS,FSdry,waterPenalty:FSdry-FS,ok:FS>=1.5}
}

export function solveBridge(p:{L:number;gk:number;qk:number;gammaG:number;gammaQ:number;width:number;E:number;I:number;fatigueFactor:number}){
  const wEd=p.gammaG*p.gk+p.gammaQ*p.qk
  const MEd=wEd*p.L*p.L/8
  const VEd=wEd*p.L/2
  const R=VEd
  const wSls=p.gk+p.qk
  const Lmm=p.L*1000
  const qNmm=wSls
  const defl=5*qNmm*Math.pow(Lmm,4)/(384*Math.max(p.E,1)*Math.max(p.I,1))
  const limit=Lmm/800
  const fatigueM=p.fatigueFactor*p.qk*p.L*p.L/8
  return {wEd,MEd,VEd,R,defl,limit,fatigueM,ok:defl<=limit}
}
