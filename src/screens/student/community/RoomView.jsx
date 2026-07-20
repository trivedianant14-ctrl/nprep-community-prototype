import { useState } from 'react'
import { BackHeader, T1, T2, T3, BD, BG2, PL, PB, PD, INK, CommentIcon, LikeButton, ROOM_GRADIENT, timeAgo } from '../../shared'
import ChannelWheel from './ChannelWheel'

const CONTRIBUTOR_POST_KINDS = ['subject_room', 'exam_room']

function Flair({ children, tone }) {
  const tones = {
    subject: 'linear-gradient(135deg,#1D5BF0,#7C3AED)',
    poll: 'linear-gradient(135deg,#FBBF24,#F59E0B)',
  }
  const grad = tones[tone]
  if (!grad) return <span style={{ fontSize: 9.5, fontWeight: 800, color: T3, background: BG2, border: `1px solid ${BD}`, borderRadius: 20, padding: '2px 9px' }}>{children}</span>
  return <span style={{ fontSize: 9.5, fontWeight: 800, color: 'white', background: grad, borderRadius: 20, padding: '3px 9px' }}>{children}</span>
}

export default function RoomView({ state, tile, onSetExam, onSetRoomJoined, onOpenThread, onSwitchRoom, onLikeThread, onCreatePost, onBack }) {
  const { profile, enrolledRoomKeys, exams, threads, roomTiles } = state
  const [showCompose, setShowCompose] = useState(false)
  const [postTitle, setPostTitle] = useState('')
  const [postBody, setPostBody] = useState('')

  const roomKey = tile.kind === 'exam_room' ? (profile.exam ? 'exam_room_' + profile.exam.toLowerCase() : null) : tile.key
  const joined = roomKey ? enrolledRoomKeys.includes(roomKey) : false
  const list = roomKey ? threads.filter(t => t.roomKey === roomKey && !t.hidden).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []
  const grad = ROOM_GRADIENT[tile.kind]
  const currentIndex = Math.max(0, roomTiles.findIndex(t => t.key === tile.key))
  const HEADER_H = 54

  const contributor = state.contributors?.demo
  const roomAcceptsContributorPosts = CONTRIBUTOR_POST_KINDS.includes(tile.kind)
  const canPost = roomAcceptsContributorPosts && roomKey && contributor?.approvedToPost
  const pendingApproval = roomAcceptsContributorPosts && roomKey && contributor?.isEligible && !contributor?.approvedToPost

  const submitPost = async () => {
    if (!postTitle.trim() || !roomKey) return
    await onCreatePost({ roomKey, title: postTitle.trim(), body: postBody.trim() })
    setPostTitle(''); setPostBody(''); setShowCompose(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', position: 'relative' }}>
      <BackHeader onBack={onBack} title={tile.label} right={roomKey && (
        <button onClick={() => onSetRoomJoined(roomKey, !joined)}
          style={{ fontSize: 10.5, fontWeight: 700, padding: '6px 12px', borderRadius: 20, cursor: 'pointer', border: 'none', background: joined ? BG2 : grad, color: joined ? T2 : 'white' }}>
          {joined ? 'Joined ✓' : 'Join'}
        </button>
      )} />
      <ChannelWheel rooms={roomTiles} currentIndex={currentIndex} onSwitch={onSwitchRoom} topOffset={HEADER_H} />

      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Hike-style gradient hero for the room itself */}
        <div style={{ background: grad, padding: '18px 18px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -24, right: -10, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
          <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, position: 'relative' }}>{tile.emoji}</div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>{tile.label}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.88)', marginTop: 2, lineHeight: 1.4 }}>{tile.purpose}</div>
          </div>
        </div>

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

        {pendingApproval && (
          <div style={{ background: '#FFF4E0', border: '1px solid #FFE0AD', borderRadius: 12, padding: '10px 14px', margin: '14px 16px 0', fontSize: 11, fontWeight: 700, color: '#B96A00' }}>
            🎖️ You're a Top Contributor — posting here opens up once NPrep approves you.
          </div>
        )}

        {roomKey && list.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 10px', fontSize: 12, color: T3 }}>No threads yet in this room.</div>
        )}

        {list.map(t => {
          const hot = Date.now() - new Date(t.createdAt).getTime() < 3 * 60 * 60 * 1000
          return (
            <div key={t.id} role="button" tabIndex={0} onClick={() => onOpenThread(t.id)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onOpenThread(t.id)}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: `1px solid ${BG2}`, padding: '13px 16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {t.subjectTag && <Flair tone="subject">{t.subjectTag}</Flair>}
                {t.poll && <Flair tone="poll">📊 POLL</Flair>}
                {hot && !t.archived && <span style={{ fontSize: 10, fontWeight: 700, color: '#B9490A' }}>🔥 Hot</span>}
                <span style={{ fontSize: 10, color: T3, marginLeft: 'auto' }}>{timeAgo(t.createdAt)}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: INK, lineHeight: 1.4 }}>{t.title}</div>
              {t.body && <div style={{ fontSize: 11.5, color: T2, lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{t.body}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 2 }}>
                <LikeButton liked={t.likedByMe} count={t.likeCount} onToggle={e => { e.stopPropagation(); onLikeThread(t.id) }} size={13} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CommentIcon />
                  <span style={{ fontSize: 11, fontWeight: 700, color: T2 }}>{t.replyCount} comment{t.replyCount === 1 ? '' : 's'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {canPost && (
        <button onClick={() => setShowCompose(true)}
          style={{ position: 'absolute', right: 18, bottom: 18, width: 50, height: 50, borderRadius: '50%', background: grad, color: 'white', border: 'none', boxShadow: '0 6px 18px rgba(0,0,0,0.25)', fontSize: 24, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          +
        </button>
      )}

      {showCompose && (
        <div className="overlay" onClick={() => setShowCompose(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <span style={{ fontSize: 14.5, fontWeight: 800, color: INK }}>New post in {tile.label}</span>
              <button onClick={() => setShowCompose(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T2, fontSize: 13 }}>Close</button>
            </div>
            <div style={{ padding: '16px 20px 20px' }}>
              <input value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="Title"
                style={{ width: '100%', border: `1.5px solid ${BD}`, borderRadius: 10, padding: '10px 12px', fontSize: 13, marginBottom: 10, outline: 'none' }} />
              <textarea value={postBody} onChange={e => setPostBody(e.target.value)} placeholder="Add detail (optional)…" rows={4}
                style={{ width: '100%', border: `1.5px solid ${BD}`, borderRadius: 10, padding: '10px 12px', fontSize: 13, resize: 'vertical', outline: 'none' }} />
              <button onClick={submitPost} disabled={!postTitle.trim()}
                style={{ marginTop: 14, width: '100%', background: postTitle.trim() ? grad : BD, color: 'white', border: 'none', borderRadius: 24, padding: '12px', fontSize: 13.5, fontWeight: 700, cursor: postTitle.trim() ? 'pointer' : 'default' }}>
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
