import { useMemo, useState } from 'react'
import { BeamDiagram } from './BeamDiagram'
import { solveSimplySupportedBeam } from './beamSolver'

const tabs = ['Modelo','Geometria','Apoios','Cargas','Secção','Material','Resultados','Diagramas'] as const

export function BeamsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Modelo')
  const [span, setSpan] = useState(5)
  const [g, setG] = useState(12)
  const [q, setQ] = useState(6)
  const [p, setP] = useState(0)
  const input = { span, permanentLoad: g, variableLoad: q, pointLoad: p }
  const result = useMemo(() => solveSimplySupportedBeam(input), [span, g, q, p])
  return <div className="page">
    <div className="pageTitle"><h1>Vigas</h1><span>Viga biapoiada · ELU simplificado</span></div>
    <div className="tabs">{tabs.map((t) => <button className={tab === t ? 'active' : ''} key={t} onClick={() => setTab(t)}>{t}</button>)}</div>
    <div className="workspace">
      <section className="panel editorPanel">
        <BeamDiagram input={input}/>
        <div className="formGrid">
          <label>Vão L (m)<input type="number" step="0.1" value={span} onChange={(e) => setSpan(Number(e.target.value))}/></label>
          <label>G (kN/m)<input type="number" step="0.5" value={g} onChange={(e) => setG(Number(e.target.value))}/></label>
          <label>Q (kN/m)<input type="number" step="0.5" value={q} onChange={(e) => setQ(Number(e.target.value))}/></label>
          <label>P central (kN)<input type="number" step="1" value={p} onChange={(e) => setP(Number(e.target.value))}/></label>
        </div>
      </section>
      <aside className="panel resultPanel"><div className="panelTitle">Resultados</div><div className="metric"><span>wEd</span><strong>{result.designUniformLoad.toFixed(2)} kN/m</strong></div><div className="metric"><span>RA = RB</span><strong>{result.reactionEach.toFixed(2)} kN</strong></div><div className="metric"><span>VEd máx.</span><strong>{result.maxShear.toFixed(2)} kN</strong></div><div className="metric"><span>MEd máx.</span><strong>{result.maxMoment.toFixed(2)} kN·m</strong></div><p className="note">Cálculo preliminar para estudo. O dimensionamento regulamentar completo entra nas próximas fases.</p></aside>
    </div>
  </div>
}
