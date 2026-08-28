export function printReport(){window.print()}
export function downloadJson(name:string,data:unknown){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'})
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name.endsWith('.json')?name:name+'.json';a.click();URL.revokeObjectURL(a.href)
}
export function saveProjectLocal(key:string,data:unknown){localStorage.setItem('smartstruct:'+key,JSON.stringify(data))}
export function loadProjectLocal<T>(key:string):T|null{const raw=localStorage.getItem('smartstruct:'+key);return raw?JSON.parse(raw) as T:null}
