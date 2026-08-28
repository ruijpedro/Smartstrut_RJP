# SmartStruct_RJP V41.1 — Type Guard Fix

Corrigidos os erros TypeScript no módulo estrutural 2D legado:

- `StructuralLoad` é uma união entre `NodeLoad` e `MemberLoad`;
- o acesso a `.member` passa a ser feito apenas depois de TypeScript confirmar que a carga é de barra;
- o editor usa `loadTarget()` para distinguir cargas nodais de cargas em barras;
- mantido o solver matricial real da V41.

A versão correta a aparecer no build é `41.1.0`.
