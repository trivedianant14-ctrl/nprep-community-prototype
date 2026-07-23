const P = '#1D5BF0', PL = '#EAF0FE', PD = '#12339B'
const T1 = '#1a1a2e', T2 = '#5a5a78', BD = '#e8e8f2'

const FLOWS = [
  {
    id: 'student',
    tag: 'Student journey',
    title: 'Student App',
    desc: 'Homepage with the Community teaser, seven rooms (Daily Dose, Subject Room, Exam Room, Webinars, YT Lectures, Recent Updates, Nursing Jobs), thread replies, polls, exam-onboarding, and push notifications.',
  },
  {
    id: 'cms',
    tag: 'Admin & moderator journey',
    title: 'Community CMS',
    desc: 'Create threads (with optional poll) in any room, source Daily Dose only from free-tier questions, and moderate — hide/delete replies, hide threads.',
  },
]

export default function Landing({ onSelect }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px', background: 'linear-gradient(180deg, #eeeef5 0%, #f5f5fb 100%)' }}>
      <div style={{ width: '100%', maxWidth: 640 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: PL, color: PD, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, marginBottom: 14 }}>
            NPrep Community — Prototype
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: T1, marginBottom: 8 }}>The in-app Community, end to end</h1>
          <p style={{ fontSize: 14, color: T2, maxWidth: 480, margin: '0 auto', lineHeight: 1.5 }}>
            Pick a flow below to walk through it exactly as scoped in the Phase 1 PRD.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {FLOWS.map(f => (
            <button key={f.id} onClick={() => onSelect(f.id)} style={{ textAlign: 'left', background: 'white', border: `1.5px solid ${BD}`, borderRadius: 16, padding: '20px 18px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: PD, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.tag}</span>
              <span style={{ fontSize: 17, fontWeight: 700, color: T1 }}>{f.title}</span>
              <span style={{ fontSize: 12, color: T2, lineHeight: 1.5, flex: 1 }}>{f.desc}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: P, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                Open flow <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
