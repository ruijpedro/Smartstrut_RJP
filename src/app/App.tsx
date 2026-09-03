import React from 'react'
import { useState } from 'react'
import type { ModuleId } from './types'
import { Sidebar } from '../ui/Sidebar'
import { Topbar } from '../ui/Topbar'
import { DashboardPage } from '../modules/dashboard/DashboardPage'
import { BeamsPage } from '../modules/structures/beams/BeamsPage'
import { RoadsPage } from '../modules/roads/RoadsPage'
import ContainmentPage from '../modules/containment/ContainmentPage'
import { SoilNailsPage, AnchorsPage, ShotcretePage, DrainageSystemsPage } from '../modules/containment/StabilizationPages'
import { EarthPressurePage } from '../modules/geotechnics/EarthPressurePage'
import HydraulicsPage from '../modules/hydraulics/HydraulicsPage'
import { FramesPage, TrussesPage, ColumnsPage, SlabsPage, FoundationsPage, WallsPage, CombinationsPage } from '../modules/structures/basic/StructuralPages'
import { GeotechnicsPage, SptPage, CptPage, BearingCapacityPage, SettlementsPage, SlopesPage } from '../modules/geotechnics/GeotechnicalPages'
import { BeamsProPage } from '../modules/beamsPro'
import { ColumnsProPage } from '../modules/columnsPro'
import { SlabsProPage } from '../modules/slabsPro'
import { TrussesProPage } from '../modules/trussesPro'
import { Structural2DEditor } from '../modules/structural2d'
import { GeotechnicsProPage } from '../modules/geotechnicsPro'
import { SlopesProPage } from '../modules/slopesPro'
import { HydraulicsProPage } from '../modules/hydraulicsPro'
import { RoadsProPage } from '../modules/roadsPro'
import { StabilizationProPage } from '../modules/stabilizationPro'
import { FoundationsProPage } from '../modules/foundationsPro'
import { PavementsProPage } from '../modules/pavementsPro'
import { AnchoredWallsProPage } from '../modules/anchoredWallsPro'
import { ProjectsPage } from '../modules/projectsPro'
import { ReportPreviewPage } from '../modules/reportsPro'
import { Frame2DProPage } from '../modules/frame2dPro'
import { FixedProppedBeamPage } from '../modules/fixedProppedBeam'
import { TechnicalLibraryPage } from '../modules/technicalLibrary'
import { ToolsPage } from '../modules/toolsPro'
import { SettingsPage } from '../modules/settingsPro'
import { OnlineLibraryPage } from '../modules/onlineLibrary'
import IntegratedStructurePage from '../modules/integratedStructure/IntegratedStructurePage'
import FrameFoundationPage from '../modules/frameFoundation/FrameFoundationPage'
import BuildingModelPage from '../modules/buildingModel/BuildingModelPage'
import { BIMModelPage } from '../modules/bimModel'
import StructuralProjectPage from '../modules/structuralProject/StructuralProjectPage'
import HelpPage from '../modules/help/HelpPage'
import LSFPage from '../modules/lsf/LSFPage'
import { SteelStructuresPage } from '../modules/steelStructures'
import {TimberPage,MasonryPage,CompositePage,SeismicPage,DeepFoundationsPage,GlobalSlopesPage,BridgesPage} from '../modules/specialties/SpecialtyPages'
import PreliminaryStudyPage from '../modules/preliminaryStudy/PreliminaryStudyPage'
import { RehabilitationPage } from '../modules/rehabilitation'

function Planned({ title }: { title: string }) {
  return <div className="page"><div className="pageTitle"><h1>{title}</h1><span>Em preparação</span></div><section className="panel planned"><h2>Módulo ainda não integrado</h2><p>Este módulo será acrescentado numa fase própria, mantendo WebApp e APK compiláveis antes de avançar.</p></section></div>
}

const titles: Partial<Record<ModuleId, string>> = {
  library: 'Biblioteca Técnica', tools: 'Ferramentas', settings: 'Configurações'
}

export default function App() {
  const [active, setActive] = useState<ModuleId>('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  let content = <Planned title={titles[active] ?? 'Módulo'} />
  if (active === 'dashboard') content = <DashboardPage onOpen={setActive}/>
  if (active === 'beams') content = <BeamsProPage/>
  if (active === 'roads') content = <RoadsProPage/>
  if (active === 'hydraulics') content = <HydraulicsPage/>
  if (active === 'frames') content = <Frame2DProPage/>
  if (active === 'trusses') content = <TrussesProPage/>
  if (active === 'combinations') content = <CombinationsPage/>
  if (active === 'columns') content = <ColumnsProPage/>
  if (active === 'slabs') content = <SlabsProPage/>
  if (active === 'foundations') content = <FoundationsProPage/>
  if (active === 'integrated') content = <IntegratedStructurePage/>
  if (active === 'framefoundation') content = <FrameFoundationPage/>
  if (active === 'buildingmodel') content = <BuildingModelPage/>
  if (active === 'bimmodel') content = <BIMModelPage onOpen={setActive}/>
  if (active === 'structuralproject') content = <StructuralProjectPage/>
  if (active === 'lsf') content = <LSFPage/>
  if (active === 'steelstructures') content = <SteelStructuresPage/>
  if (active === 'timber') content = <TimberPage/>
  if (active === 'masonry') content = <MasonryPage/>
  if (active === 'composite') content = <CompositePage/>
  if (active === 'seismic') content = <SeismicPage/>
  if (active === 'deepfoundations') content = <DeepFoundationsPage/>
  if (active === 'globalslopes') content = <GlobalSlopesPage/>
  if (active === 'bridges') content = <BridgesPage/>
  if (active === 'preliminarystudy') content = <PreliminaryStudyPage/>
  if (active === 'rehabilitation') content = <RehabilitationPage/>
  if (active === 'walls') content = <WallsPage/>
  if (active === 'containment') content = <ContainmentPage/>
  if (active === 'soilnails') content = <SoilNailsPage/>
  if (active === 'anchors') content = <AnchorsPage/>
  if (active === 'shotcrete') content = <ShotcretePage/>
  if (active === 'drainage') content = <DrainageSystemsPage/>
  if (active === 'geotechnics') content = <GeotechnicsProPage/>
  if (active === 'spt') content = <SptPage/>
  if (active === 'cpt') content = <CptPage/>
  if (active === 'bearing') content = <BearingCapacityPage/>
  if (active === 'settlements') content = <SettlementsPage/>
  if (active === 'earthpressure') content = <EarthPressurePage/>
  if (active === 'slopes') content = <SlopesProPage/>
  if (active === 'library') content = <OnlineLibraryPage/>
  if (active === 'tools') content = <ToolsPage/>
  if (active === 'settings') content = <SettingsPage/>
  if (active === 'help') content = <HelpPage/>
  return <div className="appShell"><Sidebar active={active} onSelect={setActive} open={menuOpen} onClose={() => setMenuOpen(false)}/><div className="mainShell"><Topbar onMenu={() => setMenuOpen(true)}/><main>{content}</main></div>{menuOpen && <button className="overlay" onClick={() => setMenuOpen(false)} aria-label="Fechar menu"/>}</div>
}