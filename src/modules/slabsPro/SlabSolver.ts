import {ec2Fyd} from '../../engineering/structuralMath'
export type SlabSupport='simple'|'continuous'
export type SlabInput={lx:number;ly:number;gk:number;qk:number;t:number;cover:number;fck:number;fyk:number;E:number;phi:number;support:SlabSupport}
const spacing=(As:number,phi:number)=>Math.max(50,Math.min(300,Math.floor((1000*Math.PI*phi*phi/4/Math.max(As,1))/10)*10))
export function solveSlab(i:SlabInput){
 const lx=Math.max(i.lx,.2),ly=Math.max(i.ly,.2),qEd=1.35*i.gk+1.5*i.qk,qSls=i.gk+i.qk,ratio=ly/lx,twoWay=ratio<2
 let ax=twoWay?.062:.125,ay=twoWay?.045:0
 if(i.support==='continuous'){ax*=.82;ay*=.82}
 const Mx=ax*qEd*lx*lx,My=ay*qEd*lx*lx,MnegX=i.support==='continuous'?.65*Mx:0,MnegY=i.support==='continuous'?.65*My:0
 const d=Math.max(i.t-i.cover-i.phi/2000,.04),z=.9*d,fyd=ec2Fyd(i.fyk),AsMin=.0013*i.t*1e6
 const steel=(M:number)=>Math.max(AsMin,Math.abs(M)*1e6/Math.max(z*1000*fyd,1))
 const Asx=steel(Mx),Asy=steel(My),AsNegX=steel(MnegX),AsNegY=steel(MnegY)
 const sx=spacing(Asx,i.phi),sy=spacing(Asy,i.phi),snx=spacing(AsNegX,i.phi),sny=spacing(AsNegY,i.phi)
 const I=1*Math.pow(i.t,3)/12,E=Math.max(i.E,1)*1e6
 const defl=twoWay?5*qSls*Math.pow(lx,4)/(384*E*I)*.55:5*qSls*Math.pow(lx,4)/(384*E*I)
 const deflLimit=lx/250,deflectionOK=defl<=deflLimit,spanDepth=lx/i.t
 const VEd=qEd*lx/2,vEd=VEd*1000/Math.max(1000*d*1000,1)
 return {qEd,qSls,ratio,twoWay,Mx,My,MnegX,MnegY,d,AsMin,Asx,Asy,AsNegX,AsNegY,sx,sy,snx,sny,defl,deflLimit,deflectionOK,spanDepth,VEd,vEd}
}