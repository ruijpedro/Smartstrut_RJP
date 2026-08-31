# SmartStruct_RJP — BIM ↔ Cálculo

- Seleção de elementos no visualizador BIM e inventário.
- Associação automática: IfcBeam/viga → Vigas PRO; IfcColumn/pilar → Pilares PRO; IfcSlab/laje → Lajes PRO; fundações → Fundações PRO.
- Botão Abrir cálculo / Calcular-verificar por elemento.
- Handoff persistente em `smartstruct:bim-calculation-handoff`, preservando ID, geometria, material, propriedades e estado de cálculo.
- Mantém o round-trip IFC com Bonsai da V92.

Nota: a abertura do módulo não converte automaticamente toda a semântica IFC em ações/condições de fronteira. A geometria e propriedades ficam preparadas para adoção progressiva pelos solvers.
