import React,{useEffect,useMemo,useState} from 'react'
import {sizeWater,sizeSewer} from './network'
import {loadPublicGraph,savePublicGraph} from './publicNetworkStore'

type Mode='water'|'sewer'|'public'
type Kind='meter'|'tap'|'basin'|'wc'|'shower'|'stack'|'inspection'|'manhole'|'connection'
type Point={x:number,y:number}
type Node={id:number;kind:Kind;x:number;y:number;label:string;ground?:number;invert?:number}
type Edge={id:number;a:number;b:number;L:number;slope:number;q:number;dnMin:number;points:Point[]}

const defs:{kind:Kind,label:string}[]=[
 {kind:'meter',label:'Contador'},{kind:'tap',label:'Torneira'},{kind:'basin',label:'Lavatório'},
 {kind:'wc',label:'Sanita'},{kind:'shower',label:'Duche'},{kind:'stack',label:'Tubo de queda'},
 {kind:'inspection',label:'Caixa'},{kind:'manhole',label:'Câmara de visita'},{kind:'connection',label:'Ramal de ligação'}
]
const waterKinds:Kind[]=['meter','tap','basin','shower']
const sewerKinds:Kind[]=['basin','wc','shower','stack','inspection']
const publicKinds:Kind[]=['manhole','connection']

