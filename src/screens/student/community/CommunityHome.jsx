import { useState } from 'react'
import { StatusBar, T1, T2, T3, BD, BG2, P, PL, PB, PD, INK, timeAgo } from '../../shared'

function isEnrolled(tile, enrolledRoomKeys, exam) {
  if (tile.kind === 'exam_room') return exam ? enrolledRoomKeys.includes('exam_room_' + exam.toLowerCase()) : false
  return enrolledRoomKeys.includes(tile.key)
}

export default function CommunityHome({ state, onSetExam, onSetRoomJoined, onOpenTile, onOpenThreadFromNotification, onBack }) {
  const [showNotifs, setShowNotifs] = useState(false)
  const { roomTiles, profile, enrolledRoomKeys, exams, notifications, threads } = state

  const threadCountFor = (tile) => {
    if (tile.kind === 'exam_room') {
      if (!profile.exam) return 0
      return threads.filter(t => t.roomKey === 'exam_room_' + profile.exam.toLowerCase() && !t.hidden).length
    }
    return threads.filter(t => t.roomKey === tile.key && !t.hidden).length
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

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px 16px 20px' }}>
        {!profile.exam && (
          <div style={{ background: PL, border: `1px solid ${PB}`, borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: PD, marginBottom: 3 }}>Which exam are you preparing for?</div>
            <div style={{ fontSize: 11, color: T2, marginBottom: 10, lineHeight: 1.4 }}>We'll auto-add you to that Exam Room for cutoffs, notifications and strategy.</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {exams.map(e => (
                <button key={e} onClick={() => onSetExam(e)} style={{ background: 'white', border: `1.5px solid ${PB}`, color: PD, fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 20, cursor: 'pointer' }}>{e}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {roomTiles.map(tile => {
            const joined = isEnrolled(tile, enrolledRoomKeys, profile.exam)
            const count = threadCountFor(tile)
            return (
              <button key={tile.key} onClick={() => onOpenTile(tile)} style={{ textAlign: 'left', background: BG2, border: `1px solid ${BD}`, borderRadius: 16, padding: '14px 14px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 24 }}>{tile.emoji}</span>
                  {joined && <span style={{ fontSize: 8.5, fontWeight: 800, color: '#3B6D11', background: '#EAF3DE', border: '1px solid #97C459', borderRadius: 20, padding: '2px 7px' }}>JOINED</span>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: INK }}>{tile.label}</div>
                <div style={{ fontSize: 10, color: T2, lineHeight: 1.4 }}>{tile.purpose}</div>
                <div style={{ fontSize: 9.5, color: T3, marginTop: 2 }}>{count} thread{count === 1 ? '' : 's'} · {tile.cadence}</div>
              </button>
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
