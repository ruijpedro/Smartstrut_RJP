import React,{useMemo,useState} from 'react'
import {ONLINE_SOURCES} from './catalog'
import { TechnicalLibraryPage } from '../technicalLibrary'
export default function OnlineLibraryPage(){
 const[q,setQ]=useState(''),[area,setArea]=useState('Todos')
 const rows=useMemo(()=>ONLINE_SOURCES.filter(s=>(area==='Todos'||s.area===area)&&(`${s.title} ${s.authority}`.toLowerCase().includes(q.toLowerCase()))),[q,area])
 return <div className="module-page"><div className="module-head"><div><h2>Biblioteca Técnica Online</h2><p>Fontes oficiais, legislação, Eurocódigos e documentação técnica com origem identificada.</p></div></div>
 <section className="panel library-toolbar"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Pesquisar fonte, norma ou tema…"/><select value={area} onChange={e=>setArea(e.target.value)}><option>Todos</option><option>Estruturas</option><option>Hidráulica</option></select></section>
 <div className="library-grid">{rows.map(s=><article className="library-card" key={s.id}><small>{s.area} · {s.kind}</small><b>{s.title}</b><span>{s.authority}</span><a href={s.url} target="_blank" rel="noreferrer">Abrir fonte oficial ↗</a></article>)}</div>
 <section className="panel source-note"><b>Regra da biblioteca</b><span>O SmartStruct guarda metadados, parâmetros implementados e referência da fonte. Não incorpora automaticamente o texto integral de normas protegidas. Parâmetros nacionais sujeitos a acesso controlado são assinalados.</span></section>
 <section className="embedded-library"><TechnicalLibraryPage/></section>
 </div>
}
