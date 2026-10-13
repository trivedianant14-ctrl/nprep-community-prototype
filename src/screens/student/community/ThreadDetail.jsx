import { useState } from 'react'
import { BackHeader, T1, T2, T3, BD, BG2, PL, PB, PD, INK, Avatar, HeartIcon, RoomPill, roomKindFromKey, ROOM_GRADIENT, CommentIcon, LikeButton, ShareIcon, shareThread, timeAgo, ContributorBadge, contributorTier, NPrepMark, OPBadge, PaperclipIcon, AttachmentPreview, uploadAttachment, ATTACHMENT_ACCEPT, ResourceLink, LiveBadge, TagPill, FS } from '../../shared'
import ChannelWheel from './ChannelWheel'

export default function ThreadDetail({ state, threadId, onPostReply, onVote, onLikeThread, onLikeReply, onSwitchRoom, onRegisterForWebinar, onBack }) {
  const [draft, setDraft] = useState('')
  const [shareMsg, setShareMsg] = useState('')
  const [attachment, setAttachment] = useState(null) // { url, name, type } | null — pending media for the next reply
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
        <div style={{ padding: 30, textAlign: 'center', fontSize: FS.small, color: T3 }}>Thread not found.</div>
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
  const grad = ROOM_GRADIENT[roomKindFromKey(thread.roomKey)]
  const currentIndex = Math.max(0, state.roomTiles.findIndex(t => t.kind === roomKindFromKey(thread.roomKey)))
  const HEADER_H = 54
  const authorLabel = thread.authorName || 'NPrep Team'
  const roomTile = state.roomTiles.find(t => t.kind === roomKindFromKey(thread.roomKey))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', position: 'relative' }}>
      <BackHeader onBack={onBack} title="Thread" />
      <ChannelWheel rooms={state.roomTiles} currentIndex={currentIndex} onSwitch={onSwitchRoom} topOffset={HEADER_H} />

      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Post header: tags, title and author */}
        <div style={{ padding: '16px 18px 0 28px' }}>
          {roomTile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              <RoomPill kind={roomTile.kind} emoji={roomTile.emoji}>{roomTile.label}</RoomPill>
              {thread.subjectTag && <TagPill tone="subject">{thread.subjectTag}</TagPill>}
              {thread.poll && <TagPill tone="poll">📊 Poll</TagPill>}
              {thread.isLive && <LiveBadge />}
            </div>
          )}
          <div style={{ fontSize: 19, fontWeight: 700, color: INK, lineHeight: 1.32 }}>{thread.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <Avatar name={authorLabel} size={26} />
            <span style={{ fontSize: FS.small, fontWeight: 600, color: T1 }}>{authorLabel}</span>
            <span style={{ fontSize: FS.meta, color: T3 }}>· {timeAgo(thread.createdAt)}</span>
          </div>
        </div>

        <div style={{ padding: '14px 18px 4px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {thread.body && <div style={{ fontSize: FS.body + 0.5, color: T1, lineHeight: 1.6 }}>{thread.body}</div>}
          <AttachmentPreview url={thread.attachmentUrl} name={thread.attachmentName} type={thread.attachmentType} />
          <ResourceLink url={thread.resourceUrl} name={thread.resourceName} />
        </div>

        {/* Action row: like, comment count, share — all on the post itself */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 16px 8px 24px', borderBottom: `1px solid ${BD}` }}>
          <LikeButton liked={thread.likedByMe} count={thread.likeCount} onToggle={() => onLikeThread(thread.id)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <CommentIcon size={15} />
            <span style={{ fontSize: FS.meta, fontWeight: 600, color: T2 }}>{replies.length}</span>
          </div>
          <button onClick={share} className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px', borderRadius: 8, marginLeft: isWebinar && thread.startsAt && !thread.archived ? 0 : 'auto' }}>
            <ShareIcon />
            <span style={{ fontSize: FS.meta, fontWeight: 600, color: T2 }}>{shareMsg || 'Share'}</span>
          </button>
          {isWebinar && thread.startsAt && !thread.archived && (
            <button onClick={() => onRegisterForWebinar(thread.id)} className="pill-btn"
              style={{ marginLeft: 'auto', fontSize: FS.small, fontWeight: 700, color: thread.registeredByMe ? T2 : PD, background: thread.registeredByMe ? BG2 : PL, border: `1px solid ${thread.registeredByMe ? BD : PB}`, borderRadius: 20, padding: '7px 14px', cursor: 'pointer' }}>
              {thread.registeredByMe ? 'Registered ✓' : 'Register'}
            </button>
          )}
        </div>

        {poll && (
          <div style={{ margin: '14px 16px 14px 28px', background: BG2, border: `1px solid ${BD}`, borderRadius: 14, padding: '14px 14px 6px' }}>
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
                  <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: isMine ? PL : BG2, transition: 'width 0.3s' }} />
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px' }}>
                    <span style={{ fontSize: FS.body, fontWeight: 600, color: isMine ? PD : T1 }}>{opt.label}{isMine ? ' ✓' : ''}</span>
                    <span style={{ fontSize: FS.small, fontWeight: 700, color: isMine ? PD : T2 }}>{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Comments — threaded tree: connector lines, collapsible branches, likes only,
            badges inline with the username. The count/sort bar stays pinned
            (position: sticky) once you scroll into a long comment list. */}
        <div style={{ padding: '0 14px 16px 24px' }}>
          <div style={{
            position: 'sticky', top: 0, zIndex: 5, background: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 4px', marginBottom: 4, flexWrap: 'wrap', gap: 8,
            borderBottom: `1px solid ${BD}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CommentIcon size={15} color={T1} />
              <span style={{ fontSize: FS.body, fontWeight: 700, color: INK }}>{replies.length} Comment{replies.length === 1 ? '' : 's'}</span>
            </div>
            {topLevelReplies.length > 1 && (
              <div style={{ display: 'flex', gap: 4, background: BG2, borderRadius: 20, padding: 3 }}>
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
              onLikeReply={onLikeReply} onReplyTo={reply => setReplyTo({ id: reply.id, authorName: reply.authorName })} contributors={contributors} opKey={thread.authorKey} />
          ))}
          {relevantCapped && (
            <button onClick={() => setSortMode('all')}
              style={{ width: '100%', textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 4px', fontSize: FS.meta + 0.5, fontWeight: 700, color: PD }}>
              Showing top {RELEVANT_CAP} of {orderedTopLevelAll.length} comments — view all comments
            </button>
          )}
        </div>
      </div>

      {thread.archived ? (
        <div style={{ flexShrink: 0, borderTop: `1px solid ${BD}`, padding: '14px 16px', textAlign: 'center', fontSize: FS.small, color: T3, background: BG2 }}>
          This discussion has closed to new replies.
        </div>
      ) : (
        <div style={{ flexShrink: 0, borderTop: `1px solid ${BD}`, background: 'white' }}>
          {replyTo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: BG2, fontSize: FS.meta + 0.5, color: T2 }}>
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
            {isWebinar && (
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: BG2, cursor: uploading ? 'default' : 'pointer', flexShrink: 0 }}>
                <input type="file" accept={ATTACHMENT_ACCEPT} onChange={pickAttachment} disabled={uploading} style={{ display: 'none' }} />
                <PaperclipIcon color={T2} />
              </label>
            )}
            <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} className="field"
              placeholder={replyTo ? `Reply to ${replyTo.authorName}…` : isWebinar ? 'Join the conversation, or attach media…' : 'Join the conversation…'}
              style={{ flex: 1, minWidth: 0, border: `1.5px solid ${BD}`, borderRadius: 22, padding: '11px 16px', fontSize: FS.body, background: BG2 }} />
            <button onClick={submit} disabled={!draft.trim()} aria-label="Send reply"
              style={{ background: draft.trim() ? grad : BD, color: 'white', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: draft.trim() ? 'pointer' : 'default', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Threaded comment: avatar-left, plain text (no chat bubble, no self-flip), a connector line
// down to its children. Recurses into childrenMap[reply.id] for arbitrary depth; indent
// growth slows past depth 4 so a long thread doesn't run out of horizontal room on a
// phone-width screen.
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
          <span style={{ width: 26, height: 26, borderRadius: '50%', background: BG2, border: `1px dashed ${BD}`, flexShrink: 0 }} />
          <div style={{ fontSize: FS.small, color: T3, fontStyle: 'italic' }}>This comment was removed</div>
        </div>
        {visibleKids.length > 0 && (
          <CommentChildren kids={visibleKids} depth={depth} childrenMap={childrenMap} expandedIds={expandedIds} toggleExpand={toggleExpand}
            onLikeReply={onLikeReply} onReplyTo={onReplyTo} contributors={contributors} opKey={opKey} />
        )}
      </div>
    )
  }

  const isSelf = reply.studentKey === 'demo'
  const tier = contributorTier(contributors[reply.studentKey])
  const isOP = opKey && reply.studentKey === opKey

  return (
    <div>
      <div style={{ display: 'flex', gap: 9, padding: '9px 0' }}>
        <Avatar name={reply.authorName} size={28} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: FS.small, fontWeight: 700, color: T1 }}>{isSelf ? 'You' : reply.authorName}</span>
            {isOP && <OPBadge />}
            <ContributorBadge tier={tier} />
            <span style={{ fontSize: FS.tag, color: T3 }}>· {timeAgo(reply.createdAt)}</span>
          </div>
          {reply.pinned && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: FS.tag, fontWeight: 700, color: '#8A5300', background: '#FFF1D6', borderRadius: 20, padding: '2px 8px' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3l5 5-3 1-3.5 3.5L15 16l-2 2-3.5-3.5L4 20l-.5-.5L9 14 5.5 10.5l2-2 3.5.5L14.5 5.5z"/></svg>
              Pinned by NPrep Team
            </div>
          )}
          {reply.replyingToName && <div style={{ fontSize: FS.tag, color: T3, marginTop: 2 }}>↳ replying to {reply.replyingToName}</div>}
          <div style={{ fontSize: FS.body, color: T1, lineHeight: 1.5, marginTop: 3, wordBreak: 'break-word' }}>{reply.body}</div>
          {reply.attachmentUrl && <div style={{ marginTop: 8, maxWidth: 240 }}><AttachmentPreview url={reply.attachmentUrl} name={reply.attachmentName} type={reply.attachmentType} /></div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
            <button onClick={() => onLikeReply(reply.id)} className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '5px 4px', marginLeft: -4, borderRadius: 8 }}>
              <HeartIcon size={15} liked={reply.likedByMe} />
              {reply.likeCount > 0 && <span style={{ fontSize: FS.meta, fontWeight: 600, color: reply.likedByMe ? '#E5385A' : T2 }}>{reply.likeCount}</span>}
            </button>
            {reply.likedByNPrepTeam && <NPrepMark size={16} />}
            {hiddenCount > 0 && (
              <button onClick={() => toggleExpand(reply.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 0', fontSize: FS.meta, fontWeight: 700, color: PD }}>
                {hiddenCount} repl{hiddenCount === 1 ? 'y' : 'ies'}
              </button>
            )}
            {isExpanded && otherKids.length > 0 && (
              <button onClick={() => toggleExpand(reply.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 0', fontSize: FS.meta, fontWeight: 700, color: T3 }}>
                Hide replies
              </button>
            )}
            <button onClick={() => onReplyTo(reply)} className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '5px 4px', borderRadius: 8, fontSize: FS.meta, fontWeight: 600, color: T2 }}>
              <CommentIcon size={12} color={T2} /> Reply
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
    <div style={{ marginLeft: 13, paddingLeft: indent - 13, borderLeft: `2px solid ${BD}` }}>
      {kids.map(child => (
        <CommentNode key={child.id} reply={child} depth={depth + 1} childrenMap={childrenMap} expandedIds={expandedIds} toggleExpand={toggleExpand}
          onLikeReply={onLikeReply} onReplyTo={onReplyTo} contributors={contributors} opKey={opKey} />
      ))}
    </div>
  )
}
