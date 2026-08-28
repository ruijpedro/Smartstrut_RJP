export type ProjectMeta={id:string;name:string;location?:string;client?:string;author?:string;date:string;notes?:string}
export type CalculationRecord={id:string;module:string;title:string;inputs:unknown;results:unknown;createdAt:string}
export type SmartStructProject={meta:ProjectMeta;calculations:CalculationRecord[]}
export function newProject(name:string):SmartStructProject{return {meta:{id:String(Date.now()),name,date:new Date().toISOString()},calculations:[]}}
export function addCalculation(p:SmartStructProject,module:string,title:string,inputs:unknown,results:unknown):SmartStructProject{
 return {...p,calculations:[...p.calculations,{id:String(Date.now()),module,title,inputs,results,createdAt:new Date().toISOString()}]}
}
