import { useRef, useState } from 'react'
import { BackHeader, T1, T2, T3, BD, BG2, PL, PB, PD, INK, NAVY, Avatar, HeartIcon, RoomPill, roomKindFromKey, ROOM_GRADIENT, CommentIcon, ShareIcon, shareThread, timeAgo, ContributorBadge, contributorTier, NPrepMark, OPBadge, PaperclipIcon, AttachmentPreview, uploadAttachment, ATTACHMENT_ACCEPT, ResourceLink, LiveBadge, TagPill, FlagIcon, VerifiedIcon, ChevronRight, FS } from '../../shared'

// Why each report reason exists, shown under the reason in the report sheet (Binance / Azar /
// Vivino pattern: a reason, a one-line explanation, and a chevron).
const REASON_HINTS = {
  'Spam': 'Ads, promotions or the same message repeated',
  'Abusive or rude': 'Insults, bullying or harassment',
  'Wrong information': 'Incorrect nursing or exam facts',
  'Something else': "Another problem we should look at",
}

export default function ThreadDetail({ state, threadId, onPostReply, onVote, onLikeThread, onLikeReply, onReportReply, onRegisterForWebinar, onBack }) {
  const [draft, setDraft] = useState('')
  const [shareMsg, setShareMsg] = useState('')
  const [attachment, setAttachment] = useState(null) // { url, name, type } | null — pending media for the next reply
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [reportTarget, setReportTarget] = useState(null) // reply being reported — opens the reason sheet
  const [reportMsg, setReportMsg] = useState('')
  const [replyTo, setReplyTo] = useState(null) // { id, authorName } | null — reply target, any depth
  const [sending, setSending] = useState(false) // send icon flies off and back after a comment is sent
  const [sortMode, setSortMode] = useState('relevant') // 'relevant' | 'all' — Facebook-style comment sort
  // Nested replies are collapsed by default (Instagram/Twitter-style "N replies") — a
  // reply liked by NPrep Team is the one exception, shown inline without expanding.
  // This set tracks which parent comments the student has manually expanded to reveal everyone.
  const [expandedIds, setExpandedIds] = useState(() => new Set())
  const inputRef = useRef(null)
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
        <div style={{ padding: 30, textAlign: 'center', fontSize: FS.small, color: T3 }}>Thread not found.</div>
      </div>
    )
  }

  const submit = () => {
    if (!draft.trim()) return
    setSending(true)
    setTimeout(() => setSending(false), 650)
    onPostReply(thread.id, draft.trim(), false, replyTo?.id ?? null, attachment)
    setDraft('')
    setReplyTo(null)
    setAttachment(null)
  }

  const pickAttachment = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadError('')
    setUploading(true)
    try {
      setAttachment(await uploadAttachment(file))
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
  const grad = NAVY
  const official = !thread.authorName
  const authorLabel = official ? 'NPrep Team' : thread.authorName
  const authorTier = official ? null : contributorTier(contributors[thread.authorKey])
  const roomTile = state.roomTiles.find(t => t.kind === roomKindFromKey(thread.roomKey))
  const canRegister = isWebinar && thread.startsAt && !thread.archived

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', position: 'relative' }}>
      <BackHeader onBack={onBack} title={roomTile ? roomTile.label : 'Thread'} right={
        <button onClick={share} className="icon-btn" aria-label="Share post" style={{ height: 40, minWidth: 40, padding: '0 8px', borderRadius: 12, background: 'none', border: 'none', cursor: 'pointer', color: shareMsg ? PD : T1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: FS.small, fontWeight: 700 }}>
          <ShareIcon size={18} color="currentColor" />{shareMsg}
        </button>
      } />

      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Post: author row, title, body, then like / comment / share bar (LinkedIn pattern) */}
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {official
              ? <img src="/nprep-logo.jpg" alt="" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }} />
              : <Avatar name={authorLabel} size={40} />}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                <span style={{ fontSize: FS.body, fontWeight: 700, color: INK }}>{authorLabel}</span>
                {official && <VerifiedIcon size={14} />}
                <ContributorBadge tier={authorTier} />
              </div>
              <div style={{ fontSize: FS.meta, color: T3, marginTop: 2 }}>{timeAgo(thread.createdAt)}</div>
            </div>
            {thread.isLive && <LiveBadge />}
          </div>

          {(roomTile || thread.subjectTag || thread.poll) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
              {roomTile && <RoomPill kind={roomTile.kind} emoji={roomTile.emoji}>{roomTile.label}</RoomPill>}
              {thread.subjectTag && <TagPill tone="subject">{thread.subjectTag}</TagPill>}
              {thread.poll && <TagPill tone="poll">📊 Poll</TagPill>}
            </div>
          )}

          <div style={{ fontSize: 20, fontWeight: 800, color: INK, lineHeight: 1.3, marginTop: 12, letterSpacing: '-0.01em' }}>{thread.title}</div>
        </div>

        {thread.approvalStatus === 'pending' && (
          <div style={{ margin: '12px 16px 0', background: '#FFF8E8', border: '1px solid #FFE0AD', borderRadius: 12, padding: '10px 13px', fontSize: FS.small, fontWeight: 600, color: '#8A5300', lineHeight: 1.45 }}>⏳ Waiting for NPrep approval — only you can see this post for now.</div>
        )}
        {thread.approvalStatus === 'rejected' && (
          <div style={{ margin: '12px 16px 0', background: '#FCEBEB', border: '1px solid #F09595', borderRadius: 12, padding: '10px 13px', fontSize: FS.small, fontWeight: 600, color: '#791F1F', lineHeight: 1.45 }}>NPrep didn't approve this post, so other students can't see it.</div>
        )}

        <div style={{ padding: '12px 16px 4px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {thread.body && <div style={{ fontSize: FS.body + 1, color: T1, lineHeight: 1.6 }}>{thread.body}</div>}
          <AttachmentPreview url={thread.attachmentUrl} name={thread.attachmentName} type={thread.attachmentType} />
          <ResourceLink url={thread.resourceUrl} name={thread.resourceName} />
        </div>

        <div style={{ padding: '8px 16px 0', fontSize: FS.meta + 0.5, color: T3 }}>
          {thread.likeCount} like{thread.likeCount === 1 ? '' : 's'} · {replies.length} comment{replies.length === 1 ? '' : 's'}
        </div>

        <div style={{ display: 'flex', margin: '8px 8px 0', borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}` }}>
          <button onClick={() => onLikeThread(thread.id)} className="action-btn" style={barBtn}>
            <HeartIcon size={18} liked={thread.likedByMe} />
            <span style={{ ...barLabel, color: thread.likedByMe ? '#E5385A' : T2 }}>{thread.likedByMe ? 'Liked' : 'Like'}</span>
          </button>
          <button onClick={() => inputRef.current?.focus()} className="action-btn" style={barBtn}>
            <CommentIcon size={18} />
            <span style={barLabel}>Comment</span>
          </button>
          <button onClick={share} className="action-btn" style={barBtn}>
            <ShareIcon size={18} />
            <span style={barLabel}>{shareMsg || 'Share'}</span>
          </button>
        </div>

        {canRegister && (
          <div style={{ padding: '12px 16px 0' }}>
            <button onClick={() => onRegisterForWebinar(thread.id)} className="pill-btn"
              style={{ width: '100%', fontSize: FS.body + 0.5, fontWeight: 700, color: thread.registeredByMe ? T2 : 'white', background: thread.registeredByMe ? BG2 : PD, border: 'none', borderRadius: 14, padding: '12px', cursor: 'pointer' }}>
              {thread.registeredByMe ? 'Registered ✓ — tap to cancel' : 'Register for this session'}
            </button>
          </div>
        )}

        {poll && (
          <div style={{ margin: '14px 16px 4px', background: BG2, border: `1px solid ${BD}`, borderRadius: 16, padding: '14px 14px 6px' }}>
            <div style={{ fontSize: FS.meta, fontWeight: 700, color: T2, marginBottom: 10, letterSpacing: '0.04em' }}>📊 POLL {poll.totalVotes > 0 ? `· ${poll.totalVotes} vote${poll.totalVotes === 1 ? '' : 's'}` : ''}</div>
            {poll.options.map(opt => {
              const pct = poll.totalVotes > 0 ? Math.round((opt.voteCount / poll.totalVotes) * 100) : 0
              const isMine = poll.myOptionId === opt.id
              if (!voted) {
                return (
                  <button key={opt.id} onClick={() => onVote(thread.id, opt.id)} className="row-tap"
                    style={{ width: '100%', textAlign: 'left', background: 'white', border: `1.5px solid ${BD}`, borderRadius: 12, padding: '11px 13px', marginBottom: 8, fontSize: FS.body, fontWeight: 600, color: T1, cursor: 'pointer' }}>
                    {opt.label}
                  </button>
                )
              }
              return (
                <div key={opt.id} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1.5px solid ${isMine ? PB : BD}`, marginBottom: 8, background: 'white' }}>
                  <div className="grow-x" style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: isMine ? PL : BG2, transition: 'width 0.3s' }} />
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px' }}>
                    <span style={{ fontSize: FS.body, fontWeight: 600, color: isMine ? PD : T1 }}>{opt.label}{isMine ? ' ✓' : ''}</span>
                    <span style={{ fontSize: FS.small, fontWeight: 700, color: isMine ? PD : T2 }}>{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Comments — threaded tree in tinted bubbles (LinkedIn / Glassdoor), connector lines,
            collapsible branches. The count/sort bar stays pinned once you scroll into a long list. */}
        <div style={{ padding: '0 14px 16px' }}>
          <div style={{
            position: 'sticky', top: 0, zIndex: 5, background: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 2px 10px', flexWrap: 'wrap', gap: 8,
          }}>
            <span style={{ fontSize: FS.heading, fontWeight: 800, color: INK }}>{replies.length} Comment{replies.length === 1 ? '' : 's'}</span>
            {topLevelReplies.length > 1 && (
              <div style={{ display: 'flex', gap: 4, background: '#E5EFFC', borderRadius: 20, padding: 3 }}>
                {[['relevant', 'Most relevant'], ['all', 'All comments']].map(([id, label]) => (
                  <button key={id} onClick={() => setSortMode(id)}
                    style={{ fontSize: FS.tag, fontWeight: 600, padding: '5px 11px', borderRadius: 20, cursor: 'pointer', border: 'none', background: sortMode === id ? 'white' : 'transparent', boxShadow: sortMode === id ? '0 1px 3px rgba(11,18,48,0.12)' : 'none', color: sortMode === id ? PD : T2 }}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {replies.length === 0 && <div style={{ fontSize: FS.small, color: T3, padding: '16px 6px' }}>No comments yet — be the first to jump in.</div>}
          {orderedTopLevel.map(r => (
            <CommentNode key={r.id} reply={r} depth={0} childrenMap={childrenMap} expandedIds={expandedIds} toggleExpand={toggleExpand}
              onLikeReply={onLikeReply} onReplyTo={reply => { setReplyTo({ id: reply.id, authorName: reply.authorName }); inputRef.current?.focus() }} onReport={setReportTarget} contributors={contributors} opKey={thread.authorKey} />
          ))}
          {relevantCapped && (
            <button onClick={() => setSortMode('all')}
              style={{ width: '100%', textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 4px', fontSize: FS.meta + 0.5, fontWeight: 700, color: PD }}>
              Showing top {RELEVANT_CAP} of {orderedTopLevelAll.length} comments — view all comments
            </button>
          )}
        </div>
      </div>

      {reportMsg && (
        <div className="toast-up" style={{ position: 'absolute', left: 16, right: 16, bottom: 76, background: INK, color: 'white', borderRadius: 12, padding: '11px 14px', fontSize: FS.small, fontWeight: 600, textAlign: 'center', zIndex: 20 }}>{reportMsg}</div>
      )}

      {reportTarget && (
        <div className="overlay" onClick={() => setReportTarget(null)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ textAlign: 'center', fontSize: FS.heading, fontWeight: 800, color: INK, padding: '14px 20px 4px' }}>Report comment</div>
            <div style={{ padding: '4px 20px 18px' }}>
              <div style={{ fontSize: FS.small, color: T2, margin: '4px 0 14px', lineHeight: 1.45, textAlign: 'center' }}>Select a reason. NPrep will review {reportTarget.authorName}'s comment — they won't be told it was you.</div>
              <div style={{ border: `1px solid ${BD}`, borderRadius: 16, overflow: 'hidden' }}>
                {(state.reportReasons || []).map((reason, i) => (
                  <button key={reason} className="row-tap"
                    onClick={async () => {
                      const target = reportTarget
                      setReportTarget(null)
                      try {
                        await onReportReply(target.id, reason)
                        setReportMsg('Thanks — NPrep will review this comment.')
                      } catch (err) {
                        setReportMsg(err.message || 'Could not send the report')
                      }
                      setTimeout(() => setReportMsg(''), 2600)
                    }}
                    style={{ width: '100%', textAlign: 'left', background: 'white', border: 'none', borderTop: i ? `1px solid ${BD}` : 'none', padding: '13px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: FS.body + 0.5, fontWeight: 700, color: INK }}>{reason}</span>
                      {REASON_HINTS[reason] && <span style={{ display: 'block', fontSize: FS.meta + 0.5, color: T3, marginTop: 2 }}>{REASON_HINTS[reason]}</span>}
                    </span>
                    <ChevronRight />
                  </button>
                ))}
              </div>
              <button onClick={() => setReportTarget(null)} className="pill-btn"
                style={{ width: '100%', marginTop: 12, background: BG2, border: 'none', borderRadius: 14, padding: '13px', fontSize: FS.body + 0.5, fontWeight: 700, color: T1, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {thread.archived ? (
        <div style={{ flexShrink: 0, borderTop: `1px solid ${BD}`, padding: '14px 16px', textAlign: 'center', fontSize: FS.small, color: T3, background: BG2 }}>
          This discussion has closed to new replies.
        </div>
      ) : (
        <div style={{ flexShrink: 0, borderTop: `1px solid ${BD}`, background: 'white' }}>
          {replyTo && (
            <div key={replyTo.id} className="reveal" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: BG2, fontSize: FS.meta + 0.5, color: T2 }}>
              <span>Replying to <b style={{ color: T1 }}>{replyTo.authorName}</b></span>
              <button onClick={() => setReplyTo(null)} aria-label="Cancel reply" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: T3, fontSize: 14, padding: 2 }}>✕</button>
            </div>
          )}
          {isWebinar && (attachment || uploading || uploadError) && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px 0' }}>
              {uploading && <span style={{ fontSize: FS.meta + 0.5, color: T2 }}>Uploading…</span>}
              {uploadError && <span style={{ fontSize: FS.meta + 0.5, color: '#791F1F' }}>{uploadError}</span>}
              {attachment && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <div style={{ maxWidth: 200 }}><AttachmentPreview url={attachment.url} name={attachment.name} type={attachment.type} /></div>
                  <button onClick={() => setAttachment(null)} aria-label="Remove attachment" style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, fontSize: 14, padding: 2 }}>✕</button>
                </div>
              )}
            </div>
          )}
          <div style={{ padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
            <Avatar name="You" size={34} />
            {isWebinar && (
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '50%', background: BG2, cursor: uploading ? 'default' : 'pointer', flexShrink: 0 }}>
                <input type="file" accept={ATTACHMENT_ACCEPT} onChange={pickAttachment} disabled={uploading} style={{ display: 'none' }} />
                <PaperclipIcon color={T2} />
              </label>
            )}
            <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} className="field"
              placeholder={replyTo ? `Reply to ${replyTo.authorName}…` : isWebinar ? 'Join the conversation, or attach media…' : 'Join the conversation…'}
              style={{ flex: 1, minWidth: 0, border: `1.5px solid ${BD}`, borderRadius: 22, padding: '10px 16px', fontSize: FS.body, background: BG2 }} />
            <button onClick={submit} disabled={!draft.trim()} aria-label="Send reply"
              style={{ background: draft.trim() ? grad : BD, color: 'white', border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: draft.trim() ? 'pointer' : 'default', flexShrink: 0 }}>
              <svg className={sending ? 'plane-fly' : undefined} width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const barBtn = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', padding: '11px 4px', borderRadius: 8 }
const barLabel = { fontSize: FS.small + 0.5, fontWeight: 700, color: T2 }

// Threaded comment: avatar-left with the text in a soft tinted bubble (LinkedIn / Glassdoor),
// small text actions underneath (Like · Reply · Report), and a connector line down to its
// children. Recurses into childrenMap[reply.id] for arbitrary depth; indent growth slows past
// depth 4 so a long thread doesn't run out of horizontal room on a phone-width screen.
//
// Replies-to-a-comment are collapsed by default, Instagram/Twitter-style — except any reply
// NPrep Team has liked, which shows inline automatically. The rest sit behind a "N replies"
// link next to the actions; tapping it reveals everyone underneath.
function CommentNode({ reply, depth, childrenMap, expandedIds, toggleExpand, onLikeReply, onReplyTo, onReport, contributors, opKey }) {
  const kids = childrenMap[reply.id] || []
  const isExpanded = expandedIds.has(reply.id)
  const nprepKids = kids.filter(k => k.likedByNPrepTeam)
  const otherKids = kids.filter(k => !k.likedByNPrepTeam)
  const visibleKids = isExpanded ? kids : nprepKids
  const hiddenCount = isExpanded ? 0 : otherKids.length

  if (reply.hidden) {
    return (
      <div className="comment-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: BG2, border: `1px dashed ${BD}`, flexShrink: 0 }} />
          <div style={{ fontSize: FS.small, color: T3, fontStyle: 'italic' }}>This comment was removed</div>
        </div>
        {visibleKids.length > 0 && (
          <CommentChildren kids={visibleKids} depth={depth} childrenMap={childrenMap} expandedIds={expandedIds} toggleExpand={toggleExpand}
            onLikeReply={onLikeReply} onReplyTo={onReplyTo} onReport={onReport} contributors={contributors} opKey={opKey} />
        )}
      </div>
    )
  }

  const isSelf = reply.studentKey === 'demo'
  const tier = contributorTier(contributors[reply.studentKey])
  const isOP = opKey && reply.studentKey === opKey
  const textBtn = { display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '5px 2px', borderRadius: 8, fontSize: FS.meta + 0.5, fontWeight: 700, color: T2 }

  return (
    <div className="comment-in">
      <div style={{ display: 'flex', gap: 8, padding: '6px 0' }}>
        <Avatar name={reply.authorName} size={30} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: reply.pinned ? '#FFF8E8' : BG2, border: reply.pinned ? '1px solid #FFE0AD' : '1px solid transparent', borderRadius: 14, padding: '8px 12px 9px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: FS.small, fontWeight: 700, color: INK }}>{isSelf ? 'You' : reply.authorName}</span>
              {isOP && <OPBadge />}
              <ContributorBadge tier={tier} />
              <span style={{ fontSize: FS.tag, color: T3 }}>· {timeAgo(reply.createdAt)}</span>
              {reply.likedByNPrepTeam && <span style={{ marginLeft: 'auto' }}><NPrepMark size={16} /></span>}
            </div>
            {reply.pinned && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 5, fontSize: FS.tag, fontWeight: 700, color: '#8A5300' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3l5 5-3 1-3.5 3.5L15 16l-2 2-3.5-3.5L4 20l-.5-.5L9 14 5.5 10.5l2-2 3.5.5L14.5 5.5z"/></svg>
                Pinned by NPrep Team
              </div>
            )}
            {reply.replyingToName && <div style={{ fontSize: FS.tag, color: T3, marginTop: 3 }}>↳ replying to {reply.replyingToName}</div>}
            <div style={{ fontSize: FS.body, color: T1, lineHeight: 1.5, marginTop: 3, wordBreak: 'break-word' }}>{reply.body}</div>
            {reply.attachmentUrl && <div style={{ marginTop: 8, maxWidth: 240 }}><AttachmentPreview url={reply.attachmentUrl} name={reply.attachmentName} type={reply.attachmentType} /></div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 2, paddingLeft: 8 }}>
            <button onClick={() => onLikeReply(reply.id)} className="action-btn" style={{ ...textBtn, color: reply.likedByMe ? '#E5385A' : T2 }}>
              <HeartIcon size={14} liked={reply.likedByMe} />
              {reply.likeCount > 0 ? reply.likeCount : 'Like'}
            </button>
            <button onClick={() => onReplyTo(reply)} className="action-btn" style={textBtn}>Reply</button>
            {hiddenCount > 0 && (
              <button onClick={() => toggleExpand(reply.id)} style={{ ...textBtn, color: PD }}>
                {hiddenCount} repl{hiddenCount === 1 ? 'y' : 'ies'}
              </button>
            )}
            {isExpanded && otherKids.length > 0 && (
              <button onClick={() => toggleExpand(reply.id)} style={{ ...textBtn, color: T3 }}>Hide replies</button>
            )}
            {!isSelf && (reply.reportedByMe ? (
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: FS.meta, fontWeight: 600, color: T3 }}><FlagIcon size={12} color={T3} /> Reported</span>
            ) : (
              <button onClick={() => onReport(reply)} className="action-btn" aria-label="Report comment" style={{ ...textBtn, marginLeft: 'auto', color: T3 }}>
                <FlagIcon size={12} color={T3} /> Report
              </button>
            ))}
          </div>
        </div>
      </div>

      {visibleKids.length > 0 && (
        <CommentChildren kids={visibleKids} depth={depth} childrenMap={childrenMap} expandedIds={expandedIds} toggleExpand={toggleExpand}
          onLikeReply={onLikeReply} onReplyTo={onReplyTo} onReport={onReport} contributors={contributors} opKey={opKey} />
      )}
    </div>
  )
}

function CommentChildren({ kids, depth, childrenMap, expandedIds, toggleExpand, onLikeReply, onReplyTo, onReport, contributors, opKey }) {
  const indent = depth < 4 ? 22 : 8
  return (
    <div className="reveal" style={{ marginLeft: 15, paddingLeft: indent - 15 + 8, borderLeft: `2px solid ${BD}` }}>
      {kids.map(child => (
        <CommentNode key={child.id} reply={child} depth={depth + 1} childrenMap={childrenMap} expandedIds={expandedIds} toggleExpand={toggleExpand}
          onLikeReply={onLikeReply} onReplyTo={onReplyTo} onReport={onReport} contributors={contributors} opKey={opKey} />
      ))}
    </div>
  )
}
