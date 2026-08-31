import React, { useEffect, useMemo, useState } from 'react'
import {loadBIMModel} from '../../engineering/bim/model'

type Tab = 'edificios' | 'levantamento' | 'diagnostico' | 'betao' | 'alvenarias' | 'pavimentos' | 'metalicas' | 'madeira' | 'pedra' | 'intervencao'
type Severity = 'Baixa' | 'Moderada' | 'Elevada' | 'Crítica'
type SurveyBase = {name:string; dataUrl:string; kind:'Planta'|'Alçado'|'Fotografia'}

type Finding = {
  id: number
  element: string
  anomaly: string
  severity: Severity
  note: string
  bimElementId?: string
  x?: number
  y?: number
  category?: string
}

const tabs: {id: Tab; label: string}[] = [
  { id:'edificios', label:'Edifícios' },
  { id:'levantamento', label:'Levantamento patológico' },
  { id:'diagnostico', label:'Diagnóstico e intervenção' },
  { id:'betao', label:'Betão armado' },
  { id:'alvenarias', label:'Alvenarias' },
  { id:'pavimentos', label:'Pavimentos' },
  { id:'metalicas', label:'Estruturas metálicas' },
  { id:'madeira', label:'Madeira' },
  { id:'pedra', label:'Pedra' },
  { id:'intervencao', label:'Reabilitação' },
]

const materialData: Record<Exclude<Tab,'edificios'|'levantamento'|'diagnostico'|'intervencao'>, {title:string; intro:string; anomalies:string[]; actions:string[]; checks:string[]}> = {
  betao: {
    title:'Reabilitação de estruturas de betão armado',
    intro:'Triagem de proteção, reparação e reforço. A intervenção deve partir da inspeção, caracterização da geometria, materiais, ações e anomalias.',
    anomalies:['Fissuras e fendas','Vazios / zonas porosas','Descasques','Desagregação','Corrosão das armaduras','Carbonatação / agentes agressivos'],
    actions:['Proteção superficial e controlo dos agentes agressivos','Reparação localizada do betão','Injeção / selagem de fendas quando tecnicamente aplicável','Encamisamento','Chapas ou perfis metálicos de reforço','FRP','Pré-esforço exterior','Introdução de novos elementos estruturais'],
    checks:['Resistência in situ e geometria','Cobrimento e estado das armaduras','Causas da degradação antes da reparação','Capacidade resistente antes/depois da intervenção','Compatibilidade e durabilidade dos materiais de reparação']
  },
  alvenarias: {
    title:'Reabilitação de alvenarias resistentes',
    intro:'Avaliação de paredes existentes de pedra, tijolo ou sistemas tradicionais, distinguindo anomalias estruturais e não estruturais.',
    anomalies:['Fissuração / fendas','Perda de coesão','Deformações e desaprumos','Lavagem ou perda de juntas','Humidade / sais','Esmagamento localizado','Deficiente ligação entre paredes e pavimentos'],
    actions:['Injeção de caldas ligantes','Reparação de fissuras e fendas','Substituição localizada de elementos degradados','Reconstrução localizada de panos','Reforço de ligações entre paredes/pavimentos','Tirantes e cintagens quando justificados','Consolidação compatível com a alvenaria existente'],
    checks:['Identificação da tipologia da parede','Espessura, constituição e continuidade','Estado das juntas e ligantes','Ligações aos pavimentos e cobertura','Comportamento fora do plano e vulnerabilidade sísmica','Compatibilidade das argamassas de intervenção']
  },
  pavimentos: {
    title:'Reabilitação de pavimentos',
    intro:'Pavimentos antigos podem ser de madeira, metálicos, mistos ou resultantes de intervenções posteriores. A avaliação deve considerar o funcionamento global do edifício.',
    anomalies:['Deformação excessiva','Vibração','Apodrecimento / ataque biológico','Corrosão de perfis metálicos','Apoios degradados','Alterações de carga ou uso','Cortes ou remoções indevidas'],
    actions:['Reparar ou substituir troços degradados','Reforçar vigamentos','Melhorar apoios e ligações às paredes','Adicionar elementos de distribuição/rigidificação','Reduzir deformabilidade quando necessário','Compatibilizar reforço com paredes existentes','Rever cargas e utilização futura'],
    checks:['Vãos, secções e espaçamentos reais','Estado dos apoios','Humidade e ventilação','Cargas existentes e futuras','Rigidez no plano / função de diafragma','Compatibilidade com elementos históricos']
  },
  metalicas: {
    title:'Reabilitação de estruturas metálicas',
    intro:'A caracterização deve distinguir ferro fundido, ferro forjado e aço, sobretudo em estruturas antigas, porque o material condiciona a estratégia de intervenção.',
    anomalies:['Corrosão','Perda de secção','Deformações','Fadiga / fissuração','Ligações degradadas','Elementos ou reforços incompatíveis'],
    actions:['Limpeza e proteção anticorrosiva','Substituição localizada','Reforço por chapas/perfis','Reparação ou substituição de ligações','Escoramento e faseamento de intervenção','Controlo de água e condensações'],
    checks:['Identificação do material e época','Medição de espessuras / perda de secção','Estado de rebites, parafusos e soldaduras','Avaliação de estabilidade','Compatibilidade de soldadura/intervenção com material antigo','Proteção futura e manutenção']
  },
  madeira: {
    title:'Patologia e reabilitação de elementos de madeira',
    intro:'Nos edifícios antigos é frequente encontrar pavimentos, coberturas, escadas e outros elementos de madeira associados a paredes de alvenaria de pedra.',
    anomalies:['Degradação biológica','Humidade persistente','Podridão','Ataques de insetos xilófagos','Fendas e perdas de secção','Deformação','Apoios embebidos degradados'],
    actions:['Eliminar a origem da humidade','Conservar a madeira sã','Substituição localizada / próteses','Reforço de secções','Melhoria de apoios e ventilação','Tratamento adequado quando tecnicamente justificado'],
    checks:['Teor de água / origem da humidade','Extensão real da degradação','Secção residual resistente','Estado das entregas nas paredes','Cobertura e infiltrações','Alterações de uso e sobrecargas']
  },
  pedra: {
    title:'Conservação e reabilitação de elementos de pedra',
    intro:'A intervenção em pedra exige caracterização do material e do perfil de degradação. Consolidação e hidrofugação não devem ser tratadas como soluções universais.',
    anomalies:['Desagregação superficial','Fissuração','Perda de material','Cristalização de sais','Biodeterioração','Alteração por água','Intervenções anteriores incompatíveis'],
    actions:['Limpeza compatível','Proteção superficial criteriosamente avaliada','Tratamentos hidrófugos apenas após ensaios de adequação','Consolidação quando justificada','Substituição localizada em situações adequadas','Monitorização pós-intervenção'],
    checks:['Tipo de pedra / porosidade','Perfil e profundidade da degradação','Absorção de água','Sais e agentes biológicos','Ensaios prévios do produto','Risco de interfaces entre zonas tratadas e não tratadas','Reversibilidade / impacto da intervenção']
  }
}

