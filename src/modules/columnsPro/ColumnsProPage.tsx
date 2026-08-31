import React,{useEffect,useMemo,useState} from 'react'
import {readBIMHandoff,updateBIMCalculation,n} from '../../engineering/bim/calculationBridge'
import {EngineeringBasis} from '../../engineering/EngineeringBasis'
import {solveColumn,type EndCondition} from './ColumnSolver'
import {fmt} from '../../engineering/structuralMath'
import {chooseBars,chooseStirrups,anchorageLength} from '../beamsPro/ReinforcementLibrary'
const F=({l,v,s,u}:{l:string,v:number,s:(n:number)=>void,u?:string})=><label className="field"><span>{l}{u?` (${u})`:''}</span><input type="number" step="any" value={v} onChange={e=>s(+e.target.value)}/></label>
export default function ColumnsProPage(){
 const[N,setN]=useState(900),[Mx,setMx]=useState(65),[My,setMy]=useState(20),[b,setB]=useState(.35),[h,setH]=useState(.45),[L,setL]=useState(3),[fck,setFck]=useState(30),[fyk,setFyk]=useState(500),[E,setE]=useState(30),[cover,setCover]=useState(.035),[phi,setPhi]=useState(16),[k,setK]=useState(1),[end,setEnd]=useState<EndCondition>('pinned')
 const[bimSource,setBimSource]=useState<string|null>(null)
 useEffect(()=>{const x=readBIMHandoff(['column']);if(!x)return;setBimSource(x.elementId);setB(n(x.geometry.b,b));setH(n(x.geometry.h,h));setL(n(x.geometry.length,L));setFck(n(x.material?.properties?.fck_MPa,fck));const rr=x.calculation?.results||{};setN(n(rr.Nmax_kN??rr.Nbase_kN,N));setMx(n(rr.Mmax_kNm??rr.Mbase_kNm,Mx));},[])
 const r=useMemo(()=>solveColumn({N,Mx,My,b,h,L,fck,fyk,E,cover,phi,k,end}),[N,Mx,My,b,h,L,fck,fyk,E,cover,phi,k,end])
 const arm=useMemo(()=>{
   const longitudinal=chooseBars(r.AsReq,b*1000,cover*1000,8,4,12)
   const tie=chooseStirrups(0,Math.min(b,h)*1000,b*1000)
   return{longitudinal,tie}
 },[r.AsReq,b,h,cover])
 const anch=useMemo(()=>anchorageLength(arm.longitudinal.dia,fck,fyk),[arm.longitudinal.dia,fck,fyk])
 return <div className="module-page"><div className="module-head"><div><h2>Pilares PRO</h2><p>Compressão + flexão biaxial, comprimento efetivo, Euler, 2.ª ordem e armadura preliminar.</p></div></div>
 {bimSource&&<section className="panel bim-calc-banner"><b>Elemento BIM ligado: {bimSource}</b><span> · secção, material e esforços disponíveis carregados. </span><button onClick={()=>updateBIMCalculation(bimSource,'Pilares PRO',{NEd_kN:N,Mx_kNm:Mx,My_kNm:My,utilizacao:r.interaction,AsReq_mm2:r.AsReq},{verifiedIn:'Pilares PRO'})}>Devolver resultados ao BIM</button></section>}
 <div className="tabs-row">{(['pinned','fixed-pinned','fixed-fixed','cantilever','custom'] as EndCondition[]).map(x=><button key={x} className={end===x?'active':''} onClick={()=>setEnd(x)}>{({pinned:'Articulado-articulado','fixed-pinned':'Encastrado-articulado','fixed-fixed':'Bi-encastrado',cantilever:'Consola',custom:'k manual'} as any)[x]}</button>)}</div>
 <div className="work-grid"><section className="panel"><h3>Ações / geometria</h3><div className="form-grid"><F l="NEd" u="kN" v={N} s={setN}/><F l="Mx,Ed" u="kN·m" v={Mx} s={setMx}/><F l="My,Ed" u="kN·m" v={My} s={setMy}/><F l="b" u="m" v={b} s={setB}/><F l="h" u="m" v={h} s={setH}/><F l="Comprimento L" u="m" v={L} s={setL}/>{end==='custom'&&<F l="Coeficiente k" v={k} s={setK}/>}</div><h3>Material / armadura</h3><div className="form-grid"><F l="fck" u="MPa" v={fck} s={setFck}/><F l="fyk" u="MPa" v={fyk} s={setFyk}/><F l="E" u="GPa" v={E} s={setE}/><F l="Recobrimento" u="m" v={cover} s={setCover}/><F l="Ø longitudinal" u="mm" v={phi} s={setPhi}/></div></section>
 <section className="panel"><h3>Estabilidade</h3><div className="result-grid"><M t="k efetivo" v={fmt(r.kEff,2)}/><M t="L efetivo" v={`${fmt(r.le,2)} m`}/><M t="λx" v={fmt(r.lambdaX,1)}/><M t="λy" v={fmt(r.lambdaY,1)}/><M t="Ncr,x" v={`${fmt(r.NcrX,0)} kN`}/><M t="Ncr,y" v={`${fmt(r.NcrY,0)} kN`}/></div></section></div>
 <div className="result-grid"><M t="NEd/Ncr" v={fmt(r.eta,3)}/><M t="Amplificação 2ª ordem" v={fmt(r.amp,2)}/><M t="Mx,2" v={`${fmt(r.Mx2)} kN·m`}/><M t="My,2" v={`${fmt(r.My2)} kN·m`}/><M t="σ máx." v={`${fmt(r.sigMax)} MPa`}/></div>
 <section className="panel"><h3>Dimensionamento de armaduras</h3><div className="result-grid"><M t="As mínima" v={`${fmt(r.AsMin,0)} mm²`}/><M t="As requerida" v={`${fmt(r.AsReq,0)} mm²`}/><M t="Armadura longitudinal" v={arm.longitudinal.label}/><M t="As colocada" v={`${fmt(arm.longitudinal.area,0)} mm²`}/><M t="Estribos" v={arm.tie.label}/><M t="Interação N-Mx-My" v={fmt(r.interaction,2)}/></div><ColumnSectionSvg b={b} h={h} cover={cover} bars={arm.longitudinal}/><div className="result-grid"><M t={`lb,d Ø${arm.longitudinal.dia}`} v={`${fmt(anch.lbd,0)} mm`}/><M t={`Emenda Ø${arm.longitudinal.dia}`} v={`${fmt(anch.lap,0)} mm`}/></div><p className="note">A proposta longitudinal é automática e respeita um mínimo de 4 varões, com verificação geométrica simples de disposição. O cálculo N-Mx-My e 2.ª ordem continua simplificado; confirmar diagrama de interação, imperfeições, fluência, confinamento, espaçamento de estribos e pormenorização EC2.</p></section></div>}
