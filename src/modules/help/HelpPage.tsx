import React,{useState} from 'react'

type Section={id:string;title:string;body:React.ReactNode}
const SectionCard=({title,children}:{title:string;children:React.ReactNode})=><section className="panel help-card"><h3>{title}</h3>{children}</section>

export default function HelpPage(){
 const[q,setQ]=useState('')
 const sections:Section[]=[
  {id:'start',title:'Começar aqui',body:<>
   <p>Fluxo geral recomendado:</p>
   <p><b>Dashboard → módulo → geometria → materiais → ações → cálculo → resultados → verificações → desenhos → relatório.</b></p>
   <p>No telemóvel abre o menu ☰ e desloca horizontalmente os separadores quando necessário.</p>
  </>},
  {id:'project',title:'Structural Project PRO',body:<>
   <p><b>Projeto → Geometria → Materiais → Ações → Combinações → Análise → Dimensionamento → Fundações → Mapa de aço → Relatório.</b></p>
   <p>O separador <b>Mapa de aço</b> agrega preliminarmente vigas, pilares e sapatas e permite exportar CSV.</p>
  </>},
  {id:'beams',title:'Vigas PRO',body:<>
   <p>Seleciona apoios, vão, secção, recobrimento e materiais. Adiciona cargas distribuídas, pontuais e momentos.</p>
   <p>Consulta reações, V, M, armadura inferior/superior, estribos, ancoragens, emendas, cortes/prolongamentos e mapa de varões.</p>
  </>},
  {id:'columns',title:'Pilares PRO',body:<>
   <p>Introduz NEd, Mx, My, secção, comprimento, condições de extremidade e materiais.</p>
   <p>Consulta esbelteza, Euler, 2.ª ordem simplificada, As necessária/adotada, estribos e comprimentos preliminares de ancoragem/emenda.</p>
  </>},
  {id:'slabs',title:'Lajes PRO',body:<>
   <p>Define lx, ly, espessura, cargas, apoios e materiais. A app identifica funcionamento uni/bidirecional.</p>
   <p>Consulta momentos, malhas X/Y, armadura superior em apoios, flecha, corte e comprimentos de ancoragem/emenda.</p>
  </>},
  {id:'footings',title:'Sapatas / Fundações PRO',body:<>
   <p>Introduz esforços do pilar, B/L/h, dimensões do pilar, terreno e materiais.</p>
   <p>Verifica qmin/qmax, contacto, deslizamento, derrubamento, punçoamento preliminar e malhas X/Y.</p>
  </>},
  {id:'frames',title:'Pórticos 2D e Treliças',body:<>
   <p>Pórticos: cria nós, barras, apoios e cargas; depois calcula deslocamentos, reações e esforços N/V/M.</p>
   <p>Treliças: cria nós/barras articuladas, apoios e cargas nodais; consulta esforços axiais e deslocamentos.</p>
  </>},
  {id:'hydraulics',title:'Hidráulica e Drenagem',body:<>
   <p>Nos editores gráficos: coloca elementos → ativa Linha/Tubagem → seleciona nó inicial → cria vértices → termina no nó final.</p>
   <p>Distingue abastecimento de água, esgotos prediais, saneamento público e pluvial. O comprimento do troço segue a polilinha desenhada.</p>
  </>},
  {id:'roads',title:'Infraestruturas Viárias',body:<>
   <p>Fluxo recomendado: <b>Planta XY → Traçado → Rasante/PK → Secção → Visibilidade → Perfis/Volumes → Massas → Drenagem → Perfil → Planta.</b></p>
  </>},
  {id:'geo',title:'Geotecnia, Contenção e Estabilização',body:<>
   <p>Começa pelos parâmetros do solo. Usa depois SPT/CPT, capacidade de carga, assentamentos, impulsos, taludes, muros, pregagens, ancoragens, betão projetado ou drenagem.</p>
  </>},
  {id:'symbols',title:'Símbolos principais',body:<>
   <div className="help-symbols">
    <span><b>Ø</b> diâmetro do varão</span><span><b>As</b> área de armadura</span><span><b>NEd</b> esforço normal de cálculo</span><span><b>MEd</b> momento de cálculo</span><span><b>VEd</b> esforço transverso de cálculo</span><span><b>lb,d</b> comprimento de ancoragem de cálculo</span><span><b>fck</b> resistência característica do betão</span><span><b>fyk</b> tensão característica do aço</span>
   </div>
  </>},
  {id:'status',title:'Como interpretar os resultados',body:<>
   <p><b>Cálculo:</b> resultado direto do motor matemático implementado.</p>
   <p><b>Pré-dimensionamento:</b> solução automática/simplificada que necessita confirmação.</p>
   <p><b>REVER:</b> existe uma condição que exige análise antes de aceitar a solução.</p>
   <p>Antes de projeto de execução confirma unidades, hipóteses, combinações, ancoragens, pormenorização e regulamentação/Eurocódigo aplicável.</p>
  </>}
 ]
 const f=sections.filter(s=>(s.title+' '+String(s.body)).toLowerCase().includes(q.toLowerCase())||!q)
 return <div className="module-page help-page">
  <div className="module-head"><div><h2>Ajuda · Como operar</h2><p>Manual rápido do SmartStruct_RJP, organizado pelo fluxo real de utilização.</p></div></div>
  <section className="panel help-start">
   <h3>Começar aqui</h3>
   <input className="help-search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Pesquisar módulo ou termo…"/>
   <div className="help-flow"><b>1 Dados</b><span>→</span><b>2 Cálculo</b><span>→</span><b>3 Verificações</b><span>→</span><b>4 Desenhos</b><span>→</span><b>5 Exportar</b></div>
  </section>
  <div className="help-grid">{f.map(s=><SectionCard key={s.id} title={s.title}>{s.body}</SectionCard>)}</div>
 </div>
}
