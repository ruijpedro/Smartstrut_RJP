import React,{useEffect,useMemo,useState} from 'react'
import {readBIMHandoff,updateBIMCalculation,n} from '../../engineering/bim/calculationBridge'
import {EngineeringBasis} from '../../engineering/EngineeringBasis'
import {solveSlab,type SlabSupport} from './SlabSolver'
import {fmt} from '../../engineering/structuralMath'
import {chooseDistributed,anchorageLength} from '../beamsPro/ReinforcementLibrary'
const F=({l,v,s,u}:{l:string,v:number,s:(n:number)=>void,u?:string})=><label className="field"><span>{l}{u?` (${u})`:''}</span><input type="number" step="any" value={v} onChange={e=>s(+e.target.value)}/></label>
export default function SlabsProPage(){
 const[lx,setLx]=useState(4.5),[ly,setLy]=useState(5.5),[gk,setG]=useState(5),[qk,setQ]=useState(3),[t,setT]=useState(.18),[cover,setC]=useState(.025),[fck,setFck]=useState(30),[fyk,setFyk]=useState(500),[E,setE]=useState(30),[phi,setPhi]=useState(10),[support,setSupport]=useState<SlabSupport>('simple')
 const[bimSource,setBimSource]=useState<string|null>(null)
 useEffect(()=>{const x=readBIMHandoff(['slab']);if(!x)return;setBimSource(x.elementId);setLx(n(x.geometry.width,lx));setLy(n(x.geometry.depth,ly));setT(n(x.geometry.thickness,t));setFck(n(x.material?.properties?.fck_MPa,fck));},[])
 const r=useMemo(()=>solveSlab({lx,ly,gk,qk,t,cover,fck,fyk,E,phi,support}),[lx,ly,gk,qk,t,cover,fck,fyk,E,phi,support])
 const arm=useMemo(()=>({
   x:chooseDistributed(r.Asx,300,6,25),
   y:chooseDistributed(r.Asy,300,6,25),
   nx:chooseDistributed(r.AsNegX,250,6,25),
   ny:chooseDistributed(r.AsNegY,250,6,25)
 }),[r.Asx,r.Asy,r.AsNegX,r.AsNegY])
 const anch=useMemo(()=>({x:anchorageLength(arm.x.dia,fck,fyk),y:anchorageLength(arm.y.dia,fck,fyk)}),[arm.x.dia,arm.y.dia,fck,fyk])
 return <div className="module-page"><div className="module-head"><div><h2>Lajes PRO</h2><p>Unidirecional/bidirecional, ELU simplificado, armaduras X/Y e controlo preliminar de deformação.</p></div></div>
 {bimSource&&<section className="panel bim-calc-banner"><b>Elemento BIM ligado: {bimSource}</b><span> · dimensões e material carregados do modelo. </span><button onClick={()=>updateBIMCalculation(bimSource,'Lajes PRO',{qEd_kPa:r.qEd,Mx_kNm_m:r.Mx,My_kNm_m:r.My,Asx_mm2_m:r.Asx,Asy_mm2_m:r.Asy},{verifiedIn:'Lajes PRO'})}>Devolver resultados ao BIM</button></section>}
 <div className="tabs-row"><button className={support==='simple'?'active':''} onClick={()=>setSupport('simple')}>Simplesmente apoiada</button><button className={support==='continuous'?'active':''} onClick={()=>setSupport('continuous')}>Contínua</button></div>
 <div className="work-grid"><section className="panel"><h3>Geometria / ações</h3><div className="form-grid"><F l="lx" u="m" v={lx} s={setLx}/><F l="ly" u="m" v={ly} s={setLy}/><F l="gk" u="kN/m²" v={gk} s={setG}/><F l="qk" u="kN/m²" v={qk} s={setQ}/><F l="Espessura h" u="m" v={t} s={setT}/><F l="Recobrimento" u="m" v={cover} s={setC}/></div><h3>Materiais / armadura</h3><div className="form-grid"><F l="fck" u="MPa" v={fck} s={setFck}/><F l="fyk" u="MPa" v={fyk} s={setFyk}/><F l="E" u="GPa" v={E} s={setE}/><F l="Ø escolhido" u="mm" v={phi} s={setPhi}/></div></section>
 <section className="panel"><h3>Modelo</h3><SlabSvg lx={lx} ly={ly} twoWay={r.twoWay}/><div className="result-grid"><M t="Comportamento" v={r.twoWay?'Bidirecional':'Unidirecional'}/><M t="ly/lx" v={fmt(r.ratio,2)}/><M t="L/h" v={fmt(r.spanDepth,1)}/></div></section></div>
 <div className="result-grid"><M t="qEd" v={`${fmt(r.qEd)} kN/m²`}/><M t="Mx +" v={`${fmt(r.Mx)} kN·m/m`}/><M t="My +" v={`${fmt(r.My)} kN·m/m`}/><M t="Mx -" v={`${fmt(r.MnegX)} kN·m/m`}/><M t="My -" v={`${fmt(r.MnegY)} kN·m/m`}/></div>
 <section className="panel"><h3>Dimensionamento de armaduras</h3><div className="result-grid"><M t="As X inf." v={`${fmt(r.Asx,0)} mm²/m`}/><M t="X inferior" v={arm.x.label}/><M t="As colocada X" v={`${fmt(arm.x.areaPerM,0)} mm²/m`}/><M t="As Y inf." v={`${fmt(r.Asy,0)} mm²/m`}/><M t="Y inferior" v={arm.y.label}/><M t="As colocada Y" v={`${fmt(arm.y.areaPerM,0)} mm²/m`}/>{support==='continuous'&&<><M t="X superior apoios" v={arm.nx.label}/><M t="Y superior apoios" v={arm.ny.label}/></>}<M t="As mín." v={`${fmt(r.AsMin,0)} mm²/m`}/></div><SlabRebarSvg x={arm.x} y={arm.y}/><div className="result-grid"><M t={`lb,d X Ø${arm.x.dia}`} v={`${fmt(anch.x.lbd,0)} mm`}/><M t={`Emenda X Ø${arm.x.dia}`} v={`${fmt(anch.x.lap,0)} mm`}/><M t={`lb,d Y Ø${arm.y.dia}`} v={`${fmt(anch.y.lbd,0)} mm`}/><M t={`Emenda Y Ø${arm.y.dia}`} v={`${fmt(anch.y.lap,0)} mm`}/></div><p className="note">Seleção automática de diâmetro e espaçamento a partir de soluções usuais de armadura distribuída. Confirmar pormenorização, armadura superior em apoios, fendilhação, flecha, punçoamento quando aplicável e restantes verificações EC2.</p></section>
 <section className="panel"><h3>ELS / corte preliminar</h3><div className="result-grid"><M t="Flecha elástica" v={`${fmt(r.defl*1000,2)} mm`}/><M t="Limite L/250" v={`${fmt(r.deflLimit*1000,1)} mm`}/><M t="Estado flecha" v={r.deflectionOK?'OK':'VERIFICAR'}/><M t="VEd" v={`${fmt(r.VEd)} kN/m`}/><M t="vEd" v={`${fmt(r.vEd,3)} MPa`}/></div><p className="note">Coeficientes de momentos e flecha são simplificados para pré-dimensionamento. Para projeto: confirmar condições reais de apoio, redistribuição, punçoamento quando aplicável, fissuração, fluência e verificações EC2 completas.</p></section></div>}
