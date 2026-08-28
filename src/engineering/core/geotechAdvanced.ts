const rad=(x:number)=>x*Math.PI/180
export function earthPressure(phi:number,beta=0){const p=rad(phi),b=rad(beta);return {Ka:Math.cos(b)*(Math.cos(b)-Math.sqrt(Math.max(0,Math.cos(b)**2-Math.cos(p)**2)))/(Math.cos(b)+Math.sqrt(Math.max(0,Math.cos(b)**2-Math.cos(p)**2))),Kp:(1+Math.sin(p))/(1-Math.sin(p))}}
export function consolidation(H:number,Cc:number,e0:number,sigma0:number,dsigma:number){return {settlement:H*Cc/(1+e0)*Math.log10((sigma0+dsigma)/sigma0)}}
export function effectiveStress(gamma:number,z:number,waterDepth:number){const total=gamma*z,u=z>waterDepth?9.81*(z-waterDepth):0;return {total,u,effective:total-u}}
export function bearingUtilization(qEd:number,qRd:number){return {util:qEd/Math.max(qRd,1e-9),ok:qEd<=qRd}}
