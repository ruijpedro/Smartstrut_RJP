import {ec2Fcd,ec2Fyd} from '../../engineering/structuralMath'
export type FootingInput={N:number;Hx:number;Hy:number;Mx:number;My:number;B:number;L:number;h:number;cb:number;cl:number;cover:number;qAllow:number;mu:number;fck:number;fyk:number;phi:number}
export function isolatedFootingPro(i:FootingInput){
 const A=i.B*i.L,W=25*A*i.h,Ntot=i.N+W
 const ex=i.My/Math.max(Ntot,1e-9),ey=i.Mx/Math.max(Ntot,1e-9),kx=Math.abs(ex)<=i.B/6,ky=Math.abs(ey)<=i.L/6
 const q0=Ntot/A,qmax=q0*(1+6*Math.abs(ex)/i.B+6*Math.abs(ey)/i.L),qmin=q0*(1-6*Math.abs(ex)/i.B-6*Math.abs(ey)/i.L)
 const bearingUtil=qmax/Math.max(i.qAllow,1e-9),H=Math.hypot(i.Hx,i.Hy),slideResistance=i.mu*Ntot,slideFS=slideResistance/Math.max(H,1e-9)
 const overturnM=Math.hypot(i.Mx,i.My)+H*i.h,restoringM=Ntot*Math.min(i.B,i.L)/2,overturnFS=restoringM/Math.max(overturnM,1e-9)
 const d=Math.max(i.h-i.cover-i.phi/2000,.05),u=2*((i.cb+4*d)+(i.cl+4*d)),areaInside=(i.cb+4*d)*(i.cl+4*d),Vpun=Math.max(0,i.N-q0*areaInside),vEd=Vpun*1000/Math.max(u*d*1e6,1)
 const fcd=ec2Fcd(i.fck),fyd=ec2Fyd(i.fyk),rho=.005,k=Math.min(2,1+Math.sqrt(200/(d*1000))),vRd=.18/1.5*k*Math.pow(100*rho*i.fck,1/3),punchOK=vEd<=vRd
 const cx=Math.max((i.B-i.cb)/2,0),cy=Math.max((i.L-i.cl)/2,0),MxStrip=qmax*cx*cx/2,MyStrip=qmax*cy*cy/2,z=.9*d
 const AsMin=.0013*i.h*1e6,Asx=Math.max(AsMin,MxStrip*1e6/Math.max(fyd*z*1000,1)),Asy=Math.max(AsMin,MyStrip*1e6/Math.max(fyd*z*1000,1))
 const areaBar=Math.PI*i.phi*i.phi/4,spx=Math.max(75,Math.min(300,Math.floor(1000*areaBar/Asx/10)*10)),spy=Math.max(75,Math.min(300,Math.floor(1000*areaBar/Asy/10)*10))
 return {A,W,Ntot,ex,ey,kx,ky,q0,qmax,qmin,bearingUtil,H,slideResistance,slideFS,overturnM,restoringM,overturnFS,d,u,Vpun,vEd,vRd,punchOK,MxStrip,MyStrip,AsMin,Asx,Asy,spx,spy,ok:bearingUtil<=1&&qmin>=0&&slideFS>=1.5&&overturnFS>=1.5&&punchOK}
}
export function stripFooting(NperM:number,B:number,qAllow:number){const q=NperM/Math.max(B,1e-9);return{q,util:q/qAllow,ok:q<=qAllow}}
export function raftFoundation(N:number,A:number,qAllow:number){const q=N/Math.max(A,1e-9);return{q,util:q/qAllow,ok:q<=qAllow}}
export function pileGroup(N:number,nPiles:number,capPerPile:number,efficiency=.9){const cap=nPiles*capPerPile*efficiency;return{cap,util:N/Math.max(cap,1e-9),ok:N<=cap}}