export default function GraphicNetworkEditor(){
 const[mode,setMode]=useState<Mode>('water')
 const[nodes,setNodes]=useState<Node[]>([])
 const[edges,setEdges]=useState<Edge[]>([])
 const[tool,setTool]=useState<Kind>('meter')
 const[lineMode,setLineMode]=useState(false)
 const[lineStart,setLineStart]=useState<number|null>(null)
 const[route,setRoute]=useState<Point[]>([])

 const palette=defs.filter(d=>(mode==='water'?waterKinds:mode==='sewer'?sewerKinds:publicKinds).includes(d.kind))

 useEffect(()=>{ if(mode==='public') savePublicGraph({nodes,edges}) },[mode,nodes,edges])

 function reset(next:Mode){
   setMode(next); setLineStart(null); setRoute([]); setLineMode(false)
   setTool(next==='water'?'meter':next==='sewer'?'inspection':'manhole')
   if(next==='public'){
     const saved=loadPublicGraph()
     setNodes((saved?.nodes||[]) as Node[])
     setEdges(((saved?.edges||[]) as any[]).map(e=>({...e,points:e.points||[]})) as Edge[])
   }else{ setNodes([]); setEdges([]) }
 }

 function pos(e:React.MouseEvent<SVGSVGElement>):Point{
   const rect=e.currentTarget.getBoundingClientRect()
   return {x:(e.clientX-rect.left)*900/rect.width,y:(e.clientY-rect.top)*500/rect.height}
 }

 function canvasClick(e:React.MouseEvent<SVGSVGElement>){
   const pt=pos(e)
   if(lineMode && lineStart!==null){ setRoute([...route,pt]); return }
   if(lineMode) return
   const d=defs.find(x=>x.kind===tool)!
   const id=Date.now()+Math.floor(Math.random()*1000)
   setNodes([...nodes,{id,kind:tool,x:pt.x,y:pt.y,label:d.label,ground:mode==='public'?100:undefined,invert:mode==='public'?98:undefined}])
 }

 function nodeClick(id:number,e:React.MouseEvent){
   e.stopPropagation()
   if(!lineMode) return
   if(lineStart===null){ setLineStart(id); setRoute([]); return }
   if(lineStart===id){ setLineStart(null); setRoute([]); return }
   const a=nodes.find(n=>n.id===lineStart)!, b=nodes.find(n=>n.id===id)!
   const pts=[{x:a.x,y:a.y},...route,{x:b.x,y:b.y}]
   const L=Math.max(0.1,pts.slice(1).reduce((s,p,i)=>s+Math.hypot(p.x-pts[i].x,p.y-pts[i].y),0)/12)
   setEdges([...edges,{id:Date.now()+Math.floor(Math.random()*1000),a:lineStart,b:id,L,slope:mode==='public'?1:mode==='sewer'?2:0,q:mode==='public'?5:.5,dnMin:mode==='public'?200:mode==='sewer'?100:20,points:route}])
   setLineStart(null); setRoute([])
 }

 function deleteEdge(id:number){setEdges(edges.filter(e=>e.id!==id))}
 function clearAll(){setNodes([]);setEdges([]);setLineStart(null);setRoute([])}

 const results=useMemo(()=>edges.map(e=>{
   const a=nodes.find(n=>n.id===e.a),b=nodes.find(n=>n.id===e.b); if(!a||!b)return null
   if(mode==='water')return {...e,...sizeWater(e.q,e.L),a,b}
   return {...e,...sizeSewer(e.q,e.slope,Math.max(mode==='public'?200:100,e.dnMin)),a,b}
 }).filter(Boolean) as any[],[edges,nodes,mode])

 return <div className="graphic-editor">
  <section className="tech-card editor-toolbar">
   <div className="mode-switch">
    <button className={mode==='water'?'active':''} onClick={()=>reset('water')}>Abastecimento de Água</button>
    <button className={mode==='sewer'?'active':''} onClick={()=>reset('sewer')}>Esgotos Prediais</button>
    <button className={mode==='public'?'active':''} onClick={()=>reset('public')}>Saneamento Público</button>
   </div>
   <div className="palette">
    {palette.map(d=><button key={d.kind} className={!lineMode&&tool===d.kind?'active':''} onClick={()=>{setLineMode(false);setTool(d.kind)}}>{d.label}</button>)}
    <button className={lineMode?'active':''} onClick={()=>{setLineMode(!lineMode);setLineStart(null);setRoute([])}}>✎ Linha / Tubagem</button>
    <button onClick={clearAll}>Limpar desenho</button>
   </div>
   <p>{lineMode
    ? lineStart===null?'LINHA: toque primeiro no nó inicial.':'LINHA: toque no fundo para criar vértices/curvas; toque no nó final para terminar o troço.'
    :'ELEMENTOS: escolha um símbolo e toque no desenho para o colocar. Depois escolha “Linha / Tubagem” para desenhar o traçado.'}</p>
  </section>

  <section className="tech-card canvas-wrap">
   <svg viewBox="0 0 900 500" className="network-canvas" onClick={canvasClick}>
    <defs><pattern id="grid-v53" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#173246" strokeWidth="1"/></pattern></defs>
    <rect width="900" height="500" fill="url(#grid-v53)"/>
    {results.map((r:any)=>{
      const pts=[{x:r.a.x,y:r.a.y},...(r.points||[]),{x:r.b.x,y:r.b.y}]
      const mid=pts[Math.floor(pts.length/2)]
      return <g key={r.id}>
       <polyline points={pts.map((p:Point)=>`${p.x},${p.y}`).join(' ')} fill="none"
        stroke={mode==='water'?'#2ac8c1':mode==='sewer'?'#d6a85f':'#b5c2ca'} strokeWidth={mode==='public'?7:5}
        strokeLinejoin="round" strokeLinecap="round"/>
       <rect x={mid.x-66} y={mid.y-25} width="132" height="20" rx="6" fill="#07131e" opacity=".92"/>
       <text x={mid.x} y={mid.y-11} textAnchor="middle" fill="#fff" fontSize="11">
        {mode==='water'?`DN ${r.dn} · ${r.v.toFixed(2)} m/s`:`DN ${Math.max(mode==='public'?200:100,r.dn)} · i ${r.slope.toFixed(1)}%`}
       </text>
      </g>
    })}
    {lineMode&&lineStart!==null&&route.length>0&&(()=>{
      const a=nodes.find(n=>n.id===lineStart)!
      return <polyline points={[{x:a.x,y:a.y},...route].map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="#42d4cd" strokeWidth="3" strokeDasharray="8 6"/>
    })()}
    {nodes.map(n=><g key={n.id} onClick={e=>nodeClick(n.id,e)} style={{cursor:lineMode?'crosshair':'pointer'}}>
      <circle cx={n.x} cy={n.y} r="22" fill={lineStart===n.id?'#185f68':'#102b3d'} stroke="#42d4cd" strokeWidth="3"/>
      <text x={n.x} y={n.y+4} textAnchor="middle" fill="#fff" fontSize="10">{symbol(n.kind)}</text>
      <text x={n.x} y={n.y+39} textAnchor="middle" fill="#9bb1c2" fontSize="11">{n.label}</text>
    </g>)}
   </svg>
  </section>

  <NetworkPanel mode={mode} results={results} edges={edges} setEdges={setEdges} nodes={nodes} setNodes={setNodes} deleteEdge={deleteEdge}/>
 </div>
}

function NetworkPanel({mode,results,edges,setEdges,nodes,setNodes,deleteEdge}:{mode:Mode;results:any[];edges:Edge[];setEdges:(v:Edge[])=>void;nodes:Node[];setNodes:(v:Node[])=>void;deleteEdge:(id:number)=>void}){
 return <section className="tech-card">
  <h3>{mode==='water'?'ABASTECIMENTO — TROÇOS DE TUBAGEM':mode==='sewer'?'ESGOTOS PREDIAIS — RAMAIS / COLETORES':'REDE PÚBLICA — COLETORES'}</h3>
  <div className="public-table">{results.map((r:any)=><div className="public-row" key={r.id}>
   <b>{r.a.label} → {r.b.label}</b>
   <label>Q <input type="number" value={r.q} step=".1" onChange={e=>setEdges(edges.map(x=>x.id===r.id?{...x,q:+e.target.value}:x))}/> L/s</label>
   {mode!=='water'&&<label>i <input type="number" value={r.slope} step=".1" onChange={e=>setEdges(edges.map(x=>x.id===r.id?{...x,slope:+e.target.value}:x))}/> %</label>}
   <span>L {r.L.toFixed(1)} m</span><span>DN {mode==='water'?r.dn:Math.max(mode==='public'?200:100,r.dn)}</span>
   <span>v {r.v.toFixed(2)} m/s</span>{mode==='water'&&<span>hf {r.hf.toFixed(2)} m</span>}
   <button onClick={()=>deleteEdge(r.id)}>Apagar troço</button>
  </div>)}</div>
  {mode==='public'&&<><h3 style={{marginTop:16}}>CÂMARAS DE VISITA</h3><div className="manhole-grid">
   {nodes.filter(n=>n.kind==='manhole').map(n=>{const depth=Math.max(0,(n.ground||0)-(n.invert||0));return <article className="manhole-card" key={n.id}>
    <b>{n.label}</b>
    <label>Cota terreno <input type="number" value={n.ground||0} onChange={e=>setNodes(nodes.map(x=>x.id===n.id?{...x,ground:+e.target.value}:x))}/> m</label>
    <label>Cota soleira <input type="number" value={n.invert||0} onChange={e=>setNodes(nodes.map(x=>x.id===n.id?{...x,invert:+e.target.value}:x))}/> m</label>
    <span>Profundidade {depth.toFixed(2)} m</span><span>Dimensão mínima {depth<2.5?'1.00':'1.25'} m</span>
   </article>})}
  </div></>}
 </section>
}

function symbol(k:Kind){
 if(k==='manhole')return'CV';if(k==='connection')return'RL';if(k==='stack')return'TQ';if(k==='wc')return'WC'
 if(k==='basin')return'LV';if(k==='shower')return'DU';if(k==='meter')return'CT';if(k==='inspection')return'CX';if(k==='tap')return'TR';return'•'
}
