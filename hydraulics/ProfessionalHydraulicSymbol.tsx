import React from 'react'

type Kind='meter'|'tap'|'basin'|'wc'|'shower'|'bidet'|'bath'|'sink'|'washer'|'dishwasher'|'floorDrain'|'stack'|'vent'|'siphon'|'inspection'|'manhole'|'connection'|'gully'|'curbInlet'|'catchBasin'|'loadChamber'|'dischargeChamber'|'invertedSiphon'|'pumpStation'|'terminal'

export function ProfessionalHydraulicSymbol({kind,x,y,selected=false}:{kind:Kind;x:number;y:number;selected?:boolean}){
 const s=selected?'#54e0d7':'#d9e5ec', a='#42d4cd'
 const common={stroke:s,strokeWidth:2.6,fill:'none',strokeLinecap:'round' as const,strokeLinejoin:'round' as const}
 const box=(txt:string)=><><rect x={x-16} y={y-16} width="32" height="32" rx="3" {...common}/><text x={x} y={y+4} textAnchor="middle" fill={s} fontSize="10" fontWeight="700">{txt}</text></>
 if(kind==='meter') return <g><circle cx={x} cy={y} r="15" {...common}/><path d={`M${x-21} ${y}h6m30 0h6M${x-7} ${y+6}l14-12`} {...common}/><text x={x} y={y+5} textAnchor="middle" fill={s} fontSize="8">M</text></g>
 if(kind==='tap') return <g><path d={`M${x-20} ${y}h12l8-8 8 8h12M${x} ${y-8}v-8m-7 0h14`} {...common}/><circle cx={x} cy={y} r="3" fill={a}/></g>
 if(kind==='inspection') return <g><rect x={x-17} y={y-17} width="34" height="34" {...common}/><path d={`M${x-12} ${y}h24M${x} ${y-12}v24`} {...common}/><text x={x} y={y+4} textAnchor="middle" fill={s} fontSize="8">CV</text></g>
 if(kind==='manhole') return <g><circle cx={x} cy={y} r="18" {...common}/><circle cx={x} cy={y} r="11" {...common}/><text x={x} y={y+4} textAnchor="middle" fill={s} fontSize="8">PV</text></g>
 if(kind==='gully') return <g><rect x={x-17} y={y-17} width="34" height="34" {...common}/>{[-10,-5,0,5,10].map(d=><path key={d} d={`M${x+d} ${y-13}v26`} {...common} strokeWidth="1.2"/>)}</g>
 if(kind==='catchBasin') return <g><rect x={x-20} y={y-12} width="40" height="24" {...common}/>{[-14,-7,0,7,14].map(d=><path key={d} d={`M${x+d} ${y-9}v18`} {...common} strokeWidth="1.2"/>)}</g>
 if(kind==='curbInlet') return <g><path d={`M${x-20} ${y+12}h40M${x-20} ${y+5}h28v-17h12`} {...common}/><path d={`M${x-12} ${y-2}h14`} {...common}/></g>
 if(kind==='pumpStation') return <g><circle cx={x} cy={y} r="18" {...common}/><path d={`M${x-9} ${y+8}V${y-8}l18 8-18 8Z`} {...common}/></g>
 if(kind==='invertedSiphon') return <g><path d={`M${x-22} ${y-8}h8q5 0 5 8v8q0 7 7 7h4q7 0 7-7V0q0-8 5-8h8`} {...common}/></g>
 if(kind==='loadChamber') return box('CC')
 if(kind==='dischargeChamber') return box('CD')
 if(kind==='connection') return <g><path d={`M${x-20} ${y}h40M${x} ${y}l12-12`} {...common}/><circle cx={x} cy={y} r="4" fill={a}/></g>
 if(kind==='terminal') return <g><path d={`M${x-20} ${y}h20M${x} ${y-14}v28M${x+7} ${y-11}v22`} {...common}/></g>
 if(kind==='stack') return <g><circle cx={x} cy={y} r="14" {...common}/><path d={`M${x} ${y-20}v40M${x-5} ${y-13}l5-7 5 7`} {...common}/></g>
 if(kind==='vent') return <g><circle cx={x} cy={y} r="14" {...common}/><path d={`M${x} ${y+14}v-30m-6 6 6-6 6 6`} {...common}/></g>
 if(kind==='siphon') return <g><path d={`M${x-20} ${y-7}h9v14q0 9 9 9h4q9 0 9-9V-7h9`} {...common}/></g>
 if(kind==='wc') return <g><path d={`M${x-14} ${y-17}h28v10H-0m${x-12} ${y+1}q2 17 12 17t12-17Z`} {...common}/></g>
 if(kind==='basin'||kind==='sink') return <g><path d={`M${x-18} ${y-5}h36q-2 20-18 20t-18-20Z`} {...common}/><circle cx={x} cy={y+5} r="2.5" fill={a}/></g>
 if(kind==='shower'||kind==='floorDrain') return <g><rect x={x-16} y={y-16} width="32" height="32" {...common}/><path d={`M${x-11} ${y-11}l22 22m0-22-22 22`} {...common}/><circle cx={x} cy={y} r="3" {...common}/></g>
 if(kind==='bath') return <g><rect x={x-22} y={y-12} width="44" height="24" rx="9" {...common}/><circle cx={x+14} cy={y} r="2" fill={a}/></g>
 if(kind==='bidet') return <g><ellipse cx={x} cy={y} rx="15" ry="19" {...common}/><circle cx={x} cy={y+7} r="3" {...common}/></g>
 if(kind==='washer'||kind==='dishwasher') return <g><rect x={x-17} y={y-19} width="34" height="38" rx="2" {...common}/><circle cx={x} cy={y+3} r="10" {...common}/><circle cx={x-10} cy={y-12} r="2" fill={a}/></g>
 return <g>{box('•')}</g>
}
