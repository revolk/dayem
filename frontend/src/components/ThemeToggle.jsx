// frontend/src/components/ThemeToggle.jsx
import { useTheme } from '../context/ThemeContext'

const CSS = `
  .tt-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }

  /* Track */
  .tt-track {
    width: 48px;
    height: 26px;
    border-radius: 13px;
    position: relative;
    transition: background .35s, border-color .35s, box-shadow .35s;
    flex-shrink: 0;
  }
  [data-theme="dark"] .tt-track {
    background: rgba(212,175,55,.12);
    border: 1px solid rgba(212,175,55,.35);
    box-shadow: inset 0 0 8px rgba(212,175,55,.1), 0 0 12px rgba(212,175,55,.08);
  }
  [data-theme="light"] .tt-track {
    background: rgba(12,37,64,.08);
    border: 1px solid rgba(12,37,64,.2);
    box-shadow: inset 0 1px 3px rgba(12,37,64,.15);
  }

  /* Thumb */
  .tt-thumb {
    position: absolute;
    top: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    transition: transform .35s cubic-bezier(.34,1.56,.64,1), background .35s, box-shadow .35s;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    line-height: 1;
  }
  [data-theme="dark"] .tt-thumb {
    transform: translateX(4px);
    background: #D4AF37;
    box-shadow: 0 0 10px rgba(212,175,55,.6), 0 2px 4px rgba(0,0,0,.4);
  }
  [data-theme="light"] .tt-thumb {
    transform: translateX(26px);
    background: #0C2540;
    box-shadow: 0 2px 6px rgba(12,37,64,.3);
  }

  /* Label */
  .tt-label {
    font-family: 'Space Mono', 'Tajawal', monospace;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    transition: color .3s;
    white-space: nowrap;
  }
  [data-theme="dark"] .tt-label { color: rgba(212,175,55,.5); }
  [data-theme="light"] .tt-label { color: rgba(12,37,64,.4); }

  .tt-wrap:hover .tt-label {
    color: var(--c-gold) !important;
  }

  /* Ripple on click */
  @keyframes tt-ripple {
    0%   { transform: scale(0); opacity: .4 }
    100% { transform: scale(2.5); opacity: 0 }
  }
  .tt-ripple {
    position: absolute;
    inset: 0;
    border-radius: 13px;
    animation: tt-ripple .5s ease forwards;
    background: var(--c-gold);
    pointer-events: none;
  }
`

function injectCSS() {
  if (document.getElementById('tt-styles')) return
  const el = document.createElement('style')
  el.id = 'tt-styles'
  el.textContent = CSS
  document.head.appendChild(el)
}

import { useState, useEffect } from 'react'

export default function ThemeToggle({ showLabel = true }) {
  const { theme, toggle, isDark } = useTheme()
  const [ripple, setRipple] = useState(false)

  useEffect(() => { injectCSS() }, [])

  const handleClick = () => {
    setRipple(true)
    setTimeout(() => setRipple(false), 500)
    toggle()
  }

  return (
    <div className="tt-wrap" onClick={handleClick} role="button" aria-label="تغيير الثيم" title={isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}>
      <div className="tt-track">
        <div className="tt-thumb">
          {isDark ? '☾' : '☀'}
        </div>
        {ripple && <div className="tt-ripple" />}
      </div>
      {showLabel && (
        <span className="tt-label">
          {isDark ? 'DARK' : 'LIGHT'}
        </span>
      )}
    </div>
  )
}
