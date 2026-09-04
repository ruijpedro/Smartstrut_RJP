import React,{useEffect,useMemo,useState} from 'react'
import {readBIMHandoff,updateBIMCalculation,n} from '../../engineering/bim/calculationBridge'
import {EngineeringBasis} from '../../engineering/EngineeringBasis'
import {solveBeam,type SupportType,type BeamLoad} from './BeamSolver'
import {fmt} from '../../engineering/structuralMath'
import {chooseBars,chooseStirrups,barArea,anchorageLength} from './ReinforcementLibrary'

const F=({l,v,s,u}:{l:string,v:number,s:(n:number)=>void,u?:string})=><label className="field"><span>{l}{u?` (${u})`:''}</span><input type="number" step="any" value={v} onChange={e=>s(+e.target.value)}/></label>
type Step='dados'|'esforcos'|'armaduras'|'pormenorizacao'|'verificacoes'|'desenhos'

export default function BeamsProPage(){
 const[support,setSupport]=useState<SupportType>('simply'),[L,setL]=useState(6)
 const[b,setB]=useState(.30),[h,setH]=useState(.55),[cover,setCover]=useState(.035),[fck,setFck]=useState(30),[fyk,setFyk]=useState(500),[E,setE]=useState(30)
 const[loads,setLoads]=useState<BeamLoad[]>([{id:1,type:'udl',value:12,x1:0,x2:6}])
 const[step,setStep]=useState<Step>('armaduras')
 const[bimSource,setBimSource]=useState<string|null>(null)
 useEffect(()=>{const x=readBIMHandoff(['beam']);if(!x)return;setBimSource(x.elementId);setL(n(x.geometry.length,L));setB(n(x.geometry.b,b));setH(n(x.geometry.h,h));setFck(n(x.material?.properties?.fck_MPa,fck));},[])
 const r=useMemo(()=>solveBeam({L,support,b,h,cover,fck,fyk,E,loads}),[L,support,b,h,cover,fck,fyk,E,loads])
 const reinforcement=useMemo(()=>{
   const bmm=b*1000,coverMm=cover*1000
   const bottom=chooseBars(r.AsBottom,bmm,coverMm,8)
   const top=chooseBars(r.AsTop,bmm,coverMm,8)
   const stirrup=chooseStirrups(r.AswPerS,r.d*1000,bmm)
   return{bottom,top,stirrup}
 },[r.AsBottom,r.AsTop,r.AswPerS,r.d,b,cover])

 const anchBottom=useMemo(()=>anchorageLength(reinforcement.bottom.dia,fck,fyk),[reinforcement.bottom.dia,fck,fyk])
 const anchTop=useMemo(()=>anchorageLength(reinforcement.top.dia,fck,fyk),[reinforcement.top.dia,fck,fyk])
 const cutPlan=useMemo(()=>buildCurtailmentPlan(r.samples,L,anchBottom.lbd/1000,anchTop.lbd/1000),[r.samples,L,anchBottom.lbd,anchTop.lbd])
 const supportZone=Math.max(.35,Math.min(.80,L*.10))
 const midLength=Math.max(0,L-2*supportZone)
 const stirrupSupportSpacing=Math.max(75,Math.min(reinforcement.stirrup.spacing,100))
 const nStirrups=Math.ceil((2*supportZone*1000)/stirrupSupportSpacing)+Math.ceil((midLength*1000)/reinforcement.stirrup.spacing)+1
 const steelWeight=useMemo(()=>{
   const kgPerM=(dia:number)=>barArea(dia)*1e-6*7850
   const long=(reinforcement.bottom.count*kgPerM(reinforcement.bottom.dia)+reinforcement.top.count*kgPerM(reinforcement.top.dia))*L
   const stirrupPerimeter=2*Math.max(0,b-2*cover)+2*Math.max(0,h-2*cover)+.20
   const stirrups=nStirrups*stirrupPerimeter*kgPerM(reinforcement.stirrup.dia)
   return long+stirrups
 },[reinforcement,L,b,h,cover,nStirrups])

 const add=(type:BeamLoad['type'])=>setLoads([...loads,{id:Date.now(),type,value:type==='moment'?20:type==='point'?25:10,x1:type==='udl'?0:L/2,x2:type==='udl'?L:undefined}])
 const upd=(id:number,p:Partial<BeamLoad>)=>setLoads(loads.map(x=>x.id===id?{...x,...p}:x))

 return <div className="module-page v75-page">
 {bimSource&&<section className="panel bim-calc-banner"><b>Elemento BIM ligado: {bimSource}</b><span> · geometria/material carregados do modelo. </span><button onClick={()=>updateBIMCalculation(bimSource,'Vigas PRO',{Mpos_kNm:r.Mpos,Mneg_kNm:r.Mneg,Vmax_kN:r.Vmax,AsBottom_mm2:r.AsBottom,AsTop_mm2:r.AsTop},{verifiedIn:'Vigas PRO'})}>Devolver resultados ao BIM</button></section>}
  <div className="module-head"><div><h2>Vigas PRO</h2><p>Dimensionamento e pormenorização visual de armaduras.</p></div></div>

  <div className="v75-stepbar">{([
   ['dados','Dados'],['esforcos','Esforços'],['armaduras','Armaduras'],['pormenorizacao','Pormenorização'],['verificacoes','Verificações'],['desenhos','Desenhos']
  ] as [Step,string][]).map(([k,l])=><button key={k} className={step===k?'active':''} onClick={()=>setStep(k)}>{l}</button>)}</div>

  {(step==='dados'||step==='armaduras')&&<div className="work-grid">
   <section className="panel"><h3>Dados da viga</h3>
    <div className="tabs-row">{(['simply','cantilever','fixed-fixed','propped'] as SupportType[]).map(x=><button className={support===x?'active':''} onClick={()=>setSupport(x)} key={x}>{({simply:'Biapoiada',cantilever:'Consola','fixed-fixed':'Bi-encastrada',propped:'Encastrada-apoiada'} as any)[x]}</button>)}</div>
    <div className="form-grid"><F l="Vão L" u="m" v={L} s={setL}/><F l="b" u="m" v={b} s={setB}/><F l="h" u="m" v={h} s={setH}/><F l="Recobrimento" u="m" v={cover} s={setCover}/><F l="fck" u="MPa" v={fck} s={setFck}/><F l="fyk" u="MPa" v={fyk} s={setFyk}/><F l="E" u="GPa" v={E} s={setE}/></div>
   </section>
   <section className="panel"><h3>Modelo</h3><BeamSvg L={L} support={support} loads={loads}/></section>
  </div>}

  {step==='dados'&&<section className="panel"><h3>Ações</h3><div className="tabs-row"><button onClick={()=>add('udl')}>+ Carga distribuída</button><button onClick={()=>add('point')}>+ Carga pontual</button><button onClick={()=>add('moment')}>+ Momento</button></div>
   <div className="public-table">{loads.map(l=><div className="public-row" key={l.id}><b>{l.type==='udl'?'Distribuída':l.type==='point'?'Pontual':'Momento'}</b><label>Valor <input type="number" value={l.value} onChange={e=>upd(l.id,{value:+e.target.value})}/>{l.type==='udl'?' kN/m':l.type==='point'?' kN':' kN·m'}</label><label>x1 <input type="number" value={l.x1} onChange={e=>upd(l.id,{x1:+e.target.value})}/> m</label>{l.type==='udl'&&<label>x2 <input type="number" value={l.x2??L} onChange={e=>upd(l.id,{x2:+e.target.value})}/> m</label>}<button onClick={()=>setLoads(loads.filter(x=>x.id!==l.id))}>Apagar</button></div>)}</div>
  </section>}

  {(step==='esforcos'||step==='armaduras')&&<>
   <div className="result-grid"><Metric t="RA" v={`${fmt(r.RA)} kN`}/><Metric t="RB" v={`${fmt(r.RB)} kN`}/><Metric t="V |máx|" v={`${fmt(r.Vmax)} kN`}/><Metric t="M+ máx." v={`${fmt(r.Mpos)} kN·m`}/><Metric t="M− máx." v={`${fmt(r.Mneg)} kN·m`}/></div>
   <section className="panel"><h3>Momentos e corte</h3><Diagram title="Esforço transverso V (kN)" data={r.samples.map(s=>({x:s.x,y:s.V}))}/><Diagram title="Momento fletor M (kN·m)" data={r.samples.map(s=>({x:s.x,y:s.M}))}/></section>
  </>}

  {(step==='armaduras'||step==='pormenorizacao'||step==='desenhos')&&<div className="v75-detail-grid">
   <section className="panel v75-card"><h3>Armaduras longitudinais</h3>
    <div className="rebar-table">
     <div><span>Inferior · vão</span><b className="rebar-red">{reinforcement.bottom.label}</b><small>As nec. {fmt(r.AsBottom,0)} · As col. {fmt(reinforcement.bottom.area,0)} mm²</small></div>
     <div><span>Superior · apoio</span><b className="rebar-blue">{reinforcement.top.label}</b><small>As nec. {fmt(r.AsTop,0)} · As col. {fmt(reinforcement.top.area,0)} mm²</small></div>
    </div>
   </section>
   <section className="panel v75-card"><h3>Secção transversal armada</h3><BeamSectionSvg b={b} h={h} cover={cover} top={reinforcement.top} bottom={reinforcement.bottom} stirrupDia={reinforcement.stirrup.dia} stirrupSpacing={reinforcement.stirrup.spacing}/></section>
   <section className="panel v75-card"><h3>Pormenorização longitudinal</h3><BeamLongitudinalSvg L={L} supportZone={supportZone} bottom={reinforcement.bottom} top={reinforcement.top}/></section>
   <section className="panel v75-card"><h3>Cortes e prolongamentos</h3><CurtailmentSvg L={L} samples={r.samples} plan={cutPlan} bottom={reinforcement.bottom} top={reinforcement.top}/></section>
   <section className="panel v75-card"><h3>Pormenorização dos estribos</h3><StirrupDetailSvg L={L} supportZone={supportZone} dia={reinforcement.stirrup.dia} supportSpacing={stirrupSupportSpacing} midSpacing={reinforcement.stirrup.spacing}/></section>
  </div>}

  {(step==='pormenorizacao'||step==='desenhos')&&<section className="panel"><h3>Ancoragens e emendas</h3>
   <div className="result-grid">
    <Metric t={`lb,d inferior Ø${reinforcement.bottom.dia}`} v={`${fmt(anchBottom.lbd,0)} mm`}/>
    <Metric t={`Emenda inferior Ø${reinforcement.bottom.dia}`} v={`${fmt(anchBottom.lap,0)} mm`}/>
    <Metric t={`lb,d superior Ø${reinforcement.top.dia}`} v={`${fmt(anchTop.lbd,0)} mm`}/>
    <Metric t={`Emenda superior Ø${reinforcement.top.dia}`} v={`${fmt(anchTop.lap,0)} mm`}/>
   </div>
   <AnchorageSvg bottomDia={reinforcement.bottom.dia} topDia={reinforcement.top.dia} lbBottom={anchBottom.lbd} lbTop={anchTop.lbd} lapBottom={anchBottom.lap}/>
   <p className="note">Comprimentos preliminares com aderência boa, varões nervurados, σsd=fyd e coeficientes α simplificados a 1,0. Antes do projeto de execução devem ser confirmadas condições de aderência, posição do varão, confinamento, percentagem de barras emendadas e restantes fatores EC2.</p>
  </section>}

  {(step==='pormenorizacao'||step==='desenhos')&&<section className="panel"><h3>Mapa de varões da viga</h3>
   <div className="bar-schedule">
    <div><b>B1</b><span>Inferior</span><strong>{reinforcement.bottom.label}</strong><span>Comprimento ≈ {fmt(cutPlan.bottom.end-cutPlan.bottom.start,2)} m</span><small>x = {fmt(cutPlan.bottom.start,2)} → {fmt(cutPlan.bottom.end,2)} m</small></div>
    {cutPlan.top.length?cutPlan.top.map((z,i)=><div key={i}><b>T{i+1}</b><span>Superior</span><strong>{reinforcement.top.label}</strong><span>Comprimento ≈ {fmt(z.end-z.start,2)} m</span><small>x = {fmt(z.start,2)} → {fmt(z.end,2)} m</small></div>):<div><b>T1</b><span>Superior mínima/montagem</span><strong>{reinforcement.top.label}</strong><span>Contínua ≈ {fmt(L,2)} m</span><small>Sem zona negativa significativa no modelo atual</small></div>}
    <div><b>E1</b><span>Estribos apoios</span><strong>2R Ø{reinforcement.stirrup.dia}//{stirrupSupportSpacing}</strong><span>2 × {fmt(supportZone,2)} m</span><small>Zonas de apoio</small></div>
    <div><b>E2</b><span>Estribos vão</span><strong>2R Ø{reinforcement.stirrup.dia}//{reinforcement.stirrup.spacing}</strong><span>{fmt(midLength,2)} m</span><small>Zona central</small></div>
   </div>
   <p className="note">Os pontos de corte são obtidos do diagrama de momentos por uma regra automática de procura de zonas relevantes e são prolongados pelo comprimento de ancoragem calculado. Esta regra é de apoio à pormenorização e não substitui as verificações regulamentares de dispensa/corte de armadura.</p>
  </section>}

  {step==='verificacoes'&&<section className="panel"><h3>Verificações</h3><div className="result-grid"><Metric t="As inferior" v={reinforcement.bottom.area>=r.AsBottom?'OK':'REVER'}/><Metric t="As superior" v={reinforcement.top.area>=r.AsTop?'OK':'REVER'}/><Metric t="Asw/s" v={reinforcement.stirrup.aswPerS>=r.AswPerS?'OK':'REVER'}/><Metric t="Disposição inferior" v={reinforcement.bottom.fits?'OK':'REVER'}/><Metric t="Disposição superior" v={reinforcement.top.fits?'OK':'REVER'}/></div><p className="note">Verificações automáticas desta página são de apoio ao dimensionamento. Permanecem por confirmar ELU/ELS completos, ancoragens, emendas, fendilhação, deformações, torção e regras de pormenorização aplicáveis.</p></section>}

  {(step==='armaduras'||step==='pormenorizacao'||step==='desenhos')&&<section className="panel"><h3>Resumo de armaduras</h3><div className="result-grid"><Metric t="Inferior" v={reinforcement.bottom.label}/><Metric t="Superior" v={reinforcement.top.label}/><Metric t="Estribos apoios" v={`2R Ø${reinforcement.stirrup.dia} // ${stirrupSupportSpacing} mm`}/><Metric t="Estribos vão" v={`2R Ø${reinforcement.stirrup.dia} // ${reinforcement.stirrup.spacing} mm`}/><Metric t="N.º estribos aprox." v={`${nStirrups}`}/><Metric t="Peso aço aprox." v={`${fmt(steelWeight,1)} kg`}/></div></section>}
 <EngineeringBasis area="structures" compact/>
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
  <text x="295" y="220" textAnchor="middle" fill="#9fb3c8">{L.toFixed(2)} m</text></svg>
}

function BeamSectionSvg({b,h,cover,top,bottom,stirrupDia,stirrupSpacing}:{b:number;h:number;cover:number;top:{dia:number;count:number};bottom:{dia:number;count:number};stirrupDia:number;stirrupSpacing:number}){
 const W=520,H=360,p=46,bw=Math.max(b,.12),hh=Math.max(h,.18),scale=Math.min((W-190)/bw,(H-2*p)/hh)
 const rw=bw*scale,rh=hh*scale,x=55,y=(H-rh)/2,c=Math.max(cover,.015)*scale,ix=x+c+stirrupDia/1000*scale,iy=y+c+stirrupDia/1000*scale,iw=Math.max(20,rw-2*(c+stirrupDia/1000*scale)),ih=Math.max(20,rh-2*(c+stirrupDia/1000*scale))
 const bars=(count:number,dia:number,yy:number,key:string,fill:string)=>Array.from({length:Math.max(count,2)}).map((_,i)=>{const n=Math.max(count,2),r=Math.max(5,dia/1000*scale/2),xx=ix+r+(iw-2*r)*(n===1?.5:i/(n-1));return <circle key={`${key}-${i}`} cx={xx} cy={yy} r={r} fill={fill} stroke="#111827"/>})
 return <div className="beam-section-wrap"><svg viewBox={`0 0 ${W} ${H}`} className="eng-svg beam-section-svg">
  <rect x={x} y={y} width={rw} height={rh} rx="3" fill="#c8d0d8" opacity=".24" stroke="#9fb3c8" strokeWidth="3"/><rect x={ix} y={iy} width={iw} height={ih} rx="4" fill="none" stroke="#111827" strokeWidth="3"/>
  {bars(top.count,top.dia,iy+Math.max(6,top.dia/1000*scale/2),'T','#2563eb')}{bars(bottom.count,bottom.dia,iy+ih-Math.max(6,bottom.dia/1000*scale/2),'B','#dc2626')}
  <line x1={x+rw-5} y1={iy+12} x2={x+rw+75} y2={iy+12} stroke="#2563eb"/><text className="rebar-label-svg" x={x+rw+82} y={iy+18} fill="#2563eb">{top.count}Ø{top.dia} superior</text>
  <line x1={x+rw-5} y1={iy+ih-12} x2={x+rw+75} y2={iy+ih-12} stroke="#dc2626"/><text className="rebar-label-svg" x={x+rw+82} y={iy+ih-6} fill="#dc2626">{bottom.count}Ø{bottom.dia} inferior</text>
  <line x1={x+rw-5} y1={iy+ih/2} x2={x+rw+75} y2={iy+ih/2} stroke="#111827"/><text className="rebar-label-svg" x={x+rw+82} y={iy+ih/2+6} fill="#111827">2R Ø{stirrupDia}//{stirrupSpacing}</text>
  <text x={x+rw/2} y={H-10} textAnchor="middle" fill="#9fb3c8">{Math.round(b*1000)} × {Math.round(h*1000)} mm · rec. {Math.round(cover*1000)} mm</text>
 </svg></div>
}

