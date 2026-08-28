# SmartStruct_RJP V29.1 — correção de build

Correção do erro TypeScript em `StructuralPages.tsx`.

A variável numérica `N` da página de Sapatas ocultava o componente JSX `<N />`, fazendo o TypeScript interpretar `<N>` como um número.

Correção: `N` / `setN` foram renomeados para `loadN` / `setLoadN` apenas na página de Sapatas.
