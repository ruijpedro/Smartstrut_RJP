import React,{useMemo,useState} from 'react'
import {EngineeringBasis,PreliminaryChecklist} from '../../engineering/EngineeringBasis'
import {curveRadius,horizontalCurve,stoppingSightDistance,verticalCurve,roadCrossSection,roundaboutGeometry,earthworksStations,profileToCrossSections,massHaul,rationalFlow,trapezoidalDitchFlow,circularCulvertFullFlow,runoffTimeKirpich,drainageSpacing,drainageLongProfile,interpolateProfile,alignmentLengths,xyFromPkOffset,projectXYToAlignment,type ProfilePoint,type DrainageNode,type AlignmentVertex,type XYDrainageElement} from './RoadSolver'
const F=({l,v,s,u}:{l:string,v:number,s:(n:number)=>void,u?:string})=><label className="field"><span>{l}{u?` (${u})`:''}</span><input type="number" step="any" value={v} onChange={e=>s(+e.target.value)}/></label>
const M=({t,v}:{t:string,v:string})=><div className="metric"><span>{t}</span><b>{v}</b></div>
type Tab='alignment'|'profile'|'section'|'visibility'|'roundabout'|'earth'|'mass'|'drainage'|'drainprofile'|'xyplan'|'drainplan'|'criteria'
export default function RoadsProPage(){
 const[tab,setTab]=useState<Tab>('alignment'),[V,setV]=useState(80),[e,setE]=useState(.06),[f,setF]=useState(.12),[R,setR]=useState(300),[delta,setDelta]=useState(35)
 const[g1,setG1]=useState(2),[g2,setG2]=useState(-1.5),[Lv,setLv]=useState(120)
 const[lanes,setLanes]=useState(2),[lane,setLane]=useState(3.5),[shoulder,setShoulder]=useState(1.5),[median,setMedian]=useState(0)
 const[react,setReact]=useState(2.0),[grade,setGrade]=useState(-2),[ff,setFf]=useState(.35)
 const[Dext,setDe]=useState(40),[Dins,setDi]=useState(22)
 const[basinArea,setBasinArea]=useState(4),[runoffC,setRunoffC]=useState(.65),[rainI,setRainI]=useState(85)
 const[ditchB,setDitchB]=useState(.50),[ditchY,setDitchY]=useState(.45),[ditchZ,setDitchZ]=useState(1.5),[ditchS,setDitchS]=useState(.01),[ditchN,setDitchN]=useState(.025)
 const[culvD,setCulvD]=useState(.80),[culvS,setCulvS]=useState(.01),[culvN,setCulvN]=useState(.013)
 const[catchL,setCatchL]=useState(350),[catchH,setCatchH]=useState(18),[crossDrainSpacing,setCrossDrainSpacing]=useState(150)
 const[drainD,setDrainD]=useState(.40),[drainN,setDrainN]=useState(.013),[minCover,setMinCover]=useState(.80)
 const[alignment,setAlignment]=useState<AlignmentVertex[]>([{x:0,y:0},{x:80,y:0},{x:150,y:35},{x:240,y:55},{x:330,y:20}])
 const[xyScale,setXyScale]=useState(1)
 const[xyElems,setXyElems]=useState<XYDrainageElement[]>([
  {id:'D1',kind:'Sumidouro',x:0,y:0,pk:50,offset:-5,side:'E'},
  {id:'D2',kind:'Caixa',x:0,y:0,pk:120,offset:6,side:'D'},
  {id:'D3',kind:'Aqueduto',x:0,y:0,pk:210,offset:0,side:'T'}
 ])
 const[selectedKind,setSelectedKind]=useState<XYDrainageElement['kind']>('Caixa')
 const[selectedSide,setSelectedSide]=useState<'E'|'D'|'T'>('D')
 const[selectedOffset,setSelectedOffset]=useState(6)

 const[planItems,setPlanItems]=useState([{id:1,type:'Caixa',pk:50,side:'E',offset:6},{id:2,type:'Sumidouro',pk:100,side:'D',offset:5},{id:3,type:'Aqueduto',pk:150,side:'T',offset:0}])
 const[newType,setNewType]=useState('Caixa'),[newPk,setNewPk]=useState(200),[newSide,setNewSide]=useState('E'),[newOffset,setNewOffset]=useState(5)
 const[dnodes,setDnodes]=useState<DrainageNode[]>([{pk:0,ground:101.0,invert:99.7},{pk:50,ground:102.0,invert:99.2},{pk:100,ground:103.0,invert:98.7},{pk:150,ground:103.4,invert:98.2},{pk:200,ground:103.0,invert:97.7},{pk:250,ground:102.2,invert:97.2}])
 const[slopeCut,setSlopeCut]=useState(1.0),[slopeFill,setSlopeFill]=useState(1.5),[swell,setSwell]=useState(15),[shrink,setShrink]=useState(8)
 const[prof,setProf]=useState<ProfilePoint[]>([
  {pk:0,terrain:102.0,grade:101.0},{pk:50,terrain:103.5,grade:102.0},{pk:100,terrain:104.2,grade:103.0},
  {pk:150,terrain:102.8,grade:103.4},{pk:200,terrain:101.5,grade:103.0},{pk:250,terrain:100.5,grade:102.2}
 ])
 const rmin=useMemo(()=>curveRadius(V,e,f),[V,e,f]),hc=useMemo(()=>horizontalCurve(R,delta),[R,delta]),vc=useMemo(()=>verticalCurve(g1,g2,Lv),[g1,g2,Lv]),cs=useMemo(()=>roadCrossSection(lanes,lane,shoulder,median),[lanes,lane,shoulder,median]),ssd=useMemo(()=>stoppingSightDistance(V,react,grade,ff),[V,react,grade,ff]),ro=useMemo(()=>roundaboutGeometry(Dext,Dins),[Dext,Dins])
 const sections=useMemo(()=>profileToCrossSections(prof,cs.total,slopeCut,slopeFill),[prof,cs.total,slopeCut,slopeFill])
 const ew=useMemo(()=>earthworksStations(sections),[sections])
 const mass=useMemo(()=>massHaul(sections,swell,shrink),[sections,swell,shrink])
 const runoff=useMemo(()=>rationalFlow(runoffC,rainI,basinArea),[runoffC,rainI,basinArea])
 const ditch=useMemo(()=>trapezoidalDitchFlow(ditchB,ditchY,ditchZ,ditchS,ditchN),[ditchB,ditchY,ditchZ,ditchS,ditchN])
 const culv=useMemo(()=>circularCulvertFullFlow(culvD,culvS,culvN),[culvD,culvS,culvN])
 const tc=useMemo(()=>runoffTimeKirpich(catchL,catchH),[catchL,catchH])
 const drains=useMemo(()=>drainageSpacing(Math.max(...prof.map(x=>x.pk),0),crossDrainSpacing),[prof,crossDrainSpacing])
 const dsegs=useMemo(()=>drainageLongProfile(dnodes,drainD,drainN),[dnodes,drainD,drainN])
 const alignInfo=useMemo(()=>alignmentLengths(alignment),[alignment])
 const linkedElems=useMemo(()=>xyElems.map(el=>{const off=el.side==='E'?-Math.abs(el.offset):el.side==='D'?Math.abs(el.offset):0;const p=xyFromPkOffset(alignment,el.pk,off);return{...el,x:p.x,y:p.y,offset:off}}),[xyElems,alignment])
 const updAlign=(i:number,k:'x'|'y',v:number)=>setAlignment(alignment.map((p,j)=>j===i?{...p,[k]:v}:p))
 const updElemPk=(id:string,pk:number)=>setXyElems(xyElems.map(el=>el.id===id?{...el,pk}:el))
 const addElemAtPk=(pk:number)=>setXyElems([...xyElems,{id:`D${xyElems.length+1}`,kind:selectedKind,x:0,y:0,pk,offset:Math.abs(selectedOffset),side:selectedSide}])

 const updDrain=(i:number,k:'pk'|'ground'|'invert',v:number)=>setDnodes(dnodes.map((x,j)=>j===i?{...x,[k]:v}:x))
 const syncDrainGround=()=>setDnodes(dnodes.map(x=>({...x,ground:interpolateProfile(prof,x.pk,'grade')})))
 const upd=(i:number,k:'pk'|'terrain'|'grade',v:number)=>setProf(prof.map((x,j)=>j===i?{...x,[k]:v}:x))
 return <div className="module-page"><div className="module-head"><div><h2>Infraestruturas Viárias PRO</h2><p>Eixo por PK, rasante, perfis transversais, cubagens e diagrama de massas.</p></div></div>
 <div className="tabs-row">{([['alignment','Traçado'],['profile','Rasante / PK'],['section','Secção'],['visibility','Visibilidade'],['roundabout','Rotunda'],['earth','Perfis / Volumes'],['mass','Massas'],['drainage','Drenagem'],['drainprofile','Perfil drenagem'],['xyplan','Planta XY'],['drainplan','Planta drenagem'],['criteria','Normas / Critérios']] as [Tab,string][]).map(([k,l])=><button key={k} className={tab===k?'active':''} onClick={()=>setTab(k)}>{l}</button>)}</div>

 {tab==='alignment'&&<div className="work-grid"><section className="panel"><h3>Curva horizontal</h3><div className="form-grid"><F l="Velocidade" u="km/h" v={V} s={setV}/><F l="Sobreelevação e" v={e} s={setE}/><F l="Atrito lateral f" v={f} s={setF}/><F l="Raio adotado" u="m" v={R} s={setR}/><F l="Ângulo Δ" u="°" v={delta} s={setDelta}/></div><PlanSvg R={R} delta={delta}/></section><section className="panel"><h3>Resultados geométricos</h3><div className="result-grid"><M t="R mín. indicativo" v={`${rmin.R.toFixed(1)} m`}/><M t="Tangente T" v={`${hc.T.toFixed(1)} m`}/><M t="Desenvolvimento L" v={`${hc.L.toFixed(1)} m`}/><M t="Externa E" v={`${hc.E.toFixed(2)} m`}/><M t="Ordenada média" v={`${hc.M.toFixed(2)} m`}/><M t="R adotado" v={R>=rmin.R?'OK':'REVER'}/></div></section></div>}

 {tab==='profile'&&<><section className="panel"><h3>Eixo longitudinal por PK</h3><div className="member-table">{prof.map((x,i)=><div key={i}><b>PK {x.pk.toFixed(0)}</b><span>PK <input type="number" value={x.pk} onChange={e=>upd(i,'pk',+e.target.value)}/> m</span><span>Terreno <input type="number" value={x.terrain} onChange={e=>upd(i,'terrain',+e.target.value)}/> m</span><span>Rasante <input type="number" value={x.grade} onChange={e=>upd(i,'grade',+e.target.value)}/> m</span></div>)}</div><button onClick={()=>setProf([...prof,{pk:(prof[prof.length-1]?.pk||0)+50,terrain:prof[prof.length-1]?.terrain||100,grade:prof[prof.length-1]?.grade||100}])}>+ PK</button></section><section className="panel"><ProfileLongSvg pts={prof}/><div className="form-grid"><F l="Declive curva entrada" u="%" v={g1} s={setG1}/><F l="Declive curva saída" u="%" v={g2} s={setG2}/><F l="Comprimento curva vertical" u="m" v={Lv} s={setLv}/></div><div className="result-grid"><M t="|A|" v={`${vc.A.toFixed(2)} %`}/><M t="K=L/A" v={Number.isFinite(vc.K)?`${vc.K.toFixed(1)} m/%`:'—'}/></div></section></>}

 {tab==='section'&&<div className="work-grid"><section className="panel"><h3>Plataforma</h3><div className="form-grid"><F l="N.º vias" v={lanes} s={setLanes}/><F l="Largura via" u="m" v={lane} s={setLane}/><F l="Berma" u="m" v={shoulder} s={setShoulder}/><F l="Separador" u="m" v={median} s={setMedian}/><F l="Talude corte H/V" v={slopeCut} s={setSlopeCut}/><F l="Talude aterro H/V" v={slopeFill} s={setSlopeFill}/></div><SectionSvg total={cs.total} carriage={cs.carriage}/></section><section className="panel"><div className="result-grid"><M t="Faixa de rodagem" v={`${cs.carriage.toFixed(2)} m`}/><M t="Plataforma total" v={`${cs.total.toFixed(2)} m`}/></div></section></div>}

 {tab==='visibility'&&<div className="work-grid"><section className="panel"><h3>Distância de paragem</h3><div className="form-grid"><F l="Velocidade" u="km/h" v={V} s={setV}/><F l="Tempo reação" u="s" v={react} s={setReact}/><F l="Declive" u="%" v={grade} s={setGrade}/><F l="Coef. aderência" v={ff} s={setFf}/></div></section><section className="panel"><div className="result-grid"><M t="Reação" v={`${ssd.reaction.toFixed(1)} m`}/><M t="Travagem" v={`${ssd.braking.toFixed(1)} m`}/><M t="Distância total" v={`${ssd.total.toFixed(1)} m`}/></div></section></div>}

 {tab==='roundabout'&&<div className="work-grid"><section className="panel"><h3>Geometria base</h3><div className="form-grid"><F l="Diâmetro exterior" u="m" v={Dext} s={setDe}/><F l="Diâmetro ilha" u="m" v={Dins} s={setDi}/></div><RoundSvg/></section><section className="panel"><div className="result-grid"><M t="Largura anel" v={`${ro.ring.toFixed(2)} m`}/><M t="Área anular" v={`${ro.area.toFixed(0)} m²`}/></div></section></div>}

 {tab==='earth'&&<><section className="panel"><h3>Perfis transversais automáticos</h3><div className="member-table">{sections.map((x,i)=><div key={i}><b>PK {x.pk.toFixed(0)}</b><span>Corte {x.cut.toFixed(2)} m²</span><span>Aterro {x.fill.toFixed(2)} m²</span><span>Δz {(prof[i].terrain-prof[i].grade).toFixed(2)} m</span></div>)}</div></section><section className="panel"><div className="result-grid"><M t="Corte" v={`${ew.cut.toFixed(0)} m³`}/><M t="Aterro" v={`${ew.fill.toFixed(0)} m³`}/><M t="Balanço geométrico" v={`${ew.balance.toFixed(0)} m³`}/></div><p className="note">As áreas são geradas a partir da diferença terreno–rasante, largura da plataforma e taludes laterais introduzidos.</p></section></>}

 {tab==='mass'&&<><section className="panel"><h3>Transformação de volumes</h3><div className="form-grid"><F l="Empolamento corte" u="%" v={swell} s={setSwell}/><F l="Contração/compactação aterro" u="%" v={shrink} s={setShrink}/></div><MassSvg pts={mass}/></section><section className="panel"><h3>Diagrama de massas</h3><div className="member-table">{mass.map((x,i)=><div key={i}><b>PK {x.pk.toFixed(0)}</b><span>Massa acumulada {x.mass.toFixed(0)} m³</span></div>)}</div><div className="result-grid"><M t="Massa final" v={`${(mass[mass.length-1]?.mass||0).toFixed(0)} m³`}/><M t="Interpretação" v={(mass[mass.length-1]?.mass||0)>=0?'Excedente de escavação':'Necessidade de empréstimo'}/></div></section></>}


 {tab==='drainage'&&<>
  <div className="work-grid">
   <section className="panel"><h3>Bacia contributiva · Método racional</h3><div className="form-grid">
    <F l="Área contributiva" u="ha" v={basinArea} s={setBasinArea}/><F l="Coef. escoamento C" v={runoffC} s={setRunoffC}/><F l="Intensidade chuva" u="mm/h" v={rainI} s={setRainI}/>
    <F l="Comprimento escoamento" u="m" v={catchL} s={setCatchL}/><F l="Desnível" u="m" v={catchH} s={setCatchH}/>
   </div><div className="result-grid"><M t="Caudal de ponta Q" v={`${runoff.Q.toFixed(3)} m³/s`}/><M t="Tempo concentração" v={`${tc.tcMin.toFixed(1)} min`}/><M t="Declive médio bacia" v={`${(tc.S*100).toFixed(2)} %`}/></div></section>
   <section className="panel"><h3>Valeta trapezoidal</h3><div className="form-grid">
    <F l="Base b" u="m" v={ditchB} s={setDitchB}/><F l="Altura útil y" u="m" v={ditchY} s={setDitchY}/><F l="Talude z H/V" v={ditchZ} s={setDitchZ}/><F l="Declive longitudinal" v={ditchS} s={setDitchS}/><F l="Manning n" v={ditchN} s={setDitchN}/>
   </div><div className="result-grid"><M t="Área molhada" v={`${ditch.A.toFixed(3)} m²`}/><M t="Largura topo" v={`${ditch.top.toFixed(2)} m`}/><M t="Capacidade Q" v={`${ditch.Q.toFixed(3)} m³/s`}/><M t="Velocidade" v={`${ditch.v.toFixed(2)} m/s`}/><M t="Verificação Qvaleta/Qponta" v={ditch.Q>=runoff.Q?'OK':'INSUFICIENTE'}/></div><DitchSvg b={ditchB} y={ditchY} z={ditchZ}/></section>
  </div>
  <div className="work-grid">
   <section className="panel"><h3>Aqueduto circular · escoamento cheio</h3><div className="form-grid">
    <F l="Diâmetro D" u="m" v={culvD} s={setCulvD}/><F l="Declive" v={culvS} s={setCulvS}/><F l="Manning n" v={culvN} s={setCulvN}/>
   </div><div className="result-grid"><M t="Capacidade Q" v={`${culv.Q.toFixed(3)} m³/s`}/><M t="Velocidade" v={`${culv.v.toFixed(2)} m/s`}/><M t="Verificação Qaq/Qponta" v={culv.Q>=runoff.Q?'OK':'INSUFICIENTE'}/></div><CulvertSvg D={culvD}/></section>
   <section className="panel"><h3>Drenagem transversal ao longo do eixo</h3><div className="form-grid"><F l="Espaçamento de estudo" u="m" v={crossDrainSpacing} s={setCrossDrainSpacing}/></div>
    <div className="member-table">{drains.map((pk,i)=><div key={i}><b>Passagem {i+1}</b><span>PK {pk.toFixed(0)}</span><span>Tipo: a definir</span><span>Q ref. {runoff.Q.toFixed(3)} m³/s</span></div>)}</div>
    <p className="note">O espaçamento é apenas uma malha preliminar de estudo. A implantação real deve resultar da topografia, linhas de água, pontos baixos, bacias contributivas e capacidade das obras de drenagem.</p>
   </section>
  </div>
  <section className="panel"><h3>Leitura integrada</h3><div className="result-grid"><M t="Q ponta" v={`${runoff.Q.toFixed(3)} m³/s`}/><M t="Q valeta" v={`${ditch.Q.toFixed(3)} m³/s`}/><M t="Q aqueduto" v={`${culv.Q.toFixed(3)} m³/s`}/><M t="Margem valeta" v={`${(ditch.Q-runoff.Q).toFixed(3)} m³/s`}/><M t="Margem aqueduto" v={`${(culv.Q-runoff.Q).toFixed(3)} m³/s`}/></div>
   <p className="note">Cálculos hidráulicos simplificados de apoio ao estudo. Não incluem remanso, controlo à entrada/saída, afogamento, perdas localizadas, erosão, assoreamento, freeboard nem dimensionamento regulamentar completo.</p>
  </section>
 </>}


 {tab==='drainprofile'&&<>
  <section className="panel"><h3>Perfil longitudinal de drenagem</h3><div className="form-grid"><F l="Diâmetro coletor" u="m" v={drainD} s={setDrainD}/><F l="Manning n" v={drainN} s={setDrainN}/><F l="Recobrimento mínimo" u="m" v={minCover} s={setMinCover}/></div>
   <button onClick={syncDrainGround}>Sincronizar cotas com rasante</button>
   <div className="member-table">{dnodes.map((x,i)=><div key={i}><b>Caixa {i+1}</b><span>PK <input type="number" value={x.pk} onChange={e=>updDrain(i,'pk',+e.target.value)}/></span><span>Cota tampa <input type="number" value={x.ground} onChange={e=>updDrain(i,'ground',+e.target.value)}/></span><span>Cota soleira <input type="number" value={x.invert} onChange={e=>updDrain(i,'invert',+e.target.value)}/></span></div>)}</div>
   <button onClick={()=>{const last=dnodes[dnodes.length-1]||{pk:0,ground:100,invert:98};setDnodes([...dnodes,{pk:last.pk+50,ground:interpolateProfile(prof,last.pk+50,'grade'),invert:last.invert-.5}])}}>+ Caixa</button>
  </section>
  <section className="panel"><DrainProfileSvg nodes={dnodes} D={drainD}/></section>
  <section className="panel"><h3>Troços hidráulicos</h3><div className="member-table">{dsegs.map((x,i)=><div key={i}><b>PK {x.from.toFixed(0)} → {x.to.toFixed(0)}</b><span>L {x.L.toFixed(1)} m</span><span>i {(x.S*100).toFixed(2)} %</span><span>Q cheio {x.Q.toFixed(3)} m³/s</span><span>v {x.v.toFixed(2)} m/s</span><span>Rec. {Math.min(x.coverA,x.coverB).toFixed(2)} m</span><span>{x.S<=0?'⚠ contra-declive':Math.min(x.coverA,x.coverB)<minCover?'⚠ recobrimento':'OK'}</span></div>)}</div></section>
  <section className="panel"><h3>Integração com a via</h3><div className="result-grid"><M t="Caixas" v={`${dnodes.length}`}/><M t="Troços" v={`${dsegs.length}`}/><M t="Extensão" v={`${dsegs.reduce((a,x)=>a+x.L,0).toFixed(0)} m`}/><M t="Q mínimo capacidade" v={`${(dsegs.length?Math.min(...dsegs.map(x=>x.Q)):0).toFixed(3)} m³/s`}/></div><p className="note">Perfil hidráulico simplificado. As cotas podem ser sincronizadas com a rasante do eixo e depois ajustadas manualmente. Verificar profundidades, interferências, caixas, descarga, remanso e condições reais de implantação.</p></section>
 </>}

 {tab==='drainplan'&&<>
  <section className="panel"><h3>Planta gráfica de drenagem</h3><RoadDrainPlan items={planItems} length={Math.max(...prof.map(x=>x.pk),250)} platform={cs.total}/></section>
  <div className="work-grid"><section className="panel"><h3>Inserir elemento</h3><div className="form-grid">
   <label className="field"><span>Tipo</span><select value={newType} onChange={e=>setNewType(e.target.value)}><option>Caixa</option><option>Sumidouro</option><option>Valeta</option><option>Aqueduto</option><option>Descarga</option></select></label>
   <F l="PK" u="m" v={newPk} s={setNewPk}/><label className="field"><span>Lado</span><select value={newSide} onChange={e=>setNewSide(e.target.value)}><option value="E">Esquerdo</option><option value="D">Direito</option><option value="T">Transversal</option></select></label><F l="Offset ao eixo" u="m" v={newOffset} s={setNewOffset}/>
  </div><button onClick={()=>setPlanItems([...planItems,{id:Date.now(),type:newType,pk:newPk,side:newSide,offset:newOffset}])}>+ Colocar na planta</button></section>
  <section className="panel"><h3>Elementos implantados</h3><div className="member-table">{planItems.map((x,i)=><div key={x.id}><b>{x.type}</b><span>PK {x.pk.toFixed(0)}</span><span>{x.side==='E'?'Esquerdo':x.side==='D'?'Direito':'Transversal'}</span><span>Offset {x.offset.toFixed(1)} m</span><button onClick={()=>setPlanItems(planItems.filter((_,j)=>j!==i))}>Remover</button></div>)}</div></section></div>
  <section className="panel"><h3>Coordenação via ↔ drenagem</h3><div className="result-grid"><M t="Elementos" v={`${planItems.length}`}/><M t="Caixas" v={`${planItems.filter(x=>x.type==='Caixa').length}`}/><M t="Sumidouros" v={`${planItems.filter(x=>x.type==='Sumidouro').length}`}/><M t="Aquedutos" v={`${planItems.filter(x=>x.type==='Aqueduto').length}`}/></div><p className="note">A implantação usa PK, lado e afastamento ao eixo. É uma planta esquemática coordenada com a extensão da via; não substitui coordenadas topográficas XY nem levantamento georreferenciado.</p></section>
 </>}


 {tab==='xyplan'&&<>
  <div className="work-grid">
   <section className="panel"><h3>Eixo XY editável</h3>
    <div className="member-table">{alignment.map((p,i)=><div key={i}><b>Vértice {i+1}</b><span>X <input type="number" value={p.x} onChange={e=>updAlign(i,'x',+e.target.value)}/></span><span>Y <input type="number" value={p.y} onChange={e=>updAlign(i,'y',+e.target.value)}/></span></div>)}</div>
    <button onClick={()=>{const last=alignment[alignment.length-1]||{x:0,y:0};setAlignment([...alignment,{x:last.x+80,y:last.y}])}}>+ Vértice</button>
    <div className="result-grid"><M t="Comprimento eixo" v={`${alignInfo.total.toFixed(1)} m`}/><M t="Segmentos" v={`${alignInfo.seg.length}`}/></div>
   </section>
   <section className="panel"><h3>Implantação de drenagem</h3>
    <div className="form-grid">
     <label className="field"><span>Elemento</span><select value={selectedKind} onChange={e=>setSelectedKind(e.target.value as XYDrainageElement['kind'])}><option>Caixa</option><option>Sumidouro</option><option>Valeta</option><option>Aqueduto</option><option>Descarga</option></select></label>
     <label className="field"><span>Lado</span><select value={selectedSide} onChange={e=>setSelectedSide(e.target.value as 'E'|'D'|'T')}><option value="E">Esquerdo</option><option value="D">Direito</option><option value="T">Transversal</option></select></label>
     <F l="Afastamento ao eixo" u="m" v={selectedOffset} s={setSelectedOffset}/>
     <F l="Escala visual" v={xyScale} s={setXyScale}/>
    </div>
    <button onClick={()=>addElemAtPk(Math.min(alignInfo.total,Math.max(0,alignInfo.total/2)))}>+ Elemento no PK médio</button>
    <p className="note">Também podes clicar diretamente na planta: o ponto é projetado sobre o eixo e convertido automaticamente em PK e afastamento.</p>
   </section>
  </div>

  <section className="panel"><h3>Planta XY · ligação automática XY ↔ PK</h3>
   <XYPlanSvg alignment={alignment} elems={linkedElems} scale={xyScale} onPick={(x,y)=>{
    const projected=projectXYToAlignment(alignment,x,y)
    const pickedSide: 'E'|'D'|'T' = projected.offset < -0.2 ? 'E' : projected.offset > 0.2 ? 'D' : 'T'
    setXyElems([...xyElems,{id:`D${xyElems.length+1}`,kind:selectedKind,x,y,pk:projected.pk,offset:Math.abs(projected.offset),side:pickedSide}])
   }}/>
  </section>

  <section className="panel"><h3>Elementos ligados ao eixo</h3>
   <div className="member-table">{linkedElems.map(el=><div key={el.id}><b>{el.id} · {el.kind}</b><span>PK <input type="number" value={el.pk} onChange={e=>updElemPk(el.id,+e.target.value)}/></span><span>Lado {el.side}</span><span>Offset {Math.abs(el.offset).toFixed(2)} m</span><span>X {el.x.toFixed(2)}</span><span>Y {el.y.toFixed(2)}</span><span>Cota rasante {interpolateProfile(prof,Math.min(el.pk,prof[prof.length-1]?.pk||el.pk),'grade').toFixed(2)} m</span><button onClick={()=>setXyElems(xyElems.filter(x=>x.id!==el.id))}>Remover</button></div>)}</div>
  </section>

  <section className="panel"><h3>Correspondência com perfil longitudinal</h3>
   <div className="result-grid"><M t="Elementos em planta" v={`${linkedElems.length}`}/><M t="Extensão eixo XY" v={`${alignInfo.total.toFixed(1)} m`}/><M t="Último PK do perfil" v={`${(prof[prof.length-1]?.pk||0).toFixed(0)} m`}/></div>
   <p className="note">Nesta versão, os elementos gráficos ficam parametrizados por PK/offset. Ao alterar a geometria do eixo, a posição XY é recalculada automaticamente, preservando a referência longitudinal do projeto.</p>
  </section>
 </>}

 {tab==='criteria'&&<><EngineeringBasis area="roads"/><section className="panel"><h3>Checklist de estudo prévio viário</h3><PreliminaryChecklist items={[{name:'Classe / função da via e velocidade de projeto',status:'check',detail:'Definir com a entidade gestora antes de fixar parâmetros geométricos.'},{name:'Traçado horizontal',status:'ok',detail:'Raios, desenvolvimento e planta XY disponíveis para pré-estudo.'},{name:'Rasante / curvas verticais',status:'ok',detail:'Perfil longitudinal e parâmetro K disponíveis.'},{name:'Visibilidade de paragem',status:'ok',detail:'Cálculo físico implementado; valores mínimos regulamentares devem ser confirmados.'},{name:'Terraplenagens / massas',status:'ok',detail:'Perfis, volumes e diagrama de massas disponíveis.'},{name:'Drenagem',status:'ok',detail:'Pré-dimensionamento e representação em planta/perfil disponíveis.'},{name:'Sinalização, segurança rodoviária e pavimento',status:'check',detail:'Verificação ativa no fecho do estudo: validar solução de pavimento, sinalização e segurança segundo entidade gestora e documentos aplicáveis.'}]}/></section></>}

 <section className="panel"><p className="note">Ferramenta de apoio a estudo/pre-dimensionamento. Traçado, visibilidade, perfis, cubagens e movimentação de terras devem ser verificados com os critérios regulamentares e topografia de projeto.</p></section></div>}

