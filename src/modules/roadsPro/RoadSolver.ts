export type Station={pk:number;cut:number;fill:number}
export type ProfilePoint={pk:number;terrain:number;grade:number}
export type CrossSection={pk:number;cut:number;fill:number}
export type MassPoint={pk:number;mass:number}

export function curveRadius(V:number,e:number,f:number){
  const R=V*V/(127*Math.max(e+f,1e-9))
  return {R}
}
export function horizontalCurve(R:number,deltaDeg:number){
  const d=deltaDeg*Math.PI/180,T=R*Math.tan(d/2),L=R*d,E=R*(1/Math.cos(d/2)-1),M=R*(1-Math.cos(d/2))
  return{T,L,E,M}
}
export function stoppingSightDistance(V:number,reaction:number,gradePct:number,friction:number){
  const v=V/3.6,grade=gradePct/100
  const reactionDist=v*reaction
  const decel=9.81*Math.max(friction+grade,.03)
  const braking=v*v/(2*decel)
  return{reaction:reactionDist,braking,total:reactionDist+braking}
}
export function verticalCurve(g1:number,g2:number,L:number){
  const A=Math.abs(g2-g1)
  return{A,K:A>1e-9?L/A:Infinity,deltaH:(g1+g2)/200*L}
}
export function roadCrossSection(lanes:number,lane:number,shoulder:number,median:number=0){
  const carriage=lanes*lane,total=carriage+2*shoulder+median
  return{carriage,total}
}
export function earthworks(length:number,cutArea:number,fillArea:number){
  return {cut:length*cutArea,fill:length*fillArea,balance:length*(cutArea-fillArea)}
}
export function earthworksStations(stations:Station[]){
  let cut=0,fill=0
  for(let i=0;i<stations.length-1;i++){
    const a=stations[i],b=stations[i+1],L=Math.max(0,b.pk-a.pk)
    cut+=L*(a.cut+b.cut)/2
    fill+=L*(a.fill+b.fill)/2
  }
  return{cut,fill,balance:cut-fill}
}
export function profileToCrossSections(points:ProfilePoint[],platformWidth:number,sideSlopeCut:number,sideSlopeFill:number):CrossSection[]{
  return points.map(p=>{
    const h=p.terrain-p.grade
    if(h>0){
      const cut=Math.max(0,h*platformWidth+h*h*Math.max(sideSlopeCut,0))
      return{pk:p.pk,cut,fill:0}
    }
    const hf=Math.abs(h)
    const fill=Math.max(0,hf*platformWidth+hf*hf*Math.max(sideSlopeFill,0))
    return{pk:p.pk,cut:0,fill}
  })
}
export function massHaul(sections:CrossSection[],swellPct:number=0,shrinkPct:number=0):MassPoint[]{
  let mass=0
  const pts:MassPoint[]=[]
  if(!sections.length)return pts
  pts.push({pk:sections[0].pk,mass:0})
  for(let i=0;i<sections.length-1;i++){
    const a=sections[i],b=sections[i+1],L=Math.max(0,b.pk-a.pk)
    const cut=L*(a.cut+b.cut)/2*(1+swellPct/100)
    const fillGeom=L*(a.fill+b.fill)/2
    const fillNeed=fillGeom/Math.max(1-shrinkPct/100,.05)
    mass+=cut-fillNeed
    pts.push({pk:b.pk,mass})
  }
  return pts
}
export function pavementQuantities(area:number,layers:{name:string,t:number}[]){
  return layers.map(x=>({...x,volume:area*x.t}))
}
export function roundaboutGeometry(Dext:number,Dins:number){
  return {ring:(Dext-Dins)/2,area:Math.PI*(Dext*Dext-Dins*Dins)/4}
}


export function rationalFlow(C:number,intensityMmH:number,areaHa:number){
  const Q=0.0027777778*C*intensityMmH*areaHa
  return{Q}
}
export function trapezoidalDitchFlow(b:number,y:number,z:number,slope:number,n:number){
  const A=y*(b+z*y)
  const P=b+2*y*Math.sqrt(1+z*z)
  const Rh=A/Math.max(P,1e-9)
  const Q=(1/Math.max(n,1e-9))*A*Math.pow(Rh,2/3)*Math.sqrt(Math.max(slope,0))
  const v=Q/Math.max(A,1e-9)
  const top=b+2*z*y
  return{A,P,Rh,Q,v,top}
}
export function circularCulvertFullFlow(D:number,slope:number,n:number){
  const A=Math.PI*D*D/4
  const Rh=D/4
  const Q=(1/Math.max(n,1e-9))*A*Math.pow(Rh,2/3)*Math.sqrt(Math.max(slope,0))
  const v=Q/Math.max(A,1e-9)
  return{A,Rh,Q,v}
}
export function runoffTimeKirpich(lengthM:number,deltaHM:number){
  const S=Math.max(deltaHM/Math.max(lengthM,1e-9),1e-6)
  const tcMin=0.0195*Math.pow(lengthM,0.77)*Math.pow(S,-0.385)
  return{tcMin,S}
}
export function drainageSpacing(totalLength:number,spacing:number){
  if(totalLength<=0||spacing<=0)return[]
  const pts:number[]=[]
  for(let x=0;x<=totalLength+1e-9;x+=spacing)pts.push(Math.min(x,totalLength))
  if(pts[pts.length-1]!==totalLength)pts.push(totalLength)
  return pts
}