const M=({t,v}:{t:string,v:string})=><div className="metric"><span>{t}</span><b>{v}</b></div>
function ColumnSectionSvg({b,h,cover,bars}:{b:number;h:number;cover:number;bars:{dia:number;count:number}}){
 const W=360,H=320,p=35,scale=Math.min((W-2*p)/Math.max(b,.1),(H-2*p)/Math.max(h,.1))
 const bw=b*scale,hh=h*scale,x=(W-bw)/2,y=(H-hh)/2,c=Math.max(cover,.02)*scale,r=Math.max(4,bars.dia/1000*scale/2)
 const pts:{x:number;y:number}[]=[]
 const n=Math.max(4,bars.count),perSide=Math.max(2,Math.ceil(n/4))
 for(let i=0;i<perSide;i++){const t=i/(perSide-1);pts.push({x:x+c+r+(bw-2*(c+r))*t,y:y+c+r});pts.push({x:x+c+r+(bw-2*(c+r))*t,y:y+hh-c-r})}
 for(let i=1;i<perSide-1;i++){const t=i/(perSide-1);pts.push({x:x+c+r,y:y+c+r+(hh-2*(c+r))*t});pts.push({x:x+bw-c-r,y:y+c+r+(hh-2*(c+r))*t})}
 return <div className="beam-section-wrap"><h4>Secção proposta</h4><svg viewBox={`0 0 ${W} ${H}`} className="eng-svg beam-section-svg">
  <rect x={x} y={y} width={bw} height={hh} fill="#c8d0d8" opacity=".24" stroke="#9fb3c8" strokeWidth="3"/>
  <rect x={x+c} y={y+c} width={bw-2*c} height={hh-2*c} fill="none" stroke="#42d4cd" strokeWidth="3"/>
  {pts.slice(0,n).map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={r} fill="#d7a85e" stroke="#111827"/>)}
  <line x1={x+bw-8} y1={y+c+18} x2={W-88} y2={y+c+18} stroke="#d7a85e"/>
  <text className="rebar-label-svg" x={W-82} y={y+c+24} fill="#d7a85e">{bars.count}Ø{bars.dia}</text>
  <line x1={x+bw-8} y1={y+hh/2} x2={W-88} y2={y+hh/2} stroke="#42d4cd"/>
  <text className="rebar-label-svg" x={W-82} y={y+hh/2+6} fill="#42d4cd">Estribos</text>
  <text x={W/2} y={H-10} textAnchor="middle" fill="#9fb3c8">{bars.count}Ø{bars.dia} · {Math.round(b*1000)}×{Math.round(h*1000)} mm</text>
 </svg></div>
}
