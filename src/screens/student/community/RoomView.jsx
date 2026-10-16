import { useEffect, useRef, useState } from 'react'
import { BackHeader, SearchIcon, T1, T2, T3, BD, BG2, PL, PB, PD, NAVY, AZ, G, GL, INK, ROOM_GRADIENT, ROOM_TINT, EmptyState, isVisibleToStudent, examRoomKeyFor, shareThread, FS } from '../../shared'
import PostCard from './PostCard'

const CONTRIBUTOR_POST_KINDS = ['subject_room', 'exam_room']
const FEED_BG = '#F2F8FF'

// A single room. Header follows the group pages in Glassdoor / Insight Timer / Reddit (icon,
// name, purpose, one big Join button); Recent | Top tabs follow Runna; the subject chips
// follow Reddit's flair filter; and the room chips replace the old edge wheel for hopping
// between rooms the way Lex / Weverse switch categories.
export default function RoomView({ state, tile, onSetExam, onSetRoomJoined, onOpenThread, onSwitchRoom, onLikeThread, onCreatePost, onRegisterForWebinar, onBack }) {
  const { profile, enrolledRoomKeys, exams, threads, roomTiles, subjectTags } = state
  const [showCompose, setShowCompose] = useState(false)
  const [postTitle, setPostTitle] = useState('')
  const [postBody, setPostBody] = useState('')
  const [sharedId, setSharedId] = useState(null) // thread id currently showing "Link copied"
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [tab, setTab] = useState('recent') // 'recent' | 'top'
  const [sentNotice, setSentNotice] = useState(false) // contributor just posted — held for approval
  const activeChip = useRef(null)
  // Keep the current room's chip centered when hopping between rooms.
  useEffect(() => { activeChip.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }) }, [tile.key])

  const share = async (t) => {
    const result = await shareThread(t)
    if (result.copied) {
      setSharedId(t.id)
      setTimeout(() => setSharedId(id => (id === t.id ? null : id)), 1800)
    }
  }

  const roomKey = tile.kind === 'exam_room' ? examRoomKeyFor(state, profile.exam) : tile.key
  const joined = roomKey ? enrolledRoomKeys.includes(roomKey) : false
  const isYtLectures = tile.kind === 'yt_lectures'
  const hasSubjectFilter = isYtLectures || tile.kind === 'subject_room'
  const allInRoom = roomKey ? threads.filter(t => t.roomKey === roomKey && isVisibleToStudent(t)) : []
  let list = [...allInRoom]
  if (isYtLectures && search.trim()) list = list.filter(t => t.title.toLowerCase().includes(search.trim().toLowerCase()))
  if (hasSubjectFilter && subjectFilter !== 'all') list = list.filter(t => t.subjectTag === subjectFilter)
  list.sort(tab === 'top'
    ? (a, b) => (b.likeCount * 2 + b.replyCount) - (a.likeCount * 2 + a.replyCount) || new Date(b.createdAt) - new Date(a.createdAt)
    : (a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const grad = NAVY // primary actions are navy in the official theme; rooms keep their accent only on icons and pills

  const contributor = state.contributors?.demo
  const roomAcceptsContributorPosts = CONTRIBUTOR_POST_KINDS.includes(tile.kind)
  const canPost = roomAcceptsContributorPosts && roomKey && contributor?.approvedToPost
  const pendingApproval = roomAcceptsContributorPosts && roomKey && contributor?.isEligible && !contributor?.approvedToPost
  const badgePaused = roomAcceptsContributorPosts && roomKey && contributor?.inactive && contributor?.nprepLikedCount >= 10

  const submitPost = async () => {
    if (!postTitle.trim() || !roomKey) return
    await onCreatePost({ roomKey, title: postTitle.trim(), body: postBody.trim() })
    setPostTitle(''); setPostBody(''); setShowCompose(false)
    setSentNotice(true)
    setTimeout(() => setSentNotice(false), 5000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', position: 'relative' }}>
      <BackHeader onBack={onBack} title={tile.label} />

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', background: FEED_BG }}>
        {/* Room header: icon, name, purpose, members/cadence and one big Join button */}
        <div key={tile.key} className="fade-in" style={{ background: `linear-gradient(180deg, ${ROOM_TINT[tile.kind] || '#E6F2FF'} 0%, #F2F8FF 100%)`, padding: '18px 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, boxShadow: '0 1px 3px rgba(11,18,48,0.08)' }}>{tile.emoji}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: INK, letterSpacing: '-0.01em' }}>{tile.label}</div>
              <div style={{ fontSize: FS.small, color: T2, marginTop: 3, lineHeight: 1.4 }}>{tile.purpose}</div>
            </div>
          </div>
          <div style={{ fontSize: FS.small, fontWeight: 600, color: T1, marginTop: 12 }}>
            {allInRoom.length} post{allInRoom.length === 1 ? '' : 's'} · {tile.cadence}
          </div>
          {roomKey && (
            <button onClick={() => onSetRoomJoined(roomKey, !joined)} className="pill-btn pop-on" data-on={joined}
              style={{ width: '100%', marginTop: 12, fontSize: FS.body + 0.5, fontWeight: 700, padding: '12px', borderRadius: 14, cursor: 'pointer', border: joined ? `1.5px solid ${BD}` : 'none', background: joined ? 'white' : grad, color: joined ? T2 : 'white' }}>
              {joined ? 'Joined ✓' : 'Join room'}
            </button>
          )}
        </div>

        {/* Tabs + room switcher stay pinned under the header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 5, background: 'white', borderBottom: `1px solid ${BD}` }}>
          <div className="scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 12px 4px' }}>
            {roomTiles.map(rt => {
              const on = rt.key === tile.key
              return (
                <button key={rt.key} ref={on ? activeChip : null} onClick={() => !on && onSwitchRoom(rt)} className="pill-btn pop-on" data-on={on} aria-label={`Open ${rt.label}`}
                  style={{ flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: FS.small, fontWeight: 700, padding: '6px 12px', borderRadius: 20, cursor: on ? 'default' : 'pointer', border: `1.5px solid ${on ? AZ : '#E4F0FF'}`, background: on ? '#EAF6FF' : '#F0F7FF', color: on ? AZ : T2 }}>
                  <span style={{ fontSize: 12 }}>{rt.emoji}</span>{rt.label}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', position: 'relative' }}>
            {[['recent', 'Recent'], ['top', 'Top']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                style={{ flex: 1, padding: '11px 0 12px', background: 'none', border: 'none', fontSize: FS.body, fontWeight: tab === id ? 600 : 500, color: tab === id ? AZ : T2, cursor: 'pointer', transition: 'color 0.2s' }}>
                {label}
              </button>
            ))}
            {/* Sliding underline between Recent and Top */}
            <span style={{ position: 'absolute', bottom: 0, left: 0, width: '50%', height: 2.5, background: AZ, borderRadius: 2, transform: `translateX(${tab === 'top' ? 100 : 0}%)`, transition: 'transform 0.32s cubic-bezier(0.3, 1.2, 0.4, 1)' }} />
          </div>
        </div>

        {isYtLectures && (
          <div style={{ padding: '12px 12px 0' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}><SearchIcon size={16} color={T3} /></span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lectures by name…" className="field"
                style={{ width: '100%', border: `1.5px solid ${BD}`, borderRadius: 22, padding: '10px 14px 10px 38px', fontSize: FS.body, background: 'white' }} />
            </div>
          </div>
        )}

        {hasSubjectFilter && (
          <div className="scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '12px 12px 2px' }}>
            {['all', ...subjectTags].map(s => (
              <button key={s} onClick={() => setSubjectFilter(s)} className="pill-btn pop-on" data-on={subjectFilter === s}
                style={{ flex: '0 0 auto', fontSize: FS.tag + 0.5, fontWeight: 700, padding: '6px 12px', borderRadius: 20, cursor: 'pointer', border: `1.5px solid ${subjectFilter === s ? AZ : '#E4F0FF'}`, background: subjectFilter === s ? '#EAF6FF' : '#F0F7FF', color: subjectFilter === s ? AZ : T2 }}>
                {s === 'all' ? 'All subjects' : s}
              </button>
            ))}
          </div>
        )}

        {tile.kind === 'exam_room' && !profile.exam && (
          <div style={{ background: PL, border: `1px solid ${PB}`, borderRadius: 16, padding: '14px 16px', margin: '12px 12px 0' }}>
            <div style={{ fontSize: FS.body, fontWeight: 700, color: PD, marginBottom: 10 }}>Pick your exam to see this room's threads</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {exams.map(e => (
                <button key={e} onClick={() => onSetExam(e)} className="pill-btn" style={{ background: 'white', border: `1.5px solid ${PB}`, color: PD, fontSize: FS.small, fontWeight: 700, padding: '8px 18px', borderRadius: 20, cursor: 'pointer' }}>{e}</button>
              ))}
            </div>
          </div>
        )}

        {badgePaused && (
          <div className="reveal" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#FFF8E8', border: '1px solid #FFE0AD', borderRadius: 14, padding: '11px 14px', margin: '12px 12px 0' }}>
            <span style={{ fontSize: 15, lineHeight: 1.2 }}>⏸️</span>
            <span style={{ fontSize: FS.small, fontWeight: 600, color: '#8A5300', lineHeight: 1.45 }}>Your Contributor badge is paused after {state.inactivityDays || 30} days with no activity. Comment again to bring it back — posting needs a fresh approval from NPrep.</span>
          </div>
        )}

        {sentNotice && (
          <div className="reveal" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: GL, border: '1px solid #97C459', borderRadius: 14, padding: '11px 14px', margin: '12px 12px 0' }}>
            <span style={{ fontSize: 15, lineHeight: 1.2 }}>✅</span>
            <span style={{ fontSize: FS.small, fontWeight: 600, color: G, lineHeight: 1.45 }}>Sent for approval. Your post will show to other students once NPrep approves it.</span>
          </div>
        )}

        {pendingApproval && (
          <div className="reveal" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#FFF8E8', border: '1px solid #FFE0AD', borderRadius: 14, padding: '11px 14px', margin: '12px 12px 0' }}>
            <span style={{ fontSize: 15, lineHeight: 1.2 }}>🎖️</span>
            <span style={{ fontSize: FS.small, fontWeight: 600, color: '#8A5300', lineHeight: 1.45 }}>You're a Top Contributor — posting here opens up once NPrep approves you.</span>
          </div>
        )}

        <div style={{ height: 12 }} />

        {roomKey && list.length === 0 && (
          <EmptyState icon={tile.emoji}>
            {isYtLectures && search.trim() ? 'No lectures match your search.' : hasSubjectFilter && subjectFilter !== 'all' ? 'No posts for this subject yet.' : 'No threads yet in this room.'}
          </EmptyState>
        )}

        <div key={`${tile.key}|${tab}|${subjectFilter}`}>
        {list.map((t, i) => (
          <PostCard key={t.id} index={i} t={t} tile={tile} showRoom={false} contributors={state.contributors} sharedId={sharedId}
            onOpen={() => onOpenThread(t.id)}
            onLike={() => onLikeThread(t.id)}
            onShare={() => share(t)}
            onRegister={() => onRegisterForWebinar(t.id)} />
        ))}
        </div>
        <div style={{ height: 80 }} />
      </div>

      {canPost && (
        <button onClick={() => setShowCompose(true)} aria-label="Create post" className="fab"
          style={{ position: 'absolute', right: 18, bottom: 18, height: 52, padding: '0 20px 0 16px', borderRadius: 26, background: grad, color: 'white', border: 'none', boxShadow: '0 4px 14px rgba(11,18,48,0.25)', fontSize: FS.body + 0.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24, lineHeight: 1, fontWeight: 500 }}>+</span> Post
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
              <div style={{ fontSize: FS.meta + 0.5, color: T3, marginTop: 10, lineHeight: 1.45 }}>NPrep reviews every post before other students can see it.</div>
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
