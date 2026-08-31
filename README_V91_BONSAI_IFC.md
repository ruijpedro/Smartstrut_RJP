# SmartStruct_RJP — V91 · Ligação Bonsai / IFC

- Exportação IFC4 diretamente no módulo Modelo BIM.
- Botão **Exportar IFC · Bonsai** cria um ficheiro `.ifc` para abrir no Bonsai.
- Estrutura espacial IFC: IfcProject → IfcSite → IfcBuilding → IfcBuildingStorey.
- Mapeamento inicial: pilares→IfcColumn, vigas→IfcBeam, lajes→IfcSlab, fundações→IfcFooting.
- IDs SmartStruct seguem no Tag/Description para rastreabilidade.
- Geometria IFC inicial por sólidos extrudidos retangulares.
- Mantém exportação SmartStruct BIM JSON.

## Limites
Não existe uma API web oficial do Bonsai que permita a uma WebApp abrir/controlar diretamente uma instalação local do Blender/Bonsai. A ligação interoperável implementada é IFC4. O IFC deve ser aberto/importado no Bonsai. Esta versão não pretende certificação IFC nem substitui validação do ficheiro no IfcOpenShell/Bonsai.
