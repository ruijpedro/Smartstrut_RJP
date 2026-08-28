import React,{useMemo,useState} from 'react'
import type {Model2D,Node2D,SupportType,StructuralLoad} from './types'
import {analyseModel} from './solver'

const initial:Model2D={
  nodes:[
    {id:1,x:0,y:0,support:'fixed'},
    {id:2,x:0,y:3,support:'free'},
    {id:3,x:5,y:3,support:'free'},
    {id:4,x:5,y:0,support:'pin'}
  ],
  members:[
    {id:1,a:1,b:2,E:210,A:.006,I:8e-5,label:'P1'},
    {id:2,a:2,b:3,E:210,A:.006,I:8e-5,label:'V1'},
    {id:3,a:3,b:4,E:210,A:.006,I:8e-5,label:'P2'}
  ],
  loads:[
    {id:1,kind:'udl',member:2,direction:'global-y',q1:10}
  ]
}

const supportLabels:Record<SupportType,string>={
  free:'Livre', pin:'Articulado', 'roller-x':'Móvel X','roller-y':'Móvel Y',
  fixed:'Encastre','guided-x':'Guia X','guided-y':'Guia Y',
  'spring-x':'Mola X','spring-y':'Mola Y'
}

export default function Structural2DEditor(){
  const [model,setModel]=useState<Model2D>(initial)
  const [selectedNode,setSelectedNode]=useState<number|null>(null)
  const [selectedMember,setSelectedMember]=useState<number|null>(2)
  const [supportChoice,setSupportChoice]=useState<SupportType>('pin')
  const [loadKind,setLoadKind]=useState<'node-force'|'node-moment'|'point'|'udl'|'triangular'|'trapezoidal'|'moment'>('udl')
  const [loadValue,setLoadValue]=useState(10)
  const r=useMemo(()=>analyseModel(model),[model])

  function addNode(){
    const id=Math.max(0,...model.nodes.map(n=>n.id))+1
    setModel({...model,nodes:[...model.nodes,{id,x:2.5,y:1.5,support:'free'}]})
  }
  function addMember(){
    if(model.nodes.length<2)return
    const id=Math.max(0,...model.members.map(e=>e.id))+1
    const a=model.nodes[model.nodes.length-2].id,b=model.nodes[model.nodes.length-1].id
    setModel({...model,members:[...model.members,{id,a,b,E:210,A:.006,I:8e-5,label:`B${id}`}]})
  }
  function applySupport(){
    if(selectedNode==null)return
    setModel({...model,nodes:model.nodes.map(n=>n.id===selectedNode?{...n,support:supportChoice}:n)})
  }
  function addLoad(){
    const id=Math.max(0,...model.loads.map(l=>l.id))+1
    let load:StructuralLoad|null=null
    if(loadKind==='node-force' && selectedNode!=null) load={id,kind:'node-force',node:selectedNode,Fy:-Math.abs(loadValue)}
    if(loadKind==='node-moment' && selectedNode!=null) load={id,kind:'node-moment',node:selectedNode,M:loadValue}
    if(['point','udl','triangular','trapezoidal','moment'].includes(loadKind) && selectedMember!=null){
      if(loadKind==='point') load={id,kind:'point',member:selectedMember,P:Math.abs(loadValue),a:.5}
      if(loadKind==='udl') load={id,kind:'udl',member:selectedMember,q1:Math.abs(loadValue),direction:'global-y'}
      if(loadKind==='triangular') load={id,kind:'triangular',member:selectedMember,q1:0,q2:Math.abs(loadValue),direction:'global-y'}
      if(loadKind==='trapezoidal') load={id,kind:'trapezoidal',member:selectedMember,q1:Math.abs(loadValue)*.5,q2:Math.abs(loadValue),direction:'global-y'}
      if(loadKind==='moment') load={id,kind:'moment',member:selectedMember,M:loadValue}
    }
    if(load) setModel({...model,loads:[...model.loads,load]})
  }
  function removeLastLoad(){ setModel({...model,loads:model.loads.slice(0,-1)}) }

  return <div className="module-page">
    <div className="module-head"><div><h2>Editor Estrutural 2D</h2><p>Vigas, pórticos e treliças com biblioteca de apoios e cargas.</p></div></div>

    <div className="editor-toolbar">
      <button onClick={addNode}>+ Nó</button>
      <button onClick={addMember}>+ Barra</button>
      <button onClick={removeLastLoad}>− Última carga</button>
    </div>

    <div className="editor-grid">
      <section className="panel">
        <ModelSvg model={model} selectedNode={selectedNode} setSelectedNode={setSelectedNode} selectedMember={selectedMember} setSelectedMember={setSelectedMember}/>
      </section>

      <section className="panel control-stack">
        <div>
          <h3>Apoios</h3>
          <div className="support-palette">
            {(Object.keys(supportLabels) as SupportType[]).map(s=>
              <button key={s} className={supportChoice===s?'active':''} onClick={()=>setSupportChoice(s)}>
                <SupportIcon type={s}/><span>{supportLabels[s]}</span>
              </button>
            )}
          </div>
          <button className="primary-action" disabled={selectedNode==null} onClick={applySupport}>Aplicar ao nó {selectedNode??'—'}</button>
        </div>

        <div>
          <h3>Cargas</h3>
          <div className="load-palette">
            {[
              ['node-force','Força nodal'],['node-moment','Momento nodal'],['point','Pontual na barra'],
              ['udl','Distribuída'],['triangular','Triangular'],['trapezoidal','Trapezoidal'],['moment','Momento na barra']
            ].map(([k,l])=><button key={k} className={loadKind===k?'active':''} onClick={()=>setLoadKind(k as any)}>{l}</button>)}
          </div>
          <label className="field"><span>Valor</span><input type="number" step="any" value={loadValue} onChange={e=>setLoadValue(+e.target.value)}/></label>
          <button className="primary-action" onClick={addLoad}>Adicionar carga</button>
        </div>
      </section>
    </div>

    <section className="panel">
      <h3>Equilíbrio global</h3>
      <div className="result-grid compact">
        <M t="ΣFx" v={`${r.totalFx.toFixed(1)} kN`}/>
        <M t="ΣFy" v={`${r.totalFy.toFixed(1)} kN`}/>
        <M t="ΣM" v={`${r.totalM.toFixed(1)} kN·m`}/>
        <M t="Cargas" v={`${model.loads.length}`}/>
      </div>
    </section>

    <section className="panel">
      <h3>Cargas aplicadas</h3>
      <div className="member-table">
        {model.loads.map(l=><div key={l.id}><b>#{l.id}</b><span>{l.kind}</span><span>{loadTarget(l)}</span><span>{describeLoad(l)}</span></div>)}
      </div>
    </section>
  </div>
}



function loadTarget(l:StructuralLoad){
  return 'node' in l ? `Nó ${l.node}` : `Barra ${l.member}`
}

function describeLoad(l:StructuralLoad){
  if(l.kind==='node-force') return `Fx ${l.Fx||0} · Fy ${l.Fy||0} kN`
  if(l.kind==='node-moment') return `${l.M||0} kN·m`
  if(l.kind==='point') return `${l.P||0} kN`
  if(l.kind==='udl') return `${l.q1||0} kN/m`
  if(l.kind==='triangular'||l.kind==='trapezoidal') return `${l.q1||0} → ${l.q2||0} kN/m`
  return `${l.M||0} kN·m`
}

const M=({t,v}:{t:string,v:string})=><div className="metric"><span>{t}</span><b>{v}</b></div>

function ModelSvg({model,selectedNode,setSelectedNode,selectedMember,setSelectedMember}:{model:Model2D,selectedNode:number|null,setSelectedNode:(n:number)=>void,selectedMember:number|null,setSelectedMember:(n:number)=>void}){
  const W=680,H=430,pad=70,maxX=Math.max(1,...model.nodes.map(n=>n.x)),maxY=Math.max(1,...model.nodes.map(n=>n.y))
  const sx=(W-2*pad)/maxX,sy=(H-2*pad)/maxY,S=Math.min(sx,sy)
  const P=(n:Node2D)=>({x:pad+n.x*S,y:H-pad-n.y*S})
  return <svg viewBox={`0 0 ${W} ${H}`} className="eng-svg editor-svg">
    {Array.from({length:11}).map((_,i)=><line key={'v'+i} x1={pad+i*(W-2*pad)/10} y1={pad} x2={pad+i*(W-2*pad)/10} y2={H-pad} stroke="#18283b"/>)}
    {Array.from({length:7}).map((_,i)=><line key={'h'+i} x1={pad} y1={pad+i*(H-2*pad)/6} x2={W-pad} y2={pad+i*(H-2*pad)/6} stroke="#18283b"/>)}

    {model.members.map(e=>{
      const a=P(model.nodes.find(n=>n.id===e.a)!), b=P(model.nodes.find(n=>n.id===e.b)!)
      return <line key={e.id} onClick={()=>setSelectedMember(e.id)} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
        stroke={selectedMember===e.id?'#2dd4bf':'#b7c9dc'} strokeWidth={selectedMember===e.id?9:7} strokeLinecap="round" style={{cursor:'pointer'}}/>
    })}

    {model.loads.map(l=><LoadGraphic key={l.id} load={l} model={model} P={P}/>)}

    {model.nodes.map(n=>{const p=P(n);return <g key={n.id} onClick={()=>setSelectedNode(n.id)} style={{cursor:'pointer'}}>
      <SupportGraphic type={n.support||'free'} x={p.x} y={p.y}/>
      <circle cx={p.x} cy={p.y} r={selectedNode===n.id?10:7} fill={selectedNode===n.id?'#2dd4bf':'#e2e8f0'} stroke="#07111d" strokeWidth="2"/>
      <text x={p.x+10} y={p.y-10} fill="#9fb3c8" fontSize="13">{n.id}</text>
    </g>})}
  </svg>
}

function SupportIcon({type}:{type:SupportType}){return <svg viewBox="0 0 42 30" width="42" height="30"><SupportGraphic type={type} x={21} y={6}/></svg>}
function SupportGraphic({type,x,y}:{type:SupportType,x:number,y:number}){
  if(type==='free')return null
  if(type==='pin')return <polygon points={`${x},${y+4} ${x-10},${y+20} ${x+10},${y+20}`} fill="#60a5fa"/>
  if(type==='roller-y')return <><polygon points={`${x},${y+4} ${x-10},${y+18} ${x+10},${y+18}`} fill="#60a5fa"/><circle cx={x-5} cy={y+23} r="3" fill="#93c5fd"/><circle cx={x+5} cy={y+23} r="3" fill="#93c5fd"/></>
  if(type==='roller-x')return <g transform={`rotate(-90 ${x} ${y})`}><polygon points={`${x},${y+4} ${x-10},${y+18} ${x+10},${y+18}`} fill="#60a5fa"/><circle cx={x-5} cy={y+23} r="3" fill="#93c5fd"/><circle cx={x+5} cy={y+23} r="3" fill="#93c5fd"/></g>
  if(type==='fixed')return <rect x={x-14} y={y+5} width="28" height="8" fill="#60a5fa"/>
  if(type==='guided-x')return <><line x1={x-14} y1={y+12} x2={x+14} y2={y+12} stroke="#60a5fa" strokeWidth="5"/><line x1={x-14} y1={y+22} x2={x+14} y2={y+22} stroke="#60a5fa" strokeWidth="3"/></>
  if(type==='guided-y')return <g transform={`rotate(90 ${x} ${y})`}><line x1={x-14} y1={y+12} x2={x+14} y2={y+12} stroke="#60a5fa" strokeWidth="5"/><line x1={x-14} y1={y+22} x2={x+14} y2={y+22} stroke="#60a5fa" strokeWidth="3"/></g>
  if(type==='spring-x'||type==='spring-y'){
    const rot=type==='spring-x'?90:0
    return <g transform={`rotate(${rot} ${x} ${y})`}><polyline points={`${x},${y+5} ${x-5},${y+10} ${x+5},${y+15} ${x-5},${y+20} ${x+5},${y+25} ${x},${y+30}`} fill="none" stroke="#f59e0b" strokeWidth="3"/></g>
  }
  return null
}

function LoadGraphic({load,model,P}:{load:StructuralLoad,model:Model2D,P:(n:Node2D)=>{x:number,y:number}}){
  if(load.kind==='node-force'){
    const n=model.nodes.find(x=>x.id===load.node); if(!n)return null; const p=P(n)
    return <g><line x1={p.x} y1={p.y-60} x2={p.x} y2={p.y-14} stroke="#ef4444" strokeWidth="4"/><polygon points={`${p.x-7},${p.y-24} ${p.x+7},${p.y-24} ${p.x},${p.y-9}`} fill="#ef4444"/></g>
  }
  if(load.kind==='node-moment'){
    const n=model.nodes.find(x=>x.id===load.node); if(!n)return null; const p=P(n)
    return <path d={`M ${p.x-25} ${p.y-25} A 28 28 0 1 1 ${p.x+23} ${p.y-26}`} fill="none" stroke="#a78bfa" strokeWidth="4"/>
  }
  if(!('member' in load))return null
      const e=model.members.find(x=>x.id===load.member); if(!e)return null
  const a=P(model.nodes.find(n=>n.id===e.a)!),b=P(model.nodes.find(n=>n.id===e.b)!)
  const mx=(a.x+b.x)/2,my=(a.y+b.y)/2
  if(load.kind==='point')return <g><line x1={mx} y1={my-60} x2={mx} y2={my-12} stroke="#ef4444" strokeWidth="4"/><polygon points={`${mx-7},${my-22} ${mx+7},${my-22} ${mx},${my-7}`} fill="#ef4444"/></g>
  if(load.kind==='moment')return <circle cx={mx} cy={my-30} r="20" fill="none" stroke="#a78bfa" strokeWidth="4"/>
  const count=7
  return <g>{Array.from({length:count}).map((_,i)=>{
    const t=i/(count-1),x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t
    let len=45
    if(load.kind==='triangular')len=10+45*t
    if(load.kind==='trapezoidal')len=25+25*t
    return <g key={i}><line x1={x} y1={y-len} x2={x} y2={y-10} stroke="#f59e0b" strokeWidth="2"/><polygon points={`${x-4},${y-17} ${x+4},${y-17} ${x},${y-7}`} fill="#f59e0b"/></g>
  })}</g>
}
