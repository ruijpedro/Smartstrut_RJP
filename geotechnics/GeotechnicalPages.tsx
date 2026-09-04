import { useMemo, useState } from 'react'

function N({label,value,setValue,unit,step='0.1'}:{label:string,value:number,setValue:(v:number)=>void,unit:string,step?:string}){
  return <label>{label} ({unit})<input type="number" step={step} value={value} onChange={e=>setValue(Number(e.target.value))}/></label>
}
function Metric({name,value}:{name:string,value:string}){return <div className="metric"><span>{name}</span><strong>{value}</strong></div>}
function GeoSketch({kind}:{kind:'soil'|'spt'|'cpt'|'bearing'|'settlement'|'slope'}){
  return <svg viewBox="0 0 700 260" className="beamSvg" role="img" aria-label={kind}>
    <rect x="0" y="0" width="700" height="260" fill="#071723"/>
    {kind==='soil'&&<><path d="M40 70 Q160 45 300 72 T660 65" className="groundLine"/><path d="M40 70 Q160 45 300 72 T660 65 V225 H40 Z" className="soilMass"/><line x1="55" y1="135" x2="645" y2="135" className="layerLine"/><line x1="55" y1="190" x2="645" y2="190" className="waterLine"/><text x="70" y="112">Estrato 1</text><text x="70" y="170">Estrato 2</text><text x="545" y="184">N.F.</text></>}
    {kind==='spt'&&<><path d="M70 55 H630 V225 H70 Z" className="soilMass"/><line x1="350" y1="28" x2="350" y2="205" className="probeLine"/><rect x="330" y="68" width="40" height="24" className="hammer"/><path d="M340 205 L350 230 L360 205" className="probeTip"/><line x1="385" y1="95" x2="385" y2="205" className="dimLine"/><text x="400" y="145">SPT</text><text x="400" y="165">N golpes</text></>}
    {kind==='cpt'&&<><path d="M70 55 H630 V225 H70 Z" className="soilMass"/><line x1="350" y1="30" x2="350" y2="205" className="probeLine"/><polygon points="338,205 362,205 350,232" className="probeTip"/><line x1="376" y1="50" x2="376" y2="205" className="dimLine"/><text x="400" y="110">qc</text><text x="400" y="135">fs</text><text x="400" y="160">u₂</text></>}
    {kind==='bearing'&&<><path d="M45 120 H655 V225 H45 Z" className="soilMass"/><rect x="265" y="65" width="170" height="55" className="structFill2"/><rect x="315" y="25" width="70" height="40" className="structFill"/><path d="M265 120 Q350 245 435 120" className="failureArc"/><line x1="350" y1="5" x2="350" y2="40" className="loadLine"/><polygon points="342,32 358,32 350,47" className="loadArrow"/><text x="450" y="95">B</text></>}
    {kind==='settlement'&&<><path d="M45 120 H655 V225 H45 Z" className="soilMass"/><rect x="255" y="72" width="190" height="48" className="structFill2"/><path d="M245 132 Q350 170 455 132" className="settleCurve"/><line x1="350" y1="122" x2="350" y2="176" className="dimLine"/><polygon points="344,166 356,166 350,178" className="loadArrow"/><text x="370" y="160">s</text></>}
    {kind==='slope'&&<><polygon points="70,220 250,70 650,220" className="soilMass"/><path d="M145 207 Q330 65 565 202" className="failureArc"/><line x1="250" y1="70" x2="470" y2="220" className="slopeLine"/><text x="300" y="110">β</text><text x="360" y="185">superfície potencial</text></>}
  </svg>
}

function Calc({title,sub,kind,fields,results,note}:{title:string,sub:string,kind:'soil'|'spt'|'cpt'|'bearing'|'settlement'|'slope',fields:React.ReactNode,results:React.ReactNode,note:string}){
  return <div className="page"><div className="pageTitle"><h1>{title}</h1><span>{sub}</span></div><div className="workspace"><section className="panel editorPanel"><GeoSketch kind={kind}/><div className="formGrid">{fields}</div></section><aside className="panel resultPanel"><div className="panelTitle">Resultados</div>{results}<p className="note">{note}</p></aside></div></div>
}

