import { useState } from 'react'
import { StatusBar, BackIcon, T1, T2, T3, BD, BG2, PL, PB, PD, P, G, GL, INK, ROOM_GRADIENT, roomKindFromKey, RoomIcon, RoomPill, LikeButton, CommentIcon, ShareIcon, shareThread, AttachmentPreview, ResourceLink, LiveBadge, EmptyState, TagPill, isVisibleToStudent, examRoomKeyFor, timeAgo, FS } from '../../shared'

function isEnrolled(tile, enrolledRoomKeys, examKey) {
  if (tile.kind === 'exam_room') return examKey ? enrolledRoomKeys.includes(examKey) : false
  return enrolledRoomKeys.includes(tile.key)
}

function roomKeysFor(tile, examKey) {
  if (tile.kind === 'exam_room') return examKey ? [examKey] : []
  return [tile.key]
}

function tileForRoomKey(roomKey, roomTiles) {
  const kind = roomKindFromKey(roomKey)
  return roomTiles.find(t => t.kind === kind) || roomTiles[0]
}

const sectionLabel = { padding: '16px 16px 8px', fontSize: FS.meta, fontWeight: 700, color: T2, letterSpacing: '0.06em', textTransform: 'uppercase' }

export default function CommunityHome({ state, onSetExam, onSetRoomJoined, onOpenTile, onOpenThreadInRoom, onLikeThread, onRegisterForWebinar, onOpenThreadFromNotification, onBack }) {
  const [showNotifs, setShowNotifs] = useState(false)
  const [sharedId, setSharedId] = useState(null) // thread id currently showing "Link copied"
  const { roomTiles, profile, enrolledRoomKeys, exams, notifications, threads, rooms } = state
  const examKey = examRoomKeyFor(state, profile.exam)

  const share = async (t) => {
    const result = await shareThread(t)
    if (result.copied) {
      setSharedId(t.id)
      setTimeout(() => setSharedId(id => (id === t.id ? null : id)), 1800)
    }
  }

  const threadsFor = (tile) => {
    const keys = roomKeysFor(tile, examKey)
    return threads.filter(t => keys.includes(t.roomKey) && isVisibleToStudent(t)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  // Reddit-home-style mixed feed — recent posts from every room interleaved, so a student
  // can see (and like, and join on the spot) what's happening across the whole community
  // without visiting each room one at a time.
  const feedPosts = threads
    .filter(t => isVisibleToStudent(t) && !t.archived)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
      <StatusBar />
      <div style={{ padding: '2px 12px 8px 6px', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <button onClick={onBack} className="icon-btn" aria-label="Back" style={{ width: 40, height: 40, borderRadius: 12, background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BackIcon />
        </button>
        <span style={{ fontSize: FS.title, fontWeight: 700, color: INK, flex: 1 }}>Community</span>
        <button onClick={() => setShowNotifs(true)} className="icon-btn" aria-label="Notifications" style={{ position: 'relative', width: 40, height: 40, borderRadius: 12, background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          {notifications.length > 0 && <span style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: '50%', background: '#E5385A', border: '1.5px solid white' }} />}
        </button>
      </div>

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', background: 'white' }}>
        {/* The community itself, with rooms as its groups below */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 16px 14px', flexShrink: 0 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: P, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: FS.heading, fontWeight: 700, color: INK }}>NPrep Community</div>
            <div style={{ fontSize: FS.small, color: T2, marginTop: 2 }}>{roomTiles.length} rooms · 5,000+ active students</div>
          </div>
        </div>

        {!profile.exam && (
          <div style={{ background: PL, border: `1px solid ${PB}`, borderRadius: 14, padding: '14px 16px', margin: '0 16px 6px' }}>
            <div style={{ fontSize: FS.body, fontWeight: 700, color: PD, marginBottom: 3 }}>Which exam are you preparing for?</div>
            <div style={{ fontSize: FS.small, color: T2, marginBottom: 12, lineHeight: 1.45 }}>We'll auto-add you to that Exam Room for cutoffs, notifications and strategy.</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {exams.map(e => (
                <button key={e} onClick={() => onSetExam(e)} className="pill-btn" style={{ background: 'white', border: `1.5px solid ${PB}`, color: PD, fontSize: FS.small, fontWeight: 700, padding: '8px 18px', borderRadius: 20, cursor: 'pointer' }}>{e}</button>
              ))}
            </div>
          </div>
        )}

        {/* Rooms — one card per room tile: icon, name, purpose and the student's state in it. */}
        <div style={sectionLabel}>Rooms</div>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {roomTiles.map(tile => {
            const joined = isEnrolled(tile, enrolledRoomKeys, examKey)
            const roomKeys = roomKeysFor(tile, examKey)
            const list = threadsFor(tile)
            const engagement = list.reduce((sum, t) => sum + t.replyCount, 0)

            return (
              <button key={tile.key} onClick={() => onOpenTile(tile)} className="row-tap"
                style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', background: 'white', border: `1px solid ${BD}`, borderRadius: 14, padding: '11px 12px', cursor: 'pointer' }}>
                <RoomIcon kind={tile.kind} emoji={tile.emoji} size={42} />
                <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: FS.body, fontWeight: 700, color: INK }}>{tile.label}</span>
                  <span style={{ fontSize: FS.meta, color: T2, lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{tile.purpose}</span>
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  {!joined && roomKeys.length > 0 ? (
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: PD, background: PL, border: `1px solid ${PB}`, borderRadius: 20, padding: '3px 10px' }}>+ Not joined</span>
                  ) : joined ? (
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: G, background: GL, borderRadius: 20, padding: '3px 10px' }}>Joined ✓</span>
                  ) : null}
                  {joined && engagement > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 600, color: T2 }}>
                      <CommentIcon size={11} color={T3} />{engagement}
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {feedPosts.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={sectionLabel}>Recent across all rooms</div>
            {feedPosts.map(t => {
              const kind = roomKindFromKey(t.roomKey)
              const tile = tileForRoomKey(t.roomKey, roomTiles)
              const room = rooms.find(r => r.key === t.roomKey)
              const joined = enrolledRoomKeys.includes(t.roomKey)
              return (
                <div key={t.id} role="button" tabIndex={0} className="row-tap"
                  onClick={() => onOpenThreadInRoom(t.id, tile)}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onOpenThreadInRoom(t.id, tile)}
                  style={{ padding: '14px 16px', borderTop: `1px solid ${BD}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <RoomPill kind={kind} emoji={tile.emoji}>{room ? room.label : tile.label}</RoomPill>
                    {t.isLive && <LiveBadge />}
                    {t.approvalStatus === 'pending' && <TagPill tone="poll">⏳ Waiting for approval</TagPill>}
                    <span style={{ fontSize: FS.meta, color: T3, marginLeft: 'auto' }}>{timeAgo(t.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: FS.body + 0.5, fontWeight: 700, color: INK, lineHeight: 1.4 }}>{t.title}</div>
                  {t.body && <div style={{ fontSize: FS.small, color: T2, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{t.body}</div>}
                  {t.attachmentUrl && <div onClick={e => e.stopPropagation()}><AttachmentPreview url={t.attachmentUrl} name={t.attachmentName} type={t.attachmentType} /></div>}
                  {t.resourceUrl && <div onClick={e => e.stopPropagation()}><ResourceLink url={t.resourceUrl} name={t.resourceName} /></div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 1, flexWrap: 'wrap' }}>
                    <LikeButton liked={t.likedByMe} count={t.likeCount} onToggle={e => { e.stopPropagation(); onLikeThread(t.id) }} size={15} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <CommentIcon size={15} />
                      <span style={{ fontSize: FS.meta, fontWeight: 600, color: T2 }}>{t.replyCount} comment{t.replyCount === 1 ? '' : 's'}</span>
                    </div>
                    <button onClick={e => { e.stopPropagation(); share(t) }} className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px', borderRadius: 8 }}>
                      <ShareIcon size={15} />
                      <span style={{ fontSize: FS.meta, fontWeight: 600, color: T2 }}>{sharedId === t.id ? 'Link copied' : 'Share'}</span>
                    </button>
                    {t.roomKey === 'webinar_threads' && t.startsAt && !t.archived && (
                      <button onClick={e => { e.stopPropagation(); onRegisterForWebinar(t.id) }} className="pill-btn"
                        style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: t.registeredByMe ? T2 : PD, background: t.registeredByMe ? BG2 : PL, border: `1px solid ${t.registeredByMe ? BD : PB}`, borderRadius: 20, padding: '5px 12px', cursor: 'pointer' }}>
                        {t.registeredByMe ? 'Registered ✓' : 'Register'}
                      </button>
                    )}
                    {!joined && !(t.roomKey === 'webinar_threads' && t.startsAt && !t.archived) && (
                      <button onClick={e => { e.stopPropagation(); onSetRoomJoined(t.roomKey, true) }} className="pill-btn"
                        style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: PD, background: PL, border: `1px solid ${PB}`, borderRadius: 20, padding: '5px 12px', cursor: 'pointer' }}>
                        Join
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div style={{ height: 16 }} />
      </div>

      {showNotifs && (
        <div className="overlay" onClick={() => setShowNotifs(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '70%' }}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <span style={{ fontSize: FS.heading, fontWeight: 700, color: INK }}>Notifications</span>
              <button onClick={() => setShowNotifs(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: PD, fontSize: FS.small + 1, fontWeight: 600 }}>Close</button>
            </div>
            <div className="scroll" style={{ overflowY: 'auto', padding: '4px 0' }}>
              {notifications.length === 0 && <EmptyState icon="🔔" title="No notifications">No notifications yet.</EmptyState>}
              {notifications.map(n => (
                <button key={n.id} onClick={() => { setShowNotifs(false); onOpenThreadFromNotification(n.threadId) }} className="row-tap"
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: `1px solid ${BD}`, padding: '12px 18px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: n.kind === 'daily_dose' ? '#FFF3DD' : n.kind === 'reply' ? PL : n.kind === 'post_status' ? GL : '#F1EAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{n.kind === 'daily_dose' ? '🔥' : n.kind === 'reply' ? '💬' : n.kind === 'post_status' ? '📝' : '📣'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: FS.small + 0.5, fontWeight: 700, color: INK }}>{n.title}</div>
                    <div style={{ fontSize: FS.small, color: T2, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</div>
                  </div>
                  <span style={{ fontSize: 10.5, color: T3, flexShrink: 0, marginTop: 2 }}>{timeAgo(n.createdAt)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
