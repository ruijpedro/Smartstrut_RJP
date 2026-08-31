/** SmartStruct internal BIM-ready schema. Not an IFC implementation. */
export type BIMDiscipline='structures'|'geotechnics'|'hydraulics'|'roads'|'lsf'|'containment'
export type BIMElementType='beam'|'column'|'slab'|'isolated_footing'|'strip_footing'|'raft_foundation'|'pile'|'wall'|'lsf_member'|'pipe'|'manhole'|'road_element'|'material'
export type BIMProperty=string|number|boolean|null
export interface BIMMaterialRef { id:string; name:string; family:string; properties?:Record<string,BIMProperty> }
export interface BIMElement {
 id:string; name:string; discipline:BIMDiscipline; type:BIMElementType; level?:string;
 material?:BIMMaterialRef;
 geometry:Record<string,BIMProperty>;
 properties:Record<string,BIMProperty>;
 calculation?:{module:string;status:'calculated'|'preliminary'|'check';results:Record<string,BIMProperty>}
}
export interface SmartStructBIMModel {
 schema:'SmartStruct-BIM/0.6';
 project:{name:string;location?:string;author?:string};
 elements:BIMElement[];
 createdAt:string;
 updatedAt:string;
}
export const BIM_STORAGE_KEY='smartstruct:bim-model'
export const concreteC30: BIMMaterialRef={id:'MAT-CONC-C30',name:'Betão C30/37',family:'Betão',properties:{fck_MPa:30}}
export function createBIMModel(name='Projeto SmartStruct'):SmartStructBIMModel{const now=new Date().toISOString();return{schema:'SmartStruct-BIM/0.6',project:{name},elements:[],createdAt:now,updatedAt:now}}
export function saveBIMModel(model:SmartStructBIMModel){const m={...model,updatedAt:new Date().toISOString()};localStorage.setItem(BIM_STORAGE_KEY,JSON.stringify(m));return m}
export function loadBIMModel():SmartStructBIMModel|null{try{const raw=localStorage.getItem(BIM_STORAGE_KEY);if(!raw)return null;const x=JSON.parse(raw);if(!x?.elements)return null;return{...x,schema:'SmartStruct-BIM/0.6',updatedAt:x.updatedAt||x.createdAt||new Date().toISOString()}}catch{return null}}
export function exportBIMJson(model:SmartStructBIMModel){const blob=new Blob([JSON.stringify(model,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='SmartStruct_BIM_Model.json';a.click();URL.revokeObjectURL(a.href)}

export interface BuildingBIMInput{
 projectName?:string; floors:number; bays:number; bay:number; storey:number; depth:number;
 columns:Array<{index:number;N:number;M:number;b:number;h:number;footB:number;footL:number;footH:number;qmax:number;util:number}>;
 beams:Array<{id:number;b:number;h:number;Med:number}>;
}
/** Converts the current parametric 2D building study into a conceptual 3D BIM model.
 *  Two longitudinal frames are generated to give the preliminary model a transverse dimension.
 *  This is geometry/information modelling, not a 3D structural analysis model.
 */
export function buildConceptualBuildingBIM(i:BuildingBIMInput):SmartStructBIMModel{
 const model=createBIMModel(i.projectName||'Modelo de Edifício SmartStruct')
 const els:BIMElement[]=[];const rows=[0,i.depth];let id=1
 const colRef=i.columns.length?i.columns[0]:null
 const cb=colRef?.b||.30,ch=colRef?.h||.35
 // columns and isolated footings at both longitudinal frames
 for(let r=0;r<rows.length;r++)for(let x=0;x<=i.bays;x++){
  const ref=i.columns[Math.min(x,i.columns.length-1)]||colRef
  const b=ref?.b||cb,h=ref?.h||ch
  const fB=ref?.footB||1.8,fL=ref?.footL||1.8,fH=ref?.footH||.5
  els.push({id:`F${id}`,name:`Sapata ${x+1}.${r+1}`,discipline:'structures',type:'isolated_footing',level:'Fundação',material:concreteC30,
   geometry:{x:x*i.bay,y:rows[r],z:-fH/2,width:fB,depth:fL,height:fH},properties:{basis:'pré-dimensionamento automático'},
   calculation:ref?{module:'Modelo de Edifício',status:'preliminary',results:{N_kN:ref.N,M_kNm:ref.M,qmax_kPa:ref.qmax,utilizacao:ref.util}}:undefined});id++
  for(let fl=0;fl<i.floors;fl++)els.push({id:`C${id}`,name:`Pilar ${x+1}.${r+1}.${fl+1}`,discipline:'structures',type:'column',level:`Piso ${fl+1}`,material:concreteC30,
   geometry:{x:x*i.bay,y:rows[r],z:fl*i.storey,length:i.storey,b,h},properties:{orientation:'vertical'},
   calculation:ref?{module:'Modelo de Edifício',status:'preliminary',results:{Nbase_kN:ref.N,Mbase_kNm:ref.M}}:undefined});id++
 }
 // beams in X on both frames
 for(let fl=1;fl<=i.floors;fl++)for(let r=0;r<rows.length;r++)for(let x=0;x<i.bays;x++){
  const ref=i.beams[(fl-1)*i.bays+x]||i.beams[0];const b=ref?.b||.25,h=ref?.h||.45
  els.push({id:`V${id}`,name:`Viga X ${fl}.${r+1}.${x+1}`,discipline:'structures',type:'beam',level:`Piso ${fl}`,material:concreteC30,
   geometry:{x:x*i.bay,y:rows[r],z:fl*i.storey,length:i.bay,b,h,axis:'X'},properties:{},
   calculation:ref?{module:'Modelo de Edifício',status:'preliminary',results:{Mref_kNm:ref.Med}}:undefined});id++
 }
 // transverse beams and slabs: conceptual to close the 3D building volume
 for(let fl=1;fl<=i.floors;fl++){
  for(let x=0;x<=i.bays;x++)els.push({id:`VT${id}`,name:`Viga transversal ${fl}.${x+1}`,discipline:'structures',type:'beam',level:`Piso ${fl}`,material:concreteC30,
   geometry:{x:x*i.bay,y:0,z:fl*i.storey,length:i.depth,b:.25,h:.45,axis:'Y'},properties:{status:'geométrico; sem análise 3D'},calculation:{module:'BIM conceptual',status:'check',results:{nota:'Dimensionar no modelo estrutural 3D'}}});id++
  for(let x=0;x<i.bays;x++)els.push({id:`L${id}`,name:`Laje ${fl}.${x+1}`,discipline:'structures',type:'slab',level:`Piso ${fl}`,material:concreteC30,
   geometry:{x:x*i.bay,y:0,z:fl*i.storey,width:i.bay,depth:i.depth,thickness:.18},properties:{status:'geometria preliminar'},calculation:{module:'BIM conceptual',status:'check',results:{nota:'Espessura de referência; confirmar em Lajes PRO'}}});id++
 }
 model.elements=els;return model
}


export interface StructuralProjectBIMInput{
 project:{name:string;location?:string;engineer?:string;fck:number;fyk:number;cover:number;floors:number;bays:number;bay:number;storey:number;trib:number};
 nodes:Array<{id:number;x:number;y:number}>;
 elements:Array<{id:number;a:number;b:number}>;
 envelope:Array<{id:number;N:number;V:number;M:number;Ncase:string;Vcase:string;Mcase:string}>|null;
 foundations:Array<{id:number;node:number;Rx:number;Ry:number;M:number;B:number;L:number;h:number;r:{qmax:number;bearingUtil:number;ok:boolean}}>;
 steelRows?:Array<{mark:string;type:string;element:string;notation:string;weight:number}>;
}
/** Builds the BIM information model directly from Structural Project PRO.
 * IDs are deterministic from structural element/node IDs so properties remain traceable between recalculations.
 * The source analysis is still the current 2D frame model; BIM geometry does not imply a 3D FEM verification.
 */
export function buildStructuralProjectBIM(i:StructuralProjectBIMInput):SmartStructBIMModel{
 const now=new Date().toISOString(),old=loadBIMModel()
 const concrete:BIMMaterialRef={id:`MAT-CONC-C${i.project.fck}`,name:`Betão C${i.project.fck}`,family:'Betão',properties:{fck_MPa:i.project.fck}}
 const els:BIMElement[]=[]
 const nodeById=(id:number)=>i.nodes.find(n=>n.id===id)
 const steelFor=(kind:string,id:number)=>i.steelRows?.filter(r=>r.type===kind&&r.element.includes(String(id))).map(r=>r.notation).join(' + ')||null
 for(const e of i.elements){
  const a=nodeById(e.a),b=nodeById(e.b);if(!a||!b)continue
  const vertical=Math.abs(b.x-a.x)<1e-9,L=Math.hypot(b.x-a.x,b.y-a.y),env=i.envelope?.find(x=>x.id===e.id)
  const level=vertical?`Piso ${Math.max(1,Math.round(Math.max(a.y,b.y)/Math.max(i.project.storey,.01)))}`:`Piso ${Math.max(1,Math.round(a.y/Math.max(i.project.storey,.01)))}`
  els.push({id:`SP-${vertical?'C':'V'}-E${e.id}`,name:`${vertical?'Pilar':'Viga'} E${e.id}`,discipline:'structures',type:vertical?'column':'beam',level,material:concrete,
   geometry:vertical?{x:a.x,y:0,z:Math.min(a.y,b.y),length:L,b:.35,h:.45,axis:'Z'}:{x:Math.min(a.x,b.x),y:0,z:a.y,length:L,b:.25,h:.50,axis:'X'},
   properties:{sourceModule:'Structural Project PRO',sourceElementId:e.id,fyk_MPa:i.project.fyk,recobrimento_m:i.project.cover,armadura:steelFor(vertical?'Pilares':'Vigas',e.id)},
   calculation:{module:'Structural Project PRO',status:env?'calculated':'check',results:env?{Nmax_kN:env.N,Vmax_kN:env.V,Mmax_kNm:env.M,combN:env.Ncase,combV:env.Vcase,combM:env.Mcase}:{nota:'Sem envelope disponível'}}})
 }
 for(const f of i.foundations){
  const n=nodeById(f.node);if(!n)continue
  const reinf=i.steelRows?.filter(r=>r.type==='Sapatas'&&r.element===`F${f.id}`).map(r=>r.notation).join(' + ')||null
  els.push({id:`SP-F-N${f.node}`,name:`Sapata F${f.id}`,discipline:'structures',type:'isolated_footing',level:'Fundação',material:concrete,
   geometry:{x:n.x-f.B/2,y:-f.L/2,z:-f.h,width:f.B,depth:f.L,height:f.h},
   properties:{sourceModule:'Structural Project PRO',sourceNodeId:f.node,fyk_MPa:i.project.fyk,recobrimento_m:i.project.cover,armadura:reinf},
   calculation:{module:'Structural Project PRO',status:f.r.ok?'calculated':'check',results:{N_kN:f.Ry,H_kN:Math.abs(f.Rx),M_kNm:f.M,qmax_kPa:f.r.qmax,utilizacao_capacidade:f.r.bearingUtil}}})
 }
 return{schema:'SmartStruct-BIM/0.6',project:{name:i.project.name,location:i.project.location,author:i.project.engineer},elements:els,createdAt:old?.createdAt||now,updatedAt:now}
}
