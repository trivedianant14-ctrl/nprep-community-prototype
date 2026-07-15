// Shared color tokens + small pieces reused across screens — same palette as the
// official app reference used across the other NPrep prototypes.
export const P = '#1D5BF0', PL = '#EAF0FE', PB = '#A9C4FA', PD = '#12339B'
export const PURPLE = '#7C3AED'
export const G = '#3B6D11', GL = '#EAF3DE', GB = '#97C459'
export const R = '#791F1F', RL = '#FCEBEB', RB = '#F09595'
export const A = '#633806', AL = '#FAEEDA', AB = '#FAC775'
export const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0', BD = '#e8e8f2', BG2 = '#f5f5fb'
export const INK = '#0B1230'
export const ORANGE = '#FF9E1B', ORANGE_D = '#B96A00'

export function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.floor(ms / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  return `${day}d ago`
}

export function StatusBar() {
  return (
    <div style={{ padding: '12px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: T2 }}>
        <svg width="16" height="11" viewBox="0 0 30 20" fill="currentColor"><rect x="0" y="8" width="4" height="12" rx="1" opacity="0.4"/><rect x="7" y="5" width="4" height="15" rx="1" opacity="0.6"/><rect x="14" y="2" width="4" height="18" rx="1" opacity="0.8"/><rect x="21" y="0" width="4" height="20" rx="1"/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="currentColor"/><rect x="22" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.4"/><rect x="1.5" y="1.5" width="15" height="9" rx="1.5" fill="currentColor"/></svg>
      </div>
    </div>
  )
}

export function BackHeader({ onBack, title, right }) {
  return (
    <div style={{ padding: '12px 16px 10px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex', padding: 2 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
      </button>
      <span style={{ fontSize: 15, fontWeight: 700, color: T1, flex: 1 }}>{title}</span>
      {right}
    </div>
  )
}

export function Chip({ children, tone = 'default', ...props }) {
  const tones = {
    default: { bg: BG2, fg: T2, border: BD },
    primary: { bg: PL, fg: PD, border: PB },
    purple: { bg: '#EEF0FE', fg: '#4338CA', border: '#DBE0FB' },
    orange: { bg: '#FFF4E0', fg: ORANGE_D, border: '#FFE0AD' },
  }
  const t = tones[tone] || tones.default
  return (
    <span {...props} style={{ fontSize: 10.5, fontWeight: 700, color: t.fg, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 20, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4, ...(props.style || {}) }}>
      {children}
    </span>
  )
}
