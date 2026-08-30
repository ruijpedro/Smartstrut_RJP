import React,{useMemo,useState} from 'react'

type Material={family:string;name:string;grading:string;uses:string;origin:string;notes:string;tags:string}
const aggregates:Material[]=[
 {family:'Agregado fino',name:'Areia 0/2',grading:'0/2 mm',uses:'Argamassas, betões e regularizações',origin:'Natural ou britado',notes:'Selecionar em função da aplicação e da especificação do projeto.',tags:'areia agregado fino betão argamassa'},
 {family:'Agregado fino',name:'Areia 0/4',grading:'0/4 mm',uses:'Betão, argamassas e camadas de assentamento',origin:'Natural ou britado',notes:'Controlar granulometria, finos, absorção e limpeza.',tags:'areia agregado fino betão'},
 {family:'Brita',name:'Brita 4/8',grading:'4/8 mm',uses:'Betão, drenagem e acabamentos granulares',origin:'Rocha britada',notes:'Fração indicativa; confirmar designação comercial e requisitos do projeto.',tags:'brita agregado grosso drenagem betão'},
 {family:'Brita',name:'Brita 8/16',grading:'8/16 mm',uses:'Betão, drenagem e enchimentos selecionados',origin:'Rocha britada',notes:'A origem petrográfica influencia propriedades mecânicas e durabilidade.',tags:'brita agregado grosso betão drenagem'},
 {family:'Brita',name:'Brita 16/32',grading:'16/32 mm',uses:'Drenagem, betão quando especificado e camadas granulares',origin:'Rocha britada',notes:'Verificar dimensão máxima compatível com a utilização.',tags:'brita agregado grosso drenagem'},
 {family:'Material granular',name:'ABGE 0/31,5',grading:'0/31,5 mm',uses:'Camadas de base e sub-base de pavimentos',origin:'Agregado britado de granulometria extensa',notes:'Características de compactação e desempenho devem resultar da especificação aplicável.',tags:'abge agregado base sub-base pavimento estrada'},
 {family:'Material granular',name:'Tout-venant britado',grading:'Granulometria extensa',uses:'Aterros, regularização, bases e sub-bases conforme especificação',origin:'Rocha britada',notes:'A designação comercial não substitui a caracterização granulométrica.',tags:'tout venant agregado pavimento aterro'},
 {family:'Drenante',name:'Agregado drenante',grading:'Selecionável no projeto',uses:'Drenos, envolvimento de tubagens e camadas drenantes',origin:'Natural ou britado',notes:'Privilegiar permeabilidade e compatibilidade com filtro/geotêxtil.',tags:'drenagem dreno brita agregado filtro'},
 {family:'Reciclado',name:'Agregado reciclado de betão',grading:'Conforme produto/especificação',uses:'Camadas granulares e outras utilizações tecnicamente admissíveis',origin:'RCD de betão processado',notes:'Exigir caracterização e adequação à utilização prevista.',tags:'reciclado betão agregado circular'},
 {family:'Leve',name:'Argila expandida',grading:'Conforme produto',uses:'Enchimentos leves, isolamento e soluções específicas',origin:'Agregado leve industrial',notes:'Massa volúmica e absorção dependem do produto.',tags:'leve argila expandida enchimento'},
 {family:'Ferroviário',name:'Balastro',grading:'Conforme especificação ferroviária',uses:'Camada de balastro de via-férrea',origin:'Rocha britada selecionada',notes:'Não fixar granulometria sem a especificação ferroviária aplicável.',tags:'balastro ferrovia via férrea agregado'},
 {family:'Pedra',name:'Rachão',grading:'Fração grossa variável',uses:'Aterros drenantes, fundações e regularizações especiais',origin:'Rocha britada',notes:'Definir dimensão e qualidade em projeto.',tags:'rachão pedra fundação aterro'},
 {family:'Pedra',name:'Enrocamento',grading:'Blocos de dimensão definida em projeto',uses:'Proteção, estabilização, obras hidráulicas e taludes',origin:'Rocha selecionada',notes:'Dimensionamento depende da ação hidráulica/geotécnica e durabilidade.',tags:'enrocamento talude hidráulica proteção'}
]
const base=[
 {family:'Betão',name:'C20/25',grading:'—',uses:'Estruturas de betão',origin:'Betão',notes:'fck = 20 MPa',tags:'betão concreto c20'},
 {family:'Betão',name:'C25/30',grading:'—',uses:'Estruturas de betão',origin:'Betão',notes:'fck = 25 MPa',tags:'betão concreto c25'},
 {family:'Betão',name:'C30/37',grading:'—',uses:'Estruturas de betão',origin:'Betão',notes:'fck = 30 MPa',tags:'betão concreto c30'},
 {family:'Aço',name:'B500',grading:'—',uses:'Armaduras',origin:'Aço',notes:'fyk = 500 MPa',tags:'aço armadura b500'},
 {family:'Aço',name:'S235',grading:'—',uses:'Estruturas metálicas',origin:'Aço',notes:'fy = 235 MPa',tags:'aço perfil s235'},
 {family:'Aço',name:'S355',grading:'—',uses:'Estruturas metálicas',origin:'Aço',notes:'fy = 355 MPa',tags:'aço perfil s355'},
 {family:'Solo',name:'Areia média',grading:'—',uses:'Referência geotécnica',origin:'Solo',notes:'Valores geotécnicos devem ser definidos pela caracterização do terreno.',tags:'solo areia geotecnia'},
 {family:'Solo',name:'Argila média',grading:'—',uses:'Referência geotécnica',origin:'Solo',notes:'Valores geotécnicos devem ser definidos pela caracterização do terreno.',tags:'solo argila geotecnia'}
] satisfies Material[]
const all=[...aggregates,...base]
const families=['Todos','Agregados e materiais granulares','Brita','Betão','Aço','Solo']

