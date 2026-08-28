import React,{useMemo,useState} from 'react'
import {solveBeam,type SupportType,type BeamLoad} from './BeamSolver'
import {fmt} from '../../engineering/structuralMath'
import {chooseBars,chooseStirrups} from './ReinforcementLibrary'
const F=({l,v,s,u}:{l:string,v:number,s:(n:number)=>void,u?:string})=><label className="field"><span>{l}{u?` (${u})`:''}</span><input type="number" step="any" value={v} onChange={e=>s(+e.target.value)}/></label>
export default function BeamsProPage(){
 const[support,setSupport]=useState<SupportType>('simply'),[L,setL]=useState(6)
 const[b,setB]=useState(.30),[h,setH]=useState(.55),[cover,setCover]=useState(.035),[fck,setFck]=useState(30),[fyk,setFyk]=useState(500),[E,setE]=useState(30)
 const[loads,setLoads]=useState<BeamLoad[]>([{id:1,type:'udl',value:12,x1:0,x2:6}])
 const r=useMemo(()=>solveBeam({L,support,b,h,cover,fck,fyk,E,loads}),[L,support,b,h,cover,fck,fyk,E,loads])
 const reinforcement=useMemo(()=>{
   const bmm=b*1000,coverMm=cover*1000
   const bottom=chooseBars(r.AsBottom,bmm,coverMm,8)
   const top=chooseBars(r.AsTop,bmm,coverMm,8)
   const stirrup=chooseStirrups(r.AswPerS,r.d*1000,bmm)
   return{bottom,top,stirrup}
 },[r.AsBottom,r.AsTop,r.AswPerS,r.d,b,cover])
 const add=(type:BeamLoad['type'])=>setLoads([...loads,{id:Date.now(),type,value:type==='moment'?20:type==='point'?25:10,x1:type==='udl'?0:L/2,x2:type==='udl'?L:undefined}])
 const upd=(id:number,p:Partial<BeamLoad>)=>setLoads(loads.map(x=>x.id===id?{...x,...p}:x))
 return <div className="module-page">
  <div className="module-head"><div><h2>Vigas PRO</h2><p>Análise estrutural, diagramas V/M e dimensionamento preliminar de armaduras em betão armado.</p></div></div>
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
  <section className="panel"><h3>Dimensionamento de armaduras</h3>
   <div className="result-grid">
    <Metric t="M+ máx." v={`${fmt(r.Mpos)} kN·m`}/><Metric t="M− máx." v={`${fmt(r.Mneg)} kN·m`}/>
    <Metric t="As inf. necessária" v={`${fmt(r.AsBottom,0)} mm²`}/><Metric t="As sup. necessária" v={`${fmt(r.AsTop,0)} mm²`}/>
    <Metric t="As mínima" v={`${fmt(r.AsMin,0)} mm²`}/><Metric t="As máxima ref." v={`${fmt(r.AsMax,0)} mm²`}/>
   </div>
   <div className="reinforcement-layout">
    <article className="reinforcement-card"><h4>Armadura inferior</h4><b>{reinforcement.bottom.label}</b><span>As colocada {fmt(reinforcement.bottom.area,0)} mm²</span><span>{reinforcement.bottom.layers>1?`${reinforcement.bottom.layers} camadas`:'1 camada'} · {reinforcement.bottom.fits?'Cabe na secção':'REVER disposição'}</span></article>
    <article className="reinforcement-card"><h4>Armadura superior</h4><b>{reinforcement.top.label}</b><span>As colocada {fmt(reinforcement.top.area,0)} mm²</span><span>{reinforcement.top.layers>1?`${reinforcement.top.layers} camadas`:'1 camada'} · {reinforcement.top.fits?'Cabe na secção':'REVER disposição'}</span></article>
    <article className="reinforcement-card"><h4>Armadura transversal</h4><b>{reinforcement.stirrup.label}</b><span>Asw/s necessária {fmt(r.AswPerS,3)} mm²/mm</span><span>Asw/s colocada {fmt(reinforcement.stirrup.aswPerS,3)} mm²/mm</span></article>
   </div>
   <BeamSectionSvg b={b} h={h} cover={cover} top={reinforcement.top} bottom={reinforcement.bottom} stirrupDia={reinforcement.stirrup.dia}/>
   <p className="note">Dimensionamento automático de apoio ao projeto: armadura mínima, flexão simples e estribos por esforço transverso com modelo simplificado de treliça a 45°. Confirmar combinações ELU/ELS, ancoragens, emendas, fendilhação, deformações, disposições construtivas e restantes verificações aplicáveis do EC2 antes de usar em projeto de execução.</p>
  </section>
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
  {loads.map(l=>l.type==='point'?<g key={l.id}><line x1={px(l.x1)} y1="55" x2={px(l.x1)} y2="130" stroke="#ef4444" strokeWidth="4"/><polygon points={`${px(l.x1)-7},122 ${px(l.x1)+7},122 ${px(l.x1)},137`} fill="#ef4444"/></g>:l.type==='udl'?<g key={l.id}>{Array.from({length:7}).map((_,i)=>{const x=l.x1+((l.x2??L)-l.x1)*i/6;return <line key={i} x1={px(x)} y1="80" x2={px(x)} y2="130" stroke="#f59e0b" strokeWidth="2"/>})}</g>:<text key={l.id} x={px(l.x1)} y="90" fill="#c084fc" fontSize="22">↻</text>)}
  <text x="250" y="220" fill="#9fb3c8">{L.toFixed(2)} m</text></svg>
}

