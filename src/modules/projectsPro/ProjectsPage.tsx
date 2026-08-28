import React,{useEffect,useState} from 'react'
type Project={id:number,name:string,discipline:string,updated:string}
const KEY='smartstruct:projects'
const seed:Project[]=[
  {id:1,name:'Exemplo Estrutural',discipline:'Estruturas',updated:'Hoje'},
  {id:2,name:'Muro de Suporte',discipline:'Contenção',updated:'Hoje'},
  {id:3,name:'Rotunda Base',discipline:'Infraestruturas Viárias',updated:'Hoje'}
]
export default function ProjectsPage(){
  const [projects,setProjects]=useState<Project[]>(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')||seed}catch{return seed}})
  const [name,setName]=useState(''),[discipline,setDiscipline]=useState('Estruturas')
  useEffect(()=>localStorage.setItem(KEY,JSON.stringify(projects)),[projects])
  function add(){if(!name.trim())return;setProjects([{id:Date.now(),name:name.trim(),discipline,updated:new Date().toLocaleDateString('pt-PT')},...projects]);setName('')}
  function remove(id:number){setProjects(projects.filter(p=>p.id!==id))}
  return <div className="module-page"><div className="module-head"><div><h2>Projetos</h2><p>Projetos guardados localmente no dispositivo.</p></div></div>
    <section className="panel"><div className="project-create"><input className="project-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Nome do projeto"/>
    <select value={discipline} onChange={e=>setDiscipline(e.target.value)}><option>Estruturas</option><option>Geotecnia</option><option>Contenção</option><option>Hidráulica</option><option>Infraestruturas Viárias</option></select>
    <button className="primary-action" onClick={add}>Criar</button></div></section>
    <section className="panel"><div className="project-cards">{projects.map(p=><article key={p.id}><div><b>{p.name}</b><span>{p.discipline}</span><small>{p.updated}</small></div><button onClick={()=>remove(p.id)}>Eliminar</button></article>)}</div></section>
  </div>
}
