# SmartStruct_RJP — Engineering Preliminary Study

Esta versão aprofunda a aplicação para funcionar como ferramenta de **estudo prévio de engenharia**, mantendo a distinção entre cálculo preliminar, verificação normativa e projeto de execução.

## Evoluções
- Novo quadro comum de **Normas / Critérios** por especialidade.
- Estruturas de betão: base técnica EN 1990 / EN 1991 / EN 1992 / EN 1998 apresentada nos módulos principais.
- LSF: separadores Geometria, Ações, Montantes/Perfis, Estabilidade, Ligações, Quantificação e Normas/Critérios.
- LSF: propriedades brutas paramétricas, ações preliminares, encurvadura global aproximada, flexão ao vento, deformação e mapa preliminar de aço.
- Geotecnia: separador Normas/Critérios com EN 1997 e checklist de investigação/parâmetros/capacidade/assentamentos/estabilidade.
- Hidráulica: separador Normas/Critérios com DR 23/95 e referências complementares EN 806 / EN 12056.
- Vias: separador Normas/Critérios e checklist de traçado, rasante, visibilidade, terras, drenagem, segurança e pavimentos.
- GitHub build-validation ajustado para projetos sem package-lock: `npm install` em vez de `npm ci`.

## Limites de engenharia
Os resultados são adequados a estudo prévio e comparação de soluções. O projeto final exige confirmação da edição normativa e do Anexo Nacional, requisitos da entidade gestora, dados de campo e validação por técnico responsável.

No LSF, a resistência usa uma triagem de secção bruta e encurvadura global. A secção efetiva, encurvadura local/distorcional, ligações completas, diafragmas e contraventamento devem ser desenvolvidos antes de qualquer afirmação de conformidade EN 1993-1-3.
