export type PipeResult={dn:number,v:number,hf:number,ok:boolean}
const dns=[12,16,20,25,32,40,50,63,75,90,100,110,125,140,160,200]
export function sizeWater(qLs:number,L:number,C=130):PipeResult{
 const q=Math.max(qLs,0)/1000
 for(const dn of dns){const d=dn/1000,A=Math.PI*d*d/4,v=A?q/A:0
  const hf=q?10.67*L*Math.pow(q,1.852)/(Math.pow(C,1.852)*Math.pow(d,4.87)):0
  if(v>=.5&&v<=2)return{dn,v,hf,ok:true}
 }
 const dn=dns[dns.length-1],d=dn/1000,A=Math.PI*d*d/4,v=A?q/A:0
 return{dn,v,hf:q?10.67*L*Math.pow(q,1.852)/(Math.pow(C,1.852)*Math.pow(d,4.87)):0,ok:false}
}
export function manningHalf(dn:number,sPct:number,n=.013){
 const d=dn/1000,A=Math.PI*d*d/8,R=d/4,S=sPct/100
 const Q=(1/n)*A*Math.pow(R,2/3)*Math.sqrt(Math.max(S,0)),v=A?Q/A:0
 return{qLs:Q*1000,v}
}
export function sizeSewer(qLs:number,sPct:number,minDn=40){
 const choices=[40,50,63,75,90,100,110,125,160,200,250,315]
 for(const dn of choices){if(dn<minDn)continue;const r=manningHalf(dn,sPct);if(r.qLs>=qLs)return{dn,...r,ok:true}}
 const dn=315;return{dn,...manningHalf(dn,sPct),ok:false}
}
