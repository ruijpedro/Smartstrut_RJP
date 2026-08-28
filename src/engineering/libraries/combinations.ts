export type ActionSet={G:number;Q:number;W?:number}
export function eluFundamental(a:ActionSet){return 1.35*a.G+1.5*a.Q+1.5*(a.W||0)}
export function elsCharacteristic(a:ActionSet){return a.G+a.Q+(a.W||0)}
export function elsFrequent(a:ActionSet,psi1=.5,psi2=.3){return a.G+psi1*a.Q+psi2*(a.W||0)}
export function elsQuasiPermanent(a:ActionSet,psi2=.3){return a.G+psi2*a.Q}
