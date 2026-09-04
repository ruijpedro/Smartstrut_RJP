import {ec2Fcd,ec2Fyd} from '../../engineering/structuralMath'
export type EndCondition='pinned'|'fixed-pinned'|'fixed-fixed'|'cantilever'|'custom'
export type ColumnInput={N:number;Mx:number;My:number;b:number;h:number;L:number;fck:number;fyk:number;E:number;cover:number;phi:number;k:number;end:EndCondition}
export function endK(end:EndCondition,custom:number){if(end==='pinned')return 1;if(end==='fixed-pinned')return .70;if(end==='fixed-fixed')return .50;if(end==='cantilever')return 2;return Math.max(.1,custom)}
export function solveColumn(i:ColumnInput){
 const b=Math.max(i.b,.05),h=Math.max(i.h,.05),A=b*h,Ix=b*Math.pow(h,3)/12,Iy=h*Math.pow(b,3)/12,rx=Math.sqrt(Ix/A),ry=Math.sqrt(Iy/A),kEff=endK(i.end,i.k),le=kEff*Math.max(i.L,.1)
 const lambdaX=le/rx,lambdaY=le/ry,E=Math.max(i.E,1)*1e6,NcrX=Math.PI*Math.PI*E*Ix/(le*le),NcrY=Math.PI*Math.PI*E*Iy/(le*le),ncr=Math.min(NcrX,NcrY)
 const eta=Math.min(.90,Math.max(0,i.N/Math.max(ncr,1e-9))),amp=1/(1-eta),Mx2=i.Mx*amp,My2=i.My*amp,fcd=ec2Fcd(i.fck),fyd=ec2Fyd(i.fyk)
 const sigN=i.N/A/1000,sigMax=sigN+Math.abs(Mx2)*6/(b*h*h)*.001+Math.abs(My2)*6/(h*b*b)*.001,AsMin=.002*A*1e6,AsMax=.04*A*1e6
 const flexSteel=Math.abs(Mx2)*1e6/Math.max(fyd*.8*h*1000,1)+Math.abs(My2)*1e6/Math.max(fyd*.8*b*1000,1),AsReq=Math.min(AsMax,Math.max(AsMin,flexSteel))
 const barArea=Math.PI*i.phi*i.phi/4,nBars=Math.max(4,Math.ceil(AsReq/Math.max(barArea,1))),AsProv=nBars*barArea,NRd=A*fcd*1000+AsProv/1e6*fyd*1000
 const interaction=Math.abs(i.N)/Math.max(NRd,1e-9)+Math.abs(Mx2)/Math.max(fcd*b*h*h/6*1000,1e-9)+Math.abs(My2)/Math.max(fcd*h*b*b/6*1000,1e-9)
 return {A,kEff,le,lambdaX,lambdaY,NcrX,NcrY,eta,amp,Mx2,My2,sigMax,AsMin,AsMax,AsReq,nBars,AsProv,interaction}
}