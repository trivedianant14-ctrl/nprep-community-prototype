import { useId } from 'react'

// Small vector art for the Community entry on Home (the official "NPrep COMMUNITY" orbit): student
// portraits, a calendar, a bell and a chat bubble drifting around the NPrep logo.

export function Portrait({ size = 64, skin = '#E7B08E', hair = '#2B1B17', shirt = '#111827', long = true, bg = 'soft', radius = 14, style }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ borderRadius: radius, flexShrink: 0, display: 'block', ...style }}>
      <defs>
        <linearGradient id={`bg${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E6F2FF" /><stop offset="1" stopColor="#B9DBFF" /></linearGradient>
      </defs>
      {bg !== 'none' && <rect width="100" height="100" fill={`url(#bg${id})`} />}
      <path d="M8 100C10 79 29 71 50 71s40 8 42 29z" fill={shirt} />
      <path d="M43 60h14v13c-4 4-10 4-14 0z" fill={skin} />
      {long && <path d="M25 52C22 30 35 16 50 16s28 14 25 36c-1 14-2 24-7 30H32c-5-6-6-16-7-30z" fill={hair} />}
      <ellipse cx="50" cy="48" rx="15" ry="18" fill={skin} />
      <path d={long ? 'M33 46C32 31 43 25 52 27c9 2 15 9 15 19-6-8-20-10-34 0z' : 'M34 44C33 30 42 24 52 25c9 1 15 8 14 19-5-7-14-8-32 0z'} fill={hair} />
      <path d="M44 56q6 4 12 0" stroke="#B9654F" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

const AVATAR_BG = ['#FFC24D', '#B38BFF', '#7ED7A5', '#FF9EC1', '#8FD0FF', '#FFB38A']
export function Face({ size = 36, tone = 0, long = true }) {
  const skins = ['#E7B08E', '#C98B66', '#F1C7A5', '#A9714F']
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: AVATAR_BG[tone % AVATAR_BG.length], overflow: 'hidden', display: 'inline-flex', flexShrink: 0, boxShadow: '0 0 0 2px #fff' }}>
      <Portrait size={size} bg="none" radius={0} long={long} skin={skins[tone % skins.length]} shirt={['#3E7BD8', '#fff', '#1E9E57', '#6B4EE6'][tone % 4]} hair={tone % 2 ? '#241713' : '#3A271E'} />
    </span>
  )
}

export function Orbit() {
  const item = (style, children, delay = 0) => <span className="orbit-item" style={{ position: 'absolute', animationDelay: `${delay}s`, ...style }}>{children}</span>
  const ring = (inset) => <span style={{ position: 'absolute', inset, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.95)' }} />
  return (
    <div style={{ position: 'relative', width: '100%', height: 250 }}>
      <span style={{ position: 'absolute', left: '50%', top: 0, width: 330, height: 330, marginLeft: -165 }}>
        {ring(0)}{ring(48)}{ring(96)}
      </span>
      {item({ left: '23%', top: 38 }, <Face size={30} tone={4} long={false} />, 0)}
      {item({ left: '57%', top: 10 }, <CalendarArt />, 0.6)}
      {item({ right: '12%', top: 56 }, <Face size={24} tone={2} long={false} />, 1.1)}
      {item({ left: '7%', top: 90 }, <BellArt />, 0.3)}
      {item({ left: '27%', top: 108 }, <Face size={40} tone={0} />, 0.9)}
      {item({ left: '58%', top: 96 }, <Face size={34} tone={1} />, 0.4)}
      {item({ right: '5%', top: 110 }, <ChatArt />, 1.3)}
      {item({ left: '10%', top: 160 }, <Face size={32} tone={2} long={false} />, 0.7)}
      {item({ right: '24%', top: 164 }, <Face size={26} tone={3} long={false} />, 1.5)}
      <span style={{ position: 'absolute', left: '50%', top: 150, width: 56, height: 56, marginLeft: -28, borderRadius: '50%', background: '#fff', boxShadow: '0 4px 18px rgba(0,141,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/nprep-logo.jpg" alt="" style={{ width: 34, height: 34, borderRadius: 9 }} />
      </span>
    </div>
  )
}

function CalendarArt() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38"><rect x="4" y="7" width="30" height="27" rx="7" fill="#E9F1FF" /><rect x="4" y="7" width="30" height="10" rx="7" fill="#6B4EE6" /><rect x="4" y="12" width="30" height="5" fill="#6B4EE6" /><rect x="11" y="3" width="3.5" height="8" rx="1.7" fill="#4B33B8" /><rect x="23.5" y="3" width="3.5" height="8" rx="1.7" fill="#4B33B8" /><text x="19" y="30" textAnchor="middle" fontSize="12" fontWeight="800" fill="#3B2BA8" fontFamily="Poppins, sans-serif">21</text></svg>
  )
}
function BellArt() {
  return (
    <svg width="32" height="34" viewBox="0 0 32 34"><path d="M16 3a8 8 0 00-8 8v6l-3 5h22l-3-5v-6a8 8 0 00-8-8z" fill="#6AB7FF" /><path d="M16 3a8 8 0 00-8 8v6l-3 5h8z" fill="#9AD0FF" /><circle cx="16" cy="27" r="3" fill="#1E7CFF" /><circle cx="16" cy="2.5" r="2" fill="#1E7CFF" /></svg>
  )
}
function ChatArt() {
  return (
    <svg width="40" height="36" viewBox="0 0 40 36"><path d="M6 6h28a4 4 0 014 4v13a4 4 0 01-4 4H18l-8 7v-7H6a4 4 0 01-4-4V10a4 4 0 014-4z" fill="#69B6FF" /><path d="M6 6h28a4 4 0 014 4v6H2v-6a4 4 0 014-4z" fill="#97CFFF" /><circle cx="13" cy="17" r="2.2" fill="#fff" /><circle cx="20" cy="17" r="2.2" fill="#fff" /><circle cx="27" cy="17" r="2.2" fill="#fff" /></svg>
  )
}
