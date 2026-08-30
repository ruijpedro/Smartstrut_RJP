/** SmartStruct internal BIM-ready schema. Not an IFC implementation. */
export type BIMDiscipline='structures'|'geotechnics'|'hydraulics'|'roads'|'lsf'|'containment'
export type BIMElementType='beam'|'column'|'slab'|'isolated_footing'|'strip_footing'|'raft_foundation'|'pile'|'wall'|'lsf_member'|'pipe'|'manhole'|'road_element'|'material'
export type BIMProperty=string|number|boolean|null
export interface BIMMaterialRef { id:string; name:string; family:string; properties?:Record<string,BIMProperty> }
export interface BIMElement { id:string; name:string; discipline:BIMDiscipline; type:BIMElementType; level?:string; material?:BIMMaterialRef; geometry:Record<string,BIMProperty>; properties:Record<string,BIMProperty>; calculation?:{module:string;status:'calculated'|'preliminary'|'check';results:Record<string,BIMProperty>} }
export interface SmartStructBIMModel { schema:'SmartStruct-BIM/0.1'; project:{name:string;location?:string;author?:string}; elements:BIMElement[]; createdAt:string }
export function createBIMModel(name='Projeto SmartStruct'):SmartStructBIMModel{return{schema:'SmartStruct-BIM/0.1',project:{name},elements:[],createdAt:new Date().toISOString()}}
export function exportBIMJson(model:SmartStructBIMModel){const blob=new Blob([JSON.stringify(model,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='SmartStruct_BIM_Model.json';a.click();URL.revokeObjectURL(a.href)}
