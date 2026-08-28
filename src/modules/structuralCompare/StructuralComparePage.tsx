import React from 'react'
export default function StructuralComparePage(){
  const rows=[
    ['Vigas','Reações, V, M, flecha, As','EC2 preliminar'],
    ['Pilares','N, Mx, My, esbelteza, interação','EC2 preliminar'],
    ['Lajes','1D/2D, Mx/My, armaduras','EC2 preliminar'],
    ['Treliças','Reações, banzos/diagonais, flecha aprox.','Análise linear simplificada']
  ]
  return <div className="module-page"><div className="module-head"><div><h2>Comparação estrutural</h2><p>Resumo dos modelos atualmente implementados.</p></div></div>
  <section className="panel"><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr><th align="left">Módulo</th><th align="left">Resultados</th><th align="left">Nível</th></tr></thead><tbody>{rows.map(r=><tr key={r[0]}>{r.map(c=><td key={c} style={{padding:'10px 6px',borderTop:'1px solid #22344d'}}>{c}</td>)}</tr>)}</tbody></table></section></div>
}
