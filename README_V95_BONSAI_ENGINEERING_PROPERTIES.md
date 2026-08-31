# SmartStruct_RJP — V95 · Propriedades de Engenharia IFC / Bonsai

## Evolução
- Esquema interno SmartStruct-BIM/0.6.
- Exportação IFC4 mantém IDs persistentes SmartStruct.
- Cada elemento estrutural exportado recebe `Pset_SmartStruct_Identity`.
- Materiais recebem `Pset_SmartStruct_Material`.
- Propriedades e resultados de cálculo são exportados em `Pset_SmartStruct_Engineering`.
- Inclui, quando disponíveis, esforços/envelopes, combinações críticas, armaduras, utilização, capacidade de carga e estado de cálculo.
- No Bonsai estas propriedades podem ser consultadas como Property Sets do elemento IFC.

## Limites
A presença dos resultados no IFC não constitui certificação regulamentar nem transforma o modelo BIM num modelo FEM 3D. Mantêm-se as hipóteses e limites dos módulos de cálculo SmartStruct que produziram cada resultado.