export type DrainageNode={pk:number;ground:number;invert:number}
export function drainageLongProfile(nodes:DrainageNode[],diameter:number,n:number){
  return nodes.slice(0,-1).map((a,i)=>{
    const b=nodes[i+1],L=Math.max(b.pk-a.pk,1e-9),S=(a.invert-b.invert)/L
    const hyd=circularCulvertFullFlow(diameter,Math.max(S,0),n)
    return{from:a.pk,to:b.pk,L,S,coverA:a.ground-a.invert-diameter,coverB:b.ground-b.invert-diameter,Q:hyd.Q,v:hyd.v}
  })
}
export function interpolateProfile(points:ProfilePoint[],pk:number,key:'terrain'|'grade'){
  if(!points.length)return 0
  if(pk<=points[0].pk)return points[0][key]
  if(pk>=points[points.length-1].pk)return points[points.length-1][key]
  for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1];if(pk>=a.pk&&pk<=b.pk){const t=(pk-a.pk)/(b.pk-a.pk);return a[key]+t*(b[key]-a[key])}}
  return points[0][key]
}


export type XYPoint={x:number;y:number}
export type AlignmentVertex={x:number;y:number}
export type XYDrainageElement={
  id:string
  kind:'Caixa'|'Sumidouro'|'Valeta'|'Aqueduto'|'Descarga'
  x:number
  y:number
  pk:number
  offset:number
  side:'E'|'D'|'T'
}

export function alignmentLengths(vertices:AlignmentVertex[]){
  const seg:number[]=[]
  let total=0
  for(let i=0;i<vertices.length-1;i++){
    const a=vertices[i],b=vertices[i+1]
    const L=Math.hypot(b.x-a.x,b.y-a.y)
    seg.push(L); total+=L
  }
  return{seg,total}
}

export function pointAtPk(vertices:AlignmentVertex[],pk:number){
  if(!vertices.length)return{x:0,y:0,tx:1,ty:0,nx:0,ny:1,pk:0}
  if(vertices.length===1)return{x:vertices[0].x,y:vertices[0].y,tx:1,ty:0,nx:0,ny:1,pk:0}
  const {seg,total}=alignmentLengths(vertices)
  const target=Math.max(0,Math.min(pk,total))
  let acc=0
  for(let i=0;i<seg.length;i++){
    const L=Math.max(seg[i],1e-9)
    if(target<=acc+L || i===seg.length-1){
      const a=vertices[i],b=vertices[i+1],t=(target-acc)/L
      const tx=(b.x-a.x)/L,ty=(b.y-a.y)/L
      return{x:a.x+t*(b.x-a.x),y:a.y+t*(b.y-a.y),tx,ty,nx:-ty,ny:tx,pk:target}
    }
    acc+=L
  }
  const a=vertices[vertices.length-2],b=vertices[vertices.length-1],L=Math.max(Math.hypot(b.x-a.x,b.y-a.y),1e-9)
  const tx=(b.x-a.x)/L,ty=(b.y-a.y)/L
  return{x:b.x,y:b.y,tx,ty,nx:-ty,ny:tx,pk:total}
}

export function xyFromPkOffset(vertices:AlignmentVertex[],pk:number,offset:number){
  const p=pointAtPk(vertices,pk)
  return{x:p.x+p.nx*offset,y:p.y+p.ny*offset,pk:p.pk,offset}
}

export function projectXYToAlignment(vertices:AlignmentVertex[],x:number,y:number){
  if(vertices.length<2)return{x:vertices[0]?.x||0,y:vertices[0]?.y||0,pk:0,offset:0,distance:0}
  const {seg}=alignmentLengths(vertices)
  let best={x:vertices[0].x,y:vertices[0].y,pk:0,offset:0,distance:Infinity}
  let acc=0
  for(let i=0;i<vertices.length-1;i++){
    const a=vertices[i],b=vertices[i+1],vx=b.x-a.x,vy=b.y-a.y,L=Math.max(seg[i],1e-9)
    const t=Math.max(0,Math.min(1,((x-a.x)*vx+(y-a.y)*vy)/(L*L)))
    const px=a.x+t*vx,py=a.y+t*vy
    const dx=x-px,dy=y-py,d=Math.hypot(dx,dy)
    const tx=vx/L,ty=vy/L,nx=-ty,ny=tx
    const off=dx*nx+dy*ny
    if(d<best.distance)best={x:px,y:py,pk:acc+t*L,offset:off,distance:d}
    acc+=L
  }
  return best
}
