import React from 'react'
import {printReport} from '../../engineering/reports/report'
export default function ReportPreviewPage(){
  return <div className="module-page">
    <div className="module-head"><div><h2>Relatórios</h2><p>Memória de cálculo pronta para impressão/PDF do sistema.</p></div><button className="primary-action report-print" onClick={printReport}>Imprimir / PDF</button></div>
    <section className="panel report-sheet"><header><h2>SmartStruct_RJP</h2><p>Memória de cálculo</p></header>
      <h4>1. Identificação</h4><p>Projeto: Exemplo técnico</p><p>Disciplina: Engenharia Civil</p>
      <h4>2. Dados de entrada</h4><p>Geometria, materiais, ações, apoios e parâmetros geotécnicos/hidráulicos.</p>
      <h4>3. Modelo de cálculo</h4><p>Hipóteses, combinações e esquema paramétrico gerado pela aplicação.</p>
      <h4>4. Resultados</h4><p>Esforços, deslocamentos, tensões e coeficientes de segurança.</p>
      <h4>5. Verificações</h4><p>Resumo das verificações preliminares efetuadas em cada módulo.</p>
      <h4>6. Conclusão</h4><p>Ferramenta de apoio académico e pré-dimensionamento. Requer validação técnica adequada.</p>
    </section>
  </div>
}