function BeamLongitudinalSvg({L,supportZone,bottom,top}:{L:number;supportZone:number;bottom:{dia:number;count:number};top:{dia:number;count:number}}){
 const W=760,H=260,x1=65,x2=695,y=120,w=x2-x1,z=w*supportZone/Math.max(L,.1)
 return <svg viewBox={`0 0 ${W} ${H}`} className="eng-svg detail-svg"><rect x={x1} y={85} width={w} height={70} fill="#c8d0d8" opacity=".22" stroke="#9fb3c8"/>
  <line x1={x1+12} y1={140} x2={x2-12} y2={140} stroke="#dc2626" strokeWidth="5"/><text className="rebar-label-svg" x={W/2} y={178} textAnchor="middle" fill="#dc2626">{bottom.count}Ø{bottom.dia} · inferior</text>
  <line x1={x1+12} y1={100} x2={x1+z+45} y2={100} stroke="#2563eb" strokeWidth="5"/><line x1={x2-z-45} y1={100} x2={x2-12} y2={100} stroke="#2563eb" strokeWidth="5"/>
  <text className="rebar-label-svg" x={x1+z/2+20} y={73} textAnchor="middle" fill="#2563eb">{top.count}Ø{top.dia} superior</text><text className="rebar-label-svg" x={x2-z/2-20} y={73} textAnchor="middle" fill="#2563eb">{top.count}Ø{top.dia} superior</text>
  <line x1={x1} y1={205} x2={x2} y2={205} stroke="#60788c"/><text x={W/2} y={230} textAnchor="middle" fill="#9fb3c8">L = {L.toFixed(2)} m · zonas de apoio ≈ {supportZone.toFixed(2)} m</text></svg>
}

