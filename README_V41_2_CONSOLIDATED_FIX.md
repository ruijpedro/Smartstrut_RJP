# SmartStruct_RJP V41.2 — Consolidated Fix

Correções consolidadas:
- `StructuralLoad.member` protegido por type guard explícito no solver legado;
- `Structural2DEditor.tsx` distingue cargas nodais e de barra antes de usar `.member`;
- workflows atualizados para `actions/checkout@v5` e `actions/setup-node@v5`;
- `setup-java@v5` e `upload-artifact@v6` quando presentes;
- Node do projeto mantido em 22;
- versão marcada como `41.2.0`.

No GitHub Actions, o início do build deve mostrar:
`smartstruct-rjp-v31@41.2.0`
