export function horizontalCurve(V:number,R:number,e:number){return {f:V*V/(127*Math.max(R,1e-9))-e}}
export function stoppingSightDistance(V:number,reaction=2.0,grade=0,friction=.35){
  const v=V/3.6,reactionD=v*reaction,brake=v*v/(2*9.81*Math.max(friction+grade,0.01)); return {reactionD,brake,total:reactionD+brake}
}
export function cycleRadius(V:number,e=.02,f=.20){return {R:V*V/(127*(e+f))}}
export function roundaboutDeflection(Dext:number,Dins:number,entryWidth:number){
  const ring=(Dext-Dins)/2;return {ring,ratio:ring/Math.max(entryWidth,.1)}
}