function StirrupDetailSvg({L,supportZone,dia,supportSpacing,midSpacing}:{L:number;supportZone:number;dia:number;supportSpacing:number;midSpacing:number}){
 const W=760,H=260,x1=55,x2=705,y1=70,y2=165,w=x2-x1,z=w*supportZone/Math.max(L,.1)
 const xs:number[]=[]
 const pushZone=(a:number,b:number,spacingMm:number)=>{const lenM=(b-a)/w*L,n=Math.max(1,Math.floor(lenM*1000/spacingMm));for(let i=0;i<=n;i++)xs.push(a+(b-a)*i/Math.max(n,1))}
 pushZone(x1,x1+z,supportSpacing);pushZone(x1+z,x2-z,midSpacing);pushZone(x2-z,x2,supportSpacing)
 return <svg viewBox={`0 0 ${W} ${H}`} className="eng-svg detail-svg"><rect x={x1} y={y1} width={w} height={y2-y1} fill="#c8d0d8" opacity=".18" stroke="#9fb3c8"/>
  {xs.map((x,i)=><rect key={i} x={x-2} y={y1+7} width="4" height={y2-y1-14} fill={x<x1+z||x>x2-z?'#dc2626':'#111827'}/>)}
  <text className="rebar-label-svg" x={x1+z/2} y={45} textAnchor="middle" fill="#dc2626">2R Ø{dia}//{supportSpacing}</text><text className="rebar-label-svg" x={W/2} y={45} textAnchor="middle" fill="#111827">2R Ø{dia}//{midSpacing}</text><text className="rebar-label-svg" x={x2-z/2} y={45} textAnchor="middle" fill="#dc2626">2R Ø{dia}//{supportSpacing}</text>
  <text x={W/2} y={215} textAnchor="middle" fill="#9fb3c8">Ø dos estribos identificado junto de cada zona</text></svg>
}

