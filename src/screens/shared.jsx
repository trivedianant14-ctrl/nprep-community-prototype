import { useEffect, useId, useRef, useState } from 'react'

// Official NPrep theme, sampled from the real app designs: navy primary buttons (#131B63), azure
// accent for links / active states (#008DFF), and a pale blue page (#F2F8FF) with soft blue tints.
// P is the navy used for filled buttons and active nav; PD is the azure used for links and
// selected chips; PL / PB are the soft tint and its border.
export const NAVY = '#131B63', AZ = '#008DFF', PAGE = '#F2F8FF'
export const P = NAVY, PL = '#E8F2FF', PB = '#B2D9FF', PD = AZ
export const PURPLE = '#7C3AED'
export const G = '#1E9E57', GL = '#E3F7EC', GB = '#8FD7AF'
export const R = '#D6322E', RL = '#FDECEC', RB = '#F4A9A7'
export const A = '#8A5300', AL = '#FFF1D6', AB = '#FAC775'
export const T1 = '#1B1F2E', T2 = '#5E6578', T3 = '#9AA1B2', BD = '#E3EAF6', BG2 = '#F2F8FF'
export const INK = '#0D0F1A'
export const ORANGE = '#FF9E1B', ORANGE_D = '#B96A00'

// Type scale — one place for the sizes used across the student app, so headings, body copy
// and metadata read the same on every screen.
export const FS = { title: 18, heading: 16, body: 13.5, small: 12, meta: 11, tag: 10.5 }

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

export function BackIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6"/></svg>
}

