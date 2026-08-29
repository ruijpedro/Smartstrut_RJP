import React from 'react'

export type EngineeringArea='structures'|'lsf'|'geotechnics'|'hydraulics'|'roads'|'containment'

type Ref={code:string;title:string;scope:string}
const REFS:Record<EngineeringArea,Ref[]>={
 structures:[
  {code:'EN 1990',title:'Bases do projeto estrutural',scope:'situações de projeto, estados limite e combinações'},
  {code:'EN 1991',title:'Ações em estruturas',scope:'ações permanentes, sobrecargas, vento, neve e outras ações aplicáveis'},
  {code:'EN 1992-1-1',title:'Estruturas de betão',scope:'resistência, utilização e pormenorização de betão armado'},
  {code:'EN 1998',title:'Projeto sísmico',scope:'quando aplicável à estrutura, fundações e elementos não estruturais'}],
 lsf:[
  {code:'EN 1990',title:'Bases do projeto estrutural',scope:'estados limite e combinações'},
  {code:'EN 1991',title:'Ações em estruturas',scope:'ações gravíticas, vento, neve e outras ações aplicáveis'},
  {code:'EN 1993-1-1',title:'Estruturas de aço',scope:'regras gerais de resistência e estabilidade'},
  {code:'EN 1993-1-3',title:'Perfis e chapas enformados a frio',scope:'regras específicas LSF, instabilidade local e distorcional'},
  {code:'EN 1993-1-8',title:'Ligações',scope:'parafusos, soldaduras e ligações estruturais, quando aplicável'},
  {code:'EN 1998',title:'Projeto sísmico',scope:'quando aplicável ao edifício e ao sistema de contraventamento'}],
 geotechnics:[
  {code:'EN 1997-1',title:'Projeto geotécnico',scope:'estados limite, ações geotécnicas, verificações e abordagem de projeto'},
  {code:'EN 1997-2',title:'Reconhecimento e ensaios',scope:'investigação do terreno, ensaios de campo/laboratório e parâmetros'},
  {code:'EN 1998-5',title:'Fundações e aspetos geotécnicos sísmicos',scope:'quando aplicável'}],
 hydraulics:[
  {code:'DR 23/95',title:'Sistemas públicos e prediais de água e drenagem',scope:'conceção, dimensionamento e simbologia em Portugal'},
  {code:'EN 806',title:'Instalações de água potável em edifícios',scope:'critérios complementares de projeto, instalação e operação'},
  {code:'EN 12056',title:'Drenagem gravítica no interior de edifícios',scope:'águas residuais e pluviais em edifícios'}],
 roads:[
  {code:'Normas IP / IMT aplicáveis',title:'Geometria rodoviária e segurança',scope:'traçado, visibilidade, interseções, sinalização e drenagem conforme entidade gestora'},
  {code:'EN 13108',title:'Misturas betuminosas',scope:'materiais e famílias de misturas para pavimentação, quando aplicável'},
  {code:'EN 1991-2',title:'Ações de tráfego em pontes',scope:'aplicável apenas a obras de arte e estruturas associadas'}],
 containment:[
  {code:'EN 1997-1',title:'Projeto geotécnico',scope:'muros, escavações, estabilidade global e interação solo-estrutura'},
  {code:'EN 1992-1-1',title:'Betão armado',scope:'muros e elementos estruturais de betão'},
  {code:'EN 1993',title:'Estruturas de aço',scope:'perfis, escoramentos, berlinenses e elementos metálicos quando aplicável'},
  {code:'EN 1537',title:'Ancoragens no terreno',scope:'execução e ensaio de ancoragens, quando aplicável'}]
}

export function EngineeringBasis({area,compact=false}:{area:EngineeringArea;compact?:boolean}){
 const refs=REFS[area]
 return <section className={`panel engineering-basis ${compact?'compact':''}`}>
  <div className="engineering-basis-head"><div><h3>Base técnica do estudo prévio</h3><p className="muted">Critérios de engenharia organizados para pré-dimensionamento. Antes de projeto de execução devem ser confirmadas a edição normativa adotada, Anexo Nacional, requisitos da entidade gestora e condições locais.</p></div><span className="engineering-badge">ESTUDO PRÉVIO</span></div>
  <div className="engineering-ref-grid">{refs.map(r=><article key={r.code}><b>{r.code}</b><strong>{r.title}</strong><small>{r.scope}</small></article>)}</div>
  <div className="engineering-warning"><b>Hierarquia de utilização:</b> cálculo mecânico/hidráulico → verificação de estados limite/critério técnico → detalhe regulamentar → validação final por técnico responsável.</div>
 </section>
}

export function PreliminaryChecklist({items}:{items:{name:string;status:'ok'|'check'|'missing';detail:string}[]}){
 return <div className="prelim-checklist">{items.map((it,i)=><div className={`prelim-row ${it.status}`} key={i}><span>{it.status==='ok'?'✓':it.status==='check'?'!':'○'}</span><div><b>{it.name}</b><small>{it.detail}</small></div></div>)}</div>
}
