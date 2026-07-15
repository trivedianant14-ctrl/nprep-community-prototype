import { BackHeader, T1, T2, T3, BD, BG2, PL, PB, PD, INK, CommentIcon, timeAgo } from '../../shared'

function Flair({ children, tone }) {
  const tones = {
    subject: { bg: PL, fg: PD, border: PB },
    poll: { bg: '#FFF4E0', fg: '#B96A00', border: '#FFE0AD' },
    archived: { bg: 'white', fg: T3, border: BD },
  }
  const t = tones[tone]
  return <span style={{ fontSize: 9.5, fontWeight: 800, color: t.fg, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 4, padding: '2px 7px', letterSpacing: '0.01em' }}>{children}</span>
}

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

      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 11.5, color: T2, lineHeight: 1.4, padding: '14px 16px 12px', borderBottom: `1px solid ${BG2}` }}>{tile.purpose}</div>

        {tile.kind === 'exam_room' && !profile.exam && (
          <div style={{ background: PL, border: `1px solid ${PB}`, borderRadius: 14, padding: '14px 16px', margin: '14px 16px' }}>
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

        {list.map(t => {
          const hot = Date.now() - new Date(t.createdAt).getTime() < 3 * 60 * 60 * 1000
          return (
            <button key={t.id} onClick={() => onOpenThread(t.id)}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: `1px solid ${BG2}`, padding: '13px 16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {t.subjectTag && <Flair tone="subject">{t.subjectTag}</Flair>}
                {t.poll && <Flair tone="poll">📊 POLL</Flair>}
                {t.archived && <Flair tone="archived">ARCHIVED</Flair>}
                {hot && !t.archived && <span style={{ fontSize: 10, fontWeight: 700, color: '#B9490A' }}>🔥 Hot</span>}
                <span style={{ fontSize: 10, color: T3, marginLeft: 'auto' }}>{timeAgo(t.createdAt)}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: INK, lineHeight: 1.4 }}>{t.title}</div>
              {t.body && <div style={{ fontSize: 11.5, color: T2, lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{t.body}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <CommentIcon />
                <span style={{ fontSize: 11, fontWeight: 700, color: T2 }}>{t.replyCount} comment{t.replyCount === 1 ? '' : 's'}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
