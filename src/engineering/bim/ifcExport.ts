import type {BIMElement,SmartStructBIMModel} from './model'

const esc=(s:string)=>String(s||'').replace(/'/g,"''")
const guid=()=>{const chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';let s='';for(let i=0;i<22;i++)s+=chars[Math.floor(Math.random()*chars.length)];return s}
const n=(v:any,d=5)=>Number.isFinite(Number(v))?Number(v).toFixed(d).replace(/\.?0+$/,''):'0'

/** IFC4 exchange export for generic openBIM interoperability.
 * Geometry is deliberately simple: rectangular extrusions for the current SmartStruct structural BIM objects.
 * It is an interoperability export, not a certified IFC deliverable or a structural-analysis model.
 */
export function smartStructToIFC(model:SmartStructBIMModel):string{
 let id=1;const rows:string[]=[];const add=(x:string)=>{rows.push(`#${id}=${x};`);return id++}
 const owner=add(`IFCPERSON($,$,'SmartStruct_RJP',$,$,$,$,$)`)
 const org=add(`IFCORGANIZATION($,'SmartStruct_RJP',$,$,$)`)
 const po=add(`IFCPERSONANDORGANIZATION(#${owner},#${org},$)`)
 const app=add(`IFCAPPLICATION(#${org},'95.0','SmartStruct_RJP','SMARTSTRUCT_RJP')`)
 const hist=add(`IFCOWNERHISTORY(#${po},#${app},$,.ADDED$,$,$,$,${Math.floor(Date.now()/1000)})`.replace('.ADDED$','.ADDED.'))
 const uLen=add(`IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.)`),uArea=add(`IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.)`),uVol=add(`IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.)`),units=add(`IFCUNITASSIGNMENT((#${uLen},#${uArea},#${uVol}))`)
 const o=add(`IFCCARTESIANPOINT((0.,0.,0.))`),z=add(`IFCDIRECTION((0.,0.,1.))`),x=add(`IFCDIRECTION((1.,0.,0.))`),wcs=add(`IFCAXIS2PLACEMENT3D(#${o},#${z},#${x})`),ctx=add(`IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#${wcs},$)`)
 const project=add(`IFCPROJECT('${guid()}',#${hist},'${esc(model.project.name)}',$,$,$,$,(#${ctx}),#${units})`)
 const sitePl=localPlacement(add,add,0,0,0),site=add(`IFCSITE('${guid()}',#${hist},'Local',$,$,#${sitePl},$,$,.ELEMENT.,$,$,$,$,$)`)
 const bldPl=localPlacement(add,add,0,0,0,sitePl),building=add(`IFCBUILDING('${guid()}',#${hist},'${esc(model.project.name)}',$,$,#${bldPl},$,$,.ELEMENT.,$,$,$)`)
 add(`IFCRELAGGREGATES('${guid()}',#${hist},$,$,#${project},(#${site}))`);add(`IFCRELAGGREGATES('${guid()}',#${hist},$,$,#${site},(#${building}))`)
 const levels=[...new Set(model.elements.map(e=>e.level||'Sem nível'))];const storeys=new Map<string,number>()
 for(const lv of levels){const zs=model.elements.filter(e=>(e.level||'Sem nível')===lv).map(e=>Number(e.geometry.z||0));const zz=zs.length?Math.min(...zs):0;const lp=localPlacement(add,add,0,0,zz,bldPl);const st=add(`IFCBUILDINGSTOREY('${guid()}',#${hist},'${esc(lv)}',$,$,#${lp},$,$,.ELEMENT.,${n(zz)})`);storeys.set(lv,st)}
 if(storeys.size)add(`IFCRELAGGREGATES('${guid()}',#${hist},$,$,#${building},(${[...storeys.values()].map(v=>'#'+v).join(',')}))`)
 const byLevel=new Map<string,number[]>()
 for(const e of model.elements){const ent=elementIfc(e,add,hist,ctx,bldPl);if(!ent)continue;const lv=e.level||'Sem nível';if(!byLevel.has(lv))byLevel.set(lv,[]);byLevel.get(lv)!.push(ent)}
 for(const [lv,ents] of byLevel){const st=storeys.get(lv);if(st&&ents.length)add(`IFCRELCONTAINEDINSPATIALSTRUCTURE('${guid()}',#${hist},$,$,(${ents.map(v=>'#'+v).join(',')}),#${st})`)}
 return `ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');\nFILE_NAME('SmartStruct_openBIM.ifc','${new Date().toISOString()}',('SmartStruct_RJP'),('SmartStruct_RJP'),'SmartStruct_RJP','SmartStruct_RJP','');\nFILE_SCHEMA(('IFC4'));\nENDSEC;\nDATA;\n${rows.join('\n')}\nENDSEC;\nEND-ISO-10303-21;\n`
}
function localPlacement(add:(s:string)=>number,_a:any,x:number,y:number,z:number,rel?:number){const p=add(`IFCCARTESIANPOINT((${n(x)},${n(y)},${n(z)}))`),dz=add(`IFCDIRECTION((0.,0.,1.))`),dx=add(`IFCDIRECTION((1.,0.,0.))`),ax=add(`IFCAXIS2PLACEMENT3D(#${p},#${dz},#${dx})`);return add(`IFCLOCALPLACEMENT(${rel?'#'+rel:'$'},#${ax})`)}
function elementIfc(e:BIMElement,add:(s:string)=>number,hist:number,ctx:number,parent:number){const g=e.geometry,x=Number(g.x||0),y=Number(g.y||0),z=Number(g.z||0);let w=.3,d=.3,h=.3,cls='IFCBUILDINGELEMENTPROXY'
 if(e.type==='column'){w=Number(g.b||.3);d=Number(g.h||.3);h=Number(g.length||3);cls='IFCCOLUMN'}
 else if(e.type==='beam'){w=Number(g.length||1);d=Number(g.b||.25);h=Number(g.h||.45);cls='IFCBEAM'}
 else if(e.type==='slab'){w=Number(g.width||1);d=Number(g.depth||1);h=Number(g.thickness||.18);cls='IFCSLAB'}
 else if(['isolated_footing','strip_footing','raft_foundation'].includes(e.type)){w=Number(g.width||1);d=Number(g.depth||1);h=Number(g.height||.5);cls='IFCFOOTING'} else return 0
 const lp=localPlacement(add,add,x,y,z,parent),p2=add(`IFCCARTESIANPOINT((0.,0.))`),prof=add(`IFCRECTANGLEPROFILEDEF(.AREA.,$,#${add(`IFCAXIS2PLACEMENT2D(#${p2},$)`)},${n(w)},${n(d)})`),o=add(`IFCCARTESIANPOINT((0.,0.,0.))`),az=add(`IFCDIRECTION((0.,0.,1.))`),ax=add(`IFCAXIS2PLACEMENT3D(#${o},#${az},$)`),dir=add(`IFCDIRECTION((0.,0.,1.))`),solid=add(`IFCEXTRUDEDAREASOLID(#${prof},#${ax},#${dir},${n(h)})`),body=add(`IFCSHAPEREPRESENTATION(#${ctx},'Body','SweptSolid',(#${solid}))`),shape=add(`IFCPRODUCTDEFINITIONSHAPE($,$,(#${body}))`)
 const predefined=cls==='IFCSLAB'?',.FLOOR.':cls==='IFCFOOTING'?',.PAD_FOOTING.':''
 const ent=add(`${cls}('${guid()}',#${hist},'${esc(e.name)}','SmartStruct ID: ${esc(e.id)}',$,#${lp},#${shape},'${esc(e.id)}'${predefined})`)
 attachEngineeringPsets(e,ent,add,hist)
 return ent
}
function ifcValue(v:any){
 if(typeof v==='boolean')return `IFCBOOLEAN(${v?'.T.':'.F.'})`
 if(typeof v==='number'&&Number.isFinite(v))return `IFCREAL(${n(v)})`
 return `IFCLABEL('${esc(String(v??''))}')`
}
function attachEngineeringPsets(e:BIMElement,ent:number,add:(s:string)=>number,hist:number){
 const identity:Record<string,any>={SmartStruct_ID:e.id,Disciplina:e.discipline,Tipo:e.type,Nivel:e.level||'',Modulo_calculo:e.calculation?.module||'',Estado_calculo:e.calculation?.status||'check'}
 const make=(name:string,values:Record<string,any>)=>{
  const props=Object.entries(values).filter(([,v])=>v!==null&&v!==undefined&&v!=='').map(([k,v])=>add(`IFCPROPERTYSINGLEVALUE('${esc(k)}',$,${ifcValue(v)},$)`))
  if(!props.length)return
  const ps=add(`IFCPROPERTYSET('${guid()}',#${hist},'${esc(name)}',$,(${props.map(x=>'#'+x).join(',')}))`)
  add(`IFCRELDEFINESBYPROPERTIES('${guid()}',#${hist},$,$,(#${ent}),#${ps})`)
 }
 make('Pset_SmartStruct_Identity',identity)
 if(e.material)make('Pset_SmartStruct_Material',{Material:e.material.name,Familia:e.material.family,...(e.material.properties||{})})
 make('Pset_SmartStruct_Engineering',{...(e.properties||{}),...(e.calculation?.results||{})})
}
export function downloadIFC(model:SmartStructBIMModel){const txt=smartStructToIFC(model),blob=new Blob([txt],{type:'application/x-step'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${(model.project.name||'SmartStruct').replace(/[^a-z0-9_-]+/gi,'_')}_openBIM.ifc`;a.click();URL.revokeObjectURL(a.href)}