const pathologyTypes=['Fissura / fenda','Humidade / infiltração','Corrosão','Deformação','Perda de secção','Desagregação','Ataque biológico','Apoio / ligação deficiente','Outra']
const REHAB_STORAGE_KEY='smartstruct:rehabilitation-study'

const severityRank: Record<Severity, number> = { Baixa:1, Moderada:2, Elevada:3, Crítica:4 }

export default function RehabilitationPage(){
  const [tab,setTab]=useState<Tab>('edificios')
  const [project,setProject]=useState({name:'Edifício existente',location:'',year:'',use:'',system:'Alvenaria resistente / estrutura mista'})
  const [findings,setFindings]=useState<Finding[]>([
    {id:1,element:'Parede resistente',anomaly:'Fissuração a caracterizar',severity:'Moderada',note:'Confirmar padrão, abertura, evolução e ligação aos pavimentos.'}
  ])
  const [draft,setDraft]=useState<Omit<Finding,'id'>>({element:'',anomaly:'',severity:'Moderada',note:'',category:'Fissura / fenda'})
  const [selectedFinding,setSelectedFinding]=useState<number|null>(null)
  const [surveyBase,setSurveyBase]=useState<SurveyBase|null>(null)
  const bim=useMemo(()=>loadBIMModel(),[])
  useEffect(()=>{try{const raw=localStorage.getItem(REHAB_STORAGE_KEY);if(!raw)return;const x=JSON.parse(raw);if(x.project)setProject(x.project);if(Array.isArray(x.findings))setFindings(x.findings);if(x.surveyBase)setSurveyBase(x.surveyBase)}catch{}},[])
  useEffect(()=>{localStorage.setItem(REHAB_STORAGE_KEY,JSON.stringify({project,findings,surveyBase:surveyBase && surveyBase.dataUrl.length<1800000?surveyBase:null,updatedAt:new Date().toISOString()}))},[project,findings,surveyBase])

  const summary=useMemo(()=>{
    const max=findings.reduce<Severity>((m,f)=>severityRank[f.severity]>severityRank[m]?f.severity:m,'Baixa')
    return {count:findings.length,max,critical:findings.filter(f=>f.severity==='Crítica').length,high:findings.filter(f=>f.severity==='Elevada').length}
  },[findings])

  function addFinding(){
    if(!draft.element.trim() || !draft.anomaly.trim()) return
    setFindings(v=>[...v,{...draft,id:Date.now()}])
    setDraft({element:'',anomaly:'',severity:'Moderada',note:'',category:'Fissura / fenda'})
  }

  return <div className="page rehabilitation-page">
    <div className="pageTitle"><div><h1>Reabilitação · Estruturas e Edifícios</h1><span>Diagnóstico, patologia, reparação, reforço e intervenção em estruturas existentes</span></div></div>

    <section className="panel rehab-cover">
      <div><small>ESTRUTURAS EXISTENTES</small><h2>{project.name}</h2><p>Fluxo base: <b>inspeção → caracterização → modelo da estrutura existente → níveis de segurança → estratégia de intervenção → verificação.</b></p></div>
      <div className="rehab-kpis"><div><b>{summary.count}</b><span>anomalias registadas</span></div><div><b>{summary.max}</b><span>nível máximo</span></div><div><b>{summary.critical+summary.high}</b><span>elevadas/críticas</span></div></div>
    </section>

    <div className="prelim-area-tabs rehab-tabs">{tabs.map(t=><button key={t.id} className={tab===t.id?'active':''} onClick={()=>setTab(t.id)}>{t.label}</button>)}</div>

    {tab==='edificios' && <>
      <section className="panel"><h3>Ficha do edifício existente</h3><div className="rehab-form">
        <label>Designação<input value={project.name} onChange={e=>setProject({...project,name:e.target.value})}/></label>
        <label>Localização<input value={project.location} onChange={e=>setProject({...project,location:e.target.value})}/></label>
        <label>Época / ano aproximado<input value={project.year} onChange={e=>setProject({...project,year:e.target.value})}/></label>
        <label>Uso atual<input value={project.use} onChange={e=>setProject({...project,use:e.target.value})}/></label>
        <label className="wide">Sistema construtivo<input value={project.system} onChange={e=>setProject({...project,system:e.target.value})}/></label>
      </div></section>
      <section className="panel"><h3>Metodologia de avaliação</h3><div className="rehab-flow">
        <article><b>1 · Inspeção</b><span>Geometria real, materiais, resistências, anomalias e ações existentes.</span></article>
        <article><b>2 · Modelo existente</b><span>Representar o funcionamento da estrutura que existe — não uma estrutura idealizada nova.</span></article>
        <article><b>3 · Segurança</b><span>Avaliar níveis de segurança, vulnerabilidades e condicionantes de durabilidade.</span></article>
        <article><b>4 · Intervenção</b><span>Conservar, reparar ou reforçar de forma compatível, faseada e verificável.</span></article>
      </div></section>
      <section className="panel"><h3>Registo de anomalias</h3><div className="rehab-form rehab-finding-form">
        <label>Elemento<input value={draft.element} onChange={e=>setDraft({...draft,element:e.target.value})} placeholder="Parede, viga, pavimento..."/></label>
        <label>Anomalia<input value={draft.anomaly} onChange={e=>setDraft({...draft,anomaly:e.target.value})} placeholder="Fissura, corrosão, deformação..."/></label>
        <label>Gravidade<select value={draft.severity} onChange={e=>setDraft({...draft,severity:e.target.value as Severity})}><option>Baixa</option><option>Moderada</option><option>Elevada</option><option>Crítica</option></select></label>
        <label className="wide">Observação<input value={draft.note} onChange={e=>setDraft({...draft,note:e.target.value})}/></label>
      </div><button className="primary" onClick={addFinding}>Adicionar anomalia</button>
      <div className="rehab-findings">{findings.map(f=><article key={f.id} className={`sev-${f.severity.toLowerCase().replace('í','i')}`}><div><b>{f.element}</b><span>{f.anomaly}</span><small>{f.note}</small></div><strong>{f.severity}</strong><button onClick={()=>setFindings(v=>v.filter(x=>x.id!==f.id))}>×</button></article>)}</div></section>
    </>}

    {tab==='levantamento' && <PathologySurvey findings={findings} setFindings={setFindings} draft={draft} setDraft={setDraft} selected={selectedFinding} setSelected={setSelectedFinding} bimElements={bim?.elements||[]} surveyBase={surveyBase} setSurveyBase={setSurveyBase} project={project} />}

    {tab==='diagnostico' && <DiagnosisWorkflow findings={findings} bimElements={bim?.elements||[]} />}

    {tab!=='edificios' && tab!=='levantamento' && tab!=='diagnostico' && tab!=='intervencao' && <MaterialPanel kind={tab} />}

    {tab==='intervencao' && <>
      <section className="panel"><h3>Estratégia de reabilitação</h3><p>Escolher a intervenção apenas depois de identificar a causa das anomalias e o funcionamento da estrutura existente. O SmartStruct deverá distinguir sempre <b>conservação/proteção</b>, <b>reparação</b> e <b>reforço</b>.</p><div className="rehab-strategy">
        <article><b>Conservar / proteger</b><p>Reduzir agentes de degradação e manter a capacidade existente quando esta é adequada.</p></article>
        <article><b>Reparar</b><p>Repor características ou continuidade de elementos degradados sem assumir automaticamente aumento de capacidade.</p></article>
        <article><b>Reforçar</b><p>Aumentar capacidade, rigidez, ductilidade, estabilidade ou ligação quando a avaliação o justificar.</p></article>
      </div></section>
      <section className="panel"><h3>Decisão técnica preliminar</h3><div className="rehab-decision">
        <div><b>Estado observado</b><span>{summary.count ? `${summary.count} registo(s); gravidade máxima ${summary.max}.` : 'Sem anomalias registadas.'}</span></div>
        <div><b>Antes de dimensionar</b><span>Confirmar geometria, materiais, resistências, cargas, ligações, fundações e evolução das anomalias.</span></div>
        <div><b>Próxima fase</b><span>Associar os elementos inspecionados ao Modelo BIM/openBIM e aos módulos de cálculo correspondentes.</span></div>
      </div></section>
      <section className="panel warning"><b>Nota de engenharia</b><p>Este módulo organiza inspeção e estudo preliminar. Não substitui inspeção presencial, ensaios, levantamento geométrico, diagnóstico das causas nem verificações regulamentares específicas de uma intervenção real.</p></section>
    </>}
  </div>
}

