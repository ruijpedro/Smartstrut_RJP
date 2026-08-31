# SmartStruct_RJP — Generic openBIM / IFC

Esta versão desacopla a interoperabilidade BIM de qualquer aplicação específica.

## Alterações
- Interface renomeada para **Importar IFC · openBIM** e **Exportar IFC · openBIM**.
- Exportação IFC4 com nome genérico `*_openBIM.ifc`.
- Importação identifica a origem como `IFC/openBIM`.
- Bonsai, FreeCAD, Revit, Archicad, Tekla e outras aplicações passam a ser consumidores/produtores externos possíveis, desde que o IFC usado seja compatível com o subconjunto atualmente suportado.
- Mantidos IDs SmartStruct, GlobalId/identificação IFC quando disponível, Property Sets de engenharia e round-trip cálculo ↔ BIM.

## Limites
O SmartStruct não declara compatibilidade integral com todos os produtores IFC nem com todas as representações geométricas. O importador atual é um subconjunto técnico progressivo; geometrias complexas, mapped representations, BRep/CSG e variantes de perfis requerem evolução/validação.