function PlanSvg({R,delta}:{R:number,delta:number}){return <svg viewBox="0 0 620 260" className="eng-svg"><line x1="70" y1="205" x2="275" y2="115" stroke="#71879c" strokeWidth="5"/><path d="M275 115 Q365 72 545 70" fill="none" stroke="#2dd4bf" strokeWidth="7"/><line x1="275" y1="115" x2="545" y2="70" stroke="#71879c" strokeDasharray="8 6"/><text x="300" y="45" fill="#9fb3c8">R={R.toFixed(0)} m · Δ={delta.toFixed(1)}°</text></svg>}
function SectionSvg({total,carriage}:{total:number,carriage:number}){return <svg viewBox="0 0 620 250" className="eng-svg"><polygon points="70,185 140,130 480,130 550,185 520,205 100,205" fill="#33475c"/><line x1="310" y1="130" x2="310" y2="205" stroke="#f5f5f5" strokeDasharray="10 7"/><text x="205" y="105" fill="#9fb3c8">{carriage.toFixed(2)} m rodagem · {total.toFixed(2)} m total</text></svg>}
function RoundSvg(){return <svg viewBox="0 0 620 260" className="eng-svg"><circle cx="310" cy="130" r="100" fill="#33475c"/><circle cx="310" cy="130" r="55" fill="#1b2f42"/><line x1="20" y1="130" x2="210" y2="130" stroke="#71879c" strokeWidth="28"/><line x1="410" y1="130" x2="600" y2="130" stroke="#71879c" strokeWidth="28"/></svg>}
function ProfileLongSvg({pts}:{pts:ProfilePoint[]}){if(!pts.length)return null;const W=700,H=300,p=45,minPk=Math.min(...pts.map(x=>x.pk)),maxPk=Math.max(...pts.map(x=>x.pk)),minZ=Math.min(...pts.flatMap(x=>[x.terrain,x.grade])),maxZ=Math.max(...pts.flatMap(x=>[x.terrain,x.grade])),sx=(W-2*p)/Math.max(maxPk-minPk,1),sy=(H-2*p)/Math.max(maxZ-minZ,1),P=(pk:number,z:number)=>`${p+(pk-minPk)*sx},${H-p-(z-minZ)*sy}`,terr=pts.map(x=>P(x.pk,x.terrain)).join(' '),grad=pts.map(x=>P(x.pk,x.grade)).join(' ');return <svg viewBox={`0 0 ${W} ${H}`} className="eng-svg"><polyline points={terr} fill="none" stroke="#9ca3af" strokeWidth="4"/><polyline points={grad} fill="none" stroke="#2dd4bf" strokeWidth="4"/><text x="25" y="25" fill="#9ca3af">Terreno</text><text x="110" y="25" fill="#2dd4bf">Rasante</text></svg>}
function MassSvg({pts}:{pts:{pk:number,mass:number}[]}){if(!pts.length)return null;const W=700,H=300,p=45,minPk=Math.min(...pts.map(x=>x.pk)),maxPk=Math.max(...pts.map(x=>x.pk)),minM=Math.min(0,...pts.map(x=>x.mass)),maxM=Math.max(0,...pts.map(x=>x.mass)),sx=(W-2*p)/Math.max(maxPk-minPk,1),sy=(H-2*p)/Math.max(maxM-minM,1),P=(x:any)=>`${p+(x.pk-minPk)*sx},${H-p-(x.mass-minM)*sy}`,zeroY=H-p-(0-minM)*sy;return <svg viewBox={`0 0 ${W} ${H}`} className="eng-svg"><line x1={p} y1={zeroY} x2={W-p} y2={zeroY} stroke="#71879c" strokeDasharray="7 5"/><polyline points={pts.map(P).join(' ')} fill="none" stroke="#f59e0b" strokeWidth="5"/><text x="25" y="25" fill="#f59e0b">Massa acumulada</text></svg>}

