import React from 'react'
import BrandMark from '../branding/BrandMark'
export function Topbar({ onMenu }: { onMenu: () => void }) {
  return <header className="topbar">
    <button className="menuButton" onClick={onMenu} aria-label="Abrir menu">☰</button>
    <BrandMark compact/>
    <div className="topActions"><button>⌕</button><button>☆</button><button>⚙</button></div>
  </header>
}
