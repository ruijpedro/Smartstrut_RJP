export type WallKind='rc'|'gravity'|'gabion'|'berlin'|'pilewall'|'reinforcedsoil'
export type BaseSoil={ gamma:number; phi:number; q:number; mu:number; qAllow:number }
export type WallCheck={ label:string; value:number; limit:number; ok:boolean; unit?:string }
