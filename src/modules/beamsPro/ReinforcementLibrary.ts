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


export type AnchorageResult={
  phi:number
  fctm:number
  fctk005:number
  fctd:number
  fbd:number
  sigmaSd:number
  lbRqd:number
  lbMin:number
  lbd:number
  lapMin:number
  lap:number
  assumptions:string[]
}

/**
 * Preliminary EC2-style anchorage helper.
 * Assumptions: ribbed bars, good bond, phi <= 32 mm, alpha factors = 1.0,
 * sigma_sd = fyd. Intended for design assistance, not final normative detailing.
 */
export function anchorageLength(phi:number,fck:number,fyk:number):AnchorageResult{
  const fctm=fck<=50?0.3*Math.pow(Math.max(fck,0),2/3):2.12*Math.log(1+(fck+8)/10)
  const fctk005=0.7*fctm
  const gammaC=1.5,gammaS=1.15
  const fctd=fctk005/gammaC
  const eta1=1,eta2=phi<=32?1:Math.max(0.7,(132-phi)/100)
  const fbd=2.25*eta1*eta2*fctd
  const sigmaSd=fyk/gammaS
  const lbRqd=(phi/4)*sigmaSd/Math.max(fbd,1e-9)
  const lbMin=Math.max(0.3*lbRqd,10*phi,100)
  const lbd=Math.max(lbRqd,lbMin)
  const lapMin=Math.max(0.3*lbRqd,15*phi,200)
  const lap=Math.max(1.5*lbRqd,lapMin)
  return{
    phi,fctm,fctk005,fctd,fbd,sigmaSd,lbRqd,lbMin,lbd,lapMin,lap,
    assumptions:['aderência boa','varão nervurado','α1…α5 = 1,0','σsd = fyd','sobreposição preliminar = 1,5·lb,rqd']
  }
}
