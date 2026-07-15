import { useState } from 'react'
import { BackHeader, T1, T2, T3, BD, BG2, P, PL, PB, PD, INK, Avatar, CommentIcon, timeAgo } from '../../shared'

function Flair({ children, tone }) {
  const tones = {
    subject: { bg: PL, fg: PD, border: PB },
    poll: { bg: '#FFF4E0', fg: '#B96A00', border: '#FFE0AD' },
    archived: { bg: 'white', fg: T3, border: BD },
  }
  const t = tones[tone]
  return <span style={{ fontSize: 9.5, fontWeight: 800, color: t.fg, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 4, padding: '2px 7px', letterSpacing: '0.01em' }}>{children}</span>
}

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
      <BackHeader onBack={onBack} title="Thread" />

      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Post header — Reddit-style: flair pills, title, byline, body */}
        <div style={{ padding: '16px 16px 14px', borderBottom: `8px solid ${BG2}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {thread.subjectTag && <Flair tone="subject">{thread.subjectTag}</Flair>}
            {thread.poll && <Flair tone="poll">📊 POLL</Flair>}
            {thread.archived && <Flair tone="archived">ARCHIVED</Flair>}
          </div>
          <div style={{ fontSize: 16.5, fontWeight: 800, color: INK, lineHeight: 1.32, marginBottom: 8 }}>{thread.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: thread.body ? 10 : 0 }}>
            <Avatar name="NPrep" size={20} />
            <span style={{ fontSize: 11, fontWeight: 700, color: T2 }}>NPrep Team</span>
            <span style={{ fontSize: 10, color: T3 }}>· {timeAgo(thread.createdAt)}</span>
          </div>
          {thread.body && <div style={{ fontSize: 13, color: T1, lineHeight: 1.6 }}>{thread.body}</div>}
          {thread.archived && (
            <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: T3, background: BG2, borderRadius: 8, padding: '7px 10px' }}>
              Archived — no longer accepting replies
            </div>
          )}
        </div>

        {poll && (
          <div style={{ margin: '14px 16px', background: BG2, border: `1px solid ${BD}`, borderRadius: 14, padding: '14px 15px' }}>
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

        {/* Comments — Reddit-style: avatar + username + time, comment body indented to align under the name */}
        <div style={{ padding: '4px 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 0', borderBottom: `1px solid ${BG2}`, marginBottom: 4 }}>
            <CommentIcon size={14} color={T1} />
            <span style={{ fontSize: 12.5, fontWeight: 800, color: T1 }}>{replies.length} Comment{replies.length === 1 ? '' : 's'}</span>
          </div>
          {replies.length === 0 && <div style={{ fontSize: 11.5, color: T3, padding: '14px 0' }}>No comments yet — be the first to jump in.</div>}
          {replies.map(r => (
            <div key={r.id} style={{ display: 'flex', gap: 10, padding: '12px 0', borderBottom: `1px solid ${BG2}` }}>
              {r.hidden ? (
                <>
                  <Avatar name="—" size={26} />
                  <div style={{ fontSize: 11.5, color: T3, fontStyle: 'italic', paddingTop: 4 }}>This reply was removed</div>
                </>
              ) : (
                <>
                  <Avatar name={r.authorName} size={26} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: r.studentKey === 'demo' ? P : T1 }}>{r.authorName}</span>
                      <span style={{ fontSize: 10, color: T3 }}>{timeAgo(r.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: T1, lineHeight: 1.5 }}>{r.body}</div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {!thread.archived && (
        <div style={{ flexShrink: 0, borderTop: `1px solid ${BD}`, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Join the conversation…"
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