function DitchSvg({b,y,z}:{b:number,y:number,z:number}){const scale=90,base=Math.max(30,b*scale),h=Math.max(35,y*scale),side=z*h,x=310;return <svg viewBox="0 0 620 240" className="eng-svg"><path d={`M${x-base/2-side} 70 L${x-base/2} ${70+h} L${x+base/2} ${70+h} L${x+base/2+side} 70`} fill="none" stroke="#2dd4bf" strokeWidth="5"/><line x1={x-base/2} y1={70+h} x2={x+base/2} y2={70+h} stroke="#71879c" strokeWidth="2"/><text x="220" y="205" fill="#9fb3c8">Valeta trapezoidal</text></svg>}
function CulvertSvg({D}:{D:number}){const r=Math.max(30,Math.min(80,D*70));return <svg viewBox="0 0 620 240" className="eng-svg"><line x1="80" y1="160" x2="540" y2="160" stroke="#71879c" strokeWidth="8"/><circle cx="310" cy="130" r={r} fill="none" stroke="#2dd4bf" strokeWidth="6"/><text x="255" y="225" fill="#9fb3c8">D={D.toFixed(2)} m</text></svg>}

function DrainProfileSvg({nodes,D}:{nodes:DrainageNode[],D:number}){if(nodes.length<2)return null;const W=760,H=330,p=50,minPk=Math.min(...nodes.map(x=>x.pk)),maxPk=Math.max(...nodes.map(x=>x.pk)),minZ=Math.min(...nodes.flatMap(x=>[x.invert-D,x.ground]))-.5,maxZ=Math.max(...nodes.map(x=>x.ground))+.5,sx=(W-2*p)/Math.max(maxPk-minPk,1),sy=(H-2*p)/Math.max(maxZ-minZ,1),P=(pk:number,z:number)=>`${p+(pk-minPk)*sx},${H-p-(z-minZ)*sy}`,ground=nodes.map(x=>P(x.pk,x.ground)).join(' '),pipe=nodes.map(x=>P(x.pk,x.invert)).join(' ');return <svg viewBox={`0 0 ${W} ${H}`} className="eng-svg"><polyline points={ground} fill="none" stroke="#9ca3af" strokeWidth="4"/><polyline points={pipe} fill="none" stroke="#38bdf8" strokeWidth="6"/>{nodes.map((x,i)=>{const [cx,cy]=P(x.pk,x.invert).split(',').map(Number);return <g key={i}><line x1={cx} y1={cy} x2={cx} y2={H-p-(x.ground-minZ)*sy} stroke="#2dd4bf" strokeWidth="3"/><circle cx={cx} cy={cy} r="5" fill="#38bdf8"/></g>})}<text x="25" y="25" fill="#9ca3af">Rasante / terreno</text><text x="170" y="25" fill="#38bdf8">Coletor / soleira</text></svg>}