export default function TechnicalLibraryPage(){
 const[q,setQ]=useState(''); const[family,setFamily]=useState('Todos'); const[selected,setSelected]=useState<Material|null>(null)
 const data=useMemo(()=>all.filter(r=>{const text=Object.values(r).join(' ').toLowerCase(); const okQ=text.includes(q.toLowerCase()); const okF=family==='Todos'||(family==='Agregados e materiais granulares'?aggregates.includes(r):r.family===family); return okQ&&okF}),[q,family])
 return <div className="module-page material-library"><div className="module-head"><div><h2>Biblioteca Técnica</h2><p>Materiais, agregados, solos e referências rápidas para os módulos de engenharia.</p></div></div>
 <section className="panel library-toolbar material-toolbar"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Pesquisar material, utilização, granulometria…"/><select value={family} onChange={e=>setFamily(e.target.value)}>{families.map(x=><option key={x}>{x}</option>)}</select></section>
 {family==='Agregados e materiais granulares'&&<section className="panel aggregate-intro"><div><small>BIBLIOTECA DE MATERIAIS</small><h3>Agregados e materiais granulares</h3><p>Britas, areias, ABGE, materiais drenantes, reciclados, balastro, rachão e enrocamento. As granulometrias apresentadas são identificações técnicas/indicativas; a especificação do projeto prevalece.</p></div><b>{data.length} materiais</b></section>}
 <section className="library-grid">{data.map((r,i)=><button className="library-card material-card" key={i} onClick={()=>setSelected(r)}><small>{r.family}</small><b>{r.name}</b><strong>{r.grading}</strong><span>{r.uses}</span></button>)}</section>
 {selected&&<div className="material-modal" onClick={()=>setSelected(null)}><article className="panel material-sheet" onClick={e=>e.stopPropagation()}><button className="material-close" onClick={()=>setSelected(null)}>×</button><small>FICHA TÉCNICA · {selected.family}</small><h3>{selected.name}</h3><div className="material-properties"><div><span>Granulometria</span><b>{selected.grading}</b></div><div><span>Origem / tipo</span><b>{selected.origin}</b></div><div><span>Aplicações</span><b>{selected.uses}</b></div><div><span>Nota de engenharia</span><b>{selected.notes}</b></div></div><p className="material-warning">Propriedades de fornecimento, ensaios e critérios normativos devem ser confirmados na ficha do produto e na especificação aplicável ao projeto.</p></article></div>}
 </div>
}