export function BackHeader({ onBack, title, right }) {
  return (
    <div style={{ padding: '8px 12px 8px 6px', display: 'flex', alignItems: 'center', gap: 4, borderBottom: `1px solid ${BD}`, flexShrink: 0, minHeight: 54 }}>
      <button onClick={onBack} className="icon-btn" aria-label="Back" style={{ width: 40, height: 40, borderRadius: 12, background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BackIcon />
      </button>
      <span style={{ fontSize: FS.heading, fontWeight: 700, color: INK, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
      {right}
    </div>
  )
}

// Commenter avatar — a flat tinted circle with the author's initial, hashed from the name
// so the same author always lands on the same color without storing a real avatar per user.
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

// One muted accent per room type, used for its icon tile, join button, send button and
// tags. ROOM_GRADIENT keeps its original export name (many screens read it) but now holds
// a single solid accent instead of a gradient.
export const ROOM_GRADIENT = {
  daily_dose: '#D97706',
  subject_room: AZ,
  exam_room: PURPLE,
  webinar_threads: '#0F8F84',
  yt_lectures: '#D6204A',
  recent_updates: '#4F46E5',
  nursing_jobs: '#2F8A57',
}
export const ROOM_TINT = {
  daily_dose: '#FFF3DD',
  subject_room: PL,
  exam_room: '#F1EAFE',
  webinar_threads: '#DDF4F1',
  yt_lectures: '#FDE7EC',
  recent_updates: '#EBEAFD',
  nursing_jobs: '#E3F4EA',
}
const SIMPLE_ROOM_KINDS = ['daily_dose', 'subject_room', 'webinar_threads', 'yt_lectures', 'recent_updates', 'nursing_jobs']
export function roomKindFromKey(roomKey) {
  if (SIMPLE_ROOM_KINDS.includes(roomKey)) return roomKey
  if (roomKey && roomKey.startsWith('exam_room')) return 'exam_room'
  return 'subject_room'
}

// A contributor's post is held until NPrep approves it: students only see 'approved' posts,
// plus the author sees their own 'pending' one (tagged as waiting). Rejected posts never show.
export function isVisibleToStudent(t) {
  if (t.hidden) return false
  if (!t.approvalStatus || t.approvalStatus === 'approved') return true
  return t.approvalStatus === 'pending' && t.authorKey === 'demo'
}

// Exam rooms are keyed by the backend (the exam list is a backend setting).
export function examRoomKeyFor(state, exam) {
  return exam ? state.examRoomKeys?.[exam] || null : null
}

// Blue check next to NPrep Team — the official-account mark (LinkedIn/Reddit pattern).
export function VerifiedIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Official NPrep account" style={{ flexShrink: 0 }}>
      <path fill={P} d="M12 2l2.4 2.1 3.2-.2.9 3.1 2.7 1.8-1.1 3 1.1 3-2.7 1.8-.9 3.1-3.2-.2L12 22l-2.4-2.1-3.2.2-.9-3.1L2.8 15l1.1-3-1.1-3 2.7-1.8.9-3.1 3.2.2z"/>
      <polyline points="8.5,12 11,14.5 15.5,9.5" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function SearchIcon({ size = 20, color = 'currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
}

export function ChevronRight({ size = 16, color = T3 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6"/></svg>
}

export function FlagIcon({ size = 13, color = T2 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4"/><path d="M4 4h13l-2 4.5 2 4.5H4"/></svg>
}

// Line glyphs per room (used by RoomGlyph in the small room tags).
const ROOM_ART = {
  daily_dose: { g: ['#FFD36B', '#F28C05'], d: <path d="M12 2.8c.9 3.3 4.6 5.1 4.6 9.4A4.6 4.6 0 0112 17a4.6 4.6 0 01-4.6-4.8c0-2 .9-3.1 2-4.3.3 1.3 1 2 1.7 2.2C10.9 8 10.9 5.3 12 2.8z" /> },
  subject_room: { g: ['#6CC0FF', '#1E7CFF'], d: <><path d="M3.5 5.8C6.3 4.7 9.4 5 12 6.8c2.6-1.8 5.7-2.1 8.5-1v12.6c-2.8-1.1-5.9-.8-8.5 1-2.6-1.8-5.7-2.1-8.5-1z" /><path d="M12 6.8v12.6" /></> },
  exam_room: { g: ['#B39BFF', '#6B4EE6'], d: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.6" /><circle cx="12" cy="12" r="1.2" fill="#fff" /></> },
  webinar_threads: { g: ['#5ED6C6', '#12A594'], d: <><rect x="3" y="6.5" width="13" height="11" rx="2.6" /><path d="M16 10.5l5-3v9l-5-3z" /></> },
  yt_lectures: { g: ['#FF9EC1', '#E9457E'], d: <><rect x="3" y="4.8" width="18" height="12.6" rx="3.2" /><path d="M10.2 8.8l4.8 2.7-4.8 2.7z" fill="#fff" /><path d="M8 20.8h8" /></> },
  recent_updates: { g: ['#7E89F0', '#2E3AB0'], d: <><path d="M4 9.8v4.4h3.2l7.3 4.1V5.7L7.2 9.8z" /><path d="M17.4 9.2a3.7 3.7 0 010 5.6" /></> },
  nursing_jobs: { g: ['#6EDC9A', '#1E9E57'], d: <><rect x="3.5" y="7.5" width="17" height="12" rx="2.6" /><path d="M9 7.5V6a1.6 1.6 0 011.6-1.6h2.8A1.6 1.6 0 0115 6v1.5M3.5 13h17" /></> },
}
// Room icons in the official NPrep subject-icon style: a pale-blue gradient tile holding a small
// glossy all-blue object (cobalt, azure, navy, with white highlights) — one object per room.
const OBJ_SHADOW = <ellipse cx="24" cy="40.5" rx="11" ry="2.4" fill="#1769E8" opacity=".16" />
function objectFor(kind, u) {
  const b1 = `url(#b1${u})`, b2 = `url(#b2${u})`, hi = `url(#hi${u})`
  switch (kind) {
    case 'daily_dose': // flame
      return <>{OBJ_SHADOW}
        <path d="M24 8.5c1.7 5.4 8.2 8 8.2 16.6a8.2 8.2 0 01-16.4 0c0-3.7 1.6-5.9 3.4-8.2.5 2 1.6 3.2 2.8 3.6C21.3 15.6 21 12 24 8.5z" fill={b1} />
        <path d="M24 8.5c1.7 5.4 8.2 8 8.2 16.6a8.2 8.2 0 01-16.4 0c0-3.7 1.6-5.9 3.4-8.2.5 2 1.6 3.2 2.8 3.6C21.3 15.6 21 12 24 8.5z" fill={hi} />
        <path d="M24 22c1 2.6 3.9 3.9 3.9 7.4a3.9 3.9 0 01-7.8 0c0-1.7.8-2.7 1.7-3.7.5 1 1 1.5 1.6 1.7-.8-2-.6-3.8.6-5.4z" fill="#fff" opacity=".9" /></>
    case 'subject_room': // open book
      return <>{OBJ_SHADOW}
        <path d="M7.5 17.5C14 14.8 20 15.6 24 18.8c4-3.2 10-4 16.5-1.3v18.3c-6.500-2.700-12.500-1.900-16.500 1.300-4-3.200-10-4-16.500-1.300z" fill={b2} />
        <path d="M10 15.2c5.400-1.900 10.600-1 14 2v17c-3.400-3-8.600-3.900-14-2z" fill="#fff" />
        <path d="M38 15.2c-5.400-1.900-10.600-1-14 2v17c3.400-3 8.600-3.900 14-2z" fill="#EAF4FF" />
        <path d="M13 20.500c3-.8 6-.4 8.500 1M13 25c3-.8 6-.4 8.500 1M27 21.500c2.500-1.400 5.500-1.800 8.500-1M27 26c2.500-1.400 5.500-1.800 8.500-1" stroke="#7DBBFF" strokeWidth="1.500" strokeLinecap="round" fill="none" />
        <path d="M24 17.500v17" stroke="#131B63" strokeWidth="1.200" opacity=".4" /></>
    case 'exam_room': // clipboard with checklist
      return <>{OBJ_SHADOW}
        <rect x="12.500" y="10" width="23" height="28" rx="4.500" fill={b1} />
        <rect x="12.500" y="10" width="23" height="14" rx="4.500" fill={hi} />
        <rect x="15.500" y="14.500" width="17" height="20.500" rx="2.500" fill="#fff" />
        <rect x="18.500" y="7.500" width="11" height="6.500" rx="2.500" fill={b2} />
        <path d="M18.500 21l1.500 1.500 2.700-3M18.500 27.500l1.500 1.500 2.700-3" stroke="#1E7CFF" strokeWidth="1.600" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M25 21h5.500M25 27.500h5.500" stroke="#7DBBFF" strokeWidth="1.800" strokeLinecap="round" /></>
    case 'webinar_threads': // video camera
      return <>{OBJ_SHADOW}
        <rect x="8" y="14.500" width="23" height="19" rx="5.500" fill={b1} />
        <rect x="8" y="14.500" width="23" height="9" rx="5.500" fill={hi} />
        <path d="M31.500 21.500l8.500-5v15l-8.500-5z" fill={b2} />
        <circle cx="14.500" cy="20.500" r="2.200" fill="#fff" />
        <rect x="14" y="26" width="11" height="2.600" rx="1.300" fill="#fff" opacity=".55" /></>
    case 'yt_lectures': // monitor with play button
      return <>{OBJ_SHADOW}
        <rect x="7.500" y="10" width="33" height="23" rx="4.500" fill={b2} />
        <rect x="9.500" y="12" width="29" height="19" rx="3" fill={b1} />
        <rect x="9.500" y="12" width="29" height="9.500" rx="3" fill={hi} />
        <path d="M21 16.500v10l9-5z" fill="#fff" />
        <rect x="21" y="33" width="6" height="3.500" fill="#4B7BE8" />
        <rect x="15.500" y="36" width="17" height="3" rx="1.500" fill={b2} /></>
    case 'recent_updates': // megaphone
      return <>{OBJ_SHADOW}
        <path d="M8 19.500a2 2 0 012-2h7l15-7.500v26L17 28.500h-7a2 2 0 01-2-2z" fill={b1} />
        <path d="M8 19.500a2 2 0 012-2h7l15-7.500v10H8z" fill={hi} />
        <ellipse cx="32" cy="23" rx="2.400" ry="13" fill={b2} />
        <rect x="12" y="27" width="5.500" height="9" rx="2.200" fill={b2} />
        <path d="M37 18a7 7 0 010 10M40 14.500a12 12 0 010 17" stroke="#5DB2FF" strokeWidth="2" strokeLinecap="round" fill="none" /></>
    case 'nursing_jobs': // briefcase
    default:
      return <>{OBJ_SHADOW}
        <path d="M18 17v-3.500a3 3 0 013-3h6a3 3 0 013 3V17" stroke={b2} strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="7.500" y="16" width="33" height="22" rx="5.500" fill={b1} />
        <rect x="7.500" y="16" width="33" height="11" rx="5.500" fill={hi} />
        <rect x="7.500" y="26" width="33" height="3" fill={b2} opacity=".4" />
        <rect x="21" y="23.500" width="6" height="8" rx="2" fill="#fff" />
        <circle cx="24" cy="27.500" r="1.200" fill="#131B63" /></>
  }
}
export function RoomIcon({ kind, size = 44, style, className }) {
  const u = useId().replace(/:/g, '')
  return (
    <span className={className} style={{ width: size, height: size, display: 'inline-flex', flexShrink: 0, ...style }}>
      <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`bg${u}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D0E8FF" /><stop offset="1" stopColor="#EEF6FF" /></linearGradient>
          <linearGradient id={`b1${u}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5DB2FF" /><stop offset="1" stopColor="#1769E8" /></linearGradient>
          <linearGradient id={`b2${u}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3E5FDC" /><stop offset="1" stopColor="#131B63" /></linearGradient>
          <linearGradient id={`hi${u}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".5" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        </defs>
        <rect x="1.500" y="1.500" width="45" height="45" rx="14" fill={`url(#bg${u})`} />
        {objectFor(kind, u)}
      </svg>
    </span>
  )
}

// Bare line glyph of a room (for pills and small labels), in the room's accent colour.
export function RoomGlyph({ kind, size = 13, color }) {
  const a = ROOM_ART[kind] || ROOM_ART.subject_room
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || ROOM_GRADIENT[kind] || 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>{a.d}</svg>
  )
}

// Small room label pill (icon + name) in the room's accent tint.
export function RoomPill({ kind, children }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: FS.tag, fontWeight: 600, color: ROOM_GRADIENT[kind] || T2, background: ROOM_TINT[kind] || BG2, borderRadius: 20, padding: '3px 10px 3px 8px', lineHeight: 1.3 }}>
      <RoomGlyph kind={kind} size={12} />{children}
    </span>
  )
}

// Commenter theme — kept for callers that still ask for a theme; flat tint + ink, no gradient.
const BUBBLE_THEMES = AVATAR_COLORS.map(c => ({ grad: c.bg, fg: c.fg, bubble: c.bg }))
export const SELF_THEME = { grad: PL, fg: PD, bubble: PL }
export function bubbleThemeFor(name) {
  let h = 0
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return BUBBLE_THEMES[h % BUBBLE_THEMES.length]
}

export function GradientAvatar({ name, size = 30, grad }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?'
  const theme = bubbleThemeFor(name)
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: grad || theme.grad, color: theme.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.42, fontWeight: 800, flexShrink: 0 }}>
      {initial}
    </span>
  )
}

export function CommentIcon({ size = 13, color = T2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
    </svg>
  )
}

// Single heart — outline when not liked, filled coral when liked, with a light pop-scale
// on the liked state so the tap reads as an action, not just a toggle.
export function HeartIcon({ size = 15, liked, color = T2 }) {
  // Pop only when the heart is toggled on — not for hearts that are already liked on first paint.
  const mounted = useRef(false)
  useEffect(() => { mounted.current = true }, [])
  const burst = liked && mounted.current
  return (
    <span className="heart-wrap">
      <svg width={size} height={size} viewBox="0 0 24 24" fill={liked ? '#E5385A' : 'none'} stroke={liked ? '#E5385A' : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: liked ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1), fill 0.2s, stroke 0.2s', animation: burst ? 'heartPop 0.45s cubic-bezier(0.34,1.56,0.64,1)' : 'none' }}>
        <path d="M20.8 8.6c0-3-2.2-5.4-5-5.4-1.9 0-3.6 1.1-4.6 2.9C10.2 4.3 8.5 3.2 6.6 3.2c-2.8 0-5 2.4-5 5.4 0 6.4 9.6 11.8 9.6 11.8s9.6-5.4 9.6-11.8z"/>
      </svg>
      {burst && (
        <span className="heart-burst" aria-hidden="true">
          {[0, 60, 120, 180, 240, 300].map((a, i) => <i key={a} style={{ '--a': `${a}deg`, '--c': ['#E5385A', '#FF9EB0', '#FFB020'][i % 3] }} />)}
        </span>
      )}
    </span>
  )
}

// Number that bumps (rises into place) whenever its value changes — but not on first paint.
function Count({ value }) {
  const prev = useRef(value)
  const changed = prev.current !== value
  useEffect(() => { prev.current = value }, [value])
  return <span key={value} className={changed ? 'count-bump' : undefined}>{value}</span>
}

export function ShareIcon({ size = 15, color = T2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.6" y1="10.6" x2="15.4" y2="6.4"/><line x1="8.6" y1="13.4" x2="15.4" y2="17.6"/>
    </svg>
  )
}

export function LikeButton({ liked, count, onToggle, size = 15 }) {
  return (
    <button onClick={onToggle} className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px', borderRadius: 8 }}>
      <HeartIcon size={size} liked={liked} />
      <span style={{ fontSize: FS.meta, fontWeight: 600, color: liked ? '#E5385A' : T2 }}>{count > 0 ? <Count value={count} /> : 'Like'}</span>
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

export function PaperclipIcon({ size = 15, color = T2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a5.5 5.5 0 01-7.78-7.78l9.19-9.19a3.67 3.67 0 015.19 5.19l-9.2 9.19a1.83 1.83 0 01-2.59-2.59l8.49-8.48"/>
    </svg>
  )
}

const MAX_ATTACHMENT_BYTES = 100 * 1024 * 1024
export const ATTACHMENT_ACCEPT = 'image/*,video/*,application/pdf'

function attachmentTypeFor(mime) {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime === 'application/pdf') return 'pdf'
  return null
}

// Uploads an image/video/PDF straight from the browser to Vercel Blob via a short-lived
// client token (api/blob/upload.js issues it) — bypasses the function body-size limit a
// proxied upload would hit. Shared by the CMS attachment field (any room) and the student
// reply composer in Webinar Threads.
export async function uploadAttachment(file) {
  const type = attachmentTypeFor(file.type)
  if (!type) throw new Error('Only images, videos, or PDFs can be attached')
  if (file.size > MAX_ATTACHMENT_BYTES) throw new Error('File must be under 100MB')
  const { upload } = await import('@vercel/blob/client')
  const blob = await upload(file.name, file, { access: 'public', handleUploadUrl: '/api/blob/upload' })
  return { url: blob.url, name: file.name, type }
}

function FileIcon({ color = '#D6204A' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
    </svg>
  )
}
function DownloadIcon({ color = P }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

// Renders whatever kind of media is attached to a thread or reply — an inline image, an
// inline video player, or a tappable PDF card. `type` is the persisted attachment_type;
// falls back to sniffing the file extension for older rows saved before that column existed.
export function AttachmentPreview({ url, name, type }) {
  if (!url) return null
  const kind = type || (/\.(png|jpe?g|gif|webp)$/i.test(url) ? 'image' : /\.(mp4|webm|mov)$/i.test(url) ? 'video' : 'pdf')

  if (kind === 'image') {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', maxWidth: '100%' }}>
        <img src={url} alt={name || 'Attached image'} style={{ display: 'block', maxWidth: '100%', maxHeight: 260, borderRadius: 12, border: `1px solid ${BD}` }} />
      </a>
    )
  }
  if (kind === 'video') {
    return (
      <video src={url} controls style={{ display: 'block', width: '100%', maxHeight: 260, borderRadius: 12, background: '#000' }} />
    )
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', border: `1px solid ${BD}`, borderRadius: 12, padding: '9px 12px', textDecoration: 'none', maxWidth: '100%' }}>
      <span style={{ width: 32, height: 32, borderRadius: 8, background: '#FDE7EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FileIcon /></span>
      <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: FS.small, fontWeight: 600, color: T1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name || 'Attachment.pdf'}</span>
        <span style={{ fontSize: 10, color: T3, fontWeight: 600 }}>PDF</span>
      </span>
    </a>
  )
}

// Small pulsing "LIVE" pill — a webinar thread whose starts_at has passed but hasn't
// archived yet. Distinct from the "Hot" flair (recency) — this means happening right now.
export function LiveBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: '#C81E4A', background: '#FDE7EC', borderRadius: 20, padding: '3px 9px', letterSpacing: '0.03em' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E11D48', animation: 'livePulse 1.6s infinite' }} />
      LIVE
    </span>
  )
}

// Secondary downloadable file — e.g. lecture notes, session slides — kept separate from
// the primary media attachment (which is previewed inline via AttachmentPreview).
export function ResourceLink({ url, name }) {
  if (!url) return null
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" download
      style={{ display: 'flex', alignItems: 'center', gap: 10, background: PL, border: `1px solid ${PB}`, borderRadius: 12, padding: '9px 12px', textDecoration: 'none', maxWidth: '100%' }}>
      <span style={{ width: 32, height: 32, borderRadius: 8, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><DownloadIcon /></span>
      <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: FS.small, fontWeight: 600, color: PD, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name || 'Download'}</span>
        <span style={{ fontSize: 10, color: P, fontWeight: 600 }}>Download</span>
      </span>
    </a>
  )
}

// NPrep's real app icon (fetched from the App Store listing) — shown wherever an
// official/endorsement mark is needed. On a comment NPrep Team has liked, this renders
// on its own next to the like control, no text label.
export function NPrepMark({ size = 16 }) {
  return (
    <img src="/nprep-logo.jpg" alt="Liked by NPrep Team" title="Liked by NPrep Team"
      style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }} />
  )
}