function PathologySurvey({findings,setFindings,draft,setDraft,selected,setSelected,bimElements,surveyBase,setSurveyBase,project}:{findings:Finding[];setFindings:React.Dispatch<React.SetStateAction<Finding[]>>;draft:Omit<Finding,'id'>;setDraft:React.Dispatch<React.SetStateAction<Omit<Finding,'id'>>>;selected:number|null;setSelected:(v:number|null)=>void;bimElements:any[];surveyBase:SurveyBase|null;setSurveyBase:(v:SurveyBase|null)=>void;project:{name:string;location:string;year:string;use:string;system:string}}){
  const located=findings.filter(f=>f.x!=null&&f.y!=null)
  function mark(ev:React.MouseEvent<SVGSVGElement>){const r=ev.currentTarget.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width*100,y=(ev.clientY-r.top)/r.height*100,category=draft.category||'Outra';setFindings(v=>[...v,{id:Date.now(),element:draft.element||'Elemento em levantamento',anomaly:draft.anomaly||category,severity:draft.severity,note:draft.note,bimElementId:draft.bimElementId,x,y,category}])}
  function marker(f:Finding){const c=f.severity==='Crítica'?'#d35454':f.severity==='Elevada'?'#d47c39':f.severity==='Moderada'?'#d2a33b':'#5d9f7d';return <g key={f.id} className="pathology-marker" onClick={e=>{e.stopPropagation();setSelected(f.id)}}><circle cx={`${f.x}%`} cy={`${f.y}%`} r={selected===f.id?10:7} fill={c}/><text x={`${f.x}%`} y={`${(f.y||0)-2}%`}>{f.id.toString().slice(-2)}</text></g>}
  function loadBase(file:File|null){if(!file||!file.type.startsWith('image/'))return;const r=new FileReader();r.onload=()=>setSurveyBase({name:file.name,dataUrl:String(r.result||''),kind:'Planta'});r.readAsDataURL(file)}
  const max=located.reduce<Severity>((m,f)=>severityRank[f.severity]>severityRank[m]?f.severity:m,'Baixa')
  const base=<>{surveyBase?<image href={surveyBase.dataUrl} x="0" y="0" width="900" height="480" preserveAspectRatio="xMidYMid meet"/>:<><rect x="90" y="70" width="720" height="350" className="path-building"/><line x1="90" y1="185" x2="810" y2="185"/><line x1="90" y1="300" x2="810" y2="300"/></>}</>
  return <><section className="panel"><small>INSPEÇÃO GRÁFICA</small><h2>Levantamento patológico do edifício</h2><p>Importe uma planta, um alçado ou uma fotografia e marque diretamente as anomalias. Pode associar cada registo ao elemento BIM/openBIM.</p><div className="survey-base-tools"><label className="survey-upload">Base gráfica<input type="file" accept="image/*" onChange={e=>loadBase(e.target.files?.[0]||null)}/><span>{surveyBase?surveyBase.name:'Selecionar imagem…'}</span></label><label>Tipo<select value={surveyBase?.kind||'Alçado'} onChange={e=>surveyBase&&setSurveyBase({...surveyBase,kind:e.target.value as SurveyBase['kind']})}><option>Planta</option><option>Alçado</option><option>Fotografia</option></select></label>{surveyBase&&<button onClick={()=>setSurveyBase(null)}>Remover base</button>}<button className="primary" onClick={()=>window.print()}>Ficha de inspeção / PDF</button></div><div className="rehab-form"><label>Tipo de anomalia<select value={draft.category||''} onChange={e=>setDraft({...draft,category:e.target.value,anomaly:e.target.value})}>{pathologyTypes.map(x=><option key={x}>{x}</option>)}</select></label><label>Elemento / zona<input value={draft.element} onChange={e=>setDraft({...draft,element:e.target.value})}/></label><label>Gravidade<select value={draft.severity} onChange={e=>setDraft({...draft,severity:e.target.value as Severity})}><option>Baixa</option><option>Moderada</option><option>Elevada</option><option>Crítica</option></select></label><label>Elemento BIM<select value={draft.bimElementId||''} onChange={e=>{const id=e.target.value,be=bimElements.find(x=>x.id===id);setDraft({...draft,bimElementId:id,element:be?.name||draft.element})}}><option value="">Sem associação BIM</option>{bimElements.map(e=><option key={e.id} value={e.id}>{e.id} · {e.name}</option>)}</select></label><label className="wide">Observação<input value={draft.note} onChange={e=>setDraft({...draft,note:e.target.value})}/></label></div></section><section className="panel pathology-board"><div className="pathology-head"><div><h3>Mapa de anomalias · {surveyBase?.kind||'alçado esquemático'}</h3><small>Clique na zona observada.</small></div><b>{located.length} marcações</b></div><svg viewBox="0 0 900 480" onClick={mark} className={`pathology-svg ${surveyBase?'has-base':''}`}>{base}{located.map(marker)}</svg></section><section className="panel"><h3>Registos localizados</h3><div className="rehab-findings">{located.map(f=><article key={f.id} className={`sev-${f.severity.toLowerCase().replace('í','i')}`}><div><b>{f.element}</b><span>{f.category||f.anomaly}{f.bimElementId?` · BIM ${f.bimElementId}`:''}</span><small>{f.note||'Sem observação adicional.'}</small></div><strong>{f.severity}</strong><button onClick={()=>setFindings(v=>v.filter(x=>x.id!==f.id))}>×</button></article>)}</div></section><section className="pathology-report"><header><div><small>SMARTSTRUCT_RJP · REABILITAÇÃO</small><h1>Ficha de Inspeção · Mapa de Patologias</h1></div><div><b>{project.name}</b><span>{project.location||'Localização não indicada'}</span></div></header><div className="report-meta"><span><b>Época:</b> {project.year||'—'}</span><span><b>Uso:</b> {project.use||'—'}</span><span><b>Sistema:</b> {project.system||'—'}</span><span><b>Gravidade máxima:</b> {max}</span></div><div className="report-map"><svg viewBox="0 0 900 480">{base}{located.map(marker)}</svg></div><table><thead><tr><th>ID</th><th>Elemento</th><th>Anomalia</th><th>Gravidade</th><th>Observação</th><th>BIM</th></tr></thead><tbody>{located.map(f=><tr key={f.id}><td>{f.id.toString().slice(-2)}</td><td>{f.element}</td><td>{f.category||f.anomaly}</td><td>{f.severity}</td><td>{f.note||'—'}</td><td>{f.bimElementId||'—'}</td></tr>)}</tbody></table><footer>Documento de apoio ao levantamento e estudo preliminar. Confirmar em inspeção presencial, ensaios e verificações regulamentares aplicáveis.</footer></section></>
}