const M=({t,v}:{t:string,v:string})=><div className="metric"><span>{t}</span><b>{v}</b></div>
function SlabSvg({lx,ly,twoWay}:{lx:number,ly:number,twoWay:boolean}){return <svg viewBox="0 0 500 300" className="eng-svg"><rect x="90" y="45" width="320" height="200" fill="#31455f" stroke="#8db4dd" strokeWidth="4"/>{Array.from({length:8}).map((_,i)=><line key={'x'+i} x1={110+i*40} y1="55" x2={110+i*40} y2="235" stroke="#ef6b6b" strokeWidth="2"/>)}{twoWay&&Array.from({length:5}).map((_,i)=><line key={'y'+i} x1="100" y1={70+i*38} x2="400" y2={70+i*38} stroke="#38bdf8" strokeWidth="2"/>)}<text x="190" y="280" fill="#9fb3c8">{lx.toFixed(2)} × {ly.toFixed(2)} m</text></svg>}
function SlabRebarSvg({x,y}:{x:{dia:number;spacing:number};y:{dia:number;spacing:number}}){
 return <div className="beam-section-wrap"><h4>Malha proposta</h4><svg viewBox="0 0 520 300" className="eng-svg beam-section-svg">
  <rect x="70" y="35" width="380" height="220" rx="4" fill="#31455f" opacity=".45" stroke="#9fb3c8" strokeWidth="3"/>
  {Array.from({length:9}).map((_,i)=><line key={'vx'+i} x1={95+i*42} y1="55" x2={95+i*42} y2="235" stroke="#d7a85e" strokeWidth="2"/>)}
  {Array.from({length:6}).map((_,i)=><line key={'hy'+i} x1="90" y1={70+i*34} x2="430" y2={70+i*34} stroke="#42d4cd" strokeWidth="2"/>)}
  <text className="rebar-label-svg" x="92" y="28" fill="#d7a85e">X · Ø{x.dia}//{x.spacing}</text>
  <text className="rebar-label-svg" x="315" y="28" fill="#42d4cd">Y · Ø{y.dia}//{y.spacing}</text>
  <text x="260" y="280" textAnchor="middle" fill="#9fb3c8">Malha inferior · X Ø{x.dia}//{x.spacing} · Y Ø{y.dia}//{y.spacing}</text>
 </svg></div>
}
