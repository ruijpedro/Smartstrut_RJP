# SmartStruct_RJP — V92 · Bonsai round-trip IFC

- Importação IFC diretamente no módulo Modelo BIM.
- Fluxo SmartStruct → IFC4 → Bonsai → IFC → SmartStruct.
- Reconhecimento inicial: IfcBeam, IfcColumn, IfcSlab, IfcFooting, IfcWall, IfcPile e IfcPipeSegment.
- Leitura de posicionamentos locais e geometria IfcExtrudedAreaSolid com IfcRectangleProfileDef.
- Preserva nome, Tag/ID IFC quando disponível e STEP id como propriedades de origem.
- Elementos importados ficam marcados "A verificar"; a importação não equivale a cálculo estrutural.
- O importador no browser é deliberadamente leve: geometrias BRep, CSG, mapped items e perfis complexos requerem futura integração IfcOpenShell/serviço local.
- Esquema interno atualizado para SmartStruct-BIM/0.4.