type DiagnosisRule={match:string[];causes:string[];tests:string[];actions:string[];verification:string}
const diagnosisRules:DiagnosisRule[]=[
 {match:['fissura','fenda'],causes:['Movimentos/deformações do suporte ou da estrutura','Retração, variações térmicas ou assentamentos','Sobrecarga, alteração do funcionamento estrutural ou ligação deficiente'],tests:['Mapeamento e medição da abertura','Monitorização da evolução','Levantamento geométrico e verificação de cargas/apoios'],actions:['Eliminar a causa antes da reparação','Selagem/injeção apenas quando compatível com o diagnóstico','Reforço apenas se a verificação resistente o justificar'],verification:'Verificar esforços, deformações, estabilidade e ligações do elemento afetado.'},
 {match:['humidade','infiltra'],causes:['Entrada de água pela envolvente/cobertura','Ascensão capilar ou drenagem deficiente','Condensação/ventilação insuficiente'],tests:['Medição de humidade e inspeção da origem','Inspeção de cobertura, juntas, drenagem e redes','Avaliação de sais quando aplicável'],actions:['Eliminar a origem da água','Secagem/ventilação e reparação compatível','Só depois tratar danos em madeira, aço, betão, alvenaria ou pedra'],verification:'Reavaliar materiais degradados e a secção resistente depois de controlada a humidade.'},
 {match:['corros'],causes:['Humidade e agentes agressivos','Perda/deficiência de proteção','Carbonatação/cloretos no betão ou proteção anticorrosiva degradada no aço'],tests:['Mapeamento da corrosão e perda de secção','Medição de cobrimento/carbonatação quando for betão armado','Medição de espessuras e inspeção de ligações em estruturas metálicas'],actions:['Remover/mitigar a causa','Proteção e reparação localizada','Reforçar/substituir se a secção residual for insuficiente'],verification:'Calcular com a secção/material residual efetivamente caracterizados.'},
 {match:['deforma'],causes:['Rigidez insuficiente ou perda de secção','Sobrecarga/alteração de uso','Apoios ou ligações degradados'],tests:['Nivelamento/levantamento de deformações','Caracterização de vãos, secções e apoios','Verificação das cargas atuais e futuras'],actions:['Corrigir causa e estabilizar','Reparar apoios/ligações','Reforçar rigidez/capacidade quando necessário'],verification:'Verificar estados limites de utilização e últimos com geometria e cargas reais.'},
 {match:['perda de secção','desagrega'],causes:['Degradação física/química ou biológica','Água, sais, corrosão ou envelhecimento','Intervenções anteriores incompatíveis'],tests:['Quantificação da secção residual','Caracterização do material in situ','Mapeamento da profundidade/extensão da degradação'],actions:['Conservar material são','Reparar/substituir localmente material degradado','Reforçar apenas quando a capacidade residual for insuficiente'],verification:'Atualizar o modelo com secção residual e propriedades medidas.'},
 {match:['biológico','biologica','xilóf'],causes:['Humidade persistente','Ventilação deficiente','Condições favoráveis a fungos/insetos/micro-organismos'],tests:['Inspeção da extensão do ataque','Medição de humidade','Caracterização específica do agente quando necessário'],actions:['Eliminar humidade/causa ambiental','Conservar material são e tratar de forma adequada','Próteses/substituição/reforço das zonas sem capacidade'],verification:'Determinar a secção residual resistente, sobretudo em madeira.'},
 {match:['apoio','ligação','ligacao'],causes:['Degradação local','Alteração construtiva ou execução deficiente','Movimentos incompatíveis entre elementos'],tests:['Inspeção detalhada do apoio/ligação','Levantamento de geometria, fixações e materiais','Verificação de transferência de esforços'],actions:['Restabelecer continuidade e apoio','Reparar/substituir fixações degradadas','Reforçar a ligação quando a verificação o exigir'],verification:'Verificar localmente a ligação e o comportamento global da estrutura.'}
]
function ruleFor(f:Finding){const q=`${f.category||''} ${f.anomaly}`.toLowerCase();return diagnosisRules.find(r=>r.match.some(m=>q.includes(m)))||{match:[],causes:['Causa não determinada — requer inspeção e caracterização específica.'],tests:['Inspeção detalhada e levantamento geométrico','Ensaios adequados ao material e à anomalia'],actions:['Definir intervenção apenas depois do diagnóstico da causa.'],verification:'Associar ao módulo de cálculo adequado e verificar a solução proposta.'}}
function DiagnosisWorkflow({findings,bimElements}:{findings:Finding[];bimElements:any[]}){
 const [id,setId]=useState<number|null>(findings[0]?.id||null); const f=findings.find(x=>x.id===id)||findings[0]; const r=f?ruleFor(f):null; const be=f?.bimElementId?bimElements.find(x=>x.id===f.bimElementId):null
 return <><section className="panel"><small>DIAGNÓSTICO ASSISTIDO · ESTUDO PRELIMINAR</small><h2>Patologia → causa provável → ensaios → intervenção → verificação</h2><p>O SmartStruct organiza hipóteses técnicas; não transforma uma observação visual num diagnóstico definitivo. Selecione um registo e confirme as causas através de inspeção e ensaios adequados.</p><label className="diag-select">Anomalia<select value={f?.id||''} onChange={e=>setId(Number(e.target.value))}>{findings.map(x=><option key={x.id} value={x.id}>{x.element} · {x.category||x.anomaly} · {x.severity}</option>)}</select></label></section>{!f||!r?<section className="panel warning"><b>Sem registos</b><p>Registe primeiro uma anomalia no levantamento patológico.</p></section>:<><div className="diag-chain"><article><small>1 · OBSERVAÇÃO</small><b>{f.category||f.anomaly}</b><span>{f.element} · {f.severity}</span></article><article><small>2 · DIAGNÓSTICO</small><b>Causas prováveis</b><span>A confirmar</span></article><article><small>3 · ENSAIOS</small><b>Caracterização</b><span>Confirmar hipótese</span></article><article><small>4 · INTERVENÇÃO</small><b>Conservar / reparar / reforçar</b><span>Selecionar após diagnóstico</span></article><article><small>5 · VERIFICAÇÃO</small><b>Cálculo</b><span>{f.bimElementId?'Ligado ao BIM':'Associar elemento'}</span></article></div><div className="rehab-three diag-grid"><section className="panel"><h3>Causas prováveis</h3><ul>{r.causes.map(x=><li key={x}>{x}</li>)}</ul></section><section className="panel"><h3>Inspeções / ensaios recomendados</h3><ul>{r.tests.map(x=><li key={x}>{x}</li>)}</ul></section><section className="panel"><h3>Estratégias a estudar</h3><ul>{r.actions.map(x=><li key={x}>{x}</li>)}</ul></section></div><section className="panel diag-verification"><div><small>VERIFICAÇÃO ESTRUTURAL</small><h3>{r.verification}</h3><p>{be?`Elemento openBIM associado: ${be.id} · ${be.name||be.type||'elemento estrutural'}.`:'Ainda não existe associação a um elemento BIM/openBIM.'}</p></div><span className={f.bimElementId?'diag-status linked':'diag-status'}>{f.bimElementId?'BIM ligado':'Ligação BIM pendente'}</span></section><section className="panel rehab-principle"><b>Estado da decisão</b><span>Resultado preliminar: <strong>{f.severity==='Crítica'||f.severity==='Elevada'?'prioridade de avaliação elevada':'avaliação técnica necessária'}</strong>. A solução só deve ser fechada depois de confirmar a causa, caracterizar o elemento e verificar a segurança/durabilidade.</span></section></>}</>
}

