import React,{useEffect,useMemo,useState} from 'react'
import {EngineeringBasis,PreliminaryChecklist} from '../../engineering/EngineeringBasis'

type Tab='geometry'|'actions'|'members'|'stability'|'connections'|'quantities'|'standards'
type Profile='C'|'U'
const Num=({label,value,set,unit,step='any'}:{label:string;value:number;set:(v:number)=>void;unit?:string;step?:string})=><label className="field"><span>{label}{unit?` (${unit})`:''}</span><input type="number" step={step} value={value} onChange={e=>set(+e.target.value)}/></label>
const Metric=({label,value,note}:{label:string;value:string;note?:string})=><article className="lsf-status-card"><span>{label}</span><b>{value}</b>{note&&<small>{note}</small>}</article>

export default function LSFPage(){
 const[tab,setTab]=useState<Tab>('members')
 const[h,setH]=useState(2.7),[spacing,setSpacing]=useState(600),[web,setWeb]=useState(90),[flange,setFlange]=useState(40),[lip,setLip]=useState(15),[t,setT]=useState(1.2),[width,setWidth]=useState(4.8),[profile,setProfile]=useState<Profile>('C')
 const[fy,setFy]=useState(350),[E,setE]=useState(210),[gammaM1,setGammaM1]=useState(1.0)
 const[gk,setGk]=useState(1.0),[qk,setQk]=useState(1.5),[tributary,setTributary]=useState(3.0),[wind,setWind]=useState(.8)
 const[screwDia,setScrewDia]=useState(4.8),[screwFu,setScrewFu]=useState(450),[nScrews,setNScrews]=useState(2)
 const r=useMemo(()=>calcLSF({h,spacing,web,flange,lip,t,width,fy,E,gammaM1,gk,qk,tributary,wind}),[h,spacing,web,flange,lip,t,width,fy,E,gammaM1,gk,qk,tributary,wind])
 const conn=useMemo(()=>{const area=Math.PI*screwDia*screwDia/4;const shearPer=.6*screwFu*area/1.25/1000;return{shearPer,total:shearPer*nScrews}},[screwDia,screwFu,nScrews])
 useEffect(()=>{try{localStorage.setItem('smartstruct:lsf-study',JSON.stringify({updatedAt:new Date().toISOString(),geometry:{h,width,spacing,web,flange,lip,t},materials:{fy,E,gammaM1},actions:{gk,qk,tributary,wind},results:{nStuds:r.nStuds,Ned:r.Ned,NbRd:r.NbRd,utilAxial:r.utilAxial,Mwind:r.Mwind,MelRd:r.MelRd,utilBend:r.utilBend,deflectionRatio:r.deflectionRatio,totalKg:r.totalKg,kgPerM2:r.kgPerM2}}))}catch{}},[h,width,spacing,web,flange,lip,t,fy,E,gammaM1,gk,qk,tributary,wind,r])
 const checks=[
  {name:'Geometria e modulação',status:'ok' as const,detail:`Montantes a ${spacing} mm; ${r.nStuds} montantes na parede.`},
  {name:'Ações gravíticas e vento',status:'ok' as const,detail:'Combinação ELU preliminar 1,35G + 1,50Q; vento tratado separadamente para triagem.'},
  {name:'Resistência axial global',status:r.utilAxial<=1?'ok' as const:'check' as const,detail:`Triagem por secção bruta e encurvadura global: η ≈ ${r.utilAxial.toFixed(2)}.`},
  {name:'Deformação do montante ao vento',status:r.deflectionRatio>=250?'ok' as const:'check' as const,detail:`L/δ ≈ ${Math.round(r.deflectionRatio)}; confirmar limite de serviço exigido pelo revestimento.`},
  {name:'Secção efetiva / encurvadura local e distorcional',status:'check' as const,detail:'Verificação ativa: a V112 sinaliza a necessidade de redução da secção e exige confirmação das propriedades efetivas do perfil EN 1993-1-3.'},
  {name:'Contraventamento e diafragmas',status:'check' as const,detail:'Verificação ativa: confirmar placas, fitas, blocking, apoios laterais e caminho de transferência de esforços de piso/cobertura.'},
  {name:'Ligações e ancoragens',status:'check' as const,detail:'Existe triagem simples de parafusos; faltam modos completos de rotura e ancoragem à fundação.'}
 ]
 return <div className="page lsf-page">
  <div className="pageTitle"><div><h1>Estruturas LSF</h1><span>Estudo prévio de Light Steel Framing · aço enformado a frio</span></div></div>
  <div className="lsf-tabs">{([['geometry','Geometria'],['actions','Ações'],['members','Montantes / Perfis'],['stability','Estabilidade'],['connections','Ligações'],['quantities','Quantificação'],['standards','Normas / Critérios']] as [Tab,string][]).map(([k,l])=><button key={k} className={tab===k?'active':''} onClick={()=>setTab(k)}>{l}</button>)}</div>

  {tab==='geometry'&&<div className="work-grid"><section className="panel"><h2>Modelo da parede</h2><div className="form-grid"><Num label="Largura" unit="m" value={width} set={setWidth}/><Num label="Altura" unit="m" value={h} set={setH}/><label className="field"><span>Espaçamento montantes (mm)</span><select value={spacing} onChange={e=>setSpacing(+e.target.value)}><option>300</option><option>400</option><option>450</option><option>600</option></select></label><label className="field"><span>Família de perfil</span><select value={profile} onChange={e=>setProfile(e.target.value as Profile)}><option value="C">C — montante</option><option value="U">U — guia</option></select></label></div></section><WallSvg widthM={width} heightM={h} spacing={spacing}/></div>}

  {tab==='actions'&&<><div className="work-grid"><section className="panel"><h2>Ações características</h2><div className="form-grid"><Num label="Gk permanente" unit="kN/m²" value={gk} set={setGk}/><Num label="Qk utilização" unit="kN/m²" value={qk} set={setQk}/><Num label="Largura tributária vertical" unit="m" value={tributary} set={setTributary}/><Num label="Pressão de vento" unit="kN/m²" value={wind} set={setWind}/></div></section><section className="panel"><h2>Ações por montante</h2><div className="lsf-status-grid"><Metric label="NEd preliminar" value={`${r.Ned.toFixed(1)} kN`} note="1,35G + 1,50Q"/><Metric label="Carga linear vento" value={`${r.windLine.toFixed(3)} kN/m`} note="pressão × espaçamento"/><Metric label="Momento vento" value={`${r.Mwind.toFixed(2)} kN·m`} note="montante biapoiado"/></div><p className="note">As combinações são deliberadamente simples para estudo prévio. Vento, neve, sismo, cargas concentradas e combinações regulamentares completas devem ser configurados conforme o edifício e o Anexo Nacional.</p></section></div></>}

  {tab==='members'&&<><div className="work-grid"><section className="panel"><h2>Perfil C/U paramétrico</h2><div className="form-grid"><Num label="Alma" unit="mm" value={web} set={setWeb}/><Num label="Banzo" unit="mm" value={flange} set={setFlange}/><Num label="Lábio" unit="mm" value={lip} set={setLip}/><Num label="Espessura" unit="mm" value={t} set={setT}/><Num label="fy" unit="MPa" value={fy} set={setFy}/><Num label="E" unit="GPa" value={E} set={setE}/><Num label="γM1" value={gammaM1} set={setGammaM1}/></div></section><section className="panel"><ProfileSvg web={web} flange={flange} lip={lip} t={t}/><div className="lsf-status-grid"><Metric label="Área bruta Ag" value={`${r.A.toFixed(0)} mm²`}/><Metric label="Ix bruto" value={`${(r.Ix/1e4).toFixed(1)} cm⁴`}/><Metric label="Iy bruto" value={`${(r.Iy/1e4).toFixed(1)} cm⁴`}/><Metric label="Massa linear" value={`${r.kgPerM.toFixed(2)} kg/m`}/></div></section></div><section className="panel"><h2>Triagem resistente do montante</h2><div className="lsf-status-grid"><Metric label="Npl,Rd bruto" value={`${r.NplRd.toFixed(1)} kN`} note="Ag·fy/γM1; sem redução local"/><Metric label="Nb,Rd global" value={`${r.NbRd.toFixed(1)} kN`} note="encurvadura global aproximada"/><Metric label="Utilização axial" value={r.utilAxial.toFixed(2)} note={r.utilAxial<=1?'triagem global OK':'rever perfil/modulação'}/><Metric label="Wel,x bruto" value={`${(r.Wx/1e3).toFixed(1)} cm³`}/><Metric label="Mel,Rd bruto" value={`${r.MelRd.toFixed(2)} kN·m`} note="sem secção efetiva"/><Metric label="Utilização flexão vento" value={r.utilBend.toFixed(2)}/></div><p className="note">Para LSF, a secção efetiva e os modos de instabilidade local/distorcional podem governar. Estes resultados são uma triagem de engenharia, não substituem a verificação completa da EN 1993-1-3.</p></section></>}

  {tab==='stability'&&<div className="work-grid"><section className="panel"><h2>Estabilidade global</h2><div className="lsf-status-grid"><Metric label="i mínimo" value={`${r.imin.toFixed(1)} mm`}/><Metric label="Esbelteza L/i" value={r.lambda.toFixed(1)}/><Metric label="Ncr mínimo" value={`${r.Ncr.toFixed(1)} kN`}/><Metric label="λ̄ aproximada" value={r.lambdaBar.toFixed(2)}/><Metric label="χ aproximado" value={r.chi.toFixed(3)}/><Metric label="L/δ ao vento" value={`1/${Math.round(r.deflectionRatio)}`}/></div></section><section className="panel"><h2>Sequência obrigatória para projeto</h2><PreliminaryChecklist items={checks}/></section></div>}

  {tab==='connections'&&<div className="work-grid"><section className="panel"><h2>Triagem de ligação aparafusada</h2><div className="form-grid"><Num label="Ø parafuso" unit="mm" value={screwDia} set={setScrewDia}/><Num label="fu parafuso" unit="MPa" value={screwFu} set={setScrewFu}/><Num label="N.º parafusos" value={nScrews} set={setNScrews}/></div><div className="lsf-status-grid"><Metric label="Corte por parafuso" value={`${conn.shearPer.toFixed(2)} kN`} note="triagem por área resistente"/><Metric label="Corte conjunto" value={`${conn.total.toFixed(2)} kN`}/></div></section><section className="panel"><h2>Verificações ainda necessárias</h2><PreliminaryChecklist items={[{name:'Corte do parafuso',status:'check',detail:'Triagem simples implementada.'},{name:'Esmagamento / rasgamento da chapa',status:'check',detail:'Verificação ativa: confirmar espessura, fu da chapa, distâncias ao bordo e espaçamentos.'},{name:'Pull-over / pull-out',status:'check',detail:'Verificação ativa no fluxo de ligação; confirmar resistência do parafuso, chapa e suporte conforme configuração.'},{name:'Ancoragem de guia à fundação',status:'check',detail:'Verificação ativa: definir chumbadores, espaçamento, bordo e ações de levantamento/corte.'}]}/></section></div>}

  {tab==='quantities'&&<><div className="lsf-status-grid"><Metric label="Montantes" value={String(r.nStuds)}/><Metric label="Perfil montantes" value={`${r.studLength.toFixed(1)} m`}/><Metric label="Guias superior+inferior" value={`${r.trackLength.toFixed(1)} m`}/><Metric label="Comprimento total" value={`${r.totalLength.toFixed(1)} m`}/><Metric label="Aço estimado" value={`${r.totalKg.toFixed(1)} kg`}/><Metric label="Aço por m² parede" value={`${r.kgPerM2.toFixed(1)} kg/m²`}/></div><section className="panel"><h2>Mapa preliminar</h2><div className="member-table"><div><b>M01 · Montante C</b><span>{r.nStuds} un × {h.toFixed(2)} m</span><span>{r.studLength.toFixed(2)} m</span></div><div><b>G01 · Guia U</b><span>2 un × {width.toFixed(2)} m</span><span>{r.trackLength.toFixed(2)} m</span></div></div><p className="note">Não inclui vãos, vergas, ombreiras reforçadas, blocking, fitas, perdas de corte, chapas, parafusos ou ancoragens.</p></section></>}

  {tab==='standards'&&<><EngineeringBasis area="lsf"/><section className="panel"><h2>Estado do estudo prévio LSF</h2><PreliminaryChecklist items={checks}/></section></>}
 </div>
}

