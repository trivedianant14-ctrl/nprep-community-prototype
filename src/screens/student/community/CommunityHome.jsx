import { useState } from 'react'
import { StatusBar, T1, T2, T3, BD, BG2, PL, PB, PD, G, INK, ROOM_GRADIENT, roomKindFromKey, LikeButton, CommentIcon, ShareIcon, shareThread, AttachmentPreview, ResourceLink, LiveBadge, timeAgo } from '../../shared'

function isEnrolled(tile, enrolledRoomKeys, exam) {
  if (tile.kind === 'exam_room') return exam ? enrolledRoomKeys.includes('exam_room_' + exam.toLowerCase()) : false
  return enrolledRoomKeys.includes(tile.key)
}

function roomKeysFor(tile, exam) {
  if (tile.kind === 'exam_room') return exam ? ['exam_room_' + exam.toLowerCase()] : []
  return [tile.key]
}

function tileForRoomKey(roomKey, roomTiles) {
  const kind = roomKindFromKey(roomKey)
  return roomTiles.find(t => t.kind === kind) || roomTiles[0]
}

export default function CommunityHome({ state, onSetExam, onSetRoomJoined, onOpenTile, onOpenThreadInRoom, onLikeThread, onRegisterForWebinar, onOpenThreadFromNotification, onBack }) {
  const [showNotifs, setShowNotifs] = useState(false)
  const [sharedId, setSharedId] = useState(null) // thread id currently showing "Link copied"
  const { roomTiles, profile, enrolledRoomKeys, exams, notifications, threads, rooms } = state

  const share = async (t) => {
    const result = await shareThread(t)
    if (result.copied) {
      setSharedId(t.id)
      setTimeout(() => setSharedId(id => (id === t.id ? null : id)), 1800)
    }
  }

  const threadsFor = (tile) => {
    const keys = roomKeysFor(tile, profile.exam)
    return threads.filter(t => keys.includes(t.roomKey) && !t.hidden).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  // Reddit-home-style mixed feed — recent posts from every room interleaved, so a student
  // can see (and like, and join on the spot) what's happening across the whole community
  // without visiting each room one at a time.
  const feedPosts = threads
    .filter(t => !t.hidden && !t.archived)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
      <StatusBar />
      <div style={{ padding: '10px 16px 6px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex', padding: 2 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <span style={{ fontSize: 16, fontWeight: 800, color: INK, flex: 1 }}>Community</span>
        <button onClick={() => setShowNotifs(true)} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex', padding: 2 }}>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          {notifications.length > 0 && <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#FF3B5C', border: '1.5px solid white' }} />}
        </button>
      </div>

      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
        {/* WhatsApp-Communities-style banner: the community itself, with rooms as its groups below */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', flexShrink: 0 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #1D5BF0, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>💬</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: INK }}>NPrep Community</div>
            <div style={{ fontSize: 11, color: T2, marginTop: 2 }}>{roomTiles.length} rooms · 5,000+ active students</div>
          </div>
        </div>

        {/* Channels — 1x4 grid right under the logo, so every room is a single tap away
            without scrolling past the feed to find the room list. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, padding: '0 12px 16px', borderBottom: `8px solid ${BG2}` }}>
          {roomTiles.map(tile => {
            const joined = isEnrolled(tile, enrolledRoomKeys, profile.exam)
            const roomKeys = roomKeysFor(tile, profile.exam)
            const list = threadsFor(tile)
            const engagement = list.reduce((sum, t) => sum + t.replyCount, 0)

            return (
              <button key={tile.key} onClick={() => onOpenTile(tile)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 2px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: ROOM_GRADIENT[tile.kind] || BG2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>{tile.emoji}</div>
                  {!joined && roomKeys.length > 0 ? (
                    <span style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: PD, color: 'white', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>+</span>
                  ) : engagement > 0 ? (
                    <span style={{ position: 'absolute', bottom: -2, right: -2, minWidth: 16, height: 16, borderRadius: 9, background: G, color: 'white', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '2px solid white' }}>{engagement}</span>
                  ) : null}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: INK, textAlign: 'center', lineHeight: 1.25 }}>{tile.label}</span>
              </button>
            )
          })}
        </div>

        {feedPosts.length > 0 && (
          <div style={{ borderBottom: `8px solid ${BG2}` }}>
            <div style={{ padding: '14px 16px 8px', fontSize: 12, fontWeight: 800, color: T2, letterSpacing: '0.02em' }}>🔥 RECENT ACROSS ALL ROOMS</div>
            {feedPosts.map(t => {
              const kind = roomKindFromKey(t.roomKey)
              const tile = tileForRoomKey(t.roomKey, roomTiles)
              const room = rooms.find(r => r.key === t.roomKey)
              const joined = enrolledRoomKeys.includes(t.roomKey)
              const grad = ROOM_GRADIENT[kind]
              return (
                <div key={t.id} role="button" tabIndex={0}
                  onClick={() => onOpenThreadInRoom(t.id, tile)}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onOpenThreadInRoom(t.id, tile)}
                  style={{ padding: '13px 16px', borderTop: `1px solid ${BG2}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 800, color: 'white', background: grad, borderRadius: 20, padding: '3px 9px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {tile.emoji} {room ? room.label : tile.label}
                    </span>
                    {t.isLive && <LiveBadge />}
                    <span style={{ fontSize: 10, color: T3, marginLeft: 'auto' }}>{timeAgo(t.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, lineHeight: 1.4 }}>{t.title}</div>
                  {t.body && <div style={{ fontSize: 11.5, color: T2, lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{t.body}</div>}
                  {t.attachmentUrl && <div onClick={e => e.stopPropagation()}><AttachmentPreview url={t.attachmentUrl} name={t.attachmentName} type={t.attachmentType} /></div>}
                  {t.resourceUrl && <div onClick={e => e.stopPropagation()}><ResourceLink url={t.resourceUrl} name={t.resourceName} /></div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 2, flexWrap: 'wrap' }}>
                    <LikeButton liked={t.likedByMe} count={t.likeCount} onToggle={e => { e.stopPropagation(); onLikeThread(t.id) }} size={13} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <CommentIcon />
                      <span style={{ fontSize: 11, fontWeight: 700, color: T2 }}>{t.replyCount} comment{t.replyCount === 1 ? '' : 's'}</span>
                    </div>
                    <button onClick={e => { e.stopPropagation(); share(t) }} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px' }}>
                      <ShareIcon size={13} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: T2 }}>{sharedId === t.id ? 'Link copied' : 'Share'}</span>
                    </button>
                    {t.roomKey === 'webinar_threads' && t.startsAt && !t.archived && (
                      <button onClick={e => { e.stopPropagation(); onRegisterForWebinar(t.id) }}
                        style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: t.registeredByMe ? T2 : PD, background: t.registeredByMe ? BG2 : PL, border: `1px solid ${t.registeredByMe ? BD : PB}`, borderRadius: 20, padding: '3px 10px', cursor: 'pointer' }}>
                        {t.registeredByMe ? 'Registered ✓' : 'Register'}
                      </button>
                    )}
                    {!joined && !(t.roomKey === 'webinar_threads' && t.startsAt && !t.archived) && (
                      <button onClick={e => { e.stopPropagation(); onSetRoomJoined(t.roomKey, true) }}
                        style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: PD, background: PL, border: `1px solid ${PB}`, borderRadius: 20, padding: '3px 10px', cursor: 'pointer' }}>
                        Join
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!profile.exam && (
          <div style={{ background: PL, border: `1px solid ${PB}`, borderRadius: 14, padding: '14px 16px', margin: '14px 16px' }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: PD, marginBottom: 3 }}>Which exam are you preparing for?</div>
            <div style={{ fontSize: 11, color: T2, marginBottom: 10, lineHeight: 1.4 }}>We'll auto-add you to that Exam Room for cutoffs, notifications and strategy.</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {exams.map(e => (
                <button key={e} onClick={() => onSetExam(e)} style={{ background: 'white', border: `1.5px solid ${PB}`, color: PD, fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 20, cursor: 'pointer' }}>{e}</button>
              ))}
            </div>
          </div>
        )}

      </div>

      {showNotifs && (
        <div className="overlay" onClick={() => setShowNotifs(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '70%' }}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <span style={{ fontSize: 14.5, fontWeight: 800, color: INK }}>Notifications</span>
              <button onClick={() => setShowNotifs(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T2, fontSize: 13 }}>Close</button>
            </div>
            <div className="scroll" style={{ overflowY: 'auto', padding: '4px 0' }}>
              {notifications.length === 0 && <div style={{ padding: '30px 20px', textAlign: 'center', fontSize: 12, color: T3 }}>No notifications yet.</div>}
              {notifications.map(n => (
                <button key={n.id} onClick={() => { setShowNotifs(false); onOpenThreadFromNotification(n.threadId) }}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: `1px solid ${BG2}`, padding: '12px 20px', cursor: 'pointer', display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{n.kind === 'daily_dose' ? '🔥' : n.kind === 'reply' ? '💬' : '📣'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T1 }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: T2, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</div>
                  </div>
                  <span style={{ fontSize: 9.5, color: T3, flexShrink: 0 }}>{timeAgo(n.createdAt)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
