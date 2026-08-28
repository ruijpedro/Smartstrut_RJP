import type {Model2D,MemberResult,StructuralLoad,MemberLoad} from './types'

function isMemberLoad(l:StructuralLoad): l is MemberLoad {
  return 'member' in l
}

function memberLength(m:Model2D,memberId:number){
  const e=m.members.find(x=>x.id===memberId)
  if(!e)return 0
  const a=m.nodes.find(n=>n.id===e.a)
  const b=m.nodes.find(n=>n.id===e.b)
  if(!a||!b)return 0
  return Math.hypot(b.x-a.x,b.y-a.y)
}

export function equivalentGlobalLoads(m:Model2D){
  let Fx=0,Fy=0,M=0
  for(const l of m.loads){
    if(l.kind==='node-force'){
      Fx+=l.Fx||0
      Fy+=l.Fy||0
      continue
    }
    if(l.kind==='node-moment'){
      M+=l.M||0
      continue
    }

    if(!isMemberLoad(l))continue
    const L=memberLength(m,l.member)

    if(l.kind==='point') Fy-=Math.abs(l.P||0)
    else if(l.kind==='udl') Fy-=(l.q1||0)*L
    else if(l.kind==='triangular') Fy-=0.5*(l.q2||l.q1||0)*L
    else if(l.kind==='trapezoidal') Fy-=0.5*((l.q1||0)+(l.q2||0))*L
    else if(l.kind==='moment') M+=l.M||0
  }
  return {Fx,Fy,M}
}

export function analyseModel(m:Model2D){
  const totals=equivalentGlobalLoads(m)
  const supported=m.nodes.filter(n=>n.support && n.support!=='free')

  const reactions=supported.map((n,i)=>({
    node:n.id,
    Rx:i===0?-totals.Fx:0,
    Ry:-totals.Fy/Math.max(supported.length,1),
    M:n.support==='fixed'
      ? -totals.M/Math.max(supported.filter(x=>x.support==='fixed').length,1)
      : 0
  }))

  const members:MemberResult[]=m.members.map(e=>{
    const a=m.nodes.find(n=>n.id===e.a)!
    const b=m.nodes.find(n=>n.id===e.b)!
    const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)
    return {id:e.id,L,angle:angle*180/Math.PI,axialApprox:0}
  })

  return {
    totalFx:totals.Fx,
    totalFy:totals.Fy,
    totalM:totals.M,
    reactions,
    members
  }
}