function RoadDrainPlan({items,length,platform}:{items:{id:number;type:string;pk:number;side:string;offset:number}[];length:number;platform:number}){const W=900,H=360,p=60,y=180,road=Math.max(42,platform*5),sx=(W-2*p)/Math.max(length,1),symbol=(x:any)=>x.type==='Caixa'?'□':x.type==='Sumidouro'?'▣':x.type==='Aqueduto'?'↕':x.type==='Valeta'?'≈':'●';return <svg viewBox={`0 0 ${W} ${H}`} className="eng-svg"><rect x={p} y={y-road/2} width={W-2*p} height={road} rx="8" fill="#33475c"/><line x1={p} y1={y} x2={W-p} y2={y} stroke="#f5f5f5" strokeDasharray="12 9"/>{Array.from({length:6},(_,i)=>{const pk=length*i/5,x=p+pk*sx;return <g key={i}><line x1={x} y1={y-road/2-8} x2={x} y2={y+road/2+8} stroke="#71879c"/><text x={x-15} y={H-25} fill="#9fb3c8">{pk.toFixed(0)}</text></g>})}{items.map(a=>{const x=p+Math.max(0,Math.min(length,a.pk))*sx,sgn=a.side==='E'?-1:a.side==='D'?1:0,yy=y+sgn*(road/2+25+a.offset*3);return <g key={a.id}><line x1={x} y1={y} x2={x} y2={yy} stroke={a.type==='Aqueduto'?'#f59e0b':'#38bdf8'} strokeWidth="3"/><text x={x-10} y={yy+6} fill={a.type==='Aqueduto'?'#f59e0b':'#2dd4bf'} fontSize="22">{symbol(a)}</text><text x={x+14} y={yy+5} fill="#9fb3c8" fontSize="11">{a.type} PK{a.pk.toFixed(0)}</text></g>})}<text x="20" y="25" fill="#9fb3c8">E</text><text x="20" y={H-20} fill="#9fb3c8">D</text></svg>}

