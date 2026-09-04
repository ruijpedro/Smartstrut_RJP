import React from 'react'
type Pt={x:number,V:number,M:number}
export function DiagramSvg({points,type}:{points:Pt[],type:'V'|'M'}){
  if(!points.length)return null
  const W=640,H=230,p=35,L=points[points.length-1].x||1
  const vals=points.map(x=>type==='V'?x.V:x.M), max=Math.max(1,...vals.map(Math.abs))
  const X=(x:number)=>p+(W-2*p)*x/L, Y=(v:number)=>H/2-v*(H*.36)/max
  const d=points.map((q,i)=>`${i?'L':'M'} ${X(q.x)} ${Y(type==='V'?q.V:q.M)}`).join(' ')
  return <svg viewBox={`0 0 ${W} ${H}`} className="eng-svg">
    <line x1={p} y1={H/2} x2={W-p} y2={H/2} stroke="#536b83" strokeWidth="1.5"/>
    <path d={`${d} L ${X(L)} ${H/2} L ${X(0)} ${H/2} Z`} fill={type==='V'?'rgba(56,189,248,.15)':'rgba(167,139,250,.15)'}/>
    <path d={d} fill="none" stroke={type==='V'?'#38bdf8':'#a78bfa'} strokeWidth="3"/>
    <text x="15" y="20" fill="#9fb3c8" fontSize="13">{type==='V'?'Esforço transverso V':'Momento fletor M'}</text>
  </svg>
}
