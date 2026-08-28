import React from 'react'
import { modules } from '../app/modules'
import type { ModuleId } from '../app/types'
import { Icon } from './Icon'
import BrandMark from '../branding/BrandMark'

interface Props {
  active: ModuleId
  onSelect: (id: ModuleId) => void
  open: boolean
  onClose: () => void
}

export function Sidebar({ active, onSelect, open, onClose }: Props) {
  const groups = Array.from(new Set(modules.map((m) => m.group)))
  return <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
    <div className="brand"><BrandMark/></div>
    <nav>
      {groups.map((group) => <section key={group} className="navGroup">
        {group !== 'Geral' && <div className="navGroupTitle">{group}</div>}
        {modules.filter((m) => m.group === group).map((m) => <button key={m.id} className={`navItem ${active === m.id ? 'active' : ''}`} onClick={() => { onSelect(m.id); onClose() }}>
          <Icon id={m.id} size={20}/><span>{m.label}</span>{m.status === 'planned' && <small></small>}
        </button>)}
      </section>)}
    </nav>
  </aside>
}