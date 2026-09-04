import React,{useMemo,useState} from 'react'
import {solveRCWall,estimateStemSteel} from './RetainingWallSolver'
import {solveGravityWall} from './GravityWallSolver'
import {solveGabion} from './GabionSolver'
import {solveBerlin} from './BerlinWallSolver'
import {solvePileWall} from './PileWallSolver'
import {solveReinforcedSoil} from './ReinforcedSoilSolver'
import {n2} from '../../engineering/format'

const num=(v:string)=>Number(v||0)
const Field=({label,value,onChange,unit}:{label:string,value:number,onChange:(v:number)=>void,unit?:string})=>
  <label style={{display:'grid',gap:5,fontSize:12,color:'#a9bad0'}}>
    <span>{label}{unit?` (${unit})`:''}</span>
    <input value={value} type="number" step="any" onChange={e=>onChange(num(e.target.value))}
      style={{background:'#0d1726',border:'1px solid #26374d',borderRadius:10,padding:'9px 10px',color:'#fff'}}/>
  </label>

const Card=({children}:{children:React.ReactNode})=><div style={{background:'#101a2a',border:'1px solid #22344d',borderRadius:16,padding:16}}>{children}</div>

export default function ContainmentPage(){
  const [kind,setKind]=useState('rc')
  const [H,setH]=useState(5)
  const [B,setB]=useState(3.2)
  const [phi,setPhi]=useState(32)
  const [gamma,setGamma]=useState(19)
  const [q,setQ]=useState(10)
  const [mu,setMu]=useState(.55)

  const rc=useMemo(()=>solveRCWall({H,B,toe:.8,stem:.3,baseT:.45,gammaConcrete:25,waterH:0,gamma,phi,q,mu,qAllow:250}),[H,B,phi,gamma,q,mu])
  const gravity=useMemo(()=>solveGravityWall({H,B,top:.6,gammaWall:23,gamma,phi,q,mu,qAllow:250}),[H,B,phi,gamma,q,mu])
  const gabion=useMemo(()=>solveGabion({H,rows:Math.max(1,Math.ceil(H)),boxH:1,boxW:1,gammaFill:20,gamma,phi,q,mu}),[H,gamma,phi,q,mu])
  const berlin=useMemo(()=>solveBerlin({H,spacing:2,phi,gamma,q,anchorLevels:2,profileCap:350}),[H,phi,gamma,q])
  const pile=useMemo(()=>solvePileWall({H,embed:3,spacing:1.2,diameter:.6,gamma,phi,q}),[H,gamma,phi,q])
  const rs=useMemo(()=>solveReinforcedSoil({H,L:3.5,Sv:.6,Sh:1,gamma,phi,q,tensile:40}),[H,gamma,phi,q])
  const steel=estimateStemSteel(rc.Pa*H/3,.4)

  return <div style={{display:'grid',gap:16}}>
    <div>
      <h2 style={{margin:'0 0 6px'}}>Contenção</h2>
      <div style={{color:'#8fa5bf',fontSize:13}}>Pré-dimensionamento e comparação de soluções.</div>
    </div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
      {[
        ['rc','Betão armado'],['gravity','Gravidade'],['gabion','Gabiões'],
        ['berlin','Berlim'],['pilewall','Cortina de estacas'],['reinforcedsoil','Terra reforçada']
      ].map(([k,l])=><button key={k} onClick={()=>setKind(k)}
        style={{padding:'9px 12px',borderRadius:12,border:'1px solid #2b3f58',background:kind===k?'#0f8b8d':'#111d2e',color:'#fff'}}>{l}</button>)}
    </div>

    <div style={{display:'grid',gridTemplateColumns:'minmax(260px,340px) 1fr',gap:16}}>
      <Card>
        <div style={{display:'grid',gap:10}}>
          <Field label="Altura H" unit="m" value={H} onChange={setH}/>
          <Field label="Largura base B" unit="m" value={B} onChange={setB}/>
          <Field label="Peso volúmico γ" unit="kN/m³" value={gamma} onChange={setGamma}/>
          <Field label="Ângulo φ" unit="°" value={phi} onChange={setPhi}/>
          <Field label="Sobrecarga q" unit="kPa" value={q} onChange={setQ}/>
          <Field label="Atrito base μ" value={mu} onChange={setMu}/>
        </div>
      </Card>

      <div style={{display:'grid',gap:16}}>
        <Card>
          <ContainmentSvg kind={kind} H={H} B={B}/>
        </Card>
        <Card>
          {kind==='rc' && <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(120px,1fr))',gap:12}}>
            <Stat t="Ka" v={n2(rc.ep.Ka)}/><Stat t="Pa" v={`${n2(rc.Pa)} kN/m`}/><Stat t="FS desliz." v={n2(rc.fsSlide)}/>
            <Stat t="FS derrub." v={n2(rc.fsOT)}/><Stat t="qmax" v={`${n2(rc.qMax)} kPa`}/><Stat t="As fuste" v={`${n2(steel)} mm²/m`}/>
          </div>}
          {kind==='gravity' && <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            <Stat t="Peso" v={`${n2(gravity.W)} kN/m`}/><Stat t="FS desliz." v={n2(gravity.fsSlide)}/><Stat t="FS derrub." v={n2(gravity.fsOT)}/>
          </div>}
          {kind==='gabion' && <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            <Stat t="Fiadas" v={`${gabion.rows}`}/><Stat t="FS desliz." v={n2(gabion.fsSlide)}/><Stat t="FS derrub." v={n2(gabion.fsOT)}/>
          </div>}
          {kind==='berlin' && <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            <Stat t="Carga linear" v={`${n2(berlin.lineLoad)} kN`}/><Stat t="Carga/nível" v={`${n2(berlin.anchorLoad)} kN`}/><Stat t="Utilização perfil" v={n2(berlin.utilization)}/>
          </div>}
          {kind==='pilewall' && <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            <Stat t="Kp" v={n2(pile.Kp)}/><Stat t="Ativo" v={`${n2(pile.activeLine)} kN`}/><Stat t="Passivo/Ativo" v={n2(pile.ratio)}/>
          </div>}
          {kind==='reinforcedsoil' && <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            <Stat t="Camadas" v={`${rs.layers}`}/><Stat t="FS reforço" v={n2(rs.fs)}/><Stat t="L/H" v={n2(rs.Lratio)}/>
          </div>}
        </Card>
      </div>
    </div>
  </div>
}

function Stat({t,v}:{t:string,v:string}){return <div style={{background:'#0c1624',borderRadius:12,padding:12}}><div style={{fontSize:11,color:'#8fa5bf'}}>{t}</div><div style={{fontSize:18,fontWeight:700,marginTop:4}}>{v}</div></div>}

function ContainmentSvg({kind,H,B}:{kind:string,H:number,B:number}){
  const y0=220, scale=Math.min(28,150/Math.max(H,1)), h=H*scale, base=Math.max(70,B*35)
  return <svg viewBox="0 0 560 270" style={{width:'100%',height:260}}>
    <rect x="0" y="0" width="560" height="270" fill="#0b1421"/>
    <line x1="40" y1={y0} x2="520" y2={y0} stroke="#47617f" strokeWidth="2"/>
    {kind==='rc' && <>
      <rect x={260-base/2} y={y0-14} width={base} height="14" fill="#7d8fa6"/>
      <polygon points={`280,${y0-14} 295,${y0-h} 320,${y0-h} 315,${y0-14}`} fill="#aeb9c6"/>
      <polygon points={`315,${y0-h} 500,${y0-h} 500,${y0-14} 315,${y0-14}`} fill="#4a3425"/>
    </>}
    {kind==='gravity' && <polygon points={`230,${y0} 280,${y0-h} 330,${y0-h} ${230+base},${y0}`} fill="#7d8fa6"/>}
    {kind==='gabion' && Array.from({length:Math.max(1,Math.min(6,Math.ceil(H)))}).map((_,i)=>
      <rect key={i} x={220+i*10} y={y0-(i+1)*30} width={150-i*20} height="28" fill="#75604e" stroke="#b99b78"/>)}
    {kind==='berlin' && <>
      {[230,300,370].map(x=><line key={x} x1={x} y1={y0} x2={x} y2={y0-h} stroke="#7fa1c7" strokeWidth="8"/>)}
      {Array.from({length:5}).map((_,i)=><line key={i} x1="225" y1={y0-h+i*h/5} x2="375" y2={y0-h+i*h/5} stroke="#b88d61" strokeWidth="6"/>)}
      <line x1="300" y1={y0-h*.55} x2="470" y2={y0-h*.75} stroke="#34d399" strokeWidth="4"/>
    </>}
    {kind==='pilewall' && Array.from({length:7}).map((_,i)=><circle key={i} cx={225+i*24} cy={y0-h/2} r="13" fill="#899bb1" stroke="#d7e0ea"/>)}
    {kind==='reinforcedsoil' && <>
      <polygon points={`240,${y0} 260,${y0-h} 440,${y0-h} 500,${y0}`} fill="#543c2a"/>
      {Array.from({length:6}).map((_,i)=><line key={i} x1={255+i*2} y1={y0-15-i*h/6} x2={450} y2={y0-15-i*h/6} stroke="#2dd4bf" strokeWidth="3"/>)}
    </>}
    <text x="24" y="24" fill="#d8e5f2" fontSize="14">{label(kind)}</text>
  </svg>
}
function label(k:string){return ({rc:'Muro de betão armado',gravity:'Muro de gravidade',gabion:'Muro de gabiões',berlin:'Muro de Berlim',pilewall:'Cortina de estacas',reinforcedsoil:'Terra reforçada'} as Record<string,string>)[k]||k}
