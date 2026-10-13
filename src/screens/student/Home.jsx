import { useState } from 'react'
import { StatusBar, T1, T2, T3, BD, BG2, P, PL, PB, PD, G, GL, GB, R, RL, RB, INK, ORANGE_D, PURPLE } from '../shared'

const STORIES = [
  { label: 'For you', emoji: '🎯', tint: '#FFF3DD' },
  { label: 'Toppers', emoji: '🏆', tint: PL },
  { label: 'Study Tips', emoji: '💡', tint: '#DDF4F1' },
  { label: 'Jobs', emoji: '💼', tint: '#F1EAFE' },
  { label: 'Courses', emoji: '📚', tint: '#FDE7EC' },
]

const QOD = {
  question: 'Which of the following levels of care includes super-specialty hospitals like AIIMS?',
  options: ['Primary Care', 'Secondary Care', 'Tertiary Care', 'Home Care'],
  correct: 2,
}

const sectionTitle = { fontSize: 15, fontWeight: 700, color: INK }

export default function Home({ onOpenCommunity, onExit, state }) {
  const [picked, setPicked] = useState(null)
  const dailyDoseThread = state.threads.find(t => t.roomKey === 'daily_dose' && !t.hidden)
  const replyCount = dailyDoseThread ? dailyDoseThread.replyCount : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
      <StatusBar />

      <div style={{ padding: '4px 12px 8px 8px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button onClick={onExit} title="All flows" aria-label="All flows" className="icon-btn" style={{ width: 40, height: 40, borderRadius: 12, background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="14" y2="18"/></svg>
        </button>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#FFF4E0', border: '1px solid #FFE0AD', color: ORANGE_D, fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 20, letterSpacing: '0.04em' }}>
          ⚡ GO PRO
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, color: T1 }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FFF4E0', border: '1px solid #FFE0AD', borderRadius: 20, padding: '3px 10px', fontSize: 11.5, fontWeight: 800, color: ORANGE_D }}>🔥 0</span>
        </div>
      </div>

      <div style={{ display: 'flex', flex: '0 0 auto', gap: 16, padding: '4px 16px 14px', overflowX: 'auto', overflowY: 'hidden', borderBottom: `1px solid ${BD}` }} className="scroll">
        {STORIES.map(s => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ width: 54, height: 54, borderRadius: '50%', background: s.tint, border: `1px solid ${BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.emoji}</span>
            <span style={{ fontSize: 10.5, color: T2, fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>

        <div style={{ margin: '16px 16px 0', borderRadius: 16, background: P, padding: '18px 16px 16px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontSize: 17, fontWeight: 700, lineHeight: 1.4 }}>Your dream career is waiting. Let's start learning.</div>
            </div>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>👩‍⚕️</div>
          </div>
          <button style={{ width: '100%', marginTop: 14, padding: '12px', borderRadius: 12, background: 'white', border: 'none', color: PD, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill={PD}><polygon points="5,3 19,12 5,21"/></svg>
            Start Learning
          </button>
        </div>

        <div style={{ padding: '22px 16px 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={sectionTitle}>Question of the Day</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: ORANGE_D, background: '#FFF4E0', border: '1px solid #FFE0AD', padding: '3px 9px', borderRadius: 20 }}>Question Bank 🔥 +5</span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: T1, lineHeight: 1.5, marginBottom: 12 }}>{QOD.question}</div>
          {QOD.options.map((opt, i) => {
            const isCorrect = picked != null && i === QOD.correct
            const isWrongPick = picked === i && i !== QOD.correct
            return (
              <button key={opt} onClick={() => picked == null && setPicked(i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', marginBottom: 8, borderRadius: 12, textAlign: 'left', cursor: picked == null ? 'pointer' : 'default',
                  background: isCorrect ? GL : isWrongPick ? RL : 'white',
                  border: `1.5px solid ${isCorrect ? GB : isWrongPick ? RB : BD}` }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: isCorrect ? G : isWrongPick ? R : BG2, color: isCorrect || isWrongPick ? 'white' : T2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: isCorrect ? G : isWrongPick ? R : T1 }}>{opt}</span>
                {isCorrect && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: G }}>✓ Correct</span>}
              </button>
            )
          })}
          {picked != null && (
            <button onClick={onOpenCommunity} style={{ width: '100%', marginTop: 2, padding: '11px 12px', borderRadius: 12, background: PL, border: `1px solid ${PB}`, color: PD, fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
              💬 See what {replyCount || 'others'} students said in today's Daily Dose thread →
            </button>
          )}
        </div>

        <div style={{ padding: '22px 16px 4px' }}>
          <div style={{ ...sectionTitle, marginBottom: 10 }}>Learn & Practice</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: 'Lectures', cap: 'Lakhs of practice questions.', emoji: '🎥', bg: '#EEF3FF' },
              { label: 'QBank', cap: 'Lakhs of practice questions.', emoji: '📚', bg: '#FFF3EA' },
              { label: 'Mock', cap: 'Lakhs of practice questions.', emoji: '📝', bg: '#FDEEF3' },
            ].map(t => (
              <div key={t.label} style={{ background: t.bg, borderRadius: 14, padding: '14px 10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{t.emoji}</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{t.label}</div>
                <div style={{ fontSize: 9.5, color: T2, marginTop: 3, lineHeight: 1.4 }}>{t.cap}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Community teaser — PRD: escape the WhatsApp doubt-group, low-pressure peer
            replies vs. formal QMS queries. Entry point into the full Community tab. */}
        <div style={{ margin: '24px 16px 24px', padding: '22px 18px', textAlign: 'center', background: BG2, borderRadius: 16, border: `1px solid ${BD}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: '0.05em' }}>YOUR BATCH IS ALREADY HERE</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: INK, lineHeight: 1.15, marginTop: 8 }}>NPrep</div>
          <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, color: P, letterSpacing: '0.01em' }}>COMMUNITY</div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: T2, marginTop: 10, lineHeight: 1.55, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
            Stuck on today's question? Just ask — no query form, no waiting. Real students, daily discussions, your exam room.
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {['🔥 Daily Dose', '📖 Subject Room', '🎯 Exam Room'].map(chip => (
              <span key={chip} style={{ fontSize: 11, fontWeight: 600, color: T1, background: 'white', border: `1px solid ${BD}`, borderRadius: 20, padding: '5px 11px' }}>{chip}</span>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: T2, marginTop: 14 }}>Over <b>5,000+</b> active students showing up every month</div>
          <button onClick={onOpenCommunity} style={{ marginTop: 14, background: P, color: 'white', fontSize: 13.5, fontWeight: 700, padding: '12px 40px', borderRadius: 12, border: 'none', cursor: 'pointer' }}>Join the Conversation</button>
        </div>
      </div>
    </div>
  )
}
