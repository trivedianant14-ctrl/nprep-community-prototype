import { useState } from 'react'
import { BackHeader, T1, T2, T3, BD, BG2, P, PL, PB, PD, INK, GradientAvatar, SELF_THEME, bubbleThemeFor, roomKindFromKey, ROOM_GRADIENT, CommentIcon, HeartIcon, LikeButton, ShareIcon, shareThread, timeAgo } from '../../shared'
import ChannelWheel from './ChannelWheel'

export default function ThreadDetail({ state, threadId, onPostReply, onVote, onLikeThread, onLikeReply, onSwitchRoom, onBack }) {
  const [draft, setDraft] = useState('')
  const [shareMsg, setShareMsg] = useState('')
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

  const share = async () => {
    const result = await shareThread(thread)
    if (result.copied) {
      setShareMsg('Link copied')
      setTimeout(() => setShareMsg(''), 1800)
    }
  }

  const poll = thread.poll
  const voted = poll && poll.myOptionId != null
  const grad = ROOM_GRADIENT[roomKindFromKey(thread.roomKey)]
  const currentIndex = Math.max(0, state.roomTiles.findIndex(t => t.kind === roomKindFromKey(thread.roomKey)))

  return (
    <div style={{ display: 'flex', height: '100%', background: 'white' }}>
      <ChannelWheel rooms={state.roomTiles} currentIndex={currentIndex} onSwitch={onSwitchRoom} />
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minWidth: 0 }}>
      <BackHeader onBack={onBack} title="Thread" />

      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Gradient hero — Hike-style colorful banner instead of a flat white header */}
        <div style={{ background: grad, padding: '20px 18px 22px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 10, position: 'relative' }}>
            {thread.subjectTag && <span style={{ fontSize: 9.5, fontWeight: 800, color: 'white', background: 'rgba(255,255,255,0.24)', borderRadius: 20, padding: '3px 10px' }}>{thread.subjectTag}</span>}
            {thread.poll && <span style={{ fontSize: 9.5, fontWeight: 800, color: 'white', background: 'rgba(255,255,255,0.24)', borderRadius: 20, padding: '3px 10px' }}>📊 POLL</span>}
            {thread.archived && <span style={{ fontSize: 9.5, fontWeight: 800, color: 'white', background: 'rgba(255,255,255,0.24)', borderRadius: 20, padding: '3px 10px' }}>ARCHIVED</span>}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'white', lineHeight: 1.32, position: 'relative' }}>{thread.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, position: 'relative' }}>
            <GradientAvatar name="NPrep" size={20} grad="rgba(255,255,255,0.3)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>NPrep Team</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>· {timeAgo(thread.createdAt)}</span>
          </div>
        </div>

        <div style={{ padding: '16px 18px 4px' }}>
          {thread.body && <div style={{ fontSize: 13, color: T1, lineHeight: 1.6, marginBottom: thread.archived ? 10 : 0 }}>{thread.body}</div>}
          {thread.archived && (
            <div style={{ fontSize: 11, fontWeight: 700, color: T3, background: BG2, borderRadius: 8, padding: '7px 10px' }}>
              Archived — no longer accepting replies
            </div>
          )}
        </div>

        {/* Action row — Instagram/Facebook-style: like, comment count, share, all on the post itself */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '4px 16px 10px', borderBottom: `1px solid ${BG2}` }}>
          <LikeButton liked={thread.likedByMe} count={thread.likeCount} onToggle={() => onLikeThread(thread.id)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <CommentIcon size={14} />
            <span style={{ fontSize: 11, fontWeight: 700, color: T2 }}>{replies.length}</span>
          </div>
          <button onClick={share} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', marginLeft: 'auto' }}>
            <ShareIcon />
            <span style={{ fontSize: 11, fontWeight: 700, color: T2 }}>{shareMsg || 'Share'}</span>
          </button>
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

        {/* Comments — Hike-style chat bubbles: colorful gradient avatar + tinted bubble,
            your own replies flip to the right in the primary theme like an outgoing message. */}
        <div style={{ padding: '6px 14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 4px', marginBottom: 4 }}>
            <CommentIcon size={14} color={T1} />
            <span style={{ fontSize: 12.5, fontWeight: 800, color: T1 }}>{replies.length} Comment{replies.length === 1 ? '' : 's'}</span>
          </div>
          {replies.length === 0 && <div style={{ fontSize: 11.5, color: T3, padding: '14px 10px' }}>No comments yet — be the first to jump in.</div>}
          {replies.map(r => {
            if (r.hidden) {
              return (
                <div key={r.id} style={{ display: 'flex', gap: 8, padding: '6px 4px', marginBottom: 10 }}>
                  <GradientAvatar name="—" size={28} grad={BG2} />
                  <div style={{ background: BG2, borderRadius: '4px 16px 16px 16px', padding: '9px 13px', fontSize: 11.5, color: T3, fontStyle: 'italic' }}>This reply was removed</div>
                </div>
              )
            }
            const isSelf = r.studentKey === 'demo'
            const theme = isSelf ? SELF_THEME : bubbleThemeFor(r.authorName)
            return (
              <div key={r.id} style={{ display: 'flex', gap: 8, padding: '6px 4px', marginBottom: 10, flexDirection: isSelf ? 'row-reverse' : 'row' }}>
                <GradientAvatar name={r.authorName} size={28} grad={theme.grad} />
                <div style={{ maxWidth: '78%' }}>
                  <div style={{ background: theme.bubble, borderRadius: isSelf ? '16px 4px 16px 16px' : '4px 16px 16px 16px', padding: '9px 13px' }}>
                    {!isSelf && <div style={{ fontSize: 11, fontWeight: 800, color: T1, marginBottom: 2 }}>{r.authorName}</div>}
                    <div style={{ fontSize: 12.5, color: T1, lineHeight: 1.5 }}>{r.body}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, padding: '0 4px', flexDirection: isSelf ? 'row-reverse' : 'row' }}>
                    <span style={{ fontSize: 9.5, color: T3 }}>{timeAgo(r.createdAt)}</span>
                    <button onClick={() => onLikeReply(r.id)} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <HeartIcon size={11} liked={r.likedByMe} />
                      {r.likeCount > 0 && <span style={{ fontSize: 9.5, fontWeight: 700, color: r.likedByMe ? '#FF3B5C' : T3 }}>{r.likeCount}</span>}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {!thread.archived && (
        <div style={{ flexShrink: 0, borderTop: `1px solid ${BD}`, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Join the conversation…"
            style={{ flex: 1, border: `1.5px solid ${BD}`, borderRadius: 22, padding: '10px 15px', fontSize: 12.5, outline: 'none' }} />
          <button onClick={submit} disabled={!draft.trim()}
            style={{ background: draft.trim() ? grad : BD, color: 'white', border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: draft.trim() ? 'pointer' : 'default', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
          </button>
        </div>
      )}
      </div>
    </div>
  )
}
