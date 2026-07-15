import { useState } from 'react'
import { StatusBar, T1, T2, T3, BD, G, GL, GB, R, RL, RB, INK, ORANGE, ORANGE_D, PURPLE } from '../shared'

const STORIES = [
  { label: 'For you', emoji: '🎯', ring: 'linear-gradient(135deg,#FF9E1B,#FF5E7E)' },
  { label: 'Toppers', emoji: '🏆', ring: 'linear-gradient(135deg,#1D5BF0,#7C3AED)' },
  { label: 'Study Tips', emoji: '💡', ring: 'linear-gradient(135deg,#00B8A9,#1D5BF0)' },
  { label: 'Jobs', emoji: '💼', ring: 'linear-gradient(135deg,#F5576C,#F093FB)' },
  { label: 'Courses', emoji: '📚', ring: 'linear-gradient(135deg,#FBBF24,#F59E0B)' },
]

const QOD = {
  question: 'Which of the following levels of care includes super-specialty hospitals like AIIMS?',
  options: ['Primary Care', 'Secondary Care', 'Tertiary Care', 'Home Care'],
  correct: 2,
}

export default function Home({ onOpenCommunity, onExit, state }) {
  const [picked, setPicked] = useState(null)
  const dailyDoseThread = state.threads.find(t => t.roomKey === 'daily_dose' && !t.hidden)
  const replyCount = dailyDoseThread ? dailyDoseThread.replyCount : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
      <StatusBar />

      <div style={{ padding: '6px 16px 10px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={onExit} title="All flows" style={{ background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex', padding: 2 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="14" y2="18"/></svg>
        </button>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'linear-gradient(90deg,#FFB020,#FF8A00)', color: 'white', fontSize: 11, fontWeight: 800, padding: '5px 13px', borderRadius: 20, letterSpacing: '0.04em', boxShadow: '0 2px 8px rgba(255,138,0,0.35)' }}>
          ⚡ GO PRO
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, color: T1 }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FFF4E0', border: '1px solid #FFE0AD', borderRadius: 20, padding: '3px 10px', fontSize: 11.5, fontWeight: 800, color: ORANGE_D }}>🔥 0</span>
        </div>
      </div>

      <div style={{ display: 'flex', flex: '0 0 auto', gap: 14, padding: '2px 16px 12px', overflowX: 'auto', overflowY: 'hidden', borderBottom: `1px solid ${BD}` }} className="scroll">
        {STORIES.map(s => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <span style={{ width: 56, height: 56, borderRadius: '50%', background: s.ring, padding: 2.5, display: 'flex' }}>
              <span style={{ flex: 1, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.emoji}</span>
            </span>
            <span style={{ fontSize: 10, color: T2, fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>

        <div style={{ margin: '14px 16px 0', borderRadius: 20, overflow: 'hidden', background: 'radial-gradient(120% 160% at 20% 0%, #3B79FF 0%, #1D5BF0 45%, #1233B8 100%)', padding: '18px 16px 16px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -20, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', position: 'relative' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontSize: 17, fontWeight: 800, lineHeight: 1.4 }}>Your dream career is waiting. Let's start learning.</div>
            </div>
            <div style={{ width: 62, height: 62, borderRadius: '50%', background: 'rgba(255,255,255,0.14)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, flexShrink: 0 }}>👩‍⚕️</div>
          </div>
          <button style={{ position: 'relative', width: '100%', marginTop: 14, padding: '12px', borderRadius: 26, background: '#3B79FF', border: '1px solid rgba(255,255,255,0.35)', color: 'white', fontSize: 13.5, fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
            Start Learning
          </button>
        </div>

        <div style={{ padding: '18px 16px 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14.5, fontWeight: 800, color: INK }}>Question of the Day</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: ORANGE_D, background: '#FFF4E0', border: '1px solid #FFE0AD', padding: '2px 9px', borderRadius: 20 }}>Question Bank 🔥 +5</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T1, lineHeight: 1.5, marginBottom: 12 }}>{QOD.question}</div>
          {QOD.options.map((opt, i) => {
            const isCorrect = picked != null && i === QOD.correct
            const isWrongPick = picked === i && i !== QOD.correct
            return (
              <button key={opt} onClick={() => picked == null && setPicked(i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', marginBottom: 8, borderRadius: 12, textAlign: 'left', cursor: picked == null ? 'pointer' : 'default',
                  background: isCorrect ? GL : isWrongPick ? RL : 'white',
                  border: `1.5px solid ${isCorrect ? GB : isWrongPick ? RB : BD}` }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: isCorrect ? G : isWrongPick ? R : INK, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: isCorrect ? G : isWrongPick ? R : T1 }}>{opt}</span>
                {isCorrect && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 800, color: G }}>✓ Correct</span>}
              </button>
            )
          })}
          {picked != null && (
            <button onClick={onOpenCommunity} style={{ width: '100%', marginTop: 2, padding: '9px 10px', borderRadius: 10, background: '#EEF0FE', border: `1px solid #DBE0FB`, color: '#4338CA', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6 }}>
              💬 See what {replyCount || 'others'} students said in today's Daily Dose thread →
            </button>
          )}
        </div>

        <div style={{ padding: '18px 16px 4px' }}>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: INK, marginBottom: 10 }}>Learn & Practice</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: 'Lectures', cap: 'Lakhs of practice questions.', emoji: '🎥', bg: '#E7ECFD' },
              { label: 'QBank', cap: 'Lakhs of practice questions.', emoji: '📚', bg: '#FDEEE7' },
              { label: 'Mock', cap: 'Lakhs of practice questions.', emoji: '📝', bg: '#FBE9F0' },
            ].map(t => (
              <div key={t.label} style={{ background: t.bg, borderRadius: 16, padding: '16px 10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>{t.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: INK }}>{t.label}</div>
                <div style={{ fontSize: 9, color: T2, marginTop: 3, lineHeight: 1.4 }}>{t.cap}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Community teaser — PRD: escape the WhatsApp doubt-group, low-pressure peer
            replies vs. formal QMS queries. Entry point into the full Community tab. */}
        <div style={{ padding: '26px 16px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: PURPLE, letterSpacing: '0.02em' }}>YOUR BATCH IS ALREADY HERE</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: INK, lineHeight: 1.15, marginTop: 6 }}>NPrep</div>
          <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.1, background: 'linear-gradient(90deg, #1D5BF0, #7C3AED)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', letterSpacing: '0.01em' }}>COMMUNITY</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: T1, marginTop: 8, lineHeight: 1.5, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
            Stuck on today's question? Just ask — no query form, no waiting. Real students, daily discussions, your exam room.
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {['🔥 Daily Dose', '📖 Subject Room', '🎯 Exam Room'].map(chip => (
              <span key={chip} style={{ fontSize: 10.5, fontWeight: 700, color: '#4338CA', background: '#EEF0FE', border: '1px solid #DBE0FB', borderRadius: 20, padding: '5px 11px' }}>{chip}</span>
            ))}
          </div>
          <div style={{ fontSize: 11, color: T2, marginTop: 12 }}>Over <b>5,000+</b> active students showing up every month</div>
          <button onClick={onOpenCommunity} style={{ marginTop: 14, background: INK, color: 'white', fontSize: 13, fontWeight: 700, padding: '12px 42px', borderRadius: 26, border: 'none', cursor: 'pointer' }}>Join the Conversation</button>
        </div>
      </div>
    </div>
  )
}