type MaterialKind=Exclude<Tab,'edificios'|'levantamento'|'diagnostico'|'intervencao'>
type InspectionSheet={element:string;location:string;bimElementId:string;condition:'Bom'|'Razoável'|'Deficiente'|'Crítico';initialSection:number;residualSection:number;unit:string;test:string;measured:string;notes:string}
const inspectionOptions:Record<MaterialKind,{tests:string[];unit:string;hint:string}>={
 betao:{tests:['Inspeção visual e mapeamento','Esclerómetro / ultrassons','Carotes / resistência do betão','Carbonatação','Cloretos','Cobrimento / deteção de armaduras'],unit:'cm²',hint:'Registar secção efetiva, perda de betão/armadura e parâmetros medidos.'},
 alvenarias:{tests:['Inspeção e mapeamento de fissuras','Caracterização da constituição da parede','Endoscopia / sondagens localizadas','Macacos planos quando aplicável','Caracterização de argamassa/unidades','Levantamento de desaprumos'],unit:'cm²/m',hint:'Caracterizar espessura, constituição, ligante, juntas, vazios e continuidade.'},
 pavimentos:{tests:['Levantamento de vãos e secções','Nivelamento / deformação','Ensaio de vibração quando necessário','Inspeção de apoios','Medição de humidade','Caracterização de cargas'],unit:'cm²',hint:'Registar vigas/barrotes/perfis, espaçamento, apoios e função de diafragma.'},
 metalicas:{tests:['Inspeção visual detalhada','Medição de espessuras','Líquidos penetrantes / partículas magnéticas quando aplicável','Ultrassons quando aplicável','Inspeção de rebites/parafusos/soldaduras','Identificação do material'],unit:'cm²',hint:'Quantificar perda de espessura/secção e caracterizar ligações antes do cálculo.'},
 madeira:{tests:['Inspeção visual e percussão','Medição de teor de água','Resistógrafo / perfuração controlada quando aplicável','Identificação de ataque biológico','Levantamento de secção residual','Inspeção de entregas/apoios'],unit:'cm²',hint:'A secção residual deve refletir a degradação realmente observada e caracterizada.'},
 pedra:{tests:['Inspeção e cartografia de degradação','Absorção de água','Caracterização petrográfica quando necessária','Sais solúveis','Microperfuração quando aplicável','Ensaios prévios de compatibilidade do tratamento'],unit:'cm²',hint:'Consolidação/proteção requer caracterização prévia; não assumir produtos universais.'}
}
function MaterialPanel({kind}:{kind:MaterialKind}){
  const d=materialData[kind], opt=inspectionOptions[kind]
  const key=`smartstruct:rehab-inspection:${kind}`
  const [sheet,setSheet]=useState<InspectionSheet>(()=>{try{const x=localStorage.getItem(key);if(x)return JSON.parse(x)}catch{}return {element:'',location:'',bimElementId:'',condition:'Razoável',initialSection:100,residualSection:100,unit:opt.unit,test:opt.tests[0],measured:'',notes:''}})
  const bim=useMemo(()=>loadBIMModel(),[])
  useEffect(()=>{localStorage.setItem(key,JSON.stringify(sheet))},[key,sheet])
  const residual=sheet.initialSection>0?Math.max(0,Math.min(100,100*sheet.residualSection/sheet.initialSection)):0
  return <>
    <section className="panel"><small>REABILITAÇÃO DE ESTRUTURAS</small><h2>{d.title}</h2><p>{d.intro}</p></section>
    <div className="rehab-three">
      <section className="panel"><h3>Anomalias a observar</h3><ul>{d.anomalies.map(x=><li key={x}>{x}</li>)}</ul></section>
      <section className="panel"><h3>Intervenções possíveis</h3><ul>{d.actions.map(x=><li key={x}>{x}</li>)}</ul></section>
      <section className="panel"><h3>Verificações antes de intervir</h3><ul>{d.checks.map(x=><li key={x}>{x}</li>)}</ul></section>
    </div>
    <section className="panel material-inspection"><div className="inspection-title"><div><small>FICHA PRÓPRIA DE INSPEÇÃO</small><h3>Caracterização do elemento existente</h3></div><span className={`condition-${sheet.condition.toLowerCase().replace('í','i')}`}>{sheet.condition}</span></div>
      <div className="rehab-form">
        <label>Elemento<input value={sheet.element} onChange={e=>setSheet({...sheet,element:e.target.value})} placeholder="Viga, parede, barrote, perfil…"/></label>
        <label>Localização<input value={sheet.location} onChange={e=>setSheet({...sheet,location:e.target.value})} placeholder="Piso, compartimento, eixo…"/></label>
        <label>Estado<select value={sheet.condition} onChange={e=>setSheet({...sheet,condition:e.target.value as InspectionSheet['condition']})}><option>Bom</option><option>Razoável</option><option>Deficiente</option><option>Crítico</option></select></label>
        <label>Elemento BIM/openBIM<select value={sheet.bimElementId} onChange={e=>setSheet({...sheet,bimElementId:e.target.value})}><option value="">Sem associação</option>{(bim?.elements||[]).map(e=><option key={e.id} value={e.id}>{e.id} · {e.name}</option>)}</select></label>
        <label>Secção inicial / referência ({sheet.unit})<input type="number" min="0" step="0.1" value={sheet.initialSection} onChange={e=>setSheet({...sheet,initialSection:Number(e.target.value)})}/></label>
        <label>Secção resistente residual ({sheet.unit})<input type="number" min="0" step="0.1" value={sheet.residualSection} onChange={e=>setSheet({...sheet,residualSection:Number(e.target.value)})}/></label>
        <label>Inspeção / ensaio<select value={sheet.test} onChange={e=>setSheet({...sheet,test:e.target.value})}>{opt.tests.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Resultado medido<input value={sheet.measured} onChange={e=>setSheet({...sheet,measured:e.target.value})} placeholder="Valor, unidade e referência do ensaio"/></label>
        <label className="wide">Observações técnicas<input value={sheet.notes} onChange={e=>setSheet({...sheet,notes:e.target.value})} placeholder={opt.hint}/></label>
      </div>
      <div className="residual-box"><div><small>SECÇÃO RESISTENTE RESIDUAL</small><b>{residual.toFixed(1)}%</b><span>{sheet.residualSection.toLocaleString('pt-PT')} / {sheet.initialSection.toLocaleString('pt-PT')} {sheet.unit}</span></div><div className="residual-bar"><i style={{width:`${residual}%`}}/></div><p>Indicador geométrico de caracterização, não é por si só uma verificação de segurança. O cálculo deve utilizar geometria, propriedades e ações confirmadas.</p></div>
      <div className="inspection-actions"><button onClick={()=>window.print()}>Imprimir ficha</button>{sheet.bimElementId&&<span>BIM ligado · <b>{sheet.bimElementId}</b></span>}</div>
    </section>
    <section className="panel rehab-principle"><b>Princípio SmartStruct</b><span>Diagnosticar a causa → caracterizar o elemento existente e a secção residual → registar ensaios → verificar segurança/durabilidade → selecionar solução compatível → recalcular/verificar → documentar a intervenção.</span></section>
  </>
}