export function GeotechnicsPage(){
  const [gamma,setGamma]=useState(19),[phi,setPhi]=useState(30),[c,setC]=useState(5),[E,setE]=useState(25),[nu,setNu]=useState(.3)
  const G=E/(2*(1+nu))
  return <Calc title="Geotecnia" sub="Parâmetros base de solo" kind="soil" fields={<><N label="γ" value={gamma} setValue={setGamma} unit="kN/m³"/><N label="φ'" value={phi} setValue={setPhi} unit="°"/><N label="c'" value={c} setValue={setC} unit="kPa"/><N label="E" value={E} setValue={setE} unit="MPa"/><N label="ν" value={nu} setValue={setNu} unit="-" step="0.01"/></>} results={<><Metric name="γ" value={`${gamma.toFixed(1)} kN/m³`}/><Metric name="φ'" value={`${phi.toFixed(1)}°`}/><Metric name="c'" value={`${c.toFixed(1)} kPa`}/><Metric name="G elástico" value={`${G.toFixed(2)} MPa`}/></>} note="Parâmetros de estudo. A escolha dos valores de cálculo deve resultar da campanha geotécnica e das verificações aplicáveis ao caso."/>
}

export function SptPage(){
  const [Nraw,setNraw]=useState(18),[er,setEr]=useState(60),[cn,setCn]=useState(1.15)
  const n60=Nraw*(er/60), n160=cn*n60
  const classif=n160<4?'Muito solto/muito mole':n160<10?'Solto/mole':n160<30?'Médio':n160<50?'Denso/rijo':'Muito denso/muito rijo'
  return <Calc title="SPT" sub="Correção energética e normalização preliminar" kind="spt" fields={<><N label="N medido" value={Nraw} setValue={setNraw} unit="golpes" step="1"/><N label="Rácio energético ER" value={er} setValue={setEr} unit="%"/><N label="Fator CN" value={cn} setValue={setCn} unit="-" step="0.01"/></>} results={<><Metric name="N60" value={n60.toFixed(1)}/><Metric name="(N1)60" value={n160.toFixed(1)}/><Metric name="Classificação indicativa" value={classif}/></>} note="A correção completa do SPT pode incluir fatores adicionais de equipamento e procedimento. A classificação é apenas indicativa e não substitui interpretação geotécnica."/>
}

export function CptPage(){
  const [qc,setQc]=useState(8),[fs,setFs]=useState(80),[u2,setU2]=useState(120)
  const rf=qc>0?100*fs/(qc*1000):0
  const hint=rf<1?'Areia limpa / granular':rf<2?'Areia siltosa / transição':rf<4?'Silte / mistura':'Argila / coesivo'
  return <Calc title="CPT/CPTu" sub="Leitura e índice de atrito preliminar" kind="cpt" fields={<><N label="qc" value={qc} setValue={setQc} unit="MPa"/><N label="fs" value={fs} setValue={setFs} unit="kPa"/><N label="u₂" value={u2} setValue={setU2} unit="kPa"/></>} results={<><Metric name="Rf" value={`${rf.toFixed(2)} %`}/><Metric name="qc" value={`${qc.toFixed(2)} MPa`}/><Metric name="Comportamento indicativo" value={hint}/></>} note="Classificação simplificada baseada no índice de atrito. A interpretação CPT/CPTu rigorosa requer normalização das grandezas e correlações adequadas ao terreno."/>
}

