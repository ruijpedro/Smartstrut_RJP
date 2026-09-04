export type Check={label:string,ok:boolean,detail:string,article:string}
export function waterChecks(v:number,pressureKPa:number):Check[]{
 return[
  {label:'Velocidade',ok:v>=.5&&v<=2,detail:`${v.toFixed(2)} m/s · limite 0,5–2,0 m/s`,article:'DR 23/95 · Art. 94.º'},
  {label:'Pressão',ok:pressureKPa>=50&&pressureKPa<=600,detail:`${pressureKPa.toFixed(0)} kPa · intervalo 50–600 kPa`,article:'DR 23/95 · Art. 87.º'}
 ]
}
export function sewerChecks(sPct:number,nonIndividual=true):Check[]{
 return[
  {label:'Inclinação do ramal',ok:sPct>=1&&sPct<=4,detail:`${sPct.toFixed(2)} % · intervalo 10–40 mm/m`,article:'DR 23/95 · Art. 214.º'},
  {label:'Critério de enchimento',ok:true,detail:nonIndividual?'Ramal não individual calculado a meia secção':'Verificar distância à secção ventilada',article:'DR 23/95 · Art. 214.º'}
 ]
}
