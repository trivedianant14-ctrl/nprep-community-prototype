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

// Reddit-style commenter avatar — a colored initial circle, hashed from the name so the
// same author always lands on the same color without storing a real avatar per user.
const AVATAR_COLORS = [
  { bg: PL, fg: PD },
  { bg: '#EEF0FE', fg: '#4338CA' },
  { bg: GL, fg: G },
  { bg: AL, fg: A },
  { bg: RL, fg: R },
  { bg: '#FDEEE7', fg: '#B9490A' },
]
function avatarColor(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
export function Avatar({ name, size = 28 }) {
  const c = avatarColor(name || '?')
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?'
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.42, fontWeight: 800, flexShrink: 0 }}>
      {initial}
    </span>
  )
}

// Hike-style vibrant gradients — one per room type, reused for the room's hero banner,
// its icon in every list, and (paired with a light tint) its comment bubbles.
export const ROOM_GRADIENT = {
  daily_dose: 'linear-gradient(135deg,#FF9E1B,#FF5E7E)',
  subject_room: 'linear-gradient(135deg,#1D5BF0,#7C3AED)',
  exam_room: 'linear-gradient(135deg,#F5576C,#F093FB)',
  webinar_threads: 'linear-gradient(135deg,#00B8A9,#1D5BF0)',
}
export function roomKindFromKey(roomKey) {
  if (roomKey === 'daily_dose') return 'daily_dose'
  if (roomKey === 'subject_room') return 'subject_room'
  if (roomKey === 'webinar_threads') return 'webinar_threads'
  if (roomKey && roomKey.startsWith('exam_room')) return 'exam_room'
  return 'subject_room'
}

// Chat-bubble color themes for commenters — a vibrant gradient avatar paired with a
// matching light-tint bubble background, hashed from the name so it stays stable per author.
const BUBBLE_THEMES = [
  { grad: 'linear-gradient(135deg,#FF9E1B,#FF5E7E)', bubble: '#FFF1E6' },
  { grad: 'linear-gradient(135deg,#00B8A9,#1D5BF0)', bubble: '#E3FBF6' },
  { grad: 'linear-gradient(135deg,#F5576C,#F093FB)', bubble: '#FDEAF3' },
  { grad: 'linear-gradient(135deg,#FBBF24,#F59E0B)', bubble: '#FFF6DD' },
  { grad: 'linear-gradient(135deg,#43E97B,#38F9D7)', bubble: '#E7FBF3' },
]
export const SELF_THEME = { grad: 'linear-gradient(135deg,#1D5BF0,#7C3AED)', bubble: '#EEF0FE' }
export function bubbleThemeFor(name) {
  let h = 0
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return BUBBLE_THEMES[h % BUBBLE_THEMES.length]
}

export function GradientAvatar({ name, size = 30, grad }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?'
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: grad || bubbleThemeFor(name).grad, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.42, fontWeight: 800, flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
      {initial}
    </span>
  )
}

export function CommentIcon({ size = 13, color = T2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
    </svg>
  )
}

// Instagram-style single heart — outline when not liked, filled coral when liked, with a
// light pop-scale on the liked state so the tap reads as an action, not just a toggle.
export function HeartIcon({ size = 15, liked, color = T2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={liked ? '#FF3B5C' : 'none'} stroke={liked ? '#FF3B5C' : color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: liked ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1)' }}>
      <path d="M20.8 8.6c0-3-2.2-5.4-5-5.4-1.9 0-3.6 1.1-4.6 2.9C10.2 4.3 8.5 3.2 6.6 3.2c-2.8 0-5 2.4-5 5.4 0 6.4 9.6 11.8 9.6 11.8s9.6-5.4 9.6-11.8z"/>
    </svg>
  )
}

export function ShareIcon({ size = 15, color = T2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.6" y1="10.6" x2="15.4" y2="6.4"/><line x1="8.6" y1="13.4" x2="15.4" y2="17.6"/>
    </svg>
  )
}

export function LikeButton({ liked, count, onToggle, size = 15 }) {
  return (
    <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px' }}>
      <HeartIcon size={size} liked={liked} />
      <span style={{ fontSize: 11, fontWeight: 700, color: liked ? '#FF3B5C' : T2 }}>{count > 0 ? count : 'Like'}</span>
    </button>
  )
}

// Native share sheet when available (mobile browsers), clipboard-copy fallback otherwise —
// resolves to { copied: true } so callers can show a brief "Link copied" confirmation.
export async function shareThread(thread) {
  const url = `${window.location.origin}${window.location.pathname}#thread-${thread.id}`
  const shareData = { title: thread.title, text: thread.title, url }
  if (navigator.share) {
    try { await navigator.share(shareData); return { copied: false } } catch { /* user cancelled */ return { copied: false } }
  }
  try { await navigator.clipboard.writeText(url); return { copied: true } } catch { return { copied: false } }
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
