export type StudyObservation={id:string;area:string;title:string;status:'ok'|'check'|'missing';value?:string;detail:string;source:string}
export type IntegratedSnapshot={
 structural?:any; lsf?:any; hydraulics?:any; observations:StudyObservation[]; generatedAt:string
}
function json(key:string){try{const v=localStorage.getItem(key);return v?JSON.parse(v):null}catch{return null}}
function num(v:any,d=2){const n=Number(v);return Number.isFinite(n)?n.toFixed(d):'-'}
export function collectIntegratedSnapshot():IntegratedSnapshot{
 const structural=json('smartstruct_v64_project')
 const lsf=json('smartstruct:lsf-study')
 const sewer=json('smartstruct:public-sewer-graph')
 const observations:StudyObservation[]=[]
 if(structural){
  observations.push({id:'str-model',area:'structures',title:'Modelo estrutural guardado',status:'ok',value:`${structural.floors??'-'} pisos · ${structural.bays??'-'} vãos`,detail:'Geometria e materiais disponíveis para a memória preliminar.',source:'Structural Project PRO'})
  observations.push({id:'str-mat',area:'structures',title:'Materiais estruturais',status:'ok',value:`C${structural.fck??'-'} · fyk ${structural.fyk??'-'} MPa`,detail:'Confirmar classes, durabilidade, coeficientes parciais e Anexo Nacional no projeto.',source:'Structural Project PRO'})
 }else observations.push({id:'str-missing',area:'structures',title:'Modelo estrutural',status:'missing',detail:'Criar e guardar um modelo no Structural Project PRO.',source:'Structural Project PRO'})
 if(lsf){const uA=Number(lsf.results?.utilAxial||0),uB=Number(lsf.results?.utilBend||0);observations.push({id:'lsf-model',area:'lsf',title:'Parede LSF modelada',status:'ok',value:`${lsf.results?.nStuds??'-'} montantes · ${num(lsf.results?.totalKg,1)} kg`,detail:'Quantificação e verificações preliminares recolhidas do módulo LSF.',source:'Estruturas LSF'});observations.push({id:'lsf-util',area:'lsf',title:'Triagem resistente LSF',status:(uA<=1&&uB<=1)?'ok':'check',value:`ηN=${num(uA)} · ηM=${num(uB)}`,detail:'Utilizações preliminares; secção efetiva, interação, distorcional, ligações e contraventamento devem ser aprofundados.',source:'Estruturas LSF'})}else observations.push({id:'lsf-missing',area:'lsf',title:'Modelo LSF',status:'missing',detail:'Executar um pré-dimensionamento no separador Estruturas LSF.',source:'Estruturas LSF'})
 let hydraulics
 if(sewer){hydraulics={publicSewer:sewer,nodes:sewer.nodes?.length||0,edges:sewer.edges?.length||0,totalLength:(sewer.edges||[]).reduce((s:number,e:any)=>s+(Number(e.L)||0),0)};observations.push({id:'hyd-net',area:'hydraulics',title:'Rede hidráulica guardada',status:'ok',value:`${hydraulics.nodes} nós · ${hydraulics.edges} troços · ${num(hydraulics.totalLength,1)} m`,detail:'Traçado disponível; completar caudais, cotas, diâmetros, velocidades, capacidade e interferências.',source:'Rede pública / Hidráulica'})}else observations.push({id:'hyd-missing',area:'hydraulics',title:'Rede hidráulica',status:'missing',detail:'Guardar uma rede no editor hidráulico para integrar traçado e comprimentos.',source:'Hidráulica e Drenagem'})
 observations.push({id:'geo-link',area:'geotechnics',title:'Verificação geotécnica',status:'check',detail:'Fluxo de verificação ativo: confirmar no módulo Geotecnia os resultados SPT/CPT/capacidade/assentamentos que suportam o cenário de projeto.',source:'Geotecnia'});
 observations.push({id:'cont-link',area:'containment',title:'Verificação da contenção',status:'check',detail:'Fluxo de verificação ativo: selecionar a solução calculada e confirmar estabilidade externa, estrutural, global, água e construtibilidade.',source:'Contenção'});
 observations.push({id:'road-link',area:'roads',title:'Verificação viária',status:'check',detail:'Fluxo de verificação ativo: confirmar traçado, visibilidade, terraplenagens, drenagem, pavimento, sinalização e segurança antes de fechar o estudo.',source:'Infraestruturas Viárias'});
 return {structural:structural||undefined,lsf:lsf||undefined,hydraulics,observations,generatedAt:new Date().toISOString()}
}
export function exportStudyJson(snapshot:IntegratedSnapshot,name:string){
 const payload={study:{name,level:'Estudo prévio',generatedAt:snapshot.generatedAt},summary:{ok:snapshot.observations.filter(x=>x.status==='ok').length,check:snapshot.observations.filter(x=>x.status==='check').length,missing:snapshot.observations.filter(x=>x.status==='missing').length},...snapshot}
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`${(name||'SmartStruct').replace(/\s+/g,'_')}_estudo_previo.json`;a.click();URL.revokeObjectURL(u)
}
