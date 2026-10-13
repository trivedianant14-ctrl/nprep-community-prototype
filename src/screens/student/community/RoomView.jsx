import { useState } from 'react'
import { BackHeader, T1, T2, T3, BD, BG2, PL, PB, PD, G, GL, INK, CommentIcon, LikeButton, ROOM_GRADIENT, ROOM_TINT, RoomIcon, TagPill, ShareIcon, shareThread, AttachmentPreview, ResourceLink, LiveBadge, EmptyState, timeAgo, FS } from '../../shared'
import ChannelWheel from './ChannelWheel'

const CONTRIBUTOR_POST_KINDS = ['subject_room', 'exam_room']

export default function RoomView({ state, tile, onSetExam, onSetRoomJoined, onOpenThread, onSwitchRoom, onLikeThread, onCreatePost, onRegisterForWebinar, onBack }) {
  const { profile, enrolledRoomKeys, exams, threads, roomTiles, subjectTags } = state
  const [showCompose, setShowCompose] = useState(false)
  const [postTitle, setPostTitle] = useState('')
  const [postBody, setPostBody] = useState('')
  const [sharedId, setSharedId] = useState(null) // thread id currently showing "Link copied"
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')

  const share = async (t) => {
    const result = await shareThread(t)
    if (result.copied) {
      setSharedId(t.id)
      setTimeout(() => setSharedId(id => (id === t.id ? null : id)), 1800)
    }
  }

  const roomKey = tile.kind === 'exam_room' ? (profile.exam ? 'exam_room_' + profile.exam.toLowerCase() : null) : tile.key
  const joined = roomKey ? enrolledRoomKeys.includes(roomKey) : false
  const isYtLectures = tile.kind === 'yt_lectures'
  let list = roomKey ? threads.filter(t => t.roomKey === roomKey && !t.hidden).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []
  if (isYtLectures) {
    if (search.trim()) list = list.filter(t => t.title.toLowerCase().includes(search.trim().toLowerCase()))
    if (subjectFilter !== 'all') list = list.filter(t => t.subjectTag === subjectFilter)
  }
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
        <button onClick={() => onSetRoomJoined(roomKey, !joined)} className="pill-btn"
          style={{ fontSize: FS.small, fontWeight: 700, padding: '7px 14px', borderRadius: 20, cursor: 'pointer', border: joined ? `1px solid ${BD}` : 'none', background: joined ? BG2 : grad, color: joined ? T2 : 'white' }}>
          {joined ? 'Joined ✓' : 'Join'}
        </button>
      )} />
      <ChannelWheel rooms={roomTiles} currentIndex={currentIndex} onSwitch={onSwitchRoom} topOffset={HEADER_H} />

      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Room header: icon, name and what the room is for */}
        <div style={{ background: ROOM_TINT[tile.kind] || BG2, padding: '16px 18px 16px 28px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{tile.emoji}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: FS.heading, fontWeight: 700, color: INK }}>{tile.label}</div>
            <div style={{ fontSize: FS.small, color: T2, marginTop: 2, lineHeight: 1.4 }}>{tile.purpose}</div>
          </div>
        </div>

        {isYtLectures && (
          <div style={{ padding: '14px 16px 6px 28px' }}>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lectures by name…" className="field"
                style={{ width: '100%', border: `1.5px solid ${BD}`, borderRadius: 12, padding: '10px 14px 10px 38px', fontSize: FS.body, background: BG2 }} />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['all', ...subjectTags].map(s => (
                <button key={s} onClick={() => setSubjectFilter(s)} className="pill-btn"
                  style={{ fontSize: FS.tag + 0.5, fontWeight: 600, padding: '6px 12px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${subjectFilter === s ? PB : BD}`, background: subjectFilter === s ? PL : 'white', color: subjectFilter === s ? PD : T2 }}>
                  {s === 'all' ? 'All subjects' : s}
                </button>
              ))}
            </div>
          </div>
        )}

        {tile.kind === 'exam_room' && !profile.exam && (
          <div style={{ background: PL, border: `1px solid ${PB}`, borderRadius: 14, padding: '14px 16px', margin: '14px 16px 14px 28px' }}>
            <div style={{ fontSize: FS.body, fontWeight: 700, color: PD, marginBottom: 10 }}>Pick your exam to see this room's threads</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {exams.map(e => (
                <button key={e} onClick={() => onSetExam(e)} className="pill-btn" style={{ background: 'white', border: `1.5px solid ${PB}`, color: PD, fontSize: FS.small, fontWeight: 700, padding: '8px 18px', borderRadius: 20, cursor: 'pointer' }}>{e}</button>
              ))}
            </div>
          </div>
        )}

        {pendingApproval && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#FFF8E8', border: '1px solid #FFE0AD', borderRadius: 12, padding: '11px 14px', margin: '14px 16px 0 28px' }}>
            <span style={{ fontSize: 15, lineHeight: 1.2 }}>🎖️</span>
            <span style={{ fontSize: FS.small, fontWeight: 600, color: '#8A5300', lineHeight: 1.45 }}>You're a Top Contributor — posting here opens up once NPrep approves you.</span>
          </div>
        )}

        {roomKey && list.length === 0 && (
          <EmptyState icon={tile.emoji}>
            {isYtLectures && (search.trim() || subjectFilter !== 'all') ? 'No lectures match your search/filter.' : 'No threads yet in this room.'}
          </EmptyState>
        )}

        {list.map(t => {
          const hot = Date.now() - new Date(t.createdAt).getTime() < 3 * 60 * 60 * 1000
          return (
            <div key={t.id} role="button" tabIndex={0} onClick={() => onOpenThread(t.id)} className="row-tap"
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onOpenThread(t.id)}
              style={{ width: '100%', textAlign: 'left', borderBottom: `1px solid ${BD}`, padding: '14px 16px 12px 28px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {t.subjectTag && <TagPill tone="subject">{t.subjectTag}</TagPill>}
                {t.poll && <TagPill tone="poll">📊 Poll</TagPill>}
                {t.isLive && <LiveBadge />}
                {hot && !t.archived && !t.isLive && <span style={{ fontSize: FS.tag, fontWeight: 700, color: '#B9490A', background: '#FFF0E6', borderRadius: 20, padding: '3px 9px' }}>🔥 Hot</span>}
                <span style={{ fontSize: FS.meta, color: T3, marginLeft: 'auto' }}>{timeAgo(t.createdAt)}</span>
              </div>
              <div style={{ fontSize: FS.body + 0.5, fontWeight: 700, color: INK, lineHeight: 1.4 }}>{t.title}</div>
              {t.body && <div style={{ fontSize: FS.small, color: T2, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{t.body}</div>}
              {t.attachmentUrl && <div onClick={e => e.stopPropagation()}><AttachmentPreview url={t.attachmentUrl} name={t.attachmentName} type={t.attachmentType} /></div>}
              {t.resourceUrl && <div onClick={e => e.stopPropagation()}><ResourceLink url={t.resourceUrl} name={t.resourceName} /></div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 1 }}>
                <LikeButton liked={t.likedByMe} count={t.likeCount} onToggle={e => { e.stopPropagation(); onLikeThread(t.id) }} size={15} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CommentIcon size={15} />
                  <span style={{ fontSize: FS.meta, fontWeight: 600, color: T2 }}>{t.replyCount} comment{t.replyCount === 1 ? '' : 's'}</span>
                </div>
                <button onClick={e => { e.stopPropagation(); share(t) }} className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px', borderRadius: 8, marginLeft: t.roomKey === 'webinar_threads' && t.startsAt ? 0 : 'auto' }}>
                  <ShareIcon size={15} />
                  <span style={{ fontSize: FS.meta, fontWeight: 600, color: T2 }}>{sharedId === t.id ? 'Link copied' : 'Share'}</span>
                </button>
                {t.roomKey === 'webinar_threads' && t.startsAt && !t.archived && (
                  <button onClick={e => { e.stopPropagation(); onRegisterForWebinar(t.id) }} className="pill-btn"
                    style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: t.registeredByMe ? T2 : PD, background: t.registeredByMe ? BG2 : PL, border: `1px solid ${t.registeredByMe ? BD : PB}`, borderRadius: 20, padding: '5px 12px', cursor: 'pointer' }}>
                    {t.registeredByMe ? 'Registered ✓' : 'Register'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
        <div style={{ height: 80 }} />
      </div>

      {canPost && (
        <button onClick={() => setShowCompose(true)} aria-label="Create post"
          style={{ position: 'absolute', right: 18, bottom: 18, width: 52, height: 52, borderRadius: 16, background: grad, color: 'white', border: 'none', boxShadow: '0 4px 14px rgba(11,18,48,0.22)', fontSize: 26, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          +
        </button>
      )}

      {showCompose && (
        <div className="overlay" onClick={() => setShowCompose(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <span style={{ fontSize: FS.heading, fontWeight: 700, color: INK }}>New post in {tile.label}</span>
              <button onClick={() => setShowCompose(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: PD, fontSize: FS.small + 1, fontWeight: 600 }}>Close</button>
            </div>
            <div style={{ padding: '16px 20px 20px' }}>
              <input value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="Title" className="field"
                style={{ width: '100%', border: `1.5px solid ${BD}`, borderRadius: 12, padding: '11px 13px', fontSize: FS.body, marginBottom: 10 }} />
              <textarea value={postBody} onChange={e => setPostBody(e.target.value)} placeholder="Add detail (optional)…" rows={4} className="field"
                style={{ width: '100%', border: `1.5px solid ${BD}`, borderRadius: 12, padding: '11px 13px', fontSize: FS.body, resize: 'vertical' }} />
              <button onClick={submitPost} disabled={!postTitle.trim()}
                style={{ marginTop: 14, width: '100%', background: postTitle.trim() ? grad : BD, color: postTitle.trim() ? 'white' : T3, border: 'none', borderRadius: 12, padding: '13px', fontSize: FS.body + 0.5, fontWeight: 700, cursor: postTitle.trim() ? 'pointer' : 'default' }}>
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
