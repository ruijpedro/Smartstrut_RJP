export const rad=(d:number)=>d*Math.PI/180
export const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v))
export function fmt(v:number,d=2){return Number.isFinite(v)?v.toFixed(d):'—'}
export function safe(v:number,eps=1e-9){return Math.abs(v)<eps?(v<0?-eps:eps):v}
export function ec2Fyd(fyk:number,gammaS=1.15){return fyk/gammaS}
export function ec2Fcd(fck:number,alphaCC=0.85,gammaC=1.5){return alphaCC*fck/gammaC}
