export function deg(v:number){return v*Math.PI/180}
export function rankineKa(phi:number){const s=Math.sin(deg(phi));return (1-s)/(1+s)}
export function rankineKp(phi:number){const s=Math.sin(deg(phi));return (1+s)/(1-s)}

export function correctSPT(N:number,energy=60,rod=1,borehole=1,sampler=1){
  const N60=N*(energy/60)*rod*borehole*sampler
  return {N60}
}

export function estimatePhiFromSPT(N60:number){
  return Math.max(22,Math.min(42,27+0.3*N60))
}

export function cptBasic(qc:number,fs:number){
  const Rf=qc>0?(fs/(qc*1000))*100:0
  let soil='Indeterminado'
  if(Rf<1) soil='Areia / areia limpa'
  else if(Rf<2) soil='Areia siltosa'
  else if(Rf<4) soil='Silte / mistura'
  else soil='Argila / solo fino'
  return {Rf,soil}
}

export function bearingCapacityStrip(c:number,phi:number,gamma:number,B:number,D:number){
  const ph=deg(phi)
  const Nq=Math.exp(Math.PI*Math.tan(ph))*Math.pow(Math.tan(Math.PI/4+ph/2),2)
  const Nc=phi===0?5.14:(Nq-1)/Math.tan(ph)
  const Ng=2*(Nq+1)*Math.tan(ph)
  const q=gamma*D
  const qult=c*Nc+q*Nq+0.5*gamma*B*Ng
  return {Nc,Nq,Ng,qult}
}

export function settlementElastic(q:number,B:number,E:number,nu:number){
  const s=q*B*(1-nu*nu)/Math.max(E,1e-9)
  return {s}
}

export function waterPressure(gammaW:number,h:number){
  return gammaW*h
}
