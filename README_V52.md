# SmartStruct_RJP V52 — Android Icon + Redes Ligadas

## Ícone Android corrigido
O projeto Android é criado dinamicamente no GitHub Actions, por isso os mipmaps
não existiam no ZIP das versões anteriores. A V52 inclui agora `android-icon-res/`
com todas as densidades do `ic_launcher (9)` fornecido e o workflow copia esses
recursos para `android/app/src/main/res/` depois de `npx cap sync android`.

Incluído:
- mdpi / hdpi / xhdpi / xxhdpi / xxxhdpi;
- adaptive foreground/background;
- XML adaptive icon;
- `ic_launcher_round`;
- símbolo Web/PWA sincronizado com o mesmo ícone.

## Rede Pública ligada ao Perfil
- o Editor Gráfico guarda a rede pública localmente;
- câmaras e coletores deixam de ser apenas um desenho isolado;
- ao abrir `Perfil Público`, as câmaras desenhadas no Editor Redes são importadas;
- os comprimentos dos troços são reutilizados quando existe ligação entre CV;
- cotas de terreno e soleira introduzidas no editor alimentam o perfil;
- mantém fallback de exemplo caso ainda não exista uma rede desenhada.

Próxima evolução preparada:
- propagação bidirecional das alterações perfil ↔ planta;
- inserção automática de CV quando L > 60 m;
- deteção automática de mudança de direção / DN / inclinação;
- cálculo e desenho de quedas guiadas;
- relatório de rede pública com planta + perfil.
