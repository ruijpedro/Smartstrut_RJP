export function manningTrapezoid(b:number,y:number,z:number,n:number,S:number){
  const A=y*(b+z*y)
  const P=b+2*y*Math.sqrt(1+z*z)
  const R=A/Math.max(P,1e-9)
  const V=(1/n)*Math.pow(R,2/3)*Math.sqrt(S)
  return {A,P,R,V,Q:A*V}
}
export function circularFull(D:number,n:number,S:number){
  const A=Math.PI*D*D/4,P=Math.PI*D,R=A/P,V=(1/n)*Math.pow(R,2/3)*Math.sqrt(S)
  return {A,R,V,Q:A*V}
}
export function rational(C:number,i:number,Aha:number){
  const Q=0.00278*C*i*Aha
  return {Q}
}