function XYPlanSvg({alignment,elems,scale,onPick}:{alignment:AlignmentVertex[];elems:XYDrainageElement[];scale:number;onPick:(x:number,y:number)=>void}){
 if(alignment.length<2)return null
 const W=820,H=430,p=45
 const xs=alignment.map(a=>a.x).concat(elems.map(e=>e.x)),ys=alignment.map(a=>a.y).concat(elems.map(e=>e.y))
 const minX=Math.min(...xs)-20,maxX=Math.max(...xs)+20,minY=Math.min(...ys)-20,maxY=Math.max(...ys)+20
 const sx=(W-2*p)/Math.max(maxX-minX,1),sy=(H-2*p)/Math.max(maxY-minY,1),k=Math.min(sx,sy)*Math.max(scale,.1)
 const cx=(minX+maxX)/2,cy=(minY+maxY)/2
 const P=(x:number,y:number)=>[W/2+(x-cx)*k,H/2-(y-cy)*k]
 const poly=alignment.map(a=>P(a.x,a.y).join(',')).join(' ')
 const click=(ev: React.MouseEvent<SVGSVGElement>)=>{
  const rect=ev.currentTarget.getBoundingClientRect()
  const viewX=((ev.clientX-rect.left)/rect.width)*W
  const viewY=((ev.clientY-rect.top)/rect.height)*H
  const modelX=cx+(viewX-W/2)/k
  const modelY=cy-(viewY-H/2)/k
  onPick(modelX,modelY)
 }
 return <svg viewBox={`0 0 ${W} ${H}`} className="eng-svg" onClick={click} style={{cursor:'crosshair'}}>
  <polyline points={poly} fill="none" stroke="#2dd4bf" strokeWidth="8"/>
  {alignment.map((a,i)=>{const[qx,qy]=P(a.x,a.y);return <g key={i}><circle cx={qx} cy={qy} r="7" fill="#0f172a" stroke="#f8fafc" strokeWidth="2"/><text x={qx+8} y={qy-8} fill="#cbd5e1">V{i+1}</text></g>})}
  {elems.map(el=>{const[qx,qy]=P(el.x,el.y);const glyph=el.kind==='Caixa'?'□':el.kind==='Sumidouro'?'▣':el.kind==='Aqueduto'?'◉':el.kind==='Valeta'?'▽':'◆';return <g key={el.id}><text x={qx-8} y={qy+7} fill="#f59e0b" fontSize="22">{glyph}</text><text x={qx+10} y={qy-10} fill="#f8fafc">{el.id} PK{el.pk.toFixed(0)}</text></g>})}
  <text x="20" y="24" fill="#94a3b8">Clique para implantar elemento · eixo em coordenadas XY locais</text>
 </svg>
}
