export type SupportType =
  | 'free' | 'pin' | 'roller-x' | 'roller-y' | 'fixed'
  | 'guided-x' | 'guided-y' | 'spring-x' | 'spring-y'

export type Node2D={
  id:number; x:number; y:number; support?:SupportType;
  kx?:number; ky?:number;
}

export type Member2D={
  id:number; a:number; b:number; E:number; A:number; I:number; label?:string
}

export type NodeLoad={
  id:number; kind:'node-force'|'node-moment'; node:number;
  Fx?:number; Fy?:number; M?:number
}

export type MemberLoad={
  id:number; member:number;
  kind:'point'|'udl'|'triangular'|'trapezoidal'|'moment';
  direction?:'global-x'|'global-y'|'local-y';
  P?:number; a?:number;
  q1?:number; q2?:number;
  M?:number
}

export type StructuralLoad = NodeLoad | MemberLoad

export type Model2D={
  nodes:Node2D[];
  members:Member2D[];
  loads:StructuralLoad[];
}

export type MemberResult={id:number;L:number;angle:number;axialApprox:number}
