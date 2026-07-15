import { useState } from 'react'
import { StatusBar, T1, T2, T3, BG2, PL, PB, PD, G, INK, ROOM_GRADIENT, timeAgo } from '../../shared'

function isEnrolled(tile, enrolledRoomKeys, exam) {
  if (tile.kind === 'exam_room') return exam ? enrolledRoomKeys.includes('exam_room_' + exam.toLowerCase()) : false
  return enrolledRoomKeys.includes(tile.key)
}

function roomKeysFor(tile, exam) {
  if (tile.kind === 'exam_room') return exam ? ['exam_room_' + exam.toLowerCase()] : []
  return [tile.key]
}

export default function CommunityHome({ state, onSetExam, onSetRoomJoined, onOpenTile, onOpenThreadFromNotification, onBack }) {
  const [showNotifs, setShowNotifs] = useState(false)
  const { roomTiles, profile, enrolledRoomKeys, exams, notifications, threads } = state

  const threadsFor = (tile) => {
    const keys = roomKeysFor(tile, profile.exam)
    return threads.filter(t => keys.includes(t.roomKey) && !t.hidden).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: `8px solid ${BG2}` }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #1D5BF0, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>💬</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: INK }}>NPrep Community</div>
            <div style={{ fontSize: 11, color: T2, marginTop: 2 }}>{roomTiles.length} rooms · 5,000+ active students</div>
          </div>
        </div>

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

        <div>
          {roomTiles.map(tile => {
            const joined = isEnrolled(tile, enrolledRoomKeys, profile.exam)
            const roomKeys = roomKeysFor(tile, profile.exam)
            const list = threadsFor(tile)
            const last = list[0]
            const engagement = list.reduce((sum, t) => sum + t.replyCount, 0)
            const canJoin = roomKeys.length > 0

            return (
              <div key={tile.key} onClick={() => onOpenTile(tile)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: `1px solid ${BG2}`, cursor: 'pointer' }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: ROOM_GRADIENT[tile.kind] || BG2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>{tile.emoji}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: INK }}>{tile.label}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: T2, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {last ? last.title : tile.purpose}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: T3 }}>{last ? timeAgo(last.createdAt) : tile.cadence}</span>
                  {!joined && canJoin ? (
                    <button onClick={e => { e.stopPropagation(); onSetRoomJoined(roomKeys[0], true) }}
                      style={{ fontSize: 10, fontWeight: 700, color: PD, background: PL, border: `1px solid ${PB}`, borderRadius: 20, padding: '3px 10px', cursor: 'pointer' }}>
                      Join
                    </button>
                  ) : engagement > 0 ? (
                    <span style={{ minWidth: 18, height: 18, borderRadius: 10, background: G, color: 'white', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{engagement}</span>
                  ) : (
                    <span style={{ width: 18, height: 18 }} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
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
