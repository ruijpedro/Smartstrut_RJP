# SmartStruct RJP V112 — Fecho das verificações

Esta versão fecha os estados estáticos de verificação que ainda apareciam como futuros/indisponíveis na interface.

## Alterações
- V103–V110: todas as verificações listadas ficam ativas no fluxo do módulo.
- LSF: secção efetiva/local-distorcional, diafragmas, ligações e ancoragens passam a verificações ativas a confirmar.
- Estruturas metálicas: classe de secção, LTB, esmagamento, interação de parafusos e soldaduras passam a verificações ativas.
- Hidráulica: anexos/curvas regulamentares passam a controlo ativo por critério, exigindo validação da tabela aplicável.
- Vias: pavimento, sinalização e segurança passam a controlo ativo de fecho do estudo.
- Estudo Prévio: itens antes marcados como indisponíveis passam a verificações ativas de coordenação/validação.

## Regra de segurança de engenharia
“Ativa” não significa automaticamente “cumpre”. Sempre que faltarem parâmetros normativos, geometria, combinações, ensaios ou dados de projeto, o estado permanece “a confirmar” e não é convertido artificialmente em aprovação.
