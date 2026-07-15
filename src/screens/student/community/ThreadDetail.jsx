import { useState } from 'react'
import { BackHeader, T1, T2, T3, BD, BG2, P, PL, PB, PD, INK, timeAgo } from '../../shared'

export default function ThreadDetail({ state, threadId, onPostReply, onVote, onBack }) {
  const [draft, setDraft] = useState('')
  const thread = state.threads.find(t => t.id === threadId || String(t.id) === String(threadId))
  const replies = state.repliesByThread[threadId] || state.repliesByThread[String(threadId)] || []

  if (!thread) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
        <BackHeader onBack={onBack} title="Thread" />
        <div style={{ padding: 30, textAlign: 'center', fontSize: 12, color: T3 }}>Thread not found.</div>
      </div>
    )
  }

  const submit = () => {
    if (!draft.trim()) return
    onPostReply(thread.id, draft.trim(), false)
    setDraft('')
  }

  const poll = thread.poll
  const voted = poll && poll.myOptionId != null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
      <BackHeader onBack={onBack} title={thread.subjectTag || 'Thread'} />

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{ fontSize: 15.5, fontWeight: 800, color: INK, lineHeight: 1.35, marginBottom: 6 }}>{thread.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 10.5, color: T3 }}>{timeAgo(thread.createdAt)}</span>
          {thread.archived && <span style={{ fontSize: 9, fontWeight: 800, color: T3, background: BG2, border: `1px solid ${BD}`, borderRadius: 20, padding: '2px 8px' }}>Archived — no longer accepting replies</span>}
        </div>
        {thread.body && <div style={{ fontSize: 12.5, color: T1, lineHeight: 1.6, marginBottom: 16 }}>{thread.body}</div>}

        {poll && (
          <div style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 14, padding: '14px 15px', marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T2, marginBottom: 10 }}>📊 POLL {poll.totalVotes > 0 ? `· ${poll.totalVotes} vote${poll.totalVotes === 1 ? '' : 's'}` : ''}</div>
            {poll.options.map(opt => {
              const pct = poll.totalVotes > 0 ? Math.round((opt.voteCount / poll.totalVotes) * 100) : 0
              const isMine = poll.myOptionId === opt.id
              if (!voted) {
                return (
                  <button key={opt.id} onClick={() => onVote(thread.id, opt.id)}
                    style={{ width: '100%', textAlign: 'left', background: 'white', border: `1.5px solid ${BD}`, borderRadius: 10, padding: '10px 13px', marginBottom: 8, fontSize: 12.5, fontWeight: 600, color: T1, cursor: 'pointer' }}>
                    {opt.label}
                  </button>
                )
              }
              return (
                <div key={opt.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${isMine ? PB : BD}`, marginBottom: 8, background: 'white' }}>
                  <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: isMine ? PL : BG2, transition: 'width 0.3s' }} />
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: isMine ? PD : T1 }}>{opt.label}{isMine ? ' ✓' : ''}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: isMine ? PD : T2 }}>{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ fontSize: 11.5, fontWeight: 800, color: T2, marginBottom: 10 }}>{replies.length} Repl{replies.length === 1 ? 'y' : 'ies'}</div>
        {replies.length === 0 && <div style={{ fontSize: 11.5, color: T3, marginBottom: 10 }}>No replies yet — be the first to jump in.</div>}
        {replies.map(r => (
          <div key={r.id} style={{ marginBottom: 14 }}>
            {r.hidden ? (
              <div style={{ fontSize: 11.5, color: T3, fontStyle: 'italic' }}>This reply was removed</div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: r.studentKey === 'demo' ? P : T1 }}>{r.authorName}</span>
                  <span style={{ fontSize: 9.5, color: T3 }}>{timeAgo(r.createdAt)}</span>
                </div>
                <div style={{ fontSize: 12.5, color: T1, lineHeight: 1.5 }}>{r.body}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {!thread.archived && (
        <div style={{ flexShrink: 0, borderTop: `1px solid ${BD}`, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Reply to this thread…"
            style={{ flex: 1, border: `1.5px solid ${BD}`, borderRadius: 22, padding: '10px 15px', fontSize: 12.5, outline: 'none' }} />
          <button onClick={submit} disabled={!draft.trim()}
            style={{ background: draft.trim() ? P : BD, color: 'white', border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: draft.trim() ? 'pointer' : 'default', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
          </button>
        </div>
      )}
    </div>
  )
}
