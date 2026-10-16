// Shared color tokens + small presentation pieces reused across screens. The brand tokens
// (blue, green, red, amber, text, border) are unchanged from the original prototype; this
// file only adds the room accents and the refined presentation components built on them.
export const P = '#1D5BF0', PL = '#EAF0FE', PB = '#A9C4FA', PD = '#12339B'
export const PURPLE = '#7C3AED'
export const G = '#3B6D11', GL = '#EAF3DE', GB = '#97C459'
export const R = '#791F1F', RL = '#FCEBEB', RB = '#F09595'
export const A = '#633806', AL = '#FAEEDA', AB = '#FAC775'
export const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0', BD = '#e8e8f2', BG2 = '#f5f5fb'
export const INK = '#0B1230'
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
  subject_room: P,
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

export function FlagIcon({ size = 13, color = T2 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4"/><path d="M4 4h13l-2 4.5 2 4.5H4"/></svg>
}

// Tinted rounded-square icon tile for a room — the room's own emoji on its soft accent color.
export function RoomIcon({ kind, emoji, size = 44 }) {
  return (
    <span style={{ width: size, height: size, borderRadius: Math.round(size * 0.3), background: ROOM_TINT[kind] || BG2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(size * 0.46), flexShrink: 0 }}>
      {emoji}
    </span>
  )
}

// Small room label pill (icon + name) in the room's accent tint.
export function RoomPill({ kind, emoji, children }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: FS.tag, fontWeight: 700, color: ROOM_GRADIENT[kind] || T2, background: ROOM_TINT[kind] || BG2, borderRadius: 20, padding: '3px 9px', lineHeight: 1.3 }}>
      <span style={{ fontSize: 11 }}>{emoji}</span>{children}
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
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={liked ? '#E5385A' : 'none'} stroke={liked ? '#E5385A' : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: liked ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1)' }}>
      <path d="M20.8 8.6c0-3-2.2-5.4-5-5.4-1.9 0-3.6 1.1-4.6 2.9C10.2 4.3 8.5 3.2 6.6 3.2c-2.8 0-5 2.4-5 5.4 0 6.4 9.6 11.8 9.6 11.8s9.6-5.4 9.6-11.8z"/>
    </svg>
  )
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
      <span style={{ fontSize: FS.meta, fontWeight: 600, color: liked ? '#E5385A' : T2 }}>{count > 0 ? count : 'Like'}</span>
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
