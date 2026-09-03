import type { ModuleId } from '../app/types'

const paths: Partial<Record<ModuleId, string>> = {
  dashboard: 'M4 11 12 4l8 7v9H5z',
  beams: 'M3 7h18v3H3zm3 3h3v8H6zm9 0h3v8h-3z',
  frames: 'M4 20V5h16v15M4 10h16',
  lsf: 'M4 20V4h16v16M8 4v16m4-16v16m4-16v16M4 8h16M4 16h16',
  steelstructures: 'M4 4h16v4h-6v8h6v4H4v-4h6V8H4V4Z',
  rehabilitation: 'M4 20V6l8-3 8 3v14M7 20v-6h4v6m3-9h3m-1.5-1.5v3',
  trusses: 'M3 19 12 5l9 14H3Zm4 0 5-8 5 8',
  columns: 'M8 3h8v4h-2v10h2v4H8v-4h2V7H8z',
  slabs: 'M4 8l8-4 8 4-8 4-8-4Zm0 5 8 4 8-4',
  foundations: 'M6 5h12v5H6zm3 5h6v9H9zm-4 9h14',
  walls: 'M5 20V4h9l5 16H5Zm4-4h7',
  containment: 'M4 20V5h5l3 5 3-5h5v15M7 14h10',
  geotechnics: 'M3 8c4-3 7 3 11 0s7 3 7 3v8H3V8Zm0 6c4-3 7 3 11 0s7 3 7 3',
  spt: 'M12 3v18m-4-4h8M9 7h6M7 11h10',
  cpt: 'M12 3v15m-3 0 3 3 3-3M8 7h8',
  bearing: 'M5 9h14v4H5zm3 4h8v5H8zm-3 5h14',
  settlements: 'M4 7h16v5H4zm3 8c3 2 7 2 10 0m-5-3v8',
  slopes: 'M3 20 9 7l12 13H3Zm6-4h7',
  hydraulics: 'M12 3s5 6 5 10a5 5 0 1 1-10 0c0-4 5-10 5-10Z',
  roads: 'M8 3 5 21h14L16 3H8Zm4 2v4m0 3v4m0 3v2',
  soilnails: 'M4 19 9 6m-2 10 10-7m-8 3 10-4',
  anchors: 'M12 3v12m-5-4 5 5 5-5m-9 8h8',
  shotcrete: 'M5 19 9 5m2 12 8-8m-5-4 6 2',
  drainage: 'M4 6c5 2 7-2 12 0v12c-5-2-7 2-12 0V6m14 4 3 3-3 3',
  earthpressure: 'M5 20V4m3 3 9 5-9 5m9-5 3-3m-3 3 3 3',
  library: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 1V4Zm3 0v16',
  tools: 'M14 6 6 14m8 4 4 4m-8-12L4 4m12 4a4 4 0 1 0 4 4',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5 1 3 3 1 3-1 2 3-2 2 1 3-3 2-1 3h-4l-1-3-3-2 1-3-2-2 2-3 3 1 3-1 1-3h4Z',
}

export function Icon({ id, size = 24 }: { id: ModuleId; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[id] ?? paths.dashboard} /></svg>
}
