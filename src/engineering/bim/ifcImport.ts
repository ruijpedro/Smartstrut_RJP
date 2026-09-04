import {createBIMModel,saveBIMModel,type BIMElement,type BIMElementType,type SmartStructBIMModel} from './model'

type Entity={id:number;type:string;args:string}
const num=(s:string)=>Number(String(s).replace(/[()]/g,''))||0
const refs=(s:string)=>[...s.matchAll(/#(\d+)/g)].map(m=>Number(m[1]))
const quoted=(s:string)=>[...s.matchAll(/'((?:''|[^'])*)'/g)].map(m=>m[1].replace(/''/g,"'"))
function splitArgs(s:string){const out:string[]=[];let q=false,d=0,start=0;for(let i=0;i<s.length;i++){const c=s[i];if(c==="'"){if(q&&s[i+1]==="'"){i++;continue}q=!q}else if(!q){if(c==='(')d++;else if(c===')')d--;else if(c===','&&d===0){out.push(s.slice(start,i).trim());start=i+1}}}out.push(s.slice(start).trim());return out}
function parseEntities(text:string){const map=new Map<number,Entity>();const re=/#(\d+)\s*=\s*(IFC[A-Z0-9_]+)\s*\((.*?)\)\s*;/gis;let m:RegExpExecArray|null;while((m=re.exec(text)))map.set(Number(m[1]),{id:Number(m[1]),type:m[2].toUpperCase(),args:m[3]});return map}
function point(map:Map<number,Entity>,id:number,dim=3){const e=map.get(id);if(!e||!e.type.includes('CARTESIANPOINT'))return Array(dim).fill(0);const m=e.args.match(/\(([^()]*)\)/);const a=(m?.[1]||'').split(',').map(num);while(a.length<dim)a.push(0);return a}
function placement(map:Map<number,Entity>,id:number):[number,number,number]{const lp=map.get(id);if(!lp||lp.type!=='IFCLOCALPLACEMENT')return[0,0,0];const a=splitArgs(lp.args),parent=refs(a[0]||'')[0],axis=refs(a[1]||'')[0];let base:[number,number,number]=parent?placement(map,parent):[0,0,0];const ax=map.get(axis),pRef=ax?refs(splitArgs(ax.args)[0]||'')[0]:0,p=point(map,pRef,3);return[base[0]+p[0],base[1]+p[1],base[2]+p[2]]}
function productGeometry(map:Map<number,Entity>,shapeId:number){const shape=map.get(shapeId);if(!shape)return null;const reps=refs(shape.args);for(const rid of reps){const rep=map.get(rid);if(!rep||rep.type!=='IFCSHAPEREPRESENTATION')continue;for(const sid of refs(rep.args)){const solid=map.get(sid);if(!solid||solid.type!=='IFCEXTRUDEDAREASOLID')continue;const sa=splitArgs(solid.args),prof=map.get(refs(sa[0]||'')[0]),depth=num(sa[3]);if(prof?.type==='IFCRECTANGLEPROFILEDEF'){const pa=splitArgs(prof.args);return{x:num(pa[3]),y:num(pa[4]),z:depth}}}}return null}
function mapType(t:string):BIMElementType|null{return({IFCBEAM:'beam',IFCCOLUMN:'column',IFCSLAB:'slab',IFCFOOTING:'isolated_footing',IFCWALL:'wall',IFCPILE:'pile',IFCPIPESEGMENT:'pipe'} as Record<string,BIMElementType>)[t]||null}
export interface IFCImportSummary{model:SmartStructBIMModel;sourceSchema:string;recognized:number;ignored:number;warnings:string[]}
/** Lightweight IFC reader for generic SmartStruct/openBIM exchange. It intentionally imports supported physical objects only.
 * It is not a general IFC engine; complex mapped/BRep/CSG geometry remains outside this browser parser.
 */
export function importIFCText(text:string):IFCImportSummary{
 if(!/ISO-10303-21/i.test(text)||!/FILE_SCHEMA\s*\(\s*\(\s*'IFC/i.test(text))throw new Error('O ficheiro não parece ser um IFC STEP válido.')
 const schema=(text.match(/FILE_SCHEMA\s*\(\s*\(\s*'([^']+)'/i)?.[1]||'IFC').toUpperCase(),map=parseEntities(text)
 const project=[...map.values()].find(e=>e.type==='IFCPROJECT'),projectName=project?quoted(project.args)[1]||quoted(project.args)[0]:'Projeto IFC importado'
 const model=createBIMModel(projectName);const els:BIMElement[]=[];let ignored=0;const warnings:string[]=[]
 for(const e of map.values()){
  const bt=mapType(e.type);if(!bt)continue;const a=splitArgs(e.args),qs=quoted(e.args),name=qs[1]||`${e.type} #${e.id}`,tag=(qs.length?qs[qs.length-1]:'')||`IFC-${e.id}`
  const placeRef=refs(a[5]||'')[0],shapeRef=refs(a[6]||'')[0],p=placement(map,placeRef),box=productGeometry(map,shapeRef)
  if(!box){ignored++;continue}
  let geometry:Record<string,string|number|boolean|null>={x:p[0],y:p[1],z:p[2]}
  if(bt==='column')geometry={...geometry,b:box.x,h:box.y,length:box.z,axis:'Z'}
  else if(bt==='beam')geometry={...geometry,length:box.x,b:box.y,h:box.z,axis:'X'}
  else if(bt==='slab')geometry={...geometry,width:box.x,depth:box.y,thickness:box.z}
  else geometry={...geometry,width:box.x,depth:box.y,height:box.z}
  els.push({id:tag,name,discipline:'structures',type:bt,level:'IFC importado',geometry,properties:{source:'IFC/openBIM',ifcEntity:e.type,ifcStepId:e.id,ifcSchema:schema},calculation:{module:'Importação IFC',status:'check',results:{nota:'Geometria importada; associar/verificar cálculo no SmartStruct.'}}})
 }
 model.elements=els;model.project={name:projectName};
 if(ignored)warnings.push(`${ignored} elemento(s) reconhecido(s) tinham geometria não suportada pelo importador leve.`)
 if(!els.length)warnings.push('Não foram encontrados elementos estruturais com extrusão retangular suportada.')
 return{model,sourceSchema:schema,recognized:els.length,ignored,warnings}
}
export function saveImportedIFC(x:IFCImportSummary){return saveBIMModel(x.model)}
