import React from 'react'

export type HydraulicSymbolKind=
 'meter'|'tap'|'basin'|'wc'|'shower'|'bidet'|'bath'|'sink'|'washer'|'dishwasher'|'floorDrain'|'stack'|'vent'|'siphon'|'inspection'|'manhole'|'connection'|'gully'|'curbInlet'|'catchBasin'|'loadChamber'|'dischargeChamber'|'invertedSiphon'|'pumpStation'|'terminal'|
 'gateValve'|'checkValve'|'butterflyValve'|'reducer'|'filter'|'pump'|'flange'|'tee'

export function TechnicalSymbol({kind,x,y=0,size=42,selected=false}:{kind:HydraulicSymbolKind;x:number;y?:number;size?:number;selected?:boolean}){
 const s=size/42, c=selected?'#67e8f9':'#e8f1f7', a='#38bdf8', sw=2.2
 const T=({children}:{children:React.ReactNode})=><g transform={`translate(${x} ${y}) scale(${s})`} stroke={c} fill="none" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{children}</g>
 const valve=<><line x1="-20" y1="0" x2="-9" y2="0"/><path d="M-9-8L0 0-9 8Z M9-8L0 0 9 8Z"/><line x1="9" y1="0" x2="20" y2="0"/></>
 switch(kind){
  case'gateValve':return <T>{valve}<line x1="0" y1="-1" x2="0" y2="-14"/><line x1="-6" y1="-14" x2="6" y2="-14"/></T>
  case'checkValve':return <T><line x1="-20" y1="0" x2="-9" y2="0"/><path d="M-8-8L5 0-8 8Z"/><line x1="7" y1="-9" x2="7" y2="9"/><line x1="7" y1="0" x2="20" y2="0"/></T>
  case'butterflyValve':return <T>{valve}<circle cx="0" cy="0" r="11"/><line x1="-7" y1="7" x2="7" y2="-7"/></T>
  case'reducer':return <T><line x1="-20" y1="-7" x2="-5" y2="-7"/><line x1="-20" y1="7" x2="-5" y2="7"/><path d="M-5-7L8-4V4L-5 7"/><line x1="8" y1="-4" x2="20" y2="-4"/><line x1="8" y1="4" x2="20" y2="4"/></T>
  case'filter':return <T><line x1="-20" y1="0" x2="-10" y2="0"/><path d="M-10-10H10V10H-10Z M-7 7L7-7"/><line x1="10" y1="0" x2="20" y2="0"/></T>
  case'pump':return <T><line x1="-20" y1="0" x2="-12" y2="0"/><circle cx="0" cy="0" r="12"/><path d="M-5 7L8 0-5-7Z" fill={a} stroke={a}/><line x1="12" y1="0" x2="20" y2="0"/></T>
  case'flange':return <T><line x1="-20" y1="0" x2="-4" y2="0"/><line x1="-4" y1="-10" x2="-4" y2="10"/><line x1="4" y1="-10" x2="4" y2="10"/><line x1="4" y1="0" x2="20" y2="0"/></T>
  case'tee':return <T><path d="M-20 0H20 M0 0V-20"/><circle cx="0" cy="0" r="3" fill={c}/></T>
  case'meter':return <T><line x1="-20" y1="0" x2="-13" y2="0"/><circle r="13"/><path d="M-7 4Q0-7 7 4"/><line x1="0" y1="0" x2="6" y2="-5"/><line x1="13" y1="0" x2="20" y2="0"/></T>
  case'tap':return <T>{valve}<path d="M0-1V-14H10 M5-18H15"/></T>
  case'manhole':case'inspection':return <T><circle r={kind==='manhole'?14:11}/><circle r={kind==='manhole'?9:6}/><path d="M-9 0H9 M0-9V9"/></T>
  case'gully':return <T><rect x="-13" y="-10" width="26" height="20"/><path d="M-9-6V6 M-3-6V6 M3-6V6 M9-6V6"/></T>
  case'catchBasin':return <T><rect x="-15" y="-8" width="30" height="16"/><path d="M-12-4H12 M-12 0H12 M-12 4H12"/></T>
  case'curbInlet':return <T><path d="M-18 8H18 M-15 3H15V-7H-15Z M-10-2H10"/></T>
  case'pumpStation':return <T><rect x="-15" y="-15" width="30" height="30" rx="3"/><circle r="9"/><path d="M-3 5L6 0-3-5Z" fill={a}/></T>
  case'invertedSiphon':return <T><path d="M-20-6H-10Q-4-6-4 0V8Q-4 14 2 14H8Q14 14 14 8V0Q14-6 20-6"/></T>
  case'loadChamber':case'dischargeChamber':return <T><rect x="-15" y="-13" width="30" height="26"/><path d="M-10 5H10 M-8 0H8"/></T>
  case'terminal':return <T><path d="M-18 0H0 M0-11V11 M5-8V8"/></T>
  case'connection':return <T><path d="M-18 0H0V-16 M0 0H18"/><circle r="3" fill={c}/></T>
  case'stack':return <T><path d="M0-20V20"/><path d="M-6-13L0-20 6-13 M-6 13L0 20 6 13"/></T>
  case'vent':return <T><path d="M0 18V-12 M-7-12H7 M-5-17H5"/></T>
  case'siphon':return <T><path d="M-18-5H-8V8Q-8 14-2 14H4Q10 14 10 8V-5H18"/></T>
  case'floorDrain':return <T><circle r="13"/><path d="M-9-9L9 9 M9-9L-9 9"/></T>
  case'wc':return <T><path d="M-12-15H10V-6Q10 9 0 15Q-10 9-10-6Z"/><ellipse cy="-5" rx="7" ry="5"/></T>
  case'basin':case'sink':return <T><path d="M-16-8H16Q14 11 0 13Q-14 11-16-8Z"/><circle cy="3" r="2" fill={c}/></T>
  case'shower':return <T><rect x="-15" y="-15" width="30" height="30"/><circle r="3"/><path d="M-10-10L10 10 M10-10L-10 10"/></T>
  default:return <T><circle r="12"/><circle r="3" fill={c}/></T>
 }
}
