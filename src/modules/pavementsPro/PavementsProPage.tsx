import React,{useMemo,useState} from 'react'; import {pavementVolume,totalThickness,equivalentStructuralIndex} from './PavementSolver'
const F=({l,v,s,u}:{l:string,v:number,s:(n:number)=>void,u?:string})=><label className="field"><span>{l}{u?` (${u})`:''}</span><input type="number" step="any" value={v} onChange={e=>s(+e.target.value)}/></label>
const M=({t,v}:{t:string,v:string})=><div className="metric"><span>{t}</span><b>{v}</b></div>
export default function PavementsProPage(){
  const [area,setArea]=useState(1000),[wear,setWear]=useState(.04),[binder,setBinder]=useState(.06),[base,setBase]=useState(.18),[subbase,setSubbase]=useState(.20)
  const layers=useMemo(()=>[
    {name:'Desgaste',t:wear,density:2.35},
    {name:'Ligação',t:binder,density:2.30},
    {name:'Base',t:base,density:2.15},
    {name:'Sub-base',t:subbase,density:2.05}
  ],[wear,binder,base,subbase])
  const qty=useMemo(()=>pavementVolume(area,layers),[area,layers]),th=totalThickness(layers),idx=equivalentStructuralIndex(layers,[1.4,1.2,.8,.5])
  return <div className="module-page"><div className="module-head"><div><h2>Pavimentos</h2><p>Estrutura por camadas e quantidades preliminares.</p></div></div>
    <div className="work-grid"><section className="panel"><h3>Dados</h3><div className="form-grid"><F l="Área" u="m²" v={area} s={setArea}/><F l="Desgaste" u="m" v={wear} s={setWear}/><F l="Ligação" u="m" v={binder} s={setBinder}/><F l="Base" u="m" v={base} s={setBase}/><F l="Sub-base" u="m" v={subbase} s={setSubbase}/></div></section>
    <section className="panel"><h3>Camadas</h3><div className="result-grid compact"><M t="Espessura total" v={`${(th*1000).toFixed(0)} mm`}/><M t="Índice estrutural" v={idx.toFixed(0)}/></div></section></div>
    <section className="panel"><div className="member-table">{qty.map(l=><div key={l.name}><b>{l.name}</b><span>{(l.t*1000).toFixed(0)} mm</span><span>{l.volume.toFixed(1)} m³</span><span>{l.mass.toFixed(1)} t</span></div>)}</div></section>
  </div>
}
