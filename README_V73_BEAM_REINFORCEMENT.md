# SmartStruct_RJP — Vigas com armaduras

Primeira fase do motor comum de dimensionamento de armaduras.

## Vigas
- momentos positivo e negativo extraídos do diagrama;
- As necessária inferior e superior;
- armadura mínima baseada em fctm/fyk e limite 0,0013·b·d;
- referência de armadura máxima 4% Ac;
- seleção automática de número e diâmetro de varões;
- verificação geométrica simples de disposição em até duas camadas;
- armadura transversal 2 ramos com Ø e espaçamento automáticos;
- Asw/s mínima e calculada;
- desenho SVG responsivo da secção armada;
- interface adaptada a desktop, tablet e telemóvel.

## Tabelas
Os diâmetros e soluções usuais foram alinhados com as tabelas de armaduras fornecidas pelo utilizador. As áreas dos varões são calculadas por πØ²/4 para evitar depender de transcrição manual.

## Limitações
Este passo não constitui ainda dimensionamento EC2 completo. Permanecem por implementar/verificar de forma abrangente: combinações ELU/ELS, ancoragens, emendas, fendilhação, deformações, torção, cargas de projeto por casos/combinações, disposições construtivas completas e relatório regulamentar.