export function BearingCapacityPage(){
  const [B,setB]=useState(2),[Df,setDf]=useState(1),[gamma,setGamma]=useState(19),[phi,setPhi]=useState(30),[c,setC]=useState(0),[fs,setFs]=useState(3)
  const r=useMemo(()=>{const p=Math.max(0.01,phi)*Math.PI/180;const tq=Math.tan(Math.PI/4+p/2);const Nq=Math.exp(Math.PI*Math.tan(p))*tq*tq;const Nc=Math.abs(Math.tan(p))<1e-6?5.14:(Nq-1)/Math.tan(p);const Ng=2*(Nq+1)*Math.tan(p);const q=gamma*Df;const qult=c*Nc+q*Nq+.5*gamma*B*Ng;return{Nq,Nc,Ng,qult,qadm:qult/Math.max(1,fs)}},[B,Df,gamma,phi,c,fs])
  return <Calc title="Capacidade de carga" sub="Fundação superficial · estimativa drenada" kind="bearing" fields={<><N label="B" value={B} setValue={setB} unit="m"/><N label="Df" value={Df} setValue={setDf} unit="m"/><N label="γ" value={gamma} setValue={setGamma} unit="kN/m³"/><N label="φ'" value={phi} setValue={setPhi} unit="°"/><N label="c'" value={c} setValue={setC} unit="kPa"/><N label="FS" value={fs} setValue={setFs} unit="-" step="0.1"/></>} results={<><Metric name="Nq" value={r.Nq.toFixed(2)}/><Metric name="Nc" value={r.Nc.toFixed(2)}/><Metric name="Nγ" value={r.Ng.toFixed(2)}/><Metric name="q ult." value={`${r.qult.toFixed(0)} kPa`}/><Metric name="q adm. indicativa" value={`${r.qadm.toFixed(0)} kPa`}/></>} note="Pré-dimensionamento por expressão clássica de capacidade de carga. Não inclui fatores completos de forma, inclinação, excentricidade, nível freático nem abordagem EC7 de projeto."/>
}

export function SettlementsPage(){
  const [q,setQ]=useState(180),[B,setB]=useState(2),[E,setE]=useState(25),[nu,setNu]=useState(.3),[I,setI]=useState(1)
  const s=E>0?(q*B*(1-nu*nu)/(E*1000)*I)*1000:0
  return <Calc title="Assentamentos" sub="Assentamento elástico imediato · estimativa" kind="settlement" fields={<><N label="q" value={q} setValue={setQ} unit="kPa"/><N label="B" value={B} setValue={setB} unit="m"/><N label="E" value={E} setValue={setE} unit="MPa"/><N label="ν" value={nu} setValue={setNu} unit="-" step="0.01"/><N label="Fator I" value={I} setValue={setI} unit="-" step="0.05"/></>} results={<><Metric name="s imediato" value={`${s.toFixed(1)} mm`}/><Metric name="E usado" value={`${E.toFixed(1)} MPa`}/><Metric name="q/E" value={(q/(E*1000)).toExponential(2)}/></>} note="Estimativa elástica simplificada. Solos estratificados, consolidação, drenagem e efeitos de tempo exigem modelos próprios."/>
}

export function SlopesPage(){
  const [beta,setBeta]=useState(28),[phi,setPhi]=useState(34),[c,setC]=useState(8),[gamma,setGamma]=useState(19),[z,setZ]=useState(2),[ru,setRu]=useState(.15)
  const r=useMemo(()=>{const b=Math.max(.1,beta)*Math.PI/180,p=Math.max(.1,phi)*Math.PI/180;const denom=gamma*z*Math.sin(b)*Math.cos(b);const cohesion=denom>0?c/denom:0;const friction=(1-Math.min(.95,Math.max(0,ru)))*Math.tan(p)/Math.tan(b);return{fs:cohesion+friction,cohesion,friction}},[beta,phi,c,gamma,z,ru])
  return <Calc title="Taludes" sub="Modelo de talude infinito · triagem preliminar" kind="slope" fields={<><N label="Inclinação β" value={beta} setValue={setBeta} unit="°"/><N label="φ'" value={phi} setValue={setPhi} unit="°"/><N label="c'" value={c} setValue={setC} unit="kPa"/><N label="γ" value={gamma} setValue={setGamma} unit="kN/m³"/><N label="z" value={z} setValue={setZ} unit="m"/><N label="ru" value={ru} setValue={setRu} unit="-" step="0.05"/></>} results={<><Metric name="FS" value={r.fs.toFixed(2)}/><Metric name="Parcela coesiva" value={r.cohesion.toFixed(2)}/><Metric name="Parcela atrito" value={r.friction.toFixed(2)}/><Metric name="Estado indicativo" value={r.fs>=1.5?'Margem elevada':r.fs>=1.0?'Margem reduzida':'Instável no modelo'}/></>} note="Modelo de talude infinito para triagem. Não substitui análise de superfícies circulares/não circulares por Bishop, Janbu, Spencer ou método equivalente."/>
}
