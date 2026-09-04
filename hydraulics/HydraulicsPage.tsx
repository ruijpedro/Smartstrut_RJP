import React,{useMemo,useState} from 'react'
import {FIXTURES} from './fixtures'
import NetworkDesigner from './NetworkDesigner'
import HydraulicsPro,{DrainagePro} from './HydraulicsPro'
import SegmentDesigner from './SegmentDesigner'
import GraphicNetworkEditor from './GraphicNetworkEditor'
import PublicSewerProfile from './PublicSewerProfile'
import {EngineeringBasis,PreliminaryChecklist} from '../../engineering/EngineeringBasis'
type Tab='profile'|'graphic'|'segments'|'network'|'builder'|'supply'|'waterpro'|'sewer'|'drainpro'|'storm'|'general'|'criteria'
type Counts=Record<string,number>
const F=({l,v,s,u}:{l:string,v:number,s:(v:number)=>void,u:string})=><label className="compact-field"><span>{l}</span><div><input type="number" step="any" value={v} onChange={e=>s(+e.target.value)}/><em>{u}</em></div></label>
export default function HydraulicsPage(){
 const[tab,setTab]=useState<Tab>('graphic')
 return <div className="module-page"><div className="module-head"><div><h2>Hidráulica e Drenagem</h2><p>Redes prediais de água, águas residuais, pluviais e hidráulica geral.</p></div></div>
 <nav className="hyd-tabs">{([['graphic','Editor Redes'],['profile','Perfil Público'],['segments','Troços'],['network','Projeto'],['builder','Aparelhos'],['supply','Abastecimento'],['waterpro','Água PRO'],['sewer','Esgotos'],['drainpro','Drenagem PRO'],['storm','Pluviais'],['general','Geral'],['criteria','Normas / Critérios']] as const).map(([k,l])=><button className={tab===k?'active':''} onClick={()=>setTab(k)} key={k}>{l}</button>)}</nav>
 {tab==='graphic'&&<GraphicNetworkEditor/>}{tab==='profile'&&<PublicSewerProfile/>}{tab==='segments'&&<SegmentDesigner/>}{tab==='network'&&<NetworkDesigner/>}{tab==='builder'&&<SanitaryBuilder/>}{tab==='supply'&&<Supply/>}{tab==='waterpro'&&<HydraulicsPro/>}{tab==='sewer'&&<Sewer/>}{tab==='drainpro'&&<DrainagePro/>}{tab==='storm'&&<Storm/>}{tab==='general'&&<General/>}{tab==='criteria'&&<HydraulicCriteria/>}
 </div>
}
function SanitaryBuilder(){
 const[counts,setCounts]=useState<Counts>(()=>Object.fromEntries(FIXTURES.map(f=>[f.id,0])))
 const totals=useMemo(()=>FIXTURES.reduce((a,f)=>{const n=counts[f.id]||0;a.water+=n*f.water;a.waste+=n*f.waste;a.n+=n;return a},{water:0,waste:0,n:0}),[counts])
 // DR 23/95 requires simultaneity; exact Annex curves should be digitised/validated before regulatory use.
 const ks=totals.n<=1?1:Math.max(.20,1/Math.sqrt(totals.n))
 const qWater=totals.water*ks
 const qWaste=totals.waste*(totals.n<=1?1:Math.max(.25,1/Math.sqrt(totals.n)))
 return <div className="san-builder">
 <section className="tech-card"><h3>CONSTRUTOR DE INSTALAÇÃO SANITÁRIA</h3><p className="muted">Adiciona os aparelhos. A aplicação acumula os caudais e apresenta uma pré-dimensão. Os valores da tabela são editáveis na base técnica; a curva regulamentar de simultaneidade deve ser validada contra os Anexos IV/XIV/XV antes de uso em projeto.</p>
 <div className="fixture-grid">{FIXTURES.map(f=><div className="fixture-row" key={f.id}><div><b>{f.name}</b><small>Água {f.water.toFixed(2)} L/s · Esgoto {f.waste.toFixed(2)} L/s</small></div><div className="stepper"><button onClick={()=>setCounts({...counts,[f.id]:Math.max(0,(counts[f.id]||0)-1)})}>−</button><strong>{counts[f.id]||0}</strong><button onClick={()=>setCounts({...counts,[f.id]:(counts[f.id]||0)+1})}>+</button></div></div>)}</div>
 </section>
 <section className="tech-card"><h3>RESUMO</h3><div className="hyd-grid"><R l="N.º aparelhos" v={String(totals.n)}/><R l="Q instalado água" v={`${totals.water.toFixed(2)} L/s`}/><R l="Simultaneidade preliminar" v={ks.toFixed(3)}/><R l="Q cálculo água" v={`${qWater.toFixed(2)} L/s`}/><R l="Q descarga acumulado" v={`${totals.waste.toFixed(2)} L/s`}/><R l="Q cálculo esgoto (pré-dim.)" v={`${qWaste.toFixed(2)} L/s`}/></div></section>
 <section className="tech-card rules-card"><h3>VERIFICAÇÕES REGULAMENTARES ATIVAS</h3><ul><li>Água: Q de cálculo a partir dos dispositivos + simultaneidade.</li><li>Água: velocidade admissível 0,5–2,0 m/s.</li><li>Pressão nos dispositivos: 50–600 kPa; recomendável 150–300 kPa.</li><li>Esgotos: ramais com inclinação 10–40 mm/m.</li><li>Ramais não individuais: cálculo a meia secção.</li><li>Tubos de queda: taxa de ocupação dependente da ventilação.</li></ul></section>
 </div>
}
function Supply(){
 const[Q,setQ]=useState(2),[D,setD]=useState(50),[L,setL]=useState(30),[C,setC]=useState(130)
 const d=D/1000,q=Q/1000,A=Math.PI*d*d/4,v=q/A,hf=10.67*L*Math.pow(Math.max(q,1e-12),1.852)/(Math.pow(Math.max(C,1),1.852)*Math.pow(Math.max(d,1e-6),4.87))
 const ok=v>=.5&&v<=2
 return <Calc title="Abastecimento — conduta em pressão"><F l="Caudal Q" v={Q} s={setQ} u="L/s"/><F l="Diâmetro interior" v={D} s={setD} u="mm"/><F l="Comprimento" v={L} s={setL} u="m"/><F l="Coef. Hazen-Williams C" v={C} s={setC} u="-"/><R l="Velocidade" v={`${v.toFixed(2)} m/s ${ok?'✓':'⚠'}`}/><R l="Perda de carga" v={`${hf.toFixed(2)} m`}/></Calc>
}
function Sewer(){
 const[D,setD]=useState(100),[S,setS]=useState(2),[n,setN]=useState(.013)
 const d=D/1000,A=Math.PI*d*d/8,Rh=d/4,sl=S/100,Q=(1/n)*A*Math.pow(Rh,2/3)*Math.sqrt(sl),v=Q/A
 return <Calc title="Esgotos — Manning, meia secção"><F l="Diâmetro" v={D} s={setD} u="mm"/><F l="Inclinação" v={S} s={setS} u="%"/><F l="Manning n" v={n} s={setN} u="-"/><R l="Capacidade a 1/2 secção" v={`${(Q*1000).toFixed(2)} L/s`}/><R l="Velocidade" v={`${v.toFixed(2)} m/s`}/><R l="Inclinação DR 23/95" v={`${S>=1&&S<=4?'✓':'⚠'} 1–4 %`}/></Calc>
}
function Storm(){
 const[C,setC]=useState(1),[I,setI]=useState(100),[A,setA]=useState(500)
 const q=C*I*A/3600
 return <Calc title="Pluviais — método racional"><F l="Coef. escoamento C" v={C} s={setC} u="-"/><F l="Intensidade i" v={I} s={setI} u="mm/h"/><F l="Área horizontal" v={A} s={setA} u="m²"/><R l="Caudal de ponta" v={`${q.toFixed(2)} L/s`}/><R l="Coberturas" v="C = 1 (DR 23/95)"/></Calc>
}
function General(){
 const[Q,setQ]=useState(10),[D,setD]=useState(100),[nu,setNu]=useState(1.004)
 const d=D/1000,q=Q/1000,A=Math.PI*d*d/4,v=q/A,Re=v*d/(nu*1e-6)
 return <Calc title="Hidráulica geral"><F l="Caudal" v={Q} s={setQ} u="L/s"/><F l="Diâmetro" v={D} s={setD} u="mm"/><F l="Viscosidade cinemática" v={nu} s={setNu} u="mm²/s"/><R l="Velocidade" v={`${v.toFixed(2)} m/s`}/><R l="Reynolds" v={Re.toFixed(0)}/></Calc>
}
const Calc=({title,children}:{title:string,children:React.ReactNode})=><section className="hyd-calc tech-card"><h3>{title}</h3><div className="hyd-grid">{children}</div></section>
const R=({l,v}:{l:string,v:string})=><div className="hyd-result"><span>{l}</span><b>{v}</b></div>

function HydraulicCriteria(){return <><EngineeringBasis area="hydraulics"/><section className="panel"><h3>Checklist de estudo prévio hidráulico</h3><PreliminaryChecklist items={[
{name:'Origem / destino e entidade gestora',status:'check',detail:'Confirmar pressão disponível, cotas, ponto de ligação e condições da entidade gestora.'},
{name:'Caudais de cálculo',status:'ok',detail:'A app dispõe de acumulação, simultaneidade preliminar, Manning, Hazen-Williams e método racional.'},
{name:'Diâmetros / velocidades / perdas',status:'ok',detail:'Pré-dimensionamento implementado nos separadores de água e drenagem.'},
{name:'Perfil e cotas da rede',status:'ok',detail:'Disponível para coletores públicos e editor gráfico.'},
{name:'Órgãos e acessibilidade',status:'check',detail:'CV/PV, válvulas, sumidouros e outros órgãos devem ser validados segundo implantação e manutenção.'},
{name:'Anexos e curvas regulamentares',status:'check',detail:'Verificação ativa por parâmetro/critério: confirmar a curva ou tabela regulamentar aplicável antes de fechar o projeto.'}
]}/></section></>}
