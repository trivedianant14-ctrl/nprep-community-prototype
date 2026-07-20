import { useState } from 'react'
import { BackHeader, T1, T2, T3, BD, BG2, PL, PB, PD, INK, GradientAvatar, HeartIcon, bubbleThemeFor, roomKindFromKey, ROOM_GRADIENT, CommentIcon, LikeButton, ShareIcon, shareThread, timeAgo, ContributorBadge, contributorTier, NPrepMark, OPBadge, PaperclipIcon, PdfChip, uploadPdf } from '../../shared'
import ChannelWheel from './ChannelWheel'

export default function ThreadDetail({ state, threadId, onPostReply, onVote, onLikeThread, onLikeReply, onSwitchRoom, onBack }) {
  const [draft, setDraft] = useState('')
  const [shareMsg, setShareMsg] = useState('')
  const [attachment, setAttachment] = useState(null) // { url, name } | null — pending PDF for the next reply
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [replyTo, setReplyTo] = useState(null) // { id, authorName } | null — reply target, any depth
  const [sortMode, setSortMode] = useState('relevant') // 'relevant' | 'all' — Facebook-style comment sort
  // Nested replies are collapsed by default (Instagram/Twitter-style "N replies") — a
  // reply liked by NPrep Team is the one exception, shown inline without expanding.
  // This set tracks which parent comments the student has manually expanded to reveal everyone.
  const [expandedIds, setExpandedIds] = useState(() => new Set())
  const thread = state.threads.find(t => t.id === threadId || String(t.id) === String(threadId))
  const replies = state.repliesByThread[threadId] || state.repliesByThread[String(threadId)] || []
  const contributors = state.contributors || {}

  // Reddit-style arbitrary-depth tree — group every reply under its parent (or 'root' for
  // top-level), so any node can have its own indented, connector-lined children.
  const childrenMap = {}
  for (const r of replies) {
    const key = r.parentReplyId || 'root'
    ;(childrenMap[key] ??= []).push(r)
  }
  const topLevelReplies = childrenMap.root || []

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  // Total nested-reply count under a comment (any depth) — the primary "most relevant" signal.
  const countDescendants = (id) => {
    const kids = childrenMap[id] || []
    let total = kids.length
    for (const k of kids) total += countDescendants(k.id)
    return total
  }

  // Pinned comments always lead, regardless of sort mode. "Most relevant" ranks the rest by
  // most replied → most liked → NPrep-liked → most recent, and caps the list at 15 so a
  // 97-comment thread doesn't just become the full list again. "All comments" keeps the plain
  // chronological order from the server, uncapped. Deeper replies always stay chronological.
  const pinnedTop = topLevelReplies.filter(r => r.pinned)
  const unpinnedTop = topLevelReplies.filter(r => !r.pinned)
  const sortedUnpinned = sortMode === 'relevant'
    ? [...unpinnedTop].sort((a, b) => {
        const repliesDiff = countDescendants(b.id) - countDescendants(a.id)
        if (repliesDiff !== 0) return repliesDiff
        if (b.likeCount !== a.likeCount) return b.likeCount - a.likeCount
        const nprepDiff = (b.likedByNPrepTeam ? 1 : 0) - (a.likedByNPrepTeam ? 1 : 0)
        if (nprepDiff !== 0) return nprepDiff
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
    : unpinnedTop
  const orderedTopLevelAll = [...pinnedTop, ...sortedUnpinned]
  const RELEVANT_CAP = 15
  const orderedTopLevel = sortMode === 'relevant' ? orderedTopLevelAll.slice(0, RELEVANT_CAP) : orderedTopLevelAll
  const relevantCapped = sortMode === 'relevant' && orderedTopLevelAll.length > RELEVANT_CAP

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
    onPostReply(thread.id, draft.trim(), false, replyTo?.id ?? null, attachment)
    setDraft('')
    setReplyTo(null)
    setAttachment(null)
  }

  const pickPdf = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadError('')
    setUploading(true)
    try {
      setAttachment(await uploadPdf(file))
    } catch (err) {
      setUploadError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
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
  const isWebinar = thread.roomKey === 'webinar_threads'
  const grad = ROOM_GRADIENT[roomKindFromKey(thread.roomKey)]
  const currentIndex = Math.max(0, state.roomTiles.findIndex(t => t.kind === roomKindFromKey(thread.roomKey)))
  const HEADER_H = 54

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', position: 'relative' }}>
      <BackHeader onBack={onBack} title="Thread" />
      <ChannelWheel rooms={state.roomTiles} currentIndex={currentIndex} onSwitch={onSwitchRoom} topOffset={HEADER_H} />

      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Gradient hero — Hike-style colorful banner instead of a flat white header */}
        <div style={{ background: grad, padding: '20px 18px 22px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 10, position: 'relative' }}>
            {thread.subjectTag && <span style={{ fontSize: 9.5, fontWeight: 800, color: 'white', background: 'rgba(255,255,255,0.24)', borderRadius: 20, padding: '3px 10px' }}>{thread.subjectTag}</span>}
            {thread.poll && <span style={{ fontSize: 9.5, fontWeight: 800, color: 'white', background: 'rgba(255,255,255,0.24)', borderRadius: 20, padding: '3px 10px' }}>📊 POLL</span>}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'white', lineHeight: 1.32, position: 'relative' }}>{thread.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, position: 'relative' }}>
            <GradientAvatar name={thread.authorName || 'NPrep'} size={20} grad="rgba(255,255,255,0.3)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>{thread.authorName || 'NPrep Team'}</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>· {timeAgo(thread.createdAt)}</span>
          </div>
        </div>

        <div style={{ padding: '16px 18px 4px' }}>
          {thread.body && <div style={{ fontSize: 13, color: T1, lineHeight: 1.6, marginBottom: thread.attachmentUrl ? 10 : 0 }}>{thread.body}</div>}
          <PdfChip url={thread.attachmentUrl} name={thread.attachmentName} />
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

        {/* Comments — Reddit-style threaded tree: connector lines, collapsible branches,
            upvote-only arrows, badges inline with the username. The count/sort bar stays
            pinned (position: sticky) once you scroll into a long comment list. */}
        <div style={{ padding: '0 14px 16px' }}>
          <div style={{
            position: 'sticky', top: 0, zIndex: 5, background: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 4px', marginBottom: 4, flexWrap: 'wrap', gap: 8,
            borderBottom: `1px solid ${BG2}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CommentIcon size={14} color={T1} />
              <span style={{ fontSize: 12.5, fontWeight: 800, color: T1 }}>{replies.length} Comment{replies.length === 1 ? '' : 's'}</span>
            </div>
            {topLevelReplies.length > 1 && (
              <div style={{ display: 'flex', gap: 4 }}>
                {[['relevant', 'Most relevant'], ['all', 'All comments']].map(([id, label]) => (
                  <button key={id} onClick={() => setSortMode(id)}
                    style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${sortMode === id ? PB : BD}`, background: sortMode === id ? PL : 'white', color: sortMode === id ? PD : T2 }}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {replies.length === 0 && <div style={{ fontSize: 11.5, color: T3, padding: '14px 10px' }}>No comments yet — be the first to jump in.</div>}
          {orderedTopLevel.map(r => (
            <CommentNode key={r.id} reply={r} depth={0} childrenMap={childrenMap} expandedIds={expandedIds} toggleExpand={toggleExpand}
              onLikeReply={onLikeReply} onReplyTo={reply => setReplyTo({ id: reply.id, authorName: reply.authorName })} contributors={contributors} opKey={thread.authorKey} />
          ))}
          {relevantCapped && (
            <button onClick={() => setSortMode('all')}
              style={{ width: '100%', textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 4px', fontSize: 11, fontWeight: 700, color: PD }}>
              Showing top {RELEVANT_CAP} of {orderedTopLevelAll.length} comments — view all comments
            </button>
          )}
        </div>
      </div>

      {thread.archived ? (
        <div style={{ flexShrink: 0, borderTop: `1px solid ${BD}`, padding: '12px 16px', textAlign: 'center', fontSize: 11.5, color: T3 }}>
          This discussion has closed to new replies.
        </div>
      ) : (
        <div style={{ flexShrink: 0, borderTop: `1px solid ${BD}` }}>
          {replyTo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: BG2, fontSize: 11, color: T2 }}>
              <span>Replying to <b style={{ color: T1 }}>{replyTo.authorName}</b></span>
              <button onClick={() => setReplyTo(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: T3, fontSize: 13, padding: 2 }}>✕</button>
            </div>
          )}
          {isWebinar && (attachment || uploading || uploadError) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px 0' }}>
              {uploading && <span style={{ fontSize: 11, color: T2 }}>Uploading PDF…</span>}
              {uploadError && <span style={{ fontSize: 11, color: '#791F1F' }}>{uploadError}</span>}
              {attachment && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <PdfChip url={attachment.url} name={attachment.name} />
                  <button onClick={() => setAttachment(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, fontSize: 13, padding: 2 }}>✕</button>
                </div>
              )}
            </div>
          )}
          <div style={{ padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
            {isWebinar && (
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '50%', background: BG2, cursor: uploading ? 'default' : 'pointer', flexShrink: 0 }}>
                <input type="file" accept="application/pdf" onChange={pickPdf} disabled={uploading} style={{ display: 'none' }} />
                <PaperclipIcon color={T2} />
              </label>
            )}
            <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder={replyTo ? `Reply to ${replyTo.authorName}…` : isWebinar ? 'Join the conversation, or attach a PDF…' : 'Join the conversation…'}
              style={{ flex: 1, border: `1.5px solid ${BD}`, borderRadius: 22, padding: '10px 15px', fontSize: 12.5, outline: 'none' }} />
            <button onClick={submit} disabled={!draft.trim()}
              style={{ background: draft.trim() ? grad : BD, color: 'white', border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: draft.trim() ? 'pointer' : 'default', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Reddit-style threaded comment: avatar-left, plain text (no chat bubble, no self-flip),
// a connector line down to its children. Recurses into childrenMap[reply.id] for arbitrary
// depth; indent growth slows past depth 4 so a long thread doesn't run out of horizontal
// room on a phone-width screen.
//
// Replies-to-a-comment are collapsed by default, Instagram/Twitter-style — except any reply
// NPrep Team has liked, which shows inline automatically. The rest sit behind a "N replies"
// link right before the Reply button; tapping it reveals everyone underneath.
function CommentNode({ reply, depth, childrenMap, expandedIds, toggleExpand, onLikeReply, onReplyTo, contributors, opKey }) {
  const kids = childrenMap[reply.id] || []
  const isExpanded = expandedIds.has(reply.id)
  const nprepKids = kids.filter(k => k.likedByNPrepTeam)
  const otherKids = kids.filter(k => !k.likedByNPrepTeam)
  const visibleKids = isExpanded ? kids : nprepKids
  const hiddenCount = isExpanded ? 0 : otherKids.length

  if (reply.hidden) {
    return (
      <div>
        <div style={{ display: 'flex', gap: 8, padding: '7px 0' }}>
          <GradientAvatar name="—" size={24} grad={BG2} />
          <div style={{ fontSize: 11.5, color: T3, fontStyle: 'italic', paddingTop: 3 }}>This comment was removed</div>
        </div>
        {visibleKids.length > 0 && (
          <CommentChildren kids={visibleKids} depth={depth} childrenMap={childrenMap} expandedIds={expandedIds} toggleExpand={toggleExpand}
            onLikeReply={onLikeReply} onReplyTo={onReplyTo} contributors={contributors} opKey={opKey} />
        )}
      </div>
    )
  }

  const isSelf = reply.studentKey === 'demo'
  const theme = bubbleThemeFor(reply.authorName)
  const tier = contributorTier(contributors[reply.studentKey])
  const isOP = opKey && reply.studentKey === opKey

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, padding: '7px 0' }}>
        <GradientAvatar name={reply.authorName} size={24} grad={theme.grad} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: T1 }}>{isSelf ? 'You' : reply.authorName}</span>
            {isOP && <OPBadge />}
            <ContributorBadge tier={tier} />
            <span style={{ fontSize: 9.5, color: T3 }}>· {timeAgo(reply.createdAt)}</span>
          </div>
          {reply.pinned && <div style={{ fontSize: 9.5, fontWeight: 700, color: '#B96A00', marginTop: 2 }}>📌 Pinned by NPrep Team</div>}
          {reply.replyingToName && <div style={{ fontSize: 9.5, color: T3, marginTop: 2 }}>↳ replying to {reply.replyingToName}</div>}
          <div style={{ fontSize: 12.5, color: T1, lineHeight: 1.5, marginTop: 3 }}>{reply.body}</div>
          {reply.attachmentUrl && <div style={{ marginTop: 6 }}><PdfChip url={reply.attachmentUrl} name={reply.attachmentName} /></div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
            <button onClick={() => onLikeReply(reply.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <HeartIcon size={14} liked={reply.likedByMe} />
              {reply.likeCount > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: reply.likedByMe ? '#FF3B5C' : T2 }}>{reply.likeCount}</span>}
            </button>
            {reply.likedByNPrepTeam && <NPrepMark size={16} />}
            {hiddenCount > 0 && (
              <button onClick={() => toggleExpand(reply.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 10.5, fontWeight: 700, color: PD }}>
                {hiddenCount} repl{hiddenCount === 1 ? 'y' : 'ies'}
              </button>
            )}
            {isExpanded && otherKids.length > 0 && (
              <button onClick={() => toggleExpand(reply.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 10.5, fontWeight: 700, color: T3 }}>
                Hide replies
              </button>
            )}
            <button onClick={() => onReplyTo(reply)} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 10.5, fontWeight: 700, color: T3 }}>
              <CommentIcon size={11} color={T3} /> Reply
            </button>
          </div>
        </div>
      </div>

      {visibleKids.length > 0 && (
        <CommentChildren kids={visibleKids} depth={depth} childrenMap={childrenMap} expandedIds={expandedIds} toggleExpand={toggleExpand}
          onLikeReply={onLikeReply} onReplyTo={onReplyTo} contributors={contributors} opKey={opKey} />
      )}
    </div>
  )
}

function CommentChildren({ kids, depth, childrenMap, expandedIds, toggleExpand, onLikeReply, onReplyTo, contributors, opKey }) {
  const indent = depth < 4 ? 26 : 10
  return (
    <div style={{ marginLeft: 12, paddingLeft: indent - 12, borderLeft: `2px solid ${BD}` }}>
      {kids.map(child => (
        <CommentNode key={child.id} reply={child} depth={depth + 1} childrenMap={childrenMap} expandedIds={expandedIds} toggleExpand={toggleExpand}
          onLikeReply={onLikeReply} onReplyTo={onReplyTo} contributors={contributors} opKey={opKey} />
      ))}
    </div>
  )
}