function AnchorageSvg({bottomDia,topDia,lbBottom,lbTop,lapBottom}:{bottomDia:number;topDia:number;lbBottom:number;lbTop:number;lapBottom:number}){
 return <svg viewBox="0 0 760 250" className="eng-svg detail-svg">
  <rect x="65" y="65" width="630" height="110" fill="#c8d0d8" opacity=".18" stroke="#9fb3c8"/>
  <line x1="85" y1="145" x2="675" y2="145" stroke="#dc2626" strokeWidth="5"/>
  <path d="M85 145 L85 105 Q85 90 100 90 L150 90" fill="none" stroke="#dc2626" strokeWidth="5"/>
  <text className="rebar-label-svg" x="160" y="96" fill="#dc2626">Ø{bottomDia} · lb,d ≈ {Math.round(lbBottom)} mm</text>
  <line x1="85" y1="90" x2="270" y2="90" stroke="#2563eb" strokeWidth="5"/>
  <text className="rebar-label-svg" x="280" y="96" fill="#2563eb">Ø{topDia} · lb,d ≈ {Math.round(lbTop)} mm</text>
  <line x1="360" y1="130" x2="540" y2="130" stroke="#f59e0b" strokeWidth="7"/>
  <line x1="460" y1="160" x2="640" y2="160" stroke="#f59e0b" strokeWidth="7"/>
  <line x1="460" y1="190" x2="540" y2="190" stroke="#60788c"/>
  <text className="rebar-label-svg" x="500" y="218" textAnchor="middle" fill="#f59e0b">Emenda Ø{bottomDia} ≈ {Math.round(lapBottom)} mm</text>
 </svg>
}