// Contributor tier badge next to an author's name — highest tier only. Three ranked names:
// Active (10+) < Top (15+, pending approval) < Verified (15+, approved to post).
const TIER_ICON = {
  verified: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 2.1 3.2-.2.9 3.1 2.7 1.8-1.1 3 1.1 3-2.7 1.8-.9 3.1-3.2-.2L12 22l-2.4-2.1-3.2.2-.9-3.1L2.8 15l1.1-3-1.1-3 2.7-1.8.9-3.1 3.2.2z"/><polyline points="8.5,12 11,14.5 15.5,9.5"/></svg>,
  top: <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15,9 22,9.5 16.7,14.2 18.4,21.5 12,17.6 5.6,21.5 7.3,14.2 2,9.5 9,9"/></svg>,
  active: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z"/></svg>,
}
const TIER_STYLE = {
  verified: { fg: '#1D4ED8', bg: '#E3EDFE', label: 'Verified Contributor' },
  top: { fg: '#92400E', bg: '#FDEFC9', label: 'Top Contributor' },
  active: { fg: '#0F766E', bg: '#DDF4F1', label: 'Active Contributor' },
}
export function ContributorBadge({ tier }) {
  const s = TIER_STYLE[tier]
  if (!s) return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: s.fg, background: s.bg, borderRadius: 20, padding: '2px 8px' }}>
      {TIER_ICON[tier]}{s.label}
    </span>
  )
}

