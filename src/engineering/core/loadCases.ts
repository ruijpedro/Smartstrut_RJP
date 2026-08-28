export type LoadCase={name:string,type:'G'|'Q'|'W'|'S'|'T',value:number}
export type Combination={name:string,value:number}
export function combinations(cases:LoadCase[]):Combination[]{
 const sum=(t:string)=>cases.filter(c=>c.type===t).reduce((s,c)=>s+c.value,0)
 const G=sum('G'),Q=sum('Q'),W=sum('W'),S=sum('S')
 return [
  {name:'ELU fundamental Q',value:1.35*G+1.5*Q+1.5*.6*W+1.5*.5*S},
  {name:'ELU fundamental W',value:1.35*G+1.5*W+1.5*.7*Q+1.5*.5*S},
  {name:'ELS característica',value:G+Q+.6*W+.5*S},
  {name:'ELS frequente',value:G+.5*Q+.2*W+.2*S},
  {name:'ELS quase-permanente',value:G+.3*Q}
 ]
}
