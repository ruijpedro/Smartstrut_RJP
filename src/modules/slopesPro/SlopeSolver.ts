export function deg(v:number){return v*Math.PI/180}
export function infiniteSlope(beta:number,phi:number,c:number,gamma:number,z:number,m:number=0){
  const b=deg(beta),p=deg(phi)
  const sigma=gamma*z*Math.cos(b)*Math.cos(b)
  const u=m*gamma*z*Math.cos(b)*Math.cos(b)
  const tau=gamma*z*Math.sin(b)*Math.cos(b)
  const FS=(c+(sigma-u)*Math.tan(p))/Math.max(tau,1e-9)
  return {sigma,u,tau,FS}
}

export function bishopApprox(beta:number,phi:number,c:number,gamma:number,H:number){
  const base=infiniteSlope(beta,phi,c,gamma,H*0.6,0)
  return {FS:base.FS*1.08}
}

export function felleniusApprox(beta:number,phi:number,c:number,gamma:number,H:number){
  const base=infiniteSlope(beta,phi,c,gamma,H*0.6,0)
  return {FS:base.FS*0.96}
}
