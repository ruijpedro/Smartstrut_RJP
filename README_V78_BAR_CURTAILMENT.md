# SmartStruct_RJP 78.0 — Cortes e prolongamentos automáticos

## Vigas
- leitura do diagrama de momentos;
- identificação automática de zonas relevantes de momento positivo e negativo;
- proposta de início/fim dos varões;
- prolongamento dos cortes pelo lb,d já calculado;
- desenho gráfico com marcas B1, T1, T2;
- mapa de varões com diâmetro, quantidade, comprimento e coordenadas ao longo da viga;
- estribos separados em zonas de apoio e vão;
- etiquetas Ø mantidas junto das armaduras;
- versão responsiva para telemóvel, tablet e desktop.

## Regra atual de corte
A zona resistente é detetada, nesta fase, a partir de 30% do pico de momento de cada sinal e depois prolongada pelo comprimento de ancoragem. É uma heurística gráfica/de apoio ao projeto e NÃO uma implementação normativa completa da dispensa de armadura.

## Próximas validações necessárias
- força de tração deslocada devido ao corte;
- regras completas de dispensa de armadura;
- comprimento além do ponto teórico de corte;
- ancoragem em apoios;
- barras mínimas contínuas;
- emendas alternadas;
- compatibilidade com combinações/envelopes de esforços;
- geração de mapa de aço global do projeto.
