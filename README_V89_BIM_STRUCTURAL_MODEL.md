# SmartStruct_RJP V89 — Modelo BIM Estrutural

## Evolução principal
A V89 transforma a base BIM-ready da V88 num modelo estrutural 3D interno navegável na aplicação.

### Modelo de Edifício
- novo parâmetro **Profundidade do edifício**;
- botão **Atualizar modelo BIM**;
- converte o estudo paramétrico existente em objetos informacionais;
- pilares, vigas longitudinais, vigas transversais, lajes e sapatas;
- materiais e resultados preliminares associados aos objetos calculados.

### Novo módulo Modelo BIM
- visualizador isométrico 3D em SVG, sem dependências externas;
- filtros: todos, vigas+pilares, lajes e fundações;
- rotação por quatro vistas;
- inventário de objetos;
- tabela de propriedades;
- exportação **SmartStruct BIM JSON**.

## Nível BIM
Esquema interno atualizado para `SmartStruct-BIM/0.2`.
Não é ainda IFC/openBIM. A geometria transversal gerada a partir do modelo 2D é conceptual. Vigas transversais e lajes são objetos de coordenação a verificar/dimensionar nos respetivos módulos. O solver estrutural existente continua 2D.

## Próxima fase sugerida
- ligar Structural Project PRO ao modelo BIM;
- identificação persistente dos elementos entre cálculo e BIM;
- editor de propriedades e materiais;
- importação/exportação IFC após estabilizar o modelo interno.