type CutZone={start:number;end:number}
type CurtailmentPlan={bottom:CutZone;top:CutZone[];thresholdPos:number;thresholdNeg:number}

function buildCurtailmentPlan(samples:{x:number;M:number}[],L:number,lbBottom:number,lbTop:number):CurtailmentPlan{
 const mPos=Math.max(0,...samples.map(s=>s.M))
 const mNeg=Math.abs(Math.min(0,...samples.map(s=>s.M)))
 const thresholdPos=.30*mPos,thresholdNeg=.30*mNeg
 const pos=samples.filter(s=>mPos>0&&s.M>=thresholdPos)
 const bottomRaw:CutZone=pos.length?{start:pos[0].x,end:pos[pos.length-1].x}:{start:0,end:L}
 const bottom={start:Math.max(0,bottomRaw.start-lbBottom),end:Math.min(L,bottomRaw.end+lbBottom)}
 const top:CutZone[]=[]
 if(mNeg>1e-6){
  let current:CutZone|null=null
  for(const s of samples){
   const active=s.M<=-thresholdNeg
   if(active&&!current)current={start:s.x,end:s.x}
   else if(active&&current)current.end=s.x
   else if(!active&&current){top.push({start:Math.max(0,current.start-lbTop),end:Math.min(L,current.end+lbTop)});current=null}
  }
  if(current)top.push({start:Math.max(0,current.start-lbTop),end:Math.min(L,current.end+lbTop)})
 }
 return{bottom,top,thresholdPos,thresholdNeg}
}

