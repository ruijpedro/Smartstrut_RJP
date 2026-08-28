import React,{useMemo,useState} from 'react'
import {sizeWater,sizeSewer} from './network'
type WSeg={id:number,name:string,qCold:number,qHot:number,L:number,dz:number}
type DSeg={id:number,name:string,q:number,s:number,minDn:number,kind:'ramal'|'queda'|'coletor'}
const R=({l,v}:{l:string,v:string})=><div className="hyd-result"><span>{l}</span><b>{v}</b></div>
export default function SegmentDesigner(){
 const[pin,setPin]=useState(300)
 const[ws,setWs]=useState<WSeg[]>([
  {id:1,name:'Contador → Coluna',qCold:.60,qHot:0,L:8,dz:0},
  {id:2,name:'Coluna → Piso 1',qCold:.45,qHot:.25,L:10,dz:3},
  {id:3,name:'Piso 1 → WC',qCold:.25,qHot:.15,L:7,dz:0},
 ])
 const[ds,setDs]=useState<DSeg[]>([
  {id:1,name:'WC → Tubo de queda',q:1.2,s:2,minDn:90,kind:'ramal'},
  {id:2,name:'Tubo de queda',q:2.2,s:0,minDn:90,kind:'queda'},
  {id:3,name:'Coletor → Caixa',q:2.2,s:2,minDn:100,kind:'coletor'},
 ])
 const water=useMemo(()=>{let p=pin;return ws.map(x=>{const q=x.qCold+x.qHot,r=sizeWater(q,x.L),loss=(r.hf+x.dz)*9.81;p-=loss;return{...x,...r,p}})},[ws,pin])
 return <div className="segment-page">
 <section className="tech-card"><div className="card-title-row"><h3>ÁGUA — DIMENSIONAMENTO TROÇO A TROÇO</h3><button onClick={()=>setWs([...ws,{id:Date.now(),name:'Novo troço',qCold:.1,qHot:0,L:5,dz:0}])}>+ Troço</button></div>
 <label className="compact-field segment-pin"><span>Pressão disponível à entrada</span><div><input type="number" value={pin} onChange={e=>setPin(+e.target.value)}/><em>kPa</em></div></label>
 <div className="segment-table"><div className="seg-head"><b>Troço</b><b>AF</b><b>AQS</b><b>L</b><b>Δz</b><b>DN</b><b>v</b><b>ΔH</b><b>P saída</b></div>
 {water.map((r,i)=><div className="seg-row" key={r.id}>
  <input value={r.name} onChange={e=>setWs(ws.map(x=>x.id===r.id?{...x,name:e.target.value}:x))}/>
  <Num v={r.qCold} set={v=>setWs(ws.map(x=>x.id===r.id?{...x,qCold:v}:x))}/><Num v={r.qHot} set={v=>setWs(ws.map(x=>x.id===r.id?{...x,qHot:v}:x))}/><Num v={r.L} set={v=>setWs(ws.map(x=>x.id===r.id?{...x,L:v}:x))}/><Num v={r.dz} set={v=>setWs(ws.map(x=>x.id===r.id?{...x,dz:v}:x))}/>
  <strong>DN {r.dn}</strong><span className={r.v>=.5&&r.v<=2?'pass':'warn'}>{r.v.toFixed(2)}</span><span>{(r.hf+r.dz).toFixed(2)}</span><span className={r.p>=50&&r.p<=600?'pass':'warn'}>{r.p.toFixed(0)} kPa</span>
 </div>)}</div></section>

 <section className="tech-card"><div className="card-title-row"><h3>ESGOTO — RAMAIS / QUEDAS / COLETORES</h3><button onClick={()=>setDs([...ds,{id:Date.now(),name:'Novo troço',q:.5,s:2,minDn:50,kind:'ramal'}])}>+ Troço</button></div>
 <div className="drain-segments">{ds.map(r=>{const calc=r.kind==='queda'?null:sizeSewer(r.q,r.s,r.minDn);return <article key={r.id}>
  <div className="drain-title"><input value={r.name} onChange={e=>setDs(ds.map(x=>x.id===r.id?{...x,name:e.target.value}:x))}/><select value={r.kind} onChange={e=>setDs(ds.map(x=>x.id===r.id?{...x,kind:e.target.value as any}:x))}><option value="ramal">Ramal</option><option value="queda">Tubo queda</option><option value="coletor">Coletor</option></select></div>
  <div className="compact-fields"><label><span>Q</span><Num v={r.q} set={v=>setDs(ds.map(x=>x.id===r.id?{...x,q:v}:x))}/></label>{r.kind!=='queda'&&<label><span>Inclinação %</span><Num v={r.s} set={v=>setDs(ds.map(x=>x.id===r.id?{...x,s:v}:x))}/></label>}<label><span>DN mínimo</span><Num v={r.minDn} set={v=>setDs(ds.map(x=>x.id===r.id?{...x,minDn:v}:x))}/></label></div>
  {calc?<div className="seg-results"><R l="DN sugerido" v={`DN ${calc.dn}`}/><R l="Capacidade 1/2 secção" v={`${calc.qLs.toFixed(2)} L/s`}/><R l="Velocidade" v={`${calc.v.toFixed(2)} m/s`}/><R l="Inclinação" v={`${r.s>=1&&r.s<=4?'✓':'⚠'} ${r.s.toFixed(1)} %`}/></div>:<div className="seg-results"><R l="DN mínimo" v={`DN ${Math.max(50,r.minDn)}`}/><R l="Ventilação primária" v="Obrigatória"/><R l="Ocupação" v="≤ 1/3 c/ vent. secundária"/></div>}
 </article>})}</div></section>

 <section className="tech-card"><h3>ESQUEMA FUNCIONAL</h3><svg viewBox="0 0 900 290" className="segment-svg"><text x="30" y="42" fill="#8fa7ba">CONTADOR</text><circle cx="100" cy="85" r="24" fill="#102a3b" stroke="#28c7c1" strokeWidth="3"/>{ws.map((r,i)=>{const x=150+i*200;return <g key={r.id}><line x1={x-25} y1="85" x2={x+135} y2="85" stroke="#28c7c1" strokeWidth="6"/><text x={x+55} y="68" textAnchor="middle" fill="#dceaf3" fontSize="12">{r.name}</text><text x={x+55} y="110" textAnchor="middle" fill="#7fa2b8" fontSize="11">DN {water[i]?.dn}</text></g>})}<line x1="120" y1="210" x2="800" y2="210" stroke="#a8b7c3" strokeWidth="7"/><text x="450" y="242" textAnchor="middle" fill="#7f98aa">DRENAGEM → COLETOR → CAIXA DE INSPEÇÃO</text></svg></section>
 </div>
}
const Num=({v,set}:{v:number,set:(n:number)=>void})=><input className="seg-num" type="number" step="any" value={v} onChange={e=>set(+e.target.value)}/>
