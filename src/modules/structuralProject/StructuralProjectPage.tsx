import React,{useEffect,useMemo,useState} from 'react'
import {solveFrame2D,type FrameModel} from '../../engineering/core/frame2d'
import {isolatedFootingPro} from '../foundationsPro/FoundationsSolver'
import {chooseBars,chooseDistributed,barArea} from '../beamsPro/ReinforcementLibrary'
import {buildStructuralProjectBIM,saveBIMModel} from '../../engineering/bim/model'

type Tab='project'|'geometry'|'materials'|'loads'|'combinations'|'analysis'|'design'|'foundations'|'steel'|'report'
type Combo={name:string,g:number;q:number;w:number}
const tabs:[Tab,string][]=[['project','Projeto'],['geometry','Geometria'],['materials','Materiais'],['loads','Ações'],['combinations','Combinações'],['analysis','Análise'],['design','Dimensionamento'],['foundations','Fundações'],['steel','Mapa de aço'],['report','Relatório']]
const F=({l,v,s,u}:{l:string,v:number,s:(n:number)=>void,u?:string})=><label className="field"><span>{l}{u?` (${u})`:''}</span><input type="number" step="any" value={v} onChange={e=>s(+e.target.value)}/></label>
const T=({l,v,s}:{l:string,v:string,s:(n:string)=>void})=><label className="field"><span>{l}</span><input value={v} onChange={e=>s(e.target.value)}/></label>
const M=({t,v}:{t:string,v:string})=><div className="metric"><span>{t}</span><b>{v}</b></div>
function makeFrame(floors:number,bays:number,bay:number,storey:number,qLine:number,H:number,E:number){
 const nodes:any[]=[],elements:any[]=[];let id=1
 for(let j=0;j<=floors;j++)for(let i=0;i<=bays;i++){const nid=j*(bays+1)+i+1;nodes.push({id:nid,x:i*bay,y:j*storey,...(j===0?{fixX:true,fixY:true,fixR:true}:{}),...(j===floors&&i===bays?{Fx:H*1000}:{})})}
 for(let j=0;j<floors;j++)for(let i=0;i<=bays;i++){const a=j*(bays+1)+i+1,b=(j+1)*(bays+1)+i+1;elements.push({id:id++,a,b,E:E*1e9,A:.12,I:.0016})}
 for(let j=1;j<=floors;j++)for(let i=0;i<bays;i++){const a=j*(bays+1)+i+1,b=a+1;elements.push({id:id++,a,b,E:E*1e9,A:.15,I:.003,qy:-qLine*1000})}
 return{nodes,elements}
}
const combos:Combo[]=[
 {name:'ELU 1 · 1.35G + 1.50Q',g:1.35,q:1.50,w:0},
 {name:'ELU 2 · 1.35G + 1.50W',g:1.35,q:0,w:1.50},
 {name:'ELS carac. · G + Q',g:1,q:1,w:0},
 {name:'ELS vento · G + W',g:1,q:0,w:1},
]
function saveProject(data:any){localStorage.setItem('smartstruct_v64_project',JSON.stringify(data))}
export default function StructuralProjectPage(){
 const[tab,setTab]=useState<Tab>('project'),[name,setName]=useState('Projeto V64'),[location,setLocation]=useState(''),[engineer,setEngineer]=useState('')
 const[floors,setFloors]=useState(3),[bays,setBays]=useState(2),[bay,setBay]=useState(5),[storey,setStorey]=useState(3),[trib,setTrib]=useState(3)
 const[fck,setFck]=useState(30),[fyk,setFyk]=useState(500),[E,setE]=useState(30),[gamma,setGamma]=useState(25),[cover,setCover]=useState(.04)
 const[gk,setGk]=useState(4.5),[qk,setQk]=useState(2),[wall,setWall]=useState(1.5),[wind,setWind]=useState(25),[combo,setCombo]=useState(0),[qadm,setQadm]=useState(250)
 const nf=Math.max(1,Math.min(8,Math.round(floors))),nb=Math.max(1,Math.min(6,Math.round(bays)))
 const c=combos[combo]||combos[0], selfBeam=gamma*.25*.50
 const caseData=useMemo(()=>combos.map((cc,idx)=>{const qLine=cc.g*(gk+wall)*trib+cc.q*qk*trib+cc.g*selfBeam,H=cc.w*wind,model=makeFrame(nf,nb,bay,storey,qLine,H,E);try{return{idx,cc,qLine,H,model,r:solveFrame2D(model),error:''}}catch(e){return{idx,cc,qLine,H,model,r:null,error:e instanceof Error?e.message:String(e)}}}),[nf,nb,bay,storey,gk,wall,trib,qk,selfBeam,wind,E])
 const active=caseData[combo]||caseData[0],qLine=active.qLine,H=active.H,model=active.model,solved={r:active.r,error:active.error}
 const envelope=useMemo(()=>{const valid=caseData.filter(x=>x.r);if(!valid.length)return null
   const ids=valid[0].r!.endForces.map(e=>e.elementId)
   return ids.map(id=>{const rows=valid.map(x=>({name:x.cc.name,e:x.r!.endForces.find(e=>e.elementId===id)!}))
     const pick=(fn:(e:any)=>number)=>rows.reduce((a,b)=>Math.abs(fn(b.e))>Math.abs(fn(a.e))?b:a)
     const n=pick(e=>Math.abs(e.N1)>Math.abs(e.N2)?e.N1:e.N2),v=pick(e=>Math.abs(e.V1)>Math.abs(e.V2)?e.V1:e.V2),m=pick(e=>Math.abs(e.M1)>Math.abs(e.M2)?e.M1:e.M2)
     return{id,N:Math.max(Math.abs(n.e.N1),Math.abs(n.e.N2))/1000,Ncase:n.name,V:Math.max(Math.abs(v.e.V1),Math.abs(v.e.V2))/1000,Vcase:v.name,M:Math.max(Math.abs(m.e.M1),Math.abs(m.e.M2))/1000,Mcase:m.name}
   })},[caseData])
 const supports=model.nodes.filter(n=>n.y===0)
 const foundations=solved.r?supports.map((n,k)=>{const i=model.nodes.findIndex(x=>x.id===n.id),Rx=solved.r!.reactions[3*i]/1000,Ry=solved.r!.reactions[3*i+1]/1000,Mm=solved.r!.reactions[3*i+2]/1000,N=Math.max(0,Ry);let B=Math.max(1.2,Math.ceil(Math.sqrt(Math.max(N,1)/Math.max(qadm*.8,1))*10)/10),L=B,h=.55,r:any
   for(let it=0;it<20;it++){r=isolatedFootingPro({N,Hx:Math.abs(Rx),Hy:0,Mx:Math.abs(Mm),My:0,B,L,h,cb:.35,cl:.45,cover:.05,qAllow:qadm,mu:.5,fck,fyk,phi:12});if(r.ok&&r.bearingUtil<=.9)break;if(r.bearingUtil>.9||r.qmin<0){B+=.1;L+=.1}else h+=.05}
   return{id:k+1,node:n.id,Rx,Ry,M:Mm,B,L,h,r}
  }):[]
 const steelSchedule=useMemo(()=>{
  if(!envelope)return {rows:[] as SteelRow[],totalKg:0,byType:{Vigas:0,Pilares:0,Sapatas:0}}
  const rows:SteelRow[]=[]
  const fyd=fyk/1.15
  const kgm=(dia:number)=>barArea(dia)*1e-6*7850
  let mark=1
  for(const e of model.elements){
    const a=model.nodes.find(n=>n.id===e.a)!,bnode=model.nodes.find(n=>n.id===e.b)!
    const len=Math.hypot(bnode.x-a.x,bnode.y-a.y)
    const env=envelope.find(x=>x.id===e.id)
    if(!env)continue
    const vertical=Math.abs(bnode.x-a.x)<1e-9
    if(vertical){
      const bw=350,hc=450,Ac=bw*hc
      const req=Math.max(.002*Ac,env.N*1000/Math.max(.75*fyd,1))
      const bars=chooseBars(req,bw,cover*1000,8,4,12)
      const extra=.8
      const barLen=len+extra
      const weight=bars.count*barLen*kgm(bars.dia)
      rows.push({mark:`P${mark++}`,type:'Pilares',element:`Barra ${e.id}`,notation:bars.label,qty:bars.count,unitLength:barLen,totalLength:bars.count*barLen,weight,source:`|N|max ${env.N.toFixed(1)} kN`})
      const ties=Math.max(2,Math.ceil(len/.20)+1),tieLen=2*(.35-2*cover)+2*(.45-2*cover)+.20,tieDia=8,tieWeight=ties*tieLen*kgm(tieDia)
      rows.push({mark:`E${mark++}`,type:'Pilares',element:`Barra ${e.id}`,notation:`2R Ø${tieDia}//200`,qty:ties,unitLength:tieLen,totalLength:ties*tieLen,weight:tieWeight,source:'estribos preliminares'})
    }else{
      const bw=250,hb=500,d=hb-cover*1000-16/2,z=.9*d
      const req=Math.max(.0013*bw*d,env.M*1e6/Math.max(z*fyd,1))
      const bars=chooseBars(req,bw,cover*1000,8,2,8)
      const anch=.50,barLen=len+2*anch
      const weight=bars.count*barLen*kgm(bars.dia)
      rows.push({mark:`V${mark++}`,type:'Vigas',element:`Barra ${e.id}`,notation:bars.label,qty:bars.count,unitLength:barLen,totalLength:bars.count*barLen,weight,source:`|M|max ${env.M.toFixed(1)} kN·m`})
      const ties=Math.max(2,Math.ceil(len/.15)+1),tieLen=2*(.25-2*cover)+2*(.50-2*cover)+.20,tieDia=8,tieWeight=ties*tieLen*kgm(tieDia)
      rows.push({mark:`E${mark++}`,type:'Vigas',element:`Barra ${e.id}`,notation:`2R Ø${tieDia}//150`,qty:ties,unitLength:tieLen,totalLength:ties*tieLen,weight:tieWeight,source:`|V|max ${env.V.toFixed(1)} kN`})
    }
  }
  for(const f of foundations){
    const ax=chooseDistributed(f.r.Asx,250,8,25),ay=chooseDistributed(f.r.Asy,250,8,25)
    const nx=Math.max(2,Math.floor(f.L*1000/ax.spacing)+1),ny=Math.max(2,Math.floor(f.B*1000/ay.spacing)+1)
    const lx=Math.max(.2,f.B-2*.05),ly=Math.max(.2,f.L-2*.05)
    const wx=nx*lx*kgm(ax.dia),wy=ny*ly*kgm(ay.dia)
    rows.push({mark:`SX${f.id}`,type:'Sapatas',element:`F${f.id}`,notation:ax.label,qty:nx,unitLength:lx,totalLength:nx*lx,weight:wx,source:`AsX ${f.r.Asx.toFixed(0)} mm²/m`})
    rows.push({mark:`SY${f.id}`,type:'Sapatas',element:`F${f.id}`,notation:ay.label,qty:ny,unitLength:ly,totalLength:ny*ly,weight:wy,source:`AsY ${f.r.Asy.toFixed(0)} mm²/m`})
  }
  const byType={Vigas:0,Pilares:0,Sapatas:0}
  rows.forEach(r=>{byType[r.type]+=r.weight})
  return{rows,totalKg:rows.reduce((s,r)=>s+r.weight,0),byType}
 },[envelope,model,fyk,cover,foundations])
 const maxDisp=solved.r?Math.max(...model.nodes.map((_,i)=>Math.hypot(solved.r!.displacements[3*i],solved.r!.displacements[3*i+1]))):0
 const maxM=solved.r?Math.max(...solved.r.endForces.flatMap(e=>[Math.abs(e.M1),Math.abs(e.M2)]))/1000:0
 const drift=storey>0?maxDisp/storey:0
 const project={name,location,engineer,floors:nf,bays:nb,bay,storey,trib,fck,fyk,E,gamma,cover,gk,qk,wall,wind,qadm,combo}
 const bimModel=useMemo(()=>buildStructuralProjectBIM({project,nodes:model.nodes,elements:model.elements,envelope,foundations,steelRows:steelSchedule.rows}),[name,location,engineer,nf,nb,bay,storey,trib,fck,fyk,cover,model,envelope,foundations,steelSchedule.rows])
 useEffect(()=>{saveProject(project);saveBIMModel(bimModel)},[bimModel])
 function updateBIM(){saveProject(project);saveBIMModel(bimModel)}
 function exportJson(){const blob=new Blob([JSON.stringify(project,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`${name.replace(/\s+/g,'_')||'SmartStruct'}_project.json`;a.click();URL.revokeObjectURL(u)}
 function exportSteelCsv(){
  const head=['Marca','Tipo','Elemento','Armadura','Qtd','Comp. unit. m','Comp. total m','Peso kg','Origem']
  const lines=[head,...steelSchedule.rows.map(r=>[r.mark,r.type,r.element,r.notation,r.qty,r.unitLength.toFixed(2),r.totalLength.toFixed(2),r.weight.toFixed(2),r.source])]
  const csv=lines.map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(';')).join('\n')
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),u=URL.createObjectURL(blob),a=document.createElement('a')
  a.href=u;a.download=`${name.replace(/\s+/g,'_')||'SmartStruct'}_mapa_aco.csv`;a.click();URL.revokeObjectURL(u)
 }
 return <div className="module-page"><div className="module-head"><div><h2>Structural Project PRO</h2><p>Projeto → ações → combinações → análise → pré-dimensionamento → fundações → relatório.</p></div></div>
 <div className="tabs-row">{tabs.map(([id,l])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{l}</button>)}</div>
 {tab==='project'&&<section className="panel"><h3>Projeto</h3><div className="form-grid"><T l="Nome" v={name} s={setName}/><T l="Localização" v={location} s={setLocation}/><T l="Engenheiro" v={engineer} s={setEngineer}/></div><div className="editor-toolbar"><button onClick={()=>saveProject(project)}>Guardar localmente</button><button className="primary" onClick={updateBIM}>Atualizar BIM</button><button onClick={exportJson}>Exportar JSON</button></div><p className="note">O ficheiro JSON guarda os dados introduzidos, não constitui relatório regulamentar.</p></section>}
 {tab==='geometry'&&<section className="panel"><h3>Geometria</h3><div className="form-grid"><F l="Pisos" v={floors} s={setFloors}/><F l="Vãos" v={bays} s={setBays}/><F l="Largura do vão" u="m" v={bay} s={setBay}/><F l="Pé-direito" u="m" v={storey} s={setStorey}/><F l="Largura de influência" u="m" v={trib} s={setTrib}/></div><FrameSvg model={model}/></section>}
 {tab==='materials'&&<section className="panel"><h3>Materiais</h3><div className="form-grid"><F l="fck" u="MPa" v={fck} s={setFck}/><F l="fyk" u="MPa" v={fyk} s={setFyk}/><F l="Ecm adotado" u="GPa" v={E} s={setE}/><F l="Peso vol. betão" u="kN/m³" v={gamma} s={setGamma}/><F l="Recobrimento" u="m" v={cover} s={setCover}/></div></section>}
 {tab==='loads'&&<section className="panel"><h3>Ações características</h3><div className="form-grid"><F l="Gk piso" u="kN/m²" v={gk} s={setGk}/><F l="Qk utilização" u="kN/m²" v={qk} s={setQk}/><F l="Paredes/perm." u="kN/m²" v={wall} s={setWall}/><F l="Vento global" u="kN" v={wind} s={setWind}/></div><div className="result-grid"><M t="Peso próprio viga ref." v={`${selfBeam.toFixed(2)} kN/m`}/><M t="Carga linear da combinação" v={`${qLine.toFixed(2)} kN/m`}/></div></section>}
 {tab==='combinations'&&<section className="panel"><h3>Combinações</h3><div className="member-table">{combos.map((x,i)=><div key={x.name} onClick={()=>setCombo(i)} style={{cursor:'pointer'}}><b>{i===combo?'✓ ':''}{x.name}</b><span>γG={x.g}</span><span>γQ={x.q}</span><span>γW={x.w}</span></div>)}</div><p className="note">Conjunto simplificado e configurado para desenvolvimento do motor. Deve ser validado/expandido antes de utilização regulamentar.</p></section>}
 {tab==='analysis'&&<section className="panel"><h3>Análise global · {c.name}</h3>{solved.error?<div className="solver-error">{solved.error}</div>:<><FrameSvg model={model}/><div className="result-grid"><M t="Desloc. máx." v={`${(maxDisp*1000).toFixed(2)} mm`}/><M t="Drift proxy" v={`${(drift*1000).toFixed(2)} ‰`}/><M t="|M| máx." v={`${maxM.toFixed(1)} kN·m`}/><M t="Apoios" v={`${supports.length}`}/></div></>}</section>}
 {tab==='design'&&solved.r&&<><section className="panel"><h3>Resultados · combinação ativa</h3><div className="member-table">{solved.r.endForces.map(e=><div key={e.elementId}><b>Barra {e.elementId}</b><span>N1 {(e.N1/1000).toFixed(1)} / N2 {(e.N2/1000).toFixed(1)} kN</span><span>V1 {(e.V1/1000).toFixed(1)} / V2 {(e.V2/1000).toFixed(1)} kN</span><span>M1 {(e.M1/1000).toFixed(1)} / M2 {(e.M2/1000).toFixed(1)} kN·m</span></div>)}</div></section>
 {envelope&&<section className="panel"><h3>Envelopes N / V / M · todas as combinações</h3><div className="member-table">{envelope.map(e=><div key={e.id}><b>Barra {e.id}</b><span>|N|max {e.N.toFixed(1)} kN</span><span>{e.Ncase}</span><span>|V|max {e.V.toFixed(1)} kN</span><span>{e.Vcase}</span><span>|M|max {e.M.toFixed(1)} kN·m</span><span>{e.Mcase}</span></div>)}</div><p className="note">O envelope identifica a combinação que governa cada esforço por barra. Nesta fase usa extremos de barra; diagramas contínuos ao longo do elemento serão aprofundados na evolução seguinte.</p></section>}</>}
 {tab==='foundations'&&<section className="panel"><h3>Fundações individualizadas</h3><div className="member-table">{foundations.map(f=><div key={f.id}><b>F{f.id} · Nó {f.node}</b><span>N {f.Ry.toFixed(1)} kN</span><span>H {Math.abs(f.Rx).toFixed(1)} kN</span><span>M {f.M.toFixed(1)} kN·m</span><span>{f.B.toFixed(2)}×{f.L.toFixed(2)}×{f.h.toFixed(2)} m</span><span>qmax {f.r.qmax.toFixed(1)} kPa</span><span>{f.r.ok?'OK':'REVER'}</span></div>)}</div></section>}
 {tab==='steel'&&<><section className="panel"><div className="steel-head"><div><h3>Mapa global de aço</h3><p>Quantificação preliminar agregada de vigas, pilares e sapatas do modelo estrutural.</p></div><button onClick={exportSteelCsv}>Exportar CSV</button></div>
  <div className="result-grid"><M t="Peso total" v={`${steelSchedule.totalKg.toFixed(1)} kg`}/><M t="Vigas" v={`${steelSchedule.byType.Vigas.toFixed(1)} kg`}/><M t="Pilares" v={`${steelSchedule.byType.Pilares.toFixed(1)} kg`}/><M t="Sapatas" v={`${steelSchedule.byType.Sapatas.toFixed(1)} kg`}/><M t="Marcas" v={`${steelSchedule.rows.length}`}/></div>
  <SteelSummaryChart byType={steelSchedule.byType}/>
 </section>
 <section className="panel"><h3>Lista de corte / mapa de varões</h3><div className="steel-schedule">{steelSchedule.rows.map(r=><div className="steel-row" key={`${r.mark}-${r.element}`}><b>{r.mark}</b><span className="steel-type">{r.type}</span><span>{r.element}</span><strong>{r.notation}</strong><span>{r.qty} un.</span><span>{r.unitLength.toFixed(2)} m/un.</span><span>{r.totalLength.toFixed(2)} m</span><span>{r.weight.toFixed(1)} kg</span><small>{r.source}</small></div>)}</div>
 <p className="note">Mapa de aço preliminar. As secções de referência das barras do pórtico, comprimentos adicionais, estribos e ancoragens são estimados nesta fase; confirmar com o dimensionamento/pormenorização de cada elemento antes de emitir peças de execução.</p></section></>}
 {tab==='report'&&<section className="panel"><h3>Resumo preliminar do projeto</h3><div className="result-grid"><M t="Projeto" v={name}/><M t="Geometria" v={`${nf} pisos · ${nb} vãos`}/><M t="Betão" v={`C${fck}`}/><M t="Aço" v={`fyk ${fyk} MPa`}/><M t="Combinação" v={c.name}/><M t="Desloc. máx." v={`${(maxDisp*1000).toFixed(2)} mm`}/><M t="Momento máx." v={`${maxM.toFixed(1)} kN·m`}/><M t="Fundações" v={`${foundations.length}`}/><M t="Aço preliminar" v={`${steelSchedule.totalKg.toFixed(1)} kg`}/><M t="Objetos BIM ligados" v={`${bimModel.elements.length}`}/></div><p className="note">Relatório preliminar para estudo e rastreabilidade. Não substitui memória de cálculo, peças desenhadas nem verificações regulamentares completas.</p></section>}
 </div>
}
function FrameSvg({model}:{model:FrameModel}){const W=700,H=430,p=55,mx=Math.max(...model.nodes.map(n=>n.x),1),my=Math.max(...model.nodes.map(n=>n.y),1),s=Math.min((W-2*p)/mx,(H-2*p)/my),P=(n:any)=>({x:p+n.x*s,y:H-p-n.y*s});return <svg viewBox={`0 0 ${W} ${H}`} className="eng-svg">{model.elements.map(e=>{const a=P(model.nodes.find(n=>n.id===e.a)!),b=P(model.nodes.find(n=>n.id===e.b)!);return <line key={e.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#a9bacd" strokeWidth="5"/>})}{model.nodes.map(n=>{const a=P(n);return <circle key={n.id} cx={a.x} cy={a.y} r="5" fill={n.y===0?'#2dd4bf':'#e7eef6'}/>})}</svg>}
type SteelType='Vigas'|'Pilares'|'Sapatas'
type SteelRow={mark:string;type:SteelType;element:string;notation:string;qty:number;unitLength:number;totalLength:number;weight:number;source:string}
function SteelSummaryChart({byType}:{byType:Record<SteelType,number>}){
 const data=Object.entries(byType) as [SteelType,number][],max=Math.max(1,...data.map(x=>x[1]))
 return <div className="steel-chart">{data.map(([k,v])=><div key={k}><span>{k}</span><div className="steel-bar-track"><i style={{width:`${Math.max(2,100*v/max)}%`}}/></div><b>{v.toFixed(1)} kg</b></div>)}</div>
}
