# SmartStruct_RJP — V94 · Bonsai → Cálculo → BIM

Evolução do fluxo openBIM da V93.

- O elemento selecionado no Modelo BIM abre o módulo de cálculo correspondente.
- Vigas, pilares, lajes e fundações consomem automaticamente a geometria/material do handoff BIM.
- Quando existem esforços importados/associados, pilares e fundações reutilizam os valores disponíveis.
- Cada módulo apresenta o ID BIM ligado e permite **Devolver resultados ao BIM**.
- Os resultados ficam no mesmo objeto BIM, que pode voltar a ser exportado em IFC para Bonsai.
- Esquema interno atualizado para `SmartStruct-BIM/0.5`.

## Limites
A importação IFC continua focada nas geometrias suportadas pela V92. O fluxo não equivale a análise FEM 3D nem a validação normativa automática. O IFC exportado deve ser validado no Bonsai/IfcOpenShell antes de uso profissional.