export function contributorTier(contributor) {
  if (!contributor) return null
  if (contributor.approvedToPost) return 'verified'
  if (contributor.isEligible) return 'top'
  if (contributor.isActiveContributor) return 'active'
  return null
}

// "OP" (original poster) tag — this commenter authored the thread itself.
export function OPBadge() {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: '#6D28D9', background: '#EDE4FF', borderRadius: 20, padding: '2px 8px' }}>OP</span>
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
    <span {...props} style={{ fontSize: FS.tag, fontWeight: 700, color: t.fg, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 20, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4, ...(props.style || {}) }}>
      {children}
    </span>
  )
}

// Subject / topic tag on a thread — neutral outline pill (blue when it is a subject tag).
export function TagPill({ children, tone = 'subject' }) {
  const s = tone === 'poll'
    ? { fg: '#8A5300', bg: '#FFF1D6' }
    : tone === 'neutral'
      ? { fg: T2, bg: BG2 }
      : { fg: PD, bg: PL }
  return <span style={{ fontSize: FS.tag, fontWeight: 700, color: s.fg, background: s.bg, borderRadius: 20, padding: '3px 9px', lineHeight: 1.3 }}>{children}</span>
}

// Empty / restricted state card — icon, title and a short explanation.
export function EmptyState({ icon, title, children }) {
  return (
    <div style={{ textAlign: 'center', padding: '36px 24px' }}>
      {icon && <div style={{ width: 52, height: 52, borderRadius: 16, background: BG2, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{icon}</div>}
      {title && <div style={{ fontSize: FS.body, fontWeight: 700, color: INK, marginBottom: 4 }}>{title}</div>}
      <div style={{ fontSize: FS.small, color: T3, lineHeight: 1.5 }}>{children}</div>
    </div>
  )
}

// Join / Joined — the official NPrep pill treatment. Not joined: navy filled pill with a plus (same
// family as "Join Now" / "Answer Now"). Joined: soft azure pill with a check badge, azure text and a
// light blue border. Sizes: lg (full-width hero), md, sm, xs (inside tappable cards, as a span).
const JOIN_SIZES = {
  lg: { h: 46, fs: 14, px: 22, r: 23, ic: 20, gap: 9 },
  md: { h: 36, fs: 12.5, px: 18, r: 18, ic: 16, gap: 7 },
  sm: { h: 30, fs: 11.5, px: 14, r: 15, ic: 15, gap: 6 },
  xs: { h: 24, fs: 10.5, px: 10, r: 12, ic: 13, gap: 4 },
}
export function JoinButton({ joined, onToggle, size = 'md', label = 'Join room', joinedLabel = 'Joined', as = 'button' }) {
  const z = JOIN_SIZES[size]
  const Tag = as
  const style = {
    height: z.h, padding: `0 ${z.px}px`, borderRadius: z.r, fontSize: z.fs, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
    width: size === 'lg' ? '100%' : undefined, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: z.gap, cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s',
    ...(joined
      ? { background: '#EAF6FF', color: AZ, border: '1.5px solid #BFE0FF', boxShadow: 'none' }
      : { background: NAVY, color: '#fff', border: '1.5px solid transparent', boxShadow: size === 'lg' ? '0 8px 18px rgba(19,27,99,0.28)' : size === 'xs' ? 'none' : '0 4px 10px rgba(19,27,99,0.22)' }),
  }
  const icon = joined ? (
    <span key="on" className="pop-in" style={{ width: z.ic, height: z.ic, borderRadius: '50%', background: AZ, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={z.ic * 0.6} height={z.ic * 0.6} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="4,12.5 10,18 20,6.5" /></svg>
    </span>
  ) : (
    <svg key="off" width={z.ic - 3} height={z.ic - 3} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round"><line x1="12" y1="4.5" x2="12" y2="19.5" /><line x1="4.5" y1="12" x2="19.5" y2="12" /></svg>
  )
  const props = as === 'button' ? { onClick: e => { e.stopPropagation(); onToggle?.() }, 'aria-pressed': !!joined } : {}
  return (
    <Tag {...props} className="pill-btn pop-on" data-on={!!joined} style={style}>
      {icon}{joined ? joinedLabel : label}
    </Tag>
  )
}

// ---------- Join feedback: a toast (room icon + Undo) and a short chime ----------
let toastSetter = null
export function showToast(t) { toastSetter?.({ id: Date.now() + Math.random(), ...t }) }

// Two soft sine notes (E5 → A5) synthesised with the Web Audio API — no audio file needed. Called
// straight from the tap, so the browser allows it. Fails silently where audio is unavailable.
let audioCtx = null
export function playJoinSound() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    audioCtx = audioCtx || new AC()
    if (audioCtx.state === 'suspended') audioCtx.resume()
    const t0 = audioCtx.currentTime
    ;[[659.25, 0, 0.2], [880, 0.1, 0.34]].forEach(([freq, delay, len]) => {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, t0 + delay)
      gain.gain.exponentialRampToValueAtTime(0.16, t0 + delay + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + len)
      osc.connect(gain).connect(audioCtx.destination)
      osc.start(t0 + delay)
      osc.stop(t0 + delay + len + 0.03)
    })
    navigator.vibrate?.(12)
  } catch { /* audio unavailable — the toast still shows */ }
}

export function ToastHost({ lift = 0 }) {
  const [t, setT] = useState(null)
  useEffect(() => { toastSetter = setT; return () => { if (toastSetter === setT) toastSetter = null } }, [])
  const life = t?.undo ? 4600 : 2800
  useEffect(() => {
    if (!t) return
    const id = setTimeout(() => setT(null), life)
    return () => clearTimeout(id)
  }, [t, life])
  if (!t) return null
  return (
    <div key={t.id} className="toast-up" role="status" aria-live="polite"
      style={{ position: 'absolute', left: 12, right: 12, bottom: 14 + lift, zIndex: 130, display: 'flex', alignItems: 'center', gap: 11, background: NAVY, color: '#fff', borderRadius: 18, padding: '10px 12px 12px 10px', boxShadow: '0 12px 28px rgba(19,27,99,0.38)', overflow: 'hidden' }}>
      {t.roomKind
        ? <RoomIcon kind={t.roomKind} size={38} />
        : <span style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.14)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 17 }}>👋</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{t.title}</div>
        {t.sub && <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2, lineHeight: 1.35 }}>{t.sub}</div>}
      </div>
      {t.undo && (
        <button onClick={() => { t.undo(); setT(null) }} className="pill-btn" style={{ flexShrink: 0, background: 'rgba(255,255,255,0.16)', color: '#fff', border: 'none', borderRadius: 14, padding: '6px 13px', fontSize: 11.5, fontWeight: 600 }}>Undo</button>
      )}
      <span className="toast-timer" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2.5, background: AZ, animationDuration: `${life}ms` }} />
    </div>
  )
}

// Card gradients in each room's colour family: a tinted top that fades to white (the official card
// look). 'strong' is for standalone cards; 'soft' for dense list cards like feed posts.
export const ROOM_GRAD_TOP = {
  daily_dose: '#FFE2B0',
  subject_room: '#C6E4FF',
  exam_room: '#DDD0FF',
  webinar_threads: '#BDEFE6',
  yt_lectures: '#FFCFDF',
  recent_updates: '#D0D6FF',
  nursing_jobs: '#C9EFD8',
}
export const CARD_BORDER = '#DCE5F3'
export function roomGradient(kind, strength = 'strong') {
  const top = strength === 'soft' ? (ROOM_TINT[kind] || '#EAF4FF') : (ROOM_GRAD_TOP[kind] || '#C6E4FF')
  return `linear-gradient(180deg, ${top} 0%, #FFFFFF ${strength === 'soft' ? 52 : 62}%)`
}
