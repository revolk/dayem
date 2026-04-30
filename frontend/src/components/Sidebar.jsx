import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const useWindowWidth = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

export default function Sidebar({ active }) {
  const nav = useNavigate()
  const w = useWindowWidth()
  const isMobile = w < 1024
  const [open, setOpen] = useState(false)
  const merchant = JSON.parse(localStorage.getItem('dayem_merchant') || '{}')

  const logout = () => {
    localStorage.removeItem('dayem_token')
    localStorage.removeItem('dayem_merchant')
    window.location.href = '/login'
  }

  const links = [
    { id: 'dashboard', label: 'الرئيسية',     icon: '◈', path: '/dashboard' },
    { id: 'products',  label: 'المنتجات',     icon: '◆', path: '/dashboard/products' },
    { id: 'orders',    label: 'الطلبات',      icon: '◉', path: '/dashboard/orders' },
    { id: 'coupons',   label: 'الكوبونات',    icon: '🎫', path: '/dashboard/coupons' },
    { id: 'analytics', label: 'التحليلات',    icon: '◎', path: '/dashboard/analytics' },
    { id: 'settings',  label: 'الإعدادات',    icon: '◎', path: '/dashboard/settings' },
  ]

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Tajawal', direction: 'rtl' }}>
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', flexShrink: 0 }} />

      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,.05)', flexShrink: 0 }}>
        <div onClick={() => { nav('/dashboard'); setOpen(false) }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, border: '1.5px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#D4AF37', flexShrink: 0 }}>∞</div>
          <div>
            <div style={{ fontSize: '.95rem', fontWeight: 900, color: '#fff', letterSpacing: 2, lineHeight: 1.1 }}>دايم</div>
            <div style={{ fontSize: '.4rem', letterSpacing: 3, color: '#D4AF37', textTransform: 'uppercase' }}>DAYEM</div>
          </div>
        </div>
      </div>

      {/* Store info */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,.04)', flexShrink: 0 }}>
        <div style={{ fontSize: '.55rem', letterSpacing: 2, color: 'rgba(255,255,255,.22)', textTransform: 'uppercase', marginBottom: 5 }}>متجر</div>
        <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#fff', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{merchant?.store?.name}</div>
        <div style={{ fontSize: '.62rem', color: 'rgba(212,175,55,.45)', direction: 'ltr', textAlign: 'right' }}>/{merchant?.store?.slug}</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {links.map(l => (
          <div key={l.id} onClick={() => { nav(l.path); setOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', cursor: 'pointer', background: active === l.id ? 'rgba(212,175,55,.07)' : 'transparent', borderRight: active === l.id ? '2px solid #D4AF37' : '2px solid transparent', transition: 'all .2s' }}
            onMouseEnter={e => { if (active !== l.id) e.currentTarget.style.background = 'rgba(255,255,255,.03)' }}
            onMouseLeave={e => { if (active !== l.id) e.currentTarget.style.background = 'transparent' }}>
            <span style={{ fontSize: '.95rem', color: active === l.id ? '#D4AF37' : 'rgba(255,255,255,.3)', flexShrink: 0 }}>{l.icon}</span>
            <span style={{ fontSize: '.85rem', fontWeight: active === l.id ? 700 : 400, color: active === l.id ? '#fff' : 'rgba(255,255,255,.4)' }}>{l.label}</span>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.05)', padding: '14px 20px', flexShrink: 0 }}>
        <div onClick={() => { window.open(`/store/${merchant?.store?.slug}`, '_blank'); setOpen(false) }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'rgba(212,175,55,.06)', border: '1px solid rgba(212,175,55,.12)', cursor: 'pointer', marginBottom: 12 }}>
          <span style={{ fontSize: '.8rem', color: '#D4AF37' }}>◈</span>
          <span style={{ fontSize: '.75rem', fontWeight: 700, color: '#D4AF37' }}>عرض المتجر</span>
          <span style={{ marginRight: 'auto', fontSize: '.7rem', color: 'rgba(212,175,55,.4)' }}>←</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#D4AF37,#A88C2A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 900, color: '#0C2540', flexShrink: 0 }}>
            {merchant?.name?.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '.75rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{merchant?.name}</div>
            <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.22)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{merchant?.email}</div>
          </div>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.22)', cursor: 'pointer', fontSize: '.68rem', fontFamily: 'Tajawal', flexShrink: 0, transition: 'color .2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#FCA5A5'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.22)'}>
            خروج
          </button>
        </div>
      </div>
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,.2), transparent)', flexShrink: 0 }} />
    </div>
  )

  if (isMobile) return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 52, background: '#070D1A', borderBottom: '1px solid rgba(212,175,55,.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 200, fontFamily: 'Tajawal', direction: 'rtl' }}>
        <button onClick={() => setOpen(true)} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#D4AF37', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
          ☰
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: '.95rem', fontWeight: 900, color: '#fff', letterSpacing: 2 }}>دايم</div>
          <span style={{ color: '#D4AF37', fontSize: '.8rem' }}>∞</span>
        </div>
        <div style={{ fontSize: '.7rem', color: 'rgba(212,175,55,.6)', fontWeight: 700 }}>
          {links.find(l => l.id === active)?.label}
        </div>
      </div>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
          <div onClick={() => setOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 260, background: '#070D1A', borderLeft: '1px solid rgba(212,175,55,.1)' }}>
            <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.4)', width: 30, height: 30, cursor: 'pointer', fontSize: '.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>✕</button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 240, background: '#070D1A', borderLeft: '1px solid rgba(212,175,55,.1)', zIndex: 50 }}>
      <SidebarContent />
    </div>
  )
}