function BeamSectionSvg({b,h,cover,top,bottom,stirrupDia}:{b:number;h:number;cover:number;top:{dia:number;count:number};bottom:{dia:number;count:number};stirrupDia:number}){
 const W=360,H=320,p=34
 const bw=Math.max(b,0.12),hh=Math.max(h,0.18),scale=Math.min((W-2*p)/bw,(H-2*p)/hh)
 const rw=bw*scale,rh=hh*scale,x=(W-rw)/2,y=(H-rh)/2
 const c=Math.max(cover,0.015)*scale
 const ix=x+c+stirrupDia/1000*scale,iy=y+c+stirrupDia/1000*scale
 const iw=Math.max(20,rw-2*(c+stirrupDia/1000*scale)),ih=Math.max(20,rh-2*(c+stirrupDia/1000*scale))
 const bars=(count:number,dia:number,yy:number,key:string)=>{
   const n=Math.max(count,2),r=Math.max(4,dia/1000*scale/2)
   return Array.from({length:n}).map((_,i)=>{
     const xx=ix+r+(iw-2*r)*(n===1?.5:i/(n-1))
     return <circle key={`${key}-${i}`} cx={xx} cy={yy} r={r} fill="#d7a85e" stroke="#111827" strokeWidth="1"/>
   })
 }
 return <div className="beam-section-wrap"><h4>Secção proposta</h4><svg viewBox={`0 0 ${W} ${H}`} className="eng-svg beam-section-svg">
  <rect x={x} y={y} width={rw} height={rh} rx="3" fill="#c8d0d8" opacity=".24" stroke="#9fb3c8" strokeWidth="3"/>
  <rect x={ix} y={iy} width={iw} height={ih} rx="4" fill="none" stroke="#42d4cd" strokeWidth="3"/>
  {bars(top.count,top.dia,iy+Math.max(5,top.dia/1000*scale/2),'T')}
  {bars(bottom.count,bottom.dia,iy+ih-Math.max(5,bottom.dia/1000*scale/2),'B')}
  <text x={W/2} y={H-8} textAnchor="middle" fill="#9fb3c8" fontSize="12">{Math.round(b*1000)} × {Math.round(h*1000)} mm · rec. {Math.round(cover*1000)} mm</text>
 </svg></div>
}
