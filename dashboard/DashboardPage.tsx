import type { ModuleId } from '../../app/types'
import { Icon } from '../../ui/Icon'

const quick: { id: ModuleId; label: string; code: string; tone: string }[] = [
  { id: 'beams', label: 'VIGAS', code: 'EC2', tone: 'blue' },
  { id: 'columns', label: 'PILARES', code: 'EC2', tone: 'green' },
  { id: 'slabs', label: 'LAJES', code: 'EC2', tone: 'orange' },
  { id: 'bearing', label: 'CAP. CARGA', code: 'GEOTECNIA', tone: 'purple' },
  { id: 'containment', label: 'CONTENÇÃO', code: 'EC7', tone: 'teal' },
  { id: 'soilnails', label: 'PREGAGENS', code: 'ESTABILIZAÇÃO', tone: 'green' },
  { id: 'roads', label: 'ESTRADAS', code: 'VIÁRIO', tone: 'red' },
  { id: 'hydraulics', label: 'HIDRÁULICA', code: 'DRENAGEM', tone: 'yellow' },
  { id: 'steelstructures', label: 'METÁLICAS', code: 'EC3', tone: 'blue' },
  { id: 'timber', label: 'MADEIRA', code: 'EC5', tone: 'green' },
  { id: 'seismic', label: 'SISMO', code: 'EC8', tone: 'red' },
  { id: 'bridges', label: 'PONTES', code: 'OBRAS ARTE', tone: 'teal' },
]

const main: { id: ModuleId; title: string; body: string }[] = [
  { id: 'beams', title: 'Análise Estrutural', body: 'Vigas, pórticos, treliças, apoios, cargas e diagramas' },
  { id: 'columns', title: 'Betão Armado', body: 'Vigas, pilares, lajes, sapatas e verificações EC2' },
  { id: 'steelstructures', title: 'Estruturas Metálicas', body: 'Perfis de aço, resistência, encurvadura, ligações e quantificação' },
  { id: 'timber', title: 'Madeira · EC5', body: 'Elementos de madeira, resistência, estabilidade e ELS' },
  { id: 'masonry', title: 'Alvenaria · EC6', body: 'Paredes resistentes, compressão, esbelteza e corte' },
  { id: 'composite', title: 'Estruturas Mistas · EC4', body: 'Aço-betão, secções mistas e conectores' },
  { id: 'seismic', title: 'Sismo e Dinâmica · EC8', body: 'Ações sísmicas, espectros e análise dinâmica' },
  { id: 'deepfoundations', title: 'Fundações Especiais', body: 'Estacas, microestacas, grupos e maciços' },
  { id: 'globalslopes', title: 'Estabilidade Global', body: 'Equilíbrio limite e superfícies de deslizamento' },
  { id: 'bridges', title: 'Pontes e Obras de Arte', body: 'Tabuleiros, encontros, pilares, apoios e fundações' },
  { id: 'geotechnics', title: 'Geotecnia', body: 'Parâmetros de solo, SPT, CPT, capacidade de carga e assentamentos' },
  { id: 'containment', title: 'Contenção', body: 'Betão armado, gravidade, gabiões e Berlim' },
  { id: 'soilnails', title: 'Estabilização', body: 'Pregagens, ancoragens, betão projetado e drenagem de taludes' },
  { id: 'slopes', title: 'Taludes', body: 'Estabilidade, reforço, drenagem e proteção' },
  { id: 'roads', title: 'Infraestruturas Viárias', body: 'Estradas, ciclovias, rotundas, pavimentos e drenagem' },
  { id: 'library', title: 'Biblioteca Técnica', body: 'Materiais, perfis, solos, fórmulas, tabelas e normas' },
  { id: 'tools', title: 'Ferramentas', body: 'Conversões, calculadoras rápidas e utilitários' },
]

export function DashboardPage({ onOpen }: { onOpen: (id: ModuleId) => void }) {
  return <div className="page dashboardPage">
    <div className="pageTitle"><h1>Dashboard</h1><span>Estruturas + Geotecnia + Contenção + Infraestruturas</span></div>
    <div className="quickGrid">{quick.map((q) => <button key={q.id} className={`quickCard ${q.tone}`} onClick={() => onOpen(q.id)}><Icon id={q.id} size={40}/><strong>{q.label}</strong><span>{q.code}</span></button>)}</div>
    <section className="panel"><div className="panelTitle">Módulos principais</div><div className="moduleGrid">{main.map((m) => <button className="moduleCard" key={m.title} onClick={() => onOpen(m.id)}><div className="moduleIcon"><Icon id={m.id} size={34}/></div><div><strong>{m.title}</strong><span>{m.body}</span></div><b>›</b></button>)}</div></section>
  </div>
}
