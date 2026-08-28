export function deg(v:number){return v*Math.PI/180}
export function kaRankine(phi:number){const s=Math.sin(deg(phi));return (1-s)/(1+s)}
export function wallAdvanced(H:number,B:number,gamma:number,phi:number,q:number,mu:number,W:number,qAllow:number,waterH:number=0){
  const Ka=kaRankine(phi),PaSoil=.5*Ka*gamma*H*H,PaQ=Ka*q*H,Pw=.5*9.81*waterH*waterH
  const Hres=PaSoil+PaQ+Pw,Mover=PaSoil*H/3+PaQ*H/2+Pw*waterH/3,Mres=W*B*.5
  const fsSlide=mu*W/Math.max(Hres,1e-9),fsOT=Mres/Math.max(Mover,1e-9)
  const x=(Mres-Mover)/Math.max(W,1e-9),e=B/2-x,qavg=W/B,qmax=qavg*(1+6*e/B),qmin=qavg*(1-6*e/B)
  return {Ka,PaSoil,PaQ,Pw,Hres,Mover,Mres,fsSlide,fsOT,e,qavg,qmax,qmin,
  checks:{sliding:fsSlide>=1.5,overturning:fsOT>=1.5,bearing:qmax<=qAllow,noTension:qmin>=0}}
}
