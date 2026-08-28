export function beamFlexureRect(MEd:number,b:number,h:number,cover:number,fck:number,fyk:number){
 const d=h-cover, fcd=.85*fck/1.5, fyd=fyk/1.15, z=.9*d
 const As=MEd*1e6/(fyd*z*1000), AsMin=Math.max(.26*(2.9/fyk)*b*d*1e6,.0013*b*d*1e6)
 return {d,z,As,AsMin,AsProvide:Math.max(As,AsMin)}
}
export function beamShear(VEd:number,b:number,h:number,cover:number,fck:number){
 const d=h-cover, v=VEd*1000/(b*d*1e6), limit=.18/1.5*Math.pow(100*0.01*fck,1/3)
 return {v,limit,ok:v<=limit}
}
export function columnSlenderness(L:number,b:number,h:number){
 const iy=h/Math.sqrt(12),ix=b/Math.sqrt(12)
 return {lambdaX:L/ix,lambdaY:L/iy}
}
export function slabOneWay(qEd:number,L:number,b=1){
 const M=qEd*L*L/8,V=qEd*L/2
 return {M,V,stripWidth:b}
}
