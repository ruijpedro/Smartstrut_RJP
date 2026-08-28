# SmartStruct_RJP V53 — Traçado gráfico hidráulico

Base: V52.1.

## Novo
- Separação gráfica entre Abastecimento de Água, Esgotos Prediais e Saneamento Público.
- Ferramenta Linha / Tubagem.
- Início e fim do troço em nós da rede.
- Vértices intermédios ilimitados para representar mudanças de direção/traçado em planta.
- Comprimento calculado pelo percurso real da polilinha.
- Cada linha é um troço hidráulico calculável.
- Água: Q, comprimento, DN, velocidade e perda de carga.
- Esgotos: Q, comprimento, inclinação, DN e velocidade.
- Rede pública mantém ligação ao armazenamento usado pelo Perfil Público.
- Apagar troços e limpar desenho.

Fluxo:
1. Colocar os elementos.
2. Ativar Linha / Tubagem.
3. Tocar no nó inicial.
4. Tocar no fundo para adicionar vértices, se necessário.
5. Tocar no nó final.
