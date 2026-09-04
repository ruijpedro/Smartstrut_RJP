import React,{useMemo,useState} from 'react'; import {anchoredWall,bondLength} from './AnchoredWallSolver'
const F=({l,v,s,u}:{l:string,v:number,s:(n:number)=>void,u?:string})=><label className="field"><span>{l}{u?` (${u})`:''}</span><input type="number" step="any" value={v} onChange={e=>s(+e.target.value)}/></label>
const M=({t,v}:{t:string,v:string})=><div className="metric"><span>{t}</span><b>{v}</b></div>
export default function AnchoredWallsProPage(){
  const [H,setH]=useState(7),[gamma,setGamma]=useState(19),[phi,setPhi]=useState(32),[q,setQ]=useState(10),[levels,setLevels]=useState(2),[spacing,setSpacing]=useState(2),[dg,setDg]=useState(.15),[tau,setTau]=useState(120)
  const r=useMemo(()=>anchoredWall(H,gamma,phi,q,levels,spacing),[H,gamma,phi,q,levels,spacing]),Lb=useMemo(()=>bondLength(r.anchorEach,dg,tau),[r.anchorEach,dg,tau])
  return <div className="module-page"><div className="module-head"><div><h2>Cortinas e Muros Ancorados</h2><p>Impulsos, níveis de ancoragem e comprimento de selagem preliminar.</p></div></div>
  <div className="work-grid"><section className="panel"><h3>Dados</h3><div className="form-grid"><F l="H" u="m" v={H} s={setH}/><F l="γ" u="kN/m³" v={gamma} s={setGamma}/><F l="φ" u="°" v={phi} s={setPhi}/><F l="q" u="kPa" v={q} s={setQ}/><F l="Níveis" v={levels} s={setLevels}/><F l="Espaçamento" u="m" v={spacing} s={setSpacing}/><F l="Ø bolbo" u="m" v={dg} s={setDg}/><F l="τ aderência" u="kPa" v={tau} s={setTau}/></div></section>
  <section className="panel"><AnchoredSvg H={H} levels={levels}/></section></div>
  <div className="result-grid"><M t="Ka" v={r.Ka.toFixed(2)}/><M t="Pa" v={`${r.total.toFixed(0)} kN/m`}/><M t="Carga/anc." v={`${r.anchorEach.toFixed(0)} kN`}/><M t="Lb" v={`${Lb.toFixed(2)} m`}/><M t="Mmax" v={`${r.Mmax.toFixed(0)} kN·m/m`}/></div></div>
}
function AnchoredSvg({H,levels}:{H:number,levels:number}){const n=Math.max(1,Math.round(levels));return <svg viewBox="0 0 520 300" className="eng-svg"><line x1="210" y1="40" x2="210" y2="255" stroke="#aab8c8" strokeWidth="10"/><polygon points="215,40 500,40 500,255 215,255" fill="#4a3828"/>{Array.from({length:n}).map((_,i)=>{const y=70+i*150/Math.max(n-1,1);return <g key={i}><line x1="210" y1={y} x2="420" y2={y-35} stroke="#2dd4bf" strokeWidth="4"/><circle cx="420" cy={y-35} r="7" fill="#2dd4bf"/></g>})}<text x="20" y="25" fill="#9fb3c8">H {H.toFixed(1)} m</text></svg>}
