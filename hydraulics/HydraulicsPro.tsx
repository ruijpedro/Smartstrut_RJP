import React,{useMemo,useState} from 'react'
import {waterChecks,sewerChecks} from './regulatory'
const F=({l,v,s,u}:{l:string,v:number,s:(v:number)=>void,u:string})=><label className="compact-field"><span>{l}</span><div><input type="number" step="any" value={v} onChange={e=>s(+e.target.value)}/><em>{u}</em></div></label>
const R=({l,v}:{l:string,v:string})=><div className="hyd-result"><span>{l}</span><b>{v}</b></div>
export default function HydraulicsPro(){
 const[Q,setQ]=useState(0.5),[D,setD]=useState(25),[L,setL]=useState(20),[eps,setEps]=useState(.0015),[pin,setPin]=useState(300),[dz,setDz]=useState(6),[minor,setMinor]=useState(2)
 const d=D/1000,q=Q/1000,A=Math.PI*d*d/4,v=q/A,nu=1.004e-6,Re=v*d/nu
 const rr=(eps/1000)/d
 const f=Re<2300?64/Re:0.25/Math.pow(Math.log10(rr/3.7+5.74/Math.pow(Re,.9)),2)
 const hf=f*(L/d)*(v*v/(2*9.81)),hm=minor*v*v/(2*9.81),pLoss=(hf+hm+dz)*9.81,pout=pin-pLoss
 const checks=waterChecks(v,pout)
 return <div className="hyd-pro-grid">
 <section className="tech-card"><h3>REDE DE ÁGUA — VERIFICAÇÃO ENERGÉTICA</h3><div className="hyd-grid"><F l="Caudal" v={Q} s={setQ} u="L/s"/><F l="Diâmetro interior" v={D} s={setD} u="mm"/><F l="Comprimento" v={L} s={setL} u="m"/><F l="Rugosidade ε" v={eps} s={setEps} u="mm"/><F l="Pressão entrada" v={pin} s={setPin} u="kPa"/><F l="Desnível" v={dz} s={setDz} u="m"/><F l="ΣK singularidades" v={minor} s={setMinor} u="-"/></div></section>
 <section className="tech-card"><h3>RESULTADOS DARCY–WEISBACH</h3><R l="Velocidade" v={`${v.toFixed(2)} m/s`}/><R l="Reynolds" v={Re.toFixed(0)}/><R l="f Darcy" v={f.toFixed(4)}/><R l="Perda linear" v={`${hf.toFixed(2)} m.c.a.`}/><R l="Perdas singulares" v={`${hm.toFixed(2)} m.c.a.`}/><R l="Pressão residual" v={`${pout.toFixed(0)} kPa`}/></section>
 <section className="tech-card"><h3>CONTROLO REGULAMENTAR</h3>{checks.map(c=><div className={`reg-check ${c.ok?'ok':'bad'}`} key={c.label}><b>{c.ok?'✓':'⚠'} {c.label}</b><span>{c.detail}</span><small>{c.article}</small></div>)}</section>
 </div>
}
export function DrainagePro(){
 const[s,setS]=useState(2),[dn,setDn]=useState(100),[vent,setVent]=useState(true),[height,setHeight]=useState(9)
 const checks=sewerChecks(s,true)
 const maxOcc=vent?1/3:1/7
 const minStack=Math.max(50,dn)
 return <div className="hyd-pro-grid"><section className="tech-card"><h3>TUBO DE QUEDA / VENTILAÇÃO</h3><div className="hyd-grid"><F l="Maior DN ligado" v={dn} s={setDn} u="mm"/><F l="Altura tubo queda" v={height} s={setHeight} u="m"/><F l="Inclinação ramais" v={s} s={setS} u="%"/></div><label className="toggle-row"><input type="checkbox" checked={vent} onChange={e=>setVent(e.target.checked)}/><span>Ventilação secundária</span></label></section>
 <section className="tech-card"><h3>REGRAS AUTOMÁTICAS</h3><R l="DN mínimo tubo queda" v={`DN ${minStack}`}/><R l="Taxa ocupação máx." v={vent?'1/3':'até 1/7 (ver Anexo XVII)'}/><R l="Ventilação primária" v="Obrigatória"/>{checks.map(c=><div className={`reg-check ${c.ok?'ok':'bad'}`} key={c.label}><b>{c.ok?'✓':'⚠'} {c.label}</b><span>{c.detail}</span><small>{c.article}</small></div>)}</section>
 <section className="tech-card"><h3>MANUTENÇÃO / TRAÇADO</h3><ul className="rule-list"><li>Bocas de limpeza nas mudanças de direção.</li><li>Boca de limpeza junto da inserção mais alta.</li><li>No mínimo de 3 em 3 pisos; aconselhável em todos.</li><li>Abertura do tubo de queda: verificar afastamentos e altura acima da cobertura.</li><li>Ramais de ventilação: DN ≥ 2/3 do DN do ramal de descarga.</li></ul></section></div>
}
