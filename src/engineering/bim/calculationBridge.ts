import {loadBIMModel,saveBIMModel,type BIMElement,type BIMProperty} from './model'
export const BIM_HANDOFF_KEY='smartstruct:bim-calculation-handoff'
export interface BIMCalculationHandoff{elementId:string;type:BIMElement['type'];name:string;geometry:Record<string,BIMProperty>;material?:BIMElement['material'];properties:Record<string,BIMProperty>;calculation?:BIMElement['calculation'];at:string}
export function readBIMHandoff(expected?:BIMElement['type'][]):BIMCalculationHandoff|null{try{const raw=localStorage.getItem(BIM_HANDOFF_KEY);if(!raw)return null;const h=JSON.parse(raw) as BIMCalculationHandoff;if(!h?.elementId||expected&&!expected.includes(h.type))return null;return h}catch{return null}}
export function clearBIMHandoff(){localStorage.removeItem(BIM_HANDOFF_KEY)}
export function updateBIMCalculation(elementId:string,module:string,results:Record<string,BIMProperty>,properties?:Record<string,BIMProperty>){const model=loadBIMModel();if(!model)return false;const e=model.elements.find(x=>x.id===elementId);if(!e)return false;e.calculation={module,status:'calculated',results};if(properties)e.properties={...e.properties,...properties};saveBIMModel(model);return true}
export function n(v:BIMProperty|undefined,fallback:number){const x=Number(v);return Number.isFinite(x)?x:fallback}
