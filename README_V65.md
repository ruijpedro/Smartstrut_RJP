# SmartStruct_RJP V65 — Load Cases & Envelopes

Evolução do Structural Project PRO V64.

## Novo
- cálculo de todas as combinações definidas, sem limitar a análise à combinação visível;
- envelope por barra de |N|max, |V|max e |M|max;
- identificação da combinação governante para N, V e M;
- combinação ativa continua disponível para inspeção detalhada;
- fundações continuam ligadas à combinação ativa;
- mantém Projeto, Geometria, Materiais, Ações, Análise e exportação JSON.

## Engenharia
O envelope V65 é calculado sobre esforços de extremidade do solver 2D. Não é ainda um envelope contínuo ao longo da barra nem substitui combinações regulamentares completas.

## Interface
O novo cabeçalho/símbolo solicitado fica reservado para a V66, conforme definido.
