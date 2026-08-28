# SmartStruct_RJP 72.4

## Editor gráfico hidráulico
- separação entre Abastecimento, Esgotos Prediais, Saneamento Público e Águas Pluviais;
- CV e PV como objetos distintos;
- Sumidouro, Sarjeta e Boca de Lobo;
- Câmara de Carga, Câmara de Descarga, Sifão Invertido, EEAR e Terminal de Limpeza;
- aparelhos prediais adicionais;
- continuidade da tubagem ao colocar um novo órgão;
- propriedades de cota e profundidade para CV/PV em redes públicas/pluviais.

## Projeto de compilação
Foi acrescentada uma validação independente no GitHub Actions:
1. npm ci
2. TypeScript check
3. Build WebApp
4. Capacitor sync Android
5. Gradle assembleDebug
6. upload do APK debug

Node 22 e Java 21.
