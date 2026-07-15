import { BackHeader, T1, T2, T3, BD, BG2, PL, PB, PD, G, GL, GB, INK, timeAgo } from '../../shared'

export default function RoomView({ state, tile, onSetExam, onSetRoomJoined, onOpenThread, onBack }) {
  const { profile, enrolledRoomKeys, exams, threads } = state

  const roomKey = tile.kind === 'exam_room' ? (profile.exam ? 'exam_room_' + profile.exam.toLowerCase() : null) : tile.key
  const joined = roomKey ? enrolledRoomKeys.includes(roomKey) : false
  const list = roomKey ? threads.filter(t => t.roomKey === roomKey && !t.hidden).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
      <BackHeader onBack={onBack} title={tile.label} right={roomKey && (
        <button onClick={() => onSetRoomJoined(roomKey, !joined)}
          style={{ fontSize: 10.5, fontWeight: 700, padding: '6px 12px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${joined ? BD : PB}`, background: joined ? BG2 : PL, color: joined ? T2 : PD }}>
          {joined ? 'Joined ✓' : 'Join'}
        </button>
      )} />

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 20px' }}>
        <div style={{ fontSize: 11.5, color: T2, marginBottom: 14, lineHeight: 1.4 }}>{tile.purpose}</div>

        {tile.kind === 'exam_room' && !profile.exam && (
          <div style={{ background: PL, border: `1px solid ${PB}`, borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: PD, marginBottom: 10 }}>Pick your exam to see this room's threads</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {exams.map(e => (
                <button key={e} onClick={() => onSetExam(e)} style={{ background: 'white', border: `1.5px solid ${PB}`, color: PD, fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 20, cursor: 'pointer' }}>{e}</button>
              ))}
            </div>
          </div>
        )}

        {roomKey && list.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 10px', fontSize: 12, color: T3 }}>No threads yet in this room.</div>
        )}

        {list.map(t => (
          <button key={t.id} onClick={() => onOpenThread(t.id)} style={{ width: '100%', textAlign: 'left', background: BG2, border: `1px solid ${BD}`, borderRadius: 14, padding: '13px 15px', marginBottom: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {t.subjectTag && <span style={{ fontSize: 9, fontWeight: 800, color: PD, background: PL, border: `1px solid ${PB}`, borderRadius: 20, padding: '2px 8px' }}>{t.subjectTag}</span>}
              {t.poll && <span style={{ fontSize: 9, fontWeight: 800, color: '#B96A00', background: '#FFF4E0', border: '1px solid #FFE0AD', borderRadius: 20, padding: '2px 8px' }}>📊 Poll</span>}
              {t.archived && <span style={{ fontSize: 9, fontWeight: 800, color: T3, background: 'white', border: `1px solid ${BD}`, borderRadius: 20, padding: '2px 8px' }}>Archived</span>}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: INK, lineHeight: 1.4 }}>{t.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 10, color: T3 }}>{timeAgo(t.createdAt)}</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T2 }}>💬 {t.replyCount} repl{t.replyCount === 1 ? 'y' : 'ies'}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
