# SmartStruct_RJP V44.1 — Build Fix

Correções:
- `HydraulicsPage` importado como `default` quando usado diretamente pelo ficheiro.
- `hydraulics/index.ts` também exporta `HydraulicsPage` como alias nomeado.
- removido `Array.at(-1)` de `FixedProppedBeamPage.tsx`;
- substituído por `points[points.length - 1]`, compatível com o target atual.
- versão atualizada para `44.1.0`.
