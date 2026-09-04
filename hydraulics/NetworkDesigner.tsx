import React,{useMemo,useState} from 'react'
import {FIXTURES} from './fixtures'
import {sizeWater,sizeSewer} from './network'
type Room={id:number,name:string,floor:number,counts:Record<string,number>}
export default function NetworkDesigner(){
 const[rooms,setRooms]=useState<Room[]>([{id:1,name:'WC 1',floor:0,counts:{lavatorio:1,sanita:1,duche:1}},{id:2,name:'Cozinha',floor:0,counts:{lava_loica:1,mll:1}}])
 const[L,setL]=useState(15),[slope,setSlope]=useState(2)
 const addRoom=()=>setRooms([...rooms,{id:Date.now(),name:`Divisão ${rooms.length+1}`,floor:0,counts:{}}])
 const totals=useMemo(()=>FIXTURES.map(f=>({f,n:rooms.reduce((a,r)=>a+(r.counts[f.id]||0),0)})),[rooms])
 const n=totals.reduce((a,x)=>a+x.n,0),qi=totals.reduce((a,x)=>a+x.n*x.f.water,0),qd=totals.reduce((a,x)=>a+x.n*x.f.waste,0)
 const ks=n<=1?1:Math.max(.20,1/Math.sqrt(n)),qw=qi*ks,qs=qd*(n<=1?1:Math.max(.25,1/Math.sqrt(n)))
 const minWaste=Math.max(40,...totals.filter(x=>x.n).map(x=>x.f.dnWaste))
 const wp=sizeWater(qw,L),sp=sizeSewer(qs,slope,minWaste)
 return <div className="network-designer">
 <section className="tech-card"><div className="card-title-row"><h3>DIVISÕES / PISOS</h3><button onClick={addRoom}>+ Divisão</button></div>
 <div className="room-grid">{rooms.map((r,ri)=><article className="room-card" key={r.id}>
 <div className="room-head"><input value={r.name} onChange={e=>setRooms(rooms.map(x=>x.id===r.id?{...x,name:e.target.value}:x))}/><label>Piso <input type="number" value={r.floor} onChange={e=>setRooms(rooms.map(x=>x.id===r.id?{...x,floor:+e.target.value}:x))}/></label><button onClick={()=>setRooms(rooms.filter(x=>x.id!==r.id))}>×</button></div>
 <div className="room-fixtures">{FIXTURES.map(f=><div key={f.id}><span>{f.name}</span><input type="number" min="0" value={r.counts[f.id]||0} onChange={e=>{const c={...r.counts,[f.id]:Math.max(0,+e.target.value)};setRooms(rooms.map(x=>x.id===r.id?{...x,counts:c}:x))}}/></div>)}</div>
 </article>)}</div></section>
 <section className="tech-card"><h3>TRAÇADO / PRÉ-DIMENSIONAMENTO</h3><div className="compact-fields"><label className="compact-field"><span>Comprimento equivalente água</span><div><input type="number" value={L} onChange={e=>setL(+e.target.value)}/><em>m</em></div></label><label className="compact-field"><span>Inclinação esgoto</span><div><input type="number" value={slope} onChange={e=>setSlope(+e.target.value)}/><em>%</em></div></label></div></section>
 <section className="network-summary"><article className="tech-card"><h3>ÁGUA</h3><R l="Q instalado" v={`${qi.toFixed(2)} L/s`}/><R l="Q cálculo preliminar" v={`${qw.toFixed(2)} L/s`}/><R l="DN sugerido" v={`DN ${wp.dn}`}/><R l="Velocidade" v={`${wp.v.toFixed(2)} m/s ${wp.v>=.5&&wp.v<=2?'✓':'⚠'}`}/><R l="Perda de carga" v={`${wp.hf.toFixed(2)} m.c.a.`}/></article>
 <article className="tech-card"><h3>ESGOTO</h3><R l="Q acumulado" v={`${qd.toFixed(2)} L/s`}/><R l="Q cálculo preliminar" v={`${qs.toFixed(2)} L/s`}/><R l="DN sugerido" v={`DN ${sp.dn}`}/><R l="Capacidade 1/2 secção" v={`${sp.qLs.toFixed(2)} L/s`}/><R l="Velocidade" v={`${sp.v.toFixed(2)} m/s`}/></article></section>
 <section className="tech-card"><h3>ESQUEMA AUTOMÁTICO</h3><svg viewBox="0 0 800 260" className="network-svg"><line x1="90" y1="205" x2="710" y2="205" stroke="#36c8c2" strokeWidth="7"/>{rooms.map((r,i)=>{const x=130+i*Math.min(150,540/Math.max(1,rooms.length-1));return <g key={r.id}><line x1={x} y1="85" x2={x} y2="205" stroke="#79a7c7" strokeWidth="4"/><rect x={x-48} y="42" width="96" height="42" rx="8" fill="#102536" stroke="#31516b"/><text x={x} y="68" textAnchor="middle" fill="#e7f2f8" fontSize="13">{r.name}</text></g>})}<text x="400" y="238" textAnchor="middle" fill="#7e9ab0">Coletor / distribuição principal — esquema conceptual</text></svg></section>
 <p className="reg-note">Pré-dimensionamento. A simultaneidade definitiva e os DN mínimos por aparelho devem ser validados pelas tabelas/curvas dos anexos regulamentares antes de projeto de execução.</p>
 </div>
}
const R=({l,v}:{l:string,v:string})=><div className="hyd-result"><span>{l}</span><b>{v}</b></div>
