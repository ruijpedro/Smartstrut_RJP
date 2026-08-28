import {ec2Fyd} from '../../engineering/structuralMath'
export type SupportType='simply'|'cantilever'|'fixed-fixed'|'propped'
export type LoadType='point'|'udl'|'moment'
export type BeamLoad={id:number;type:LoadType;value:number;x1:number;x2?:number}
export type BeamInput={L:number;support:SupportType;b:number;h:number;cover:number;fck:number;fyk:number;E:number;loads:BeamLoad[]}
export type Sample={x:number;V:number;M:number}

export function solveBeam(i:BeamInput){
 const L=Math.max(i.L,.1), loads=i.loads||[], I=i.b*Math.pow(i.h,3)/12
 let totalF=0,totalMomentA=0,appliedM=0
 for(const l of loads){
  if(l.type==='point'){totalF+=l.value;totalMomentA+=l.value*Math.max(0,Math.min(L,l.x1))}
  if(l.type==='udl'){const a=Math.max(0,Math.min(L,l.x1)),b=Math.max(a,Math.min(L,l.x2??L)),W=l.value*(b-a);totalF+=W;totalMomentA+=W*(a+b)/2}
  if(l.type==='moment')appliedM+=l.value
 }
 let RA=0,RB=0,Mleft=0,Mright=0
 if(i.support==='cantilever'){RA=totalF;Mleft=-(totalMomentA+appliedM)}
 else if(i.support==='simply'){RB=(totalMomentA+appliedM)/L;RA=totalF-RB}
 else if(i.support==='propped'){
   // force method: redundant at B from free-end deflection of cantilever
   let delta=0
   for(const l of loads){
    if(l.type==='point'){const a=Math.max(0,Math.min(L,l.x1));delta+=l.value*a*a*(3*L-a)/(6*i.E*1e6*I)}
    if(l.type==='udl'){
      const a=Math.max(0,Math.min(L,l.x1)),b=Math.max(a,Math.min(L,l.x2??L))
      const n=80,dx=(b-a)/n
      for(let k=0;k<n;k++){const x=a+(k+.5)*dx;delta+=(l.value*dx)*x*x*(3*L-x)/(6*i.E*1e6*I)}
    }
    if(l.type==='moment'){const a=Math.max(0,Math.min(L,l.x1));delta+=l.value*a*(2*L-a)/(2*i.E*1e6*I)}
   }
   RB=delta*3*i.E*1e6*I/Math.pow(L,3);RA=totalF-RB;Mleft=-(totalMomentA+appliedM-RB*L)
 }else{
   // fixed-fixed via numerical stiffness-compatible fixed end reactions for common loads
   let ma=0,mb=0,ra=0,rb=0
   for(const l of loads){
    if(l.type==='udl'){
      const a=Math.max(0,Math.min(L,l.x1)),b=Math.max(a,Math.min(L,l.x2??L)),n=100,dx=(b-a)/n
      for(let k=0;k<n;k++){const x=a+(k+.5)*dx,P=l.value*dx,aa=x,bb=L-x
       ma-=P*aa*bb*bb/(L*L);mb-=P*aa*aa*bb/(L*L)
      }
    }else if(l.type==='point'){const aa=Math.max(0,Math.min(L,l.x1)),bb=L-aa;ma-=l.value*aa*bb*bb/(L*L);mb-=l.value*aa*aa*bb/(L*L)}
    else {const x=Math.max(0,Math.min(L,l.x1)),t=x/L;ma-=l.value*(1-4*t+3*t*t);mb-=l.value*(-2*t+3*t*t)}
   }
   Mleft=ma;Mright=mb;RB=(totalMomentA+appliedM+Mleft-Mright)/L;RA=totalF-RB
 }
 const samples:Sample[]=[]
 for(let k=0;k<=120;k++){
  const x=L*k/120;let V=RA,M=Mleft+RA*x
  for(const l of loads){
   if(l.type==='point'&&x>=l.x1){V-=l.value;M-=l.value*(x-l.x1)}
   if(l.type==='udl'){const a=Math.max(0,l.x1),b=Math.min(L,l.x2??L),z=Math.max(0,Math.min(x,b)-a);if(z>0){V-=l.value*z;M-=l.value*z*(x-(a+z/2))}}
   if(l.type==='moment'&&x>=l.x1)M-=l.value
  }
  samples.push({x,V,M})
 }
 const Vmax=Math.max(...samples.map(s=>Math.abs(s.V))), Mmax=Math.max(...samples.map(s=>Math.abs(s.M)))
 const maxM=samples.reduce((a,b)=>Math.abs(b.M)>Math.abs(a.M)?b:a,samples[0])
 const Mpos=Math.max(0,...samples.map(s=>s.M))
 const Mneg=Math.min(0,...samples.map(s=>s.M))
 const d=Math.max(i.h-i.cover-.01,.05),z=.9*d,fyd=ec2Fyd(i.fyk)
 const bmm=i.b*1000,dmm=d*1000,hmm=i.h*1000
 const fctm=i.fck<=50?0.3*Math.pow(i.fck,2/3):2.12*Math.log(1+(i.fck+8)/10)
 const AsMin=Math.max(0.26*fctm/Math.max(i.fyk,1)*bmm*dmm,0.0013*bmm*dmm)
 const AsMax=0.04*bmm*hmm
 const AsReqPos=Mpos*1e6/Math.max(z*1000*fyd,1e-9)
 const AsReqNeg=Math.abs(Mneg)*1e6/Math.max(z*1000*fyd,1e-9)
 const AsBottom=Math.max(AsReqPos,AsMin)
 const AsTop=Math.max(AsReqNeg,AsMin)
 const AsReq=Math.max(AsReqPos,AsReqNeg),As=Math.max(AsReq,AsMin)
 const rhoWMin=0.08*Math.sqrt(Math.max(i.fck,0))/Math.max(i.fyk,1)
 const AswPerSMin=rhoWMin*bmm
 const AswPerSCalc=Vmax*1000/Math.max(z*1000*fyd,1e-9)
 const AswPerS=Math.max(AswPerSCalc,AswPerSMin)
 const deflectionLimit=L/250
 return {RA,RB,Mleft,Mright,Vmax,Mmax,maxM,Mpos,Mneg,samples,AsReq,AsReqPos,AsReqNeg,AsMin,AsMax,As,AsBottom,AsTop,AswPerS,AswPerSCalc,AswPerSMin,d,z,fctm,fyd,spanDepth:L/i.h,deflectionLimit}

}
