# V72.3 — Correção do editor gráfico hidráulico

## Correção principal
Ao desenhar uma Linha / Tubagem e depois escolher um novo elemento (Caixa, Câmara de visita ou Sumidouro), a linha pendente deixa de ser descartada.

Novo fluxo:
1. Selecionar Linha / Tubagem.
2. Tocar no nó inicial.
3. Criar vértices intermédios se necessário.
4. Escolher o novo elemento.
5. Colocá-lo no desenho.
6. A tubagem é terminada automaticamente nesse novo nó e permanece no esquema.

## Novo elemento
- Sumidouro adicionado à paleta de Esgotos Prediais e Saneamento Público.

## Mantido
- ligação direta entre dois nós existentes;
- vértices intermédios;
- cálculo hidráulico dos troços;
- gravação da rede pública.
