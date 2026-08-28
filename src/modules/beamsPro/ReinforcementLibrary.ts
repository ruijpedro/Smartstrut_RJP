export type BarProposal={
  dia:number
  count:number
  area:number
  required:number
  excess:number
  fits:boolean
  layers:number
  label:string
}

export type StirrupProposal={
  dia:number
  legs:number
  spacing:number
  aswPerS:number
  requiredPerS:number
  label:string
}

export const BAR_DIAMETERS=[6,8,10,12,14,16,20,25,32] as const
export const LONGITUDINAL_DIAMETERS=[8,10,12,14,16,20,25,32] as const
export const STIRRUP_DIAMETERS=[6,8,10,12] as const
export const PRACTICAL_SPACINGS=[75,100,125,150,175,200,225,250,300] as const

export function barArea(dia:number){ return Math.PI*dia*dia/4 }

export function distributedAreaPerM(dia:number,spacingMm:number){
  return barArea(dia)*1000/Math.max(spacingMm,1)
}

function fitLayers(count:number,dia:number,bMm:number,coverMm:number,stirrupDia:number){
  const clearWidth=bMm-2*(coverMm+stirrupDia)
  const minClear=Math.max(20,dia)
  if(clearWidth<=dia) return {fits:false,layers:99}
  const perLayer=Math.max(1,Math.floor((clearWidth+minClear)/(dia+minClear)))
  const layers=Math.ceil(count/perLayer)
  return {fits:layers<=2,layers}
}

export function chooseBars(requiredMm2:number,bMm:number,coverMm:number,stirrupDia=8,minBars=2,maxBars=8):BarProposal{
  const req=Math.max(requiredMm2,0)
  const candidates:BarProposal[]=[]
  for(const dia of LONGITUDINAL_DIAMETERS){
    for(let count=minBars;count<=maxBars;count++){
      const area=count*barArea(dia)
      if(area+1e-9<req) continue
      const fit=fitLayers(count,dia,bMm,coverMm,stirrupDia)
      candidates.push({
        dia,count,area,required:req,excess:area-req,fits:fit.fits,layers:fit.layers,
        label:`${count}Ø${dia}`
      })
    }
  }
  const fitted=candidates.filter(c=>c.fits)
  const pool=fitted.length?fitted:candidates
  return pool.sort((a,b)=>a.excess-b.excess || a.layers-b.layers || a.dia-b.dia)[0] ??
    {dia:LONGITUDINAL_DIAMETERS[0],count:minBars,area:minBars*barArea(LONGITUDINAL_DIAMETERS[0]),required:req,excess:0,fits:false,layers:1,label:`${minBars}Ø${LONGITUDINAL_DIAMETERS[0]}`}
}

export function chooseStirrups(requiredPerS:number,dMm:number,bMm:number):StirrupProposal{
  const maxSpacing=Math.max(75,Math.min(300,0.75*dMm))
  const candidates:StirrupProposal[]=[]
  for(const dia of STIRRUP_DIAMETERS){
    const area2=2*barArea(dia)
    for(const spacing of PRACTICAL_SPACINGS){
      if(spacing>maxSpacing+1e-9) continue
      const aswPerS=area2/spacing
      if(aswPerS+1e-9<requiredPerS) continue
      candidates.push({
        dia,legs:2,spacing,aswPerS,requiredPerS,
        label:`2R Ø${dia} // ${spacing} mm`
      })
    }
  }
  return candidates.sort((a,b)=>a.aswPerS-b.aswPerS || b.spacing-a.spacing || a.dia-b.dia)[0] ??
    {dia:12,legs:2,spacing:75,aswPerS:2*barArea(12)/75,requiredPerS,label:'2R Ø12 // 75 mm'}
}


export type DistributedProposal={
  dia:number
  spacing:number
  areaPerM:number
  requiredPerM:number
  excess:number
  label:string
}

export function chooseDistributed(requiredPerM:number,maxSpacing=300,minDia=6,maxDia=25):DistributedProposal{
  const req=Math.max(requiredPerM,0)
  const candidates:DistributedProposal[]=[]
  for(const dia of BAR_DIAMETERS){
    if(dia<minDia||dia>maxDia) continue
    for(const spacing of PRACTICAL_SPACINGS){
      if(spacing>maxSpacing) continue
      const areaPerM=distributedAreaPerM(dia,spacing)
      if(areaPerM+1e-9<req) continue
      candidates.push({dia,spacing,areaPerM,requiredPerM:req,excess:areaPerM-req,label:`Ø${dia} // ${spacing} mm`})
    }
  }
  return candidates.sort((a,b)=>a.excess-b.excess || b.spacing-a.spacing || a.dia-b.dia)[0] ??
    {dia:25,spacing:75,areaPerM:distributedAreaPerM(25,75),requiredPerM:req,excess:0,label:'Ø25 // 75 mm'}
}
