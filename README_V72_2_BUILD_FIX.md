# V72.2 — WebApp TypeScript syntax fix

Correções em RoadsProPage.tsx:
- comparação de offset reescrita como `projected.offset < -0.2`, evitando ambiguidade do parser TSX;
- handler `onPick` reescrito em instruções separadas;
- handler de clique SVG reescrito em várias instruções, sem declaração compacta ambígua;
- package version 72.2.0.

Validação: o TypeScript global já não reporta TS1005 nas linhas do módulo Roads PRO. A validação local completa não foi concluída porque as dependências npm não ficaram instaladas dentro do tempo disponível.