function CurtailmentSvg({L,samples,plan,bottom,top}:{L:number;samples:{x:number;M:number}[];plan:CurtailmentPlan;bottom:{dia:number;count:number};top:{dia:number;count:number}}){
 const W=780,H=330,x1=65,x2=715,w=x2-x1,px=(x:number)=>x1+w*x/Math.max(L,.1)
 const maxM=Math.max(1,...samples.map(s=>Math.abs(s.M))),axis=120
 const pts=samples.map(s=>`${px(s.x)},${axis-s.M/maxM*62}`).join(' ')
 const topYs=[70,88,106]
 return <svg viewBox={`0 0 ${W} ${H}`} className="eng-svg detail-svg">
  <text x={x1} y="24" fill="#9fb3c8">Diagrama M + zonas automáticas de armadura</text>
  <line x1={x1} y1={axis} x2={x2} y2={axis} stroke="#60788c"/><polyline points={pts} fill="none" stroke="#42d4cd" strokeWidth="3"/>
  <rect x={x1} y="155" width={w} height="92" fill="#c8d0d8" opacity=".16" stroke="#9fb3c8"/>
  <line x1={px(plan.bottom.start)} y1="224" x2={px(plan.bottom.end)} y2="224" stroke="#dc2626" strokeWidth="7"/>
  <line x1={px(plan.bottom.start)} y1="211" x2={px(plan.bottom.start)} y2="237" stroke="#dc2626" strokeWidth="3"/>
  <line x1={px(plan.bottom.end)} y1="211" x2={px(plan.bottom.end)} y2="237" stroke="#dc2626" strokeWidth="3"/>
  <text className="rebar-label-svg" x={(px(plan.bottom.start)+px(plan.bottom.end))/2} y="278" textAnchor="middle" fill="#dc2626">B1 · {bottom.count}Ø{bottom.dia} · {Math.max(0,plan.bottom.end-plan.bottom.start).toFixed(2)} m</text>
  {plan.top.length?plan.top.map((z,i)=><g key={i}><line x1={px(z.start)} y1={175+i*18} x2={px(z.end)} y2={175+i*18} stroke="#2563eb" strokeWidth="7"/><line x1={px(z.start)} y1={165+i*18} x2={px(z.start)} y2={185+i*18} stroke="#2563eb" strokeWidth="3"/><line x1={px(z.end)} y1={165+i*18} x2={px(z.end)} y2={185+i*18} stroke="#2563eb" strokeWidth="3"/><text className="rebar-label-svg" x={(px(z.start)+px(z.end))/2} y={151-i*16} textAnchor="middle" fill="#2563eb">T{i+1} · {top.count}Ø{top.dia}</text></g>):<><line x1={x1+10} y1="175" x2={x2-10} y2="175" stroke="#2563eb" strokeWidth="5" strokeDasharray="12 8"/><text className="rebar-label-svg" x={W/2} y="151" textAnchor="middle" fill="#2563eb">T1 · {top.count}Ø{top.dia} mínima/montagem contínua</text></>}
  <text x={W/2} y="316" textAnchor="middle" fill="#9fb3c8">Cortes prolongados por lb,d · regra automática preliminar</text>
 </svg>
}
