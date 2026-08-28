import type { BeamInput } from './beamSolver'

export function BeamDiagram({ input }: { input: BeamInput }) {
  const arrows = Array.from({ length: 9 }, (_, i) => 70 + i * 42)
  return <svg className="beamSvg" viewBox="0 0 520 210" role="img" aria-label="Viga biapoiada">
    <line x1="55" y1="125" x2="465" y2="125" className="beamLine" />
    <polygon points="75,128 58,160 92,160" className="support" />
    <polygon points="445,128 428,160 462,160" className="support" />
    <circle cx="438" cy="166" r="5" className="roller"/><circle cx="452" cy="166" r="5" className="roller"/>
    {arrows.map((x) => <g key={x}><line x1={x} y1="50" x2={x} y2="103" className="loadLine"/><polygon points={`${x-5},98 ${x+5},98 ${x},108`} className="loadArrow"/></g>)}
    {input.pointLoad > 0 && <g><line x1="260" y1="25" x2="260" y2="102" className="pointLine"/><polygon points="254,96 266,96 260,109" className="pointArrow"/></g>}
    <text x="260" y="195" textAnchor="middle">L = {input.span.toFixed(2)} m</text>
  </svg>
}