function calcLSF(x:{h:number;spacing:number;web:number;flange:number;lip:number;t:number;width:number;fy:number;E:number;gammaM1:number;gk:number;qk:number;tributary:number;wind:number}){
 const {h,spacing,web,flange,lip,t,width,fy,E,gammaM1,gk,qk,tributary,wind}=x
 const nStuds=Math.ceil(width*1000/spacing)+1
 const A=t*(web+2*flange+2*lip)
 // thin-wall component approximation about centroid axes; gross properties only
 const Ix=t*Math.pow(web,3)/12 + 2*(flange*t*Math.pow(web/2,2)) + 2*(lip*t*Math.pow(Math.max(0,web/2-lip/2),2))
 const Iy=2*(t*Math.pow(flange,3)/12) + 2*(lip*t*Math.pow(Math.max(0,flange-t/2),2)) + web*Math.pow(t,3)/12
 const imin=Math.sqrt(Math.max(1,Math.min(Ix,Iy))/Math.max(1,A))
 const Lmm=h*1000, lambda=Lmm/imin
 const Epa=E*1000
 const Ncr=Math.PI*Math.PI*Epa*Math.min(Ix,Iy)/(Lmm*Lmm)/1000
 const NplRd=A*fy/gammaM1/1000
 const lambdaBar=Math.sqrt(Math.max(0,A*fy/(Math.max(Ncr,1e-9)*1000)))
 const alpha=.49,phi=.5*(1+alpha*(lambdaBar-.2)+lambdaBar*lambdaBar)
 const chi=Math.min(1,1/(phi+Math.sqrt(Math.max(0,phi*phi-lambdaBar*lambdaBar))))
 const NbRd=chi*A*fy/gammaM1/1000
 const tributaryArea=spacing/1000*tributary
 const Ned=(1.35*gk+1.5*qk)*tributaryArea
 const windLine=wind*spacing/1000
 const Mwind=windLine*h*h/8
 const Wx=Ix/(web/2)
 const MelRd=Wx*fy/gammaM1/1e6
 const utilAxial=Ned/Math.max(NbRd,1e-9), utilBend=Mwind/Math.max(MelRd,1e-9)
 const wNmm=windLine // 1 kN/m = 1 N/mm
 const delta=5*wNmm*Math.pow(Lmm,4)/(384*Epa*Math.max(Ix,1))
 const deflectionRatio=Lmm/Math.max(delta,1e-9)
 const kgPerM=A*1e-6*7850
 const studLength=nStuds*h,trackLength=2*width,totalLength=studLength+trackLength,totalKg=totalLength*kgPerM,kgPerM2=totalKg/(width*h)
 return{nStuds,A,Ix,Iy,imin,lambda,Ncr,NplRd,lambdaBar,chi,NbRd,Ned,windLine,Mwind,Wx,MelRd,utilAxial,utilBend,delta,deflectionRatio,kgPerM,studLength,trackLength,totalLength,totalKg,kgPerM2}
}
function WallSvg({widthM,heightM,spacing}:{widthM:number;heightM:number;spacing:number}){const W=720,H=330,p=38,iw=W-2*p,ih=H-2*p,n=Math.max(2,Math.ceil(widthM*1000/spacing)+1);return <div className="lsf-drawing"><svg viewBox={`0 0 ${W} ${H}`}><rect x={p} y={p} width={iw} height={ih} fill="none" stroke="currentColor" strokeWidth="6"/>{Array.from({length:n}).map((_,i)=>{const x=p+iw*i/(n-1);return <g key={i}><line x1={x} y1={p+3} x2={x} y2={p+ih-3} stroke="currentColor" strokeWidth="4"/><line x1={x-5} y1={p+8} x2={x+5} y2={p+8} stroke="currentColor"/><line x1={x-5} y1={p+ih-8} x2={x+5} y2={p+ih-8} stroke="currentColor"/></g>})}<text x={W/2} y={22} textAnchor="middle">Parede LSF · montantes @ {spacing} mm</text><text x={W/2} y={H-8} textAnchor="middle">{widthM.toFixed(2)} m × {heightM.toFixed(2)} m</text></svg></div>}
function ProfileSvg({web,flange,lip,t}:{web:number;flange:number;lip:number;t:number}){return <div className="lsf-drawing"><svg viewBox="0 0 420 260"><path d="M285 45 H145 V215 H285 M285 45 v42 M285 215 v-42" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round"/><text x="80" y="132">alma {web} mm</text><text x="210" y="28" textAnchor="middle">banzo {flange} mm</text><text x="305" y="72">lábio {lip} mm</text><text x="210" y="245" textAnchor="middle">t = {t} mm · secção bruta paramétrica</text></svg></div>}
