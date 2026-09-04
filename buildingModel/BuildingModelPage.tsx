import React,{useMemo,useState} from 'react'
import {buildConceptualBuildingBIM,saveBIMModel} from '../../engineering/bim/model'
import {solveFrame2D,type FrameModel} from '../../engineering/core/frame2d'
import {isolatedFootingPro} from '../foundationsPro/FoundationsSolver'
const F=({l,v,s,u}:{l:string,v:number,s:(n:number)=>void,u?:string})=><label className="field"><span>{l}{u?` (${u})`:''}</span><input type="number" step="any" value={v} onChange={e=>s(+e.target.value)}/></label>
const M=({t,v}:{t:string,v:string})=><div className="metric"><span>{t}</span><b>{v}</b></div>
function makeFrame(floors:number,bays:number,bay:number,storey:number,q:number,H:number):FrameModel{
 const ns:any[]=[],es:any[]=[];let eid=1
 for(let j=0;j<=floors;j++)for(let i=0;i<=bays;i++){const id=j*(bays+1)+i+1;ns.push({id,x:i*bay,y:j*storey,...(j===0?{fixX:true,fixY:true,fixR:true}:{}),...(j===floors&&i===bays?{Fx:H*1000}:{})})}
 for(let j=0;j<floors;j++)for(let i=0;i<=bays;i++){const a=j*(bays+1)+i+1,b=(j+1)*(bays+1)+i+1;es.push({id:eid++,a,b,E:30e9,A:.12,I:.0016})}
 for(let j=1;j<=floors;j++)for(let i=0;i<bays;i++){const a=j*(bays+1)+i+1,b=a+1;es.push({id:eid++,a,b,E:30e9,A:.15,I:.003,qy:-q*1000})}
 return{nodes:ns,elements:es}
}
function ceil5(x:number){return Math.ceil(x/0.05)*0.05}
function autoColumn(N:number,M:number){
 const demand=Math.max(.25,Math.sqrt(Math.max(N,1)/12000)+Math.sqrt(Math.max(Math.abs(M),1)/8000))
 const b=Math.min(.60,Math.max(.25,ceil5(demand))),h=Math.min(.70,Math.max(.30,ceil5(demand*1.15)))
 return{b,h,label:`${Math.round(b*100)}×${Math.round(h*100)} cm`}
}
function autoBeam(L:number,q:number,Mend:number){
 const h=Math.min(.80,Math.max(.35,ceil5(L/12))),b=Math.min(.40,Math.max(.25,ceil5(h*.45)))
 const Med=Math.max(q*L*L/8,Math.abs(Mend))
 return{b,h,Med,label:`${Math.round(b*100)}×${Math.round(h*100)} cm`}
}
function autoFooting(N:number,H:number,Mm:number,qadm:number,cb:number,ch:number){
 let B=Math.max(1.2,ceil5(Math.sqrt(Math.max(N,1)/Math.max(qadm*.80,1)))),L=B,h=.50,r:any=null
 for(let k=0;k<24;k++){r=isolatedFootingPro({N,Hx:H,Hy:0,Mx:Math.abs(Mm),My:0,B,L,h,cb,cl:ch,cover:.05,qAllow:qadm,mu:.5,fck:30,fyk:500,phi:12});if(r.ok&&r.bearingUtil<=.9)break;if(r.bearingUtil>.9||r.qmin<0){B+=.1;L+=.1}else h+=.05}
 return{B,L,h,r}
}
export default function BuildingModelPage(){
 const[floors,setFloors]=useState(3),[bays,setBays]=useState(2),[bay,setBay]=useState(5),[storey,setStorey]=useState(3),[depth,setDepth]=useState(6),[q,setQ]=useState(12),[wind,setWind]=useState(25),[qadm,setQadm]=useState(250),[bimSaved,setBimSaved]=useState('')
 const nf=Math.max(1,Math.min(6,Math.round(floors))),nb=Math.max(1,Math.min(5,Math.round(bays))),model=useMemo(()=>makeFrame(nf,nb,bay,storey,q,wind),[nf,nb,bay,storey,q,wind])
 const solved=useMemo(()=>{try{return{r:solveFrame2D(model),err:''}}catch(e){return{r:null,err:e instanceof Error?e.message:String(e)}}},[model])
 const design=useMemo(()=>{if(!solved.r)return null
  const bases=model.nodes.filter(n=>n.y===0)
  const foundations=bases.map((n,k)=>{const i=model.nodes.findIndex(x=>x.id===n.id),Rx=solved.r!.reactions[3*i]/1000,Ry=solved.r!.reactions[3*i+1]/1000,Mm=solved.r!.reactions[3*i+2]/1000,N=Math.max(0,Ry),col=autoColumn(N,Mm),foot=autoFooting(N,Math.abs(Rx),Mm,qadm,col.b,col.h);return{id:n.id,index:k+1,Rx,Ry,M:Mm,col,foot}})
  const beams=solved.r.endForces.filter((e:any)=>{const el=model.elements.find(x=>x.id===e.elementId)!;const a=model.nodes.find(n=>n.id===el.a)!,b=model.nodes.find(n=>n.id===el.b)!;return Math.abs(a.y-b.y)<1e-6}).map((e:any)=>{const el=model.elements.find(x=>x.id===e.elementId)!,sz=autoBeam(e.L,q,Math.max(Math.abs(e.M1),Math.abs(e.M2))/1000);return{id:e.elementId,...sz}})
  return{foundations,beams}
 },[solved.r,model,q,qadm])
 const maxDisp=solved.r?Math.max(...model.nodes.map((_,i)=>Math.hypot(solved.r!.displacements[3*i],solved.r!.displacements[3*i+1]))):0
 const updateBIM=()=>{if(!design)return;const bim=buildConceptualBuildingBIM({floors:nf,bays:nb,bay,storey,depth,columns:design.foundations.map(x=>({index:x.index,N:x.Ry,M:x.M,b:x.col.b,h:x.col.h,footB:x.foot.B,footL:x.foot.L,footH:x.foot.h,qmax:x.foot.r.qmax,util:x.foot.r.bearingUtil})),beams:design.beams.map(x=>({id:x.id,b:x.b,h:x.h,Med:x.Med}))});saveBIMModel(bim);setBimSaved(new Date().toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'}))}
 return <div className="module-page"><div className="module-head"><div><h2>Modelo de Edifício · AUTO</h2><p>Geometria → análise global → pré-dimensionamento automático → modelo BIM estrutural conceptual.</p></div>{design&&<div className="bim-actions"><button className="primary" onClick={updateBIM}>Atualizar modelo BIM</button>{bimSaved&&<small>Guardado às {bimSaved}</small>}</div>}</div>
 <div className="work-grid"><section className="panel"><h3>Edifício</h3><div className="form-grid"><F l="Pisos" v={floors} s={setFloors}/><F l="Vãos" v={bays} s={setBays}/><F l="Largura vão" u="m" v={bay} s={setBay}/><F l="Pé-direito" u="m" v={storey} s={setStorey}/><F l="Profundidade edifício" u="m" v={depth} s={setDepth}/><F l="q vigas" u="kN/m" v={q} s={setQ}/><F l="Ação horizontal topo" u="kN" v={wind} s={setWind}/><F l="qadm terreno" u="kPa" v={qadm} s={setQadm}/></div></section><section className="panel"><h3>Modelo gerado</h3><BuildingSvg model={model}/>{solved.err&&<div className="solver-error">{solved.err}</div>}</section></div>
 {solved.r&&design&&<><div className="result-grid"><M t="Nós" v={`${model.nodes.length}`}/><M t="Barras" v={`${model.elements.length}`}/><M t="Vigas dimensionadas" v={`${design.beams.length}`}/><M t="Fundações" v={`${design.foundations.length}`}/><M t="Desloc. máx." v={`${(maxDisp*1000).toFixed(2)} mm`}/></div>
 <section className="panel"><h3>Pilares de base · secção automática</h3><div className="member-table">{design.foundations.map(x=><div key={x.id}><b>P{x.index}</b><span>N {x.Ry.toFixed(1)} kN</span><span>M {x.M.toFixed(1)} kN·m</span><span>Secção {x.col.label}</span></div>)}</div></section>
 <section className="panel"><h3>Vigas · secção automática</h3><div className="member-table">{design.beams.map(x=><div key={x.id}><b>Viga {x.id}</b><span>Secção {x.label}</span><span>M referência {x.Med.toFixed(1)} kN·m</span></div>)}</div></section>
 <section className="panel"><h3>Sapatas · otimização individual</h3><div className="member-table">{design.foundations.map(x=><div key={x.id}><b>F{x.index}</b><span>{x.foot.B.toFixed(2)}×{x.foot.L.toFixed(2)}×{x.foot.h.toFixed(2)} m</span><span>qmax {x.foot.r.qmax.toFixed(1)} kPa</span><span>Util. {(100*x.foot.r.bearingUtil).toFixed(0)}%</span><span>FS desl. {x.foot.r.slideFS.toFixed(2)}</span><span>{x.foot.r.ok?'OK':'REVER'}</span></div>)}</div></section>
 <section className="panel"><h3>Cadeia de engenharia + BIM</h3><div className="flow-line"><b>Edifício</b><span>→</span><b>Solver</b><span>→</span><b>Esforços</b><span>→</span><b>Secções</b><span>→</span><b>Fundações</b><span>→</span><b>BIM 3D</b></div><p className="note">AUTO significa pré-dimensionamento automático, não projeto regulamentar final. As regras de seleção de secção são heurísticas de engenharia; a análise matricial fornece os esforços, mas EC2/EC7, combinações, 2.ª ordem global, fissuração, punçoamento e geotecnia devem ser verificados.</p></section></>}</div>}
function BuildingSvg({model}:{model:FrameModel}){const W=650,H=430,p=50,mx=Math.max(...model.nodes.map(n=>n.x),1),my=Math.max(...model.nodes.map(n=>n.y),1),s=Math.min((W-2*p)/mx,(H-2*p)/my),P=(n:any)=>({x:p+n.x*s,y:H-p-n.y*s});return <svg viewBox={`0 0 ${W} ${H}`} className="eng-svg">{model.elements.map(e=>{const a=P(model.nodes.find(n=>n.id===e.a)!),b=P(model.nodes.find(n=>n.id===e.b)!);return <line key={e.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#a9bacd" strokeWidth="5"/>})}{model.nodes.map(n=>{const z=P(n);return <circle key={n.id} cx={z.x} cy={z.y} r="5" fill={n.y===0?'#2dd4bf':'#e7eef6'}/>})}<text x="20" y="25" fill="#9fb3c8">Modelo paramétrico + dimensionamento automático</text></svg>}