import { P, PL, PD, INK, T1, T2, BD } from './shared'

const FLOWS = [
  {
    id: 'student',
    tag: 'Student journey',
    title: 'Student App',
    desc: 'Homepage with the Community teaser, seven rooms (Daily Dose, Subject Room, Exam Room, Webinars, YT Lectures, Recent Updates, Nursing Jobs), thread replies, polls, exam-onboarding, and push notifications.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="3"/><line x1="10.5" y1="18" x2="13.5" y2="18"/></svg>,
  },
  {
    id: 'cms',
    tag: 'Admin & moderator journey',
    title: 'Community CMS',
    desc: 'Create threads (with optional poll) in any room, source Daily Dose only from free-tier questions, and moderate — hide/delete replies, hide threads.',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="4" width="19" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="18" x2="12" y2="21"/></svg>,
  },
]

export default function Landing({ onSelect }) {
  return (
    <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 20px', background: '#F6F7FB' }}>
      <div style={{ width: '100%', maxWidth: 680 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', border: `1px solid ${BD}`, color: PD, fontSize: 11.5, fontWeight: 700, padding: '5px 12px 5px 6px', borderRadius: 20, marginBottom: 16 }}>
            <img src="/nprep-logo.jpg" alt="" style={{ width: 20, height: 20, borderRadius: 6 }} />
            NPrep Community — Prototype
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, marginBottom: 8, letterSpacing: '-0.01em' }}>The in-app Community, end to end</h1>
          <p style={{ fontSize: 14, color: T2, maxWidth: 480, margin: '0 auto', lineHeight: 1.55 }}>
            Pick a flow below to walk through it exactly as scoped in the Phase 1 PRD.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {FLOWS.map(f => (
            <button key={f.id} onClick={() => onSelect(f.id)} className="row-tap" style={{ textAlign: 'left', background: 'white', border: `1px solid ${BD}`, borderRadius: 16, padding: '22px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: PL, color: P, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.icon}</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.tag}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: T1, marginTop: -4 }}>{f.title}</span>
              <span style={{ fontSize: 12.5, color: T2, lineHeight: 1.55, flex: 1 }}>{f.desc}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: P, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                Open flow <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
