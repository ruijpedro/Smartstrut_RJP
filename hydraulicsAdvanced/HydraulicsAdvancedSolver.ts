export function criticalDepthRect(Q:number,b:number){return Math.cbrt(Q*Q/(9.81*b*b))}
export function froude(V:number,Dh:number){return V/Math.sqrt(9.81*Math.max(Dh,1e-9))}
export function headLossDarcy(L:number,D:number,V:number,f=.02){return f*(L/D)*(V*V/(2*9.81))}
export function culvertCapacity(D:number,n:number,S:number){
  const A=Math.PI*D*D/4,R=D/4,V=(1/n)*Math.pow(R,2/3)*Math.sqrt(S); return {A,V,Q:A*V}
}
