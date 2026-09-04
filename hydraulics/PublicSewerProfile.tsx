import React,{useMemo,useState} from 'react'
import {sizeSewer} from './network'
import {loadPublicGraph} from './publicNetworkStore'
type MH={id:number,name:string,chain:number,ground:number,invert:number}
const N=({v,set,step=.01}:{v:number,set:(n:number)=>void,step?:number})=><input type="number" step={step} value={v} onChange={e=>set(+e.target.value)}/>
export default function PublicSewerProfile(){
 const[mhs,setMhs]=useState<MH[]>(()=>{
  const g=loadPublicGraph()
  const manholes=(g?.nodes||[]).filter(n=>n.kind==='manhole').sort((a,b)=>a.x-b.x)
  if(manholes.length>=2){
    let chain=0
    return manholes.map((n,i)=>{
      if(i>0){
        const prev=manholes[i-1]
        const edge=(g?.edges||[]).find(e=>(e.a===prev.id&&e.b===n.id)||(e.a===n.id&&e.b===prev.id))
        chain += edge?.L ?? Math.hypot(n.x-prev.x,n.y-prev.y)/12
      }
      return{id:n.id,name:`CV${i+1}`,chain,ground:n.ground??100-i*.2,invert:n.invert??98-i*.3}
    })
  }
  return[
   {id:1,name:'CV1',chain:0,ground:100.00,invert:98.20},
   {id:2,name:'CV2',chain:35,ground:99.65,invert:97.85},
   {id:3,name:'CV3',chain:75,ground:99.20,invert:97.30},
  ]
 })
 const[q,setQ]=useState(8),[dnMin,setDnMin]=useState(200)
 const sorted=[...mhs].sort((a,b)=>a.chain-b.chain)
 const segs=useMemo(()=>sorted.slice(0,-1).map((a,i)=>{
   const b=sorted[i+1],L=b.chain-a.chain,drop=a.invert-b.invert,s=L>0?drop/L*100:0
   const calc=sizeSewer(q,Math.max(s,.001),Math.max(200,dnMin))
   const coverA=a.ground-a.invert-calc.dn/1000,coverB=b.ground-b.invert-calc.dn/1000
   const guided=drop>0.50
   return{a,b,L,drop,s,...calc,coverA,coverB,guided}
 }),[mhs,q,dnMin])
 const minG=Math.min(...sorted.map(x=>x.invert))-1,maxG=Math.max(...sorted.map(x=>x.ground))+1
 const x=(ch:number)=>60+(ch-(sorted[0]?.chain||0))/Math.max(1,(sorted.length?sorted[sorted.length-1].chain:1)-(sorted[0]?.chain||0))*780
 const y=(z:number)=>420-(z-minG)/Math.max(.1,maxG-minG)*340
 const add=()=>{const last=sorted[sorted.length-1];setMhs([...mhs,{id:Date.now(),name:`CV${mhs.length+1}`,chain:(last?.chain||0)+30,ground:(last?.ground||100)-.2,invert:(last?.invert||98)-.3}])}
 return <div className="public-profile">
 <section className="tech-card"><div className="card-title-row"><h3>PERFIL LONGITUDINAL — SANEAMENTO PÚBLICO</h3><button onClick={add}>+ Câmara</button></div>
 <div className="compact-fields"><label><span>Caudal de projeto</span><div><N v={q} set={setQ}/><em>L/s</em></div></label><label><span>DN mínimo</span><div><N v={dnMin} set={setDnMin} step={1}/><em>mm</em></div></label></div>
 <div className="profile-inputs">{sorted.map(m=><div className="profile-row" key={m.id}><input value={m.name} onChange={e=>setMhs(mhs.map(x=>x.id===m.id?{...x,name:e.target.value}:x))}/><label>PK <N v={m.chain} set={v=>setMhs(mhs.map(x=>x.id===m.id?{...x,chain:v}:x))}/></label><label>Terreno <N v={m.ground} set={v=>setMhs(mhs.map(x=>x.id===m.id?{...x,ground:v}:x))}/></label><label>Soleira <N v={m.invert} set={v=>setMhs(mhs.map(x=>x.id===m.id?{...x,invert:v}:x))}/></label><span>Prof. {(m.ground-m.invert).toFixed(2)} m</span></div>)}</div></section>
 <section className="tech-card profile-canvas"><svg viewBox="0 0 900 470"><polyline points={sorted.map(m=>`${x(m.chain)},${y(m.ground)}`).join(' ')} fill="none" stroke="#8aa0ae" strokeWidth="3"/><polyline points={sorted.map(m=>`${x(m.chain)},${y(m.invert)}`).join(' ')} fill="none" stroke="#34ccc5" strokeWidth="6"/>{sorted.map(m=><g key={m.id}><line x1={x(m.chain)} y1={y(m.ground)} x2={x(m.chain)} y2={y(m.invert)} stroke="#c2d0d8" strokeWidth="4"/><circle cx={x(m.chain)} cy={y(m.invert)} r="7" fill="#34ccc5"/><text x={x(m.chain)} y={y(m.ground)-10} textAnchor="middle" fill="#e8f1f5" fontSize="12">{m.name}</text><text x={x(m.chain)} y="452" textAnchor="middle" fill="#7893a6" fontSize="11">{m.chain.toFixed(1)} m</text></g>)}{segs.map((s,i)=><text key={i} x={(x(s.a.chain)+x(s.b.chain))/2} y={(y(s.a.invert)+y(s.b.invert))/2-10} textAnchor="middle" fill="#e7f0f5" fontSize="11">DN{s.dn} · {s.s.toFixed(2)}%</text>)}</svg></section>
 <section className="tech-card"><h3>QUADRO DE TROÇOS</h3><div className="profile-segments">{segs.map((s,i)=><div className="profile-seg" key={i}><b>{s.a.name} → {s.b.name}</b><span>L {s.L.toFixed(2)} m</span><span>i {s.s.toFixed(2)}%</span><span>DN {Math.max(200,s.dn)}</span><span>v {s.v.toFixed(2)} m/s</span><span>Rec. {Math.min(s.coverA,s.coverB).toFixed(2)} m</span><span className={s.L<=60?'pass':'warn'}>{s.L<=60?'✓ distância CV':'⚠ >60 m'}</span><span className={s.guided?'warn':'pass'}>{s.guided?'⚠ verificar queda guiada':'✓ sem queda >0,50 m'}</span></div>)}</div></section>
 </div>
}
