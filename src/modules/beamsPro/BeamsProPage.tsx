import React,{useMemo,useState} from 'react'
import {solveBeam,type SupportType,type BeamLoad} from './BeamSolver'
import {fmt} from '../../engineering/structuralMath'
const F=({l,v,s,u}:{l:string,v:number,s:(n:number)=>void,u?:string})=><label className="field"><span>{l}{u?` (${u})`:''}</span><input type="number" step="any" value={v} onChange={e=>s(+e.target.value)}/></label>
export default function BeamsProPage(){
 const[support,setSupport]=useState<SupportType>('simply'),[L,setL]=useState(6)
 const[b,setB]=useState(.30),[h,setH]=useState(.55),[cover,setCover]=useState(.035),[fck,setFck]=useState(30),[fyk,setFyk]=useState(500),[E,setE]=useState(30)
 const[loads,setLoads]=useState<BeamLoad[]>([{id:1,type:'udl',value:12,x1:0,x2:6}])
 const r=useMemo(()=>solveBeam({L,support,b,h,cover,fck,fyk,E,loads}),[L,support,b,h,cover,fck,fyk,E,loads])
 const add=(type:BeamLoad['type'])=>setLoads([...loads,{id:Date.now(),type,value:type==='moment'?20:type==='point'?25:10,x1:type==='udl'?0:L/2,x2:type==='udl'?L:undefined}])
 const upd=(id:number,p:Partial<BeamLoad>)=>setLoads(loads.map(x=>x.id===id?{...x,...p}:x))
 return <div className="module-page">
  <div className="module-head"><div><h2>Vigas PRO · V54</h2><p>Modelo estrutural, múltiplas ações, reações, diagramas V/M e pré-dimensionamento EC2.</p></div></div>
  <div className="tabs-row">{(['simply','cantilever','fixed-fixed','propped'] as SupportType[]).map(x=><button className={support===x?'active':''} onClick={()=>setSupport(x)} key={x}>{({simply:'Biapoiada',cantilever:'Consola','fixed-fixed':'Bi-encastrada',propped:'Encastrada-apoiada'} as any)[x]}</button>)}</div>
  <div className="work-grid">
   <section className="panel"><h3>Geometria / material</h3><div className="form-grid">
    <F l="Vão L" u="m" v={L} s={setL}/><F l="Largura b" u="m" v={b} s={setB}/><F l="Altura h" u="m" v={h} s={setH}/>
    <F l="Recobrimento" u="m" v={cover} s={setCover}/><F l="fck" u="MPa" v={fck} s={setFck}/><F l="fyk" u="MPa" v={fyk} s={setFyk}/><F l="E" u="GPa" v={E} s={setE}/>
   </div></section>
   <section className="panel"><h3>Modelo</h3><BeamSvg L={L} support={support} loads={loads}/></section>
  </div>
  <section className="panel"><h3>Ações</h3><div className="tabs-row"><button onClick={()=>add('udl')}>+ Carga distribuída</button><button onClick={()=>add('point')}>+ Carga pontual</button><button onClick={()=>add('moment')}>+ Momento</button></div>
   <div className="public-table">{loads.map(l=><div className="public-row" key={l.id}><b>{l.type==='udl'?'Distribuída':l.type==='point'?'Pontual':'Momento'}</b>
    <label>Valor <input type="number" value={l.value} onChange={e=>upd(l.id,{value:+e.target.value})}/>{l.type==='udl'?' kN/m':l.type==='point'?' kN':' kN·m'}</label>
    <label>x1 <input type="number" value={l.x1} onChange={e=>upd(l.id,{x1:+e.target.value})}/> m</label>
    {l.type==='udl'&&<label>x2 <input type="number" value={l.x2??L} onChange={e=>upd(l.id,{x2:+e.target.value})}/> m</label>}
    <button onClick={()=>setLoads(loads.filter(x=>x.id!==l.id))}>Apagar</button></div>)}</div>
  </section>
  <div className="result-grid"><Metric t="RA" v={`${fmt(r.RA)} kN`}/><Metric t="RB" v={`${fmt(r.RB)} kN`}/><Metric t="V |máx|" v={`${fmt(r.Vmax)} kN`}/><Metric t="M |máx|" v={`${fmt(r.Mmax)} kN·m`}/><Metric t="x Mmáx" v={`${fmt(r.maxM.x)} m`}/><Metric t="As prelim." v={`${fmt(r.As,0)} mm²`}/></div>
  <section className="panel"><h3>Diagramas</h3><Diagram title="Esforço transverso V (kN)" data={r.samples.map(s=>({x:s.x,y:s.V}))}/><Diagram title="Momento fletor M (kN·m)" data={r.samples.map(s=>({x:s.x,y:s.M}))}/></section>
  <section className="panel"><h3>Pré-dimensionamento</h3><div className="result-grid"><Metric t="As requerida" v={`${fmt(r.AsReq,0)} mm²`}/><Metric t="As mínima" v={`${fmt(r.AsMin,0)} mm²`}/><Metric t="d" v={`${fmt(r.d*1000,0)} mm`}/><Metric t="L/h" v={fmt(r.spanDepth,1)}/></div><p className="note">Resultados para estudo e pré-dimensionamento. Confirmar combinações, ELS/ELU e verificações regulamentares completas no projeto.</p></section>
 </div>
}
const Metric=({t,v}:{t:string,v:string})=><div className="metric"><span>{t}</span><b>{v}</b></div>
function Diagram({title,data}:{title:string,data:{x:number,y:number}[]}){
 const W=760,H=190,p=28,maxX=Math.max(...data.map(d=>d.x),1),maxY=Math.max(...data.map(d=>Math.abs(d.y)),1)
 const pts=data.map(d=>`${p+d.x/maxX*(W-2*p)},${H/2-d.y/maxY*(H/2-p)}`).join(' ')
 return <div style={{marginTop:12}}><b>{title}</b><svg viewBox={`0 0 ${W} ${H}`} className="eng-svg"><line x1={p} y1={H/2} x2={W-p} y2={H/2} stroke="#60788c"/><polyline points={pts} fill="none" stroke="#42d4cd" strokeWidth="3"/></svg></div>
}
function BeamSvg({L,support,loads}:{L:number,support:SupportType,loads:BeamLoad[]}){
 const x1=70,x2=520,y=150,w=x2-x1,px=(x:number)=>x1+w*Math.max(0,Math.min(x,L))/Math.max(L,.1)
 return <svg viewBox="0 0 590 250" className="eng-svg"><line x1={x1} y1={y} x2={x2} y2={y} stroke="#c7d5e6" strokeWidth="8"/>
  {(support==='cantilever'||support==='propped'||support==='fixed-fixed')&&<rect x="45" y="105" width="18" height="92" fill="#8295aa"/>}
  {support!=='cantilever'&&support!=='fixed-fixed'&&<polygon points={`${x2},${y+4} ${x2-14},${y+28} ${x2+14},${y+28}`} fill="#6fa8dc"/>}
  {support==='simply'&&<polygon points={`${x1},${y+4} ${x1-14},${y+28} ${x1+14},${y+28}`} fill="#6fa8dc"/>}
  {support==='fixed-fixed'&&<rect x="527" y="105" width="18" height="92" fill="#8295aa"/>}
  {loads.map(l=>l.type==='point'?<g key={l.id}><line x1={px(l.x1)} y1="55" x2={px(l.x1)} y2="130" stroke="#ef4444" strokeWidth="4"/><polygon points={`${px(l.x1)-7},122 ${px(l.x1)+7},122 ${px(l.x1)},137`} fill="#ef4444"/></g>:l.type==='udl'?<g key={l.id}>{Array.from({length:7}).map((_,i)=>{const x=(l.x1+(l.x2??L-l.x1)*i/6);return <line key={i} x1={px(x)} y1="80" x2={px(x)} y2="130" stroke="#f59e0b" strokeWidth="2"/>})}</g>:<text key={l.id} x={px(l.x1)} y="90" fill="#c084fc" fontSize="22">↻</text>)}
  <text x="250" y="220" fill="#9fb3c8">{L.toFixed(2)} m</text></svg>
}
