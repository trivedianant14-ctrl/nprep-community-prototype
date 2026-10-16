import { useState } from 'react'
import { StatusBar, BackIcon, SearchIcon, T1, T2, T3, BD, BG2, PL, PB, PD, P, AZ, G, GL, INK, roomKindFromKey, RoomIcon, EmptyState, isVisibleToStudent, examRoomKeyFor, shareThread, timeAgo, FS } from '../../shared'
import PostCard from './PostCard'

const FEED_BG = '#F2F8FF'

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

const sectionRow = { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '16px 16px 8px' }
const sectionTitle = { fontSize: FS.heading, fontWeight: 800, color: INK }

// Community home. Patterns borrowed from the Mobbin references: a horizontal strip of your
// groups (Reddit "Active in these communities", Nextdoor "Groups"), filter chips over a single
// mixed feed (Lex, Numo), and white post cards on a soft grey ground (Nextdoor, Lex).
export default function CommunityHome({ state, onSetExam, onSetRoomJoined, onOpenTile, onOpenThreadInRoom, onLikeThread, onRegisterForWebinar, onOpenThreadFromNotification, onBack }) {
  const [showNotifs, setShowNotifs] = useState(false)
  const [sharedId, setSharedId] = useState(null) // thread id currently showing "Link copied"
  const [filter, setFilter] = useState('all') // 'all' | room tile key
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [ringing, setRinging] = useState(false) // bell rings when tapped
  const { roomTiles, profile, enrolledRoomKeys, exams, notifications, threads, rooms, contributors = {} } = state
  const examKey = examRoomKeyFor(state, profile.exam)

  const share = async (t) => {
    const result = await shareThread(t)
    if (result.copied) {
      setSharedId(t.id)
      setTimeout(() => setSharedId(id => (id === t.id ? null : id)), 1800)
    }
  }

  // One mixed feed across rooms, newest first, narrowed by the chip and the search box.
  let feed = threads.filter(t => isVisibleToStudent(t) && !t.archived).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const activeTile = filter === 'all' ? null : roomTiles.find(t => t.key === filter)
  if (activeTile) {
    const keys = roomKeysFor(activeTile, examKey)
    feed = feed.filter(t => keys.includes(t.roomKey))
  }
  const q = query.trim().toLowerCase()
  if (q) feed = feed.filter(t => t.title.toLowerCase().includes(q) || (t.body || '').toLowerCase().includes(q))
  feed = feed.slice(0, 30)

  const needsExam = !profile.exam && activeTile?.kind === 'exam_room'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'linear-gradient(180deg, #D3E7FF 0%, #E6F2FF 100%)' }}>
      <StatusBar />
      <div style={{ padding: '2px 8px 8px 6px', display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <button onClick={onBack} className="icon-btn" aria-label="Back" style={iconBtn}>
          <BackIcon />
        </button>
        <span style={{ fontSize: 20, fontWeight: 700, color: INK, flex: 1, letterSpacing: '-0.01em' }}>Community</span>
        <button key={searching ? 'search-on' : 'search-off'} onClick={() => { setSearching(s => !s); setQuery('') }} className={`icon-btn${searching ? ' search-open' : ''}`} aria-label="Search posts" style={{ ...roundBtn, color: searching ? AZ : T1 }}>
          <SearchIcon size={21} />
        </button>
        <button onClick={() => { setRinging(true); setTimeout(() => setRinging(false), 750); setShowNotifs(true) }} className={`icon-btn${ringing ? ' bell-ring' : ''}`} aria-label="Notifications" style={{ ...roundBtn, position: 'relative' }}>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          {notifications.length > 0 && <span className="dot-pulse" style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: '50%', background: '#E5385A', border: '1.5px solid white' }} />}
        </button>
      </div>

      {searching && (
        <div className="reveal" style={{ padding: '0 16px 10px', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}><SearchIcon size={16} color={T3} /></span>
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search posts…" className="field"
              style={{ width: '100%', border: `1.5px solid ${BD}`, borderRadius: 22, padding: '10px 14px 10px 38px', fontSize: FS.body, background: BG2 }} />
          </div>
        </div>
      )}

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', background: FEED_BG }}>
        {!profile.exam && (
          <div style={{ background: PL, border: `1px solid ${PB}`, borderRadius: 16, padding: '14px 16px', margin: '12px 12px 0' }}>
            <div style={{ fontSize: FS.body, fontWeight: 700, color: PD, marginBottom: 3 }}>Which exam are you preparing for?</div>
            <div style={{ fontSize: FS.small, color: T2, marginBottom: 12, lineHeight: 1.45 }}>We'll auto-add you to that Exam Room for cutoffs, notifications and strategy.</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {exams.map(e => (
                <button key={e} onClick={() => onSetExam(e)} className="pill-btn" style={{ background: 'white', border: `1.5px solid ${PB}`, color: PD, fontSize: FS.small, fontWeight: 700, padding: '8px 18px', borderRadius: 20, cursor: 'pointer' }}>{e}</button>
              ))}
            </div>
          </div>
        )}

        {/* Your rooms — a horizontal strip of room cards */}
        {!q && (
          <>
            <div style={sectionRow}>
              <span style={sectionTitle}>Rooms</span>
              <span style={{ fontSize: FS.small, color: T3 }}>{roomTiles.length} rooms · 5,000+ students</span>
            </div>
            <div className="scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 12px 4px' }}>
              {roomTiles.map((tile, i) => {
                const joined = isEnrolled(tile, enrolledRoomKeys, examKey)
                const hasRoom = roomKeysFor(tile, examKey).length > 0
                return (
                  <button key={tile.key} onClick={() => onOpenTile(tile)} className="room-card stagger"
                    style={{ '--i': i, flex: '0 0 auto', width: 136, textAlign: 'left', background: 'white', border: `1px solid ${BD}`, borderRadius: 16, padding: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 1px 2px rgba(11,18,48,0.05)' }}>
                    <RoomIcon kind={tile.kind} emoji={tile.emoji} size={40} />
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: FS.body, fontWeight: 700, color: INK }}>{tile.label}</span>
                      <span style={{ fontSize: FS.meta, color: T3 }}>{tile.cadence}</span>
                    </span>
                    {joined
                      ? <span style={{ fontSize: 10.5, fontWeight: 700, color: G, background: GL, borderRadius: 20, padding: '3px 10px', alignSelf: 'flex-start' }}>Joined ✓</span>
                      : hasRoom
                        ? <span style={{ fontSize: 10.5, fontWeight: 700, color: PD, background: PL, border: `1px solid ${PB}`, borderRadius: 20, padding: '2px 10px', alignSelf: 'flex-start' }}>+ Join</span>
                        : <span style={{ fontSize: 10.5, fontWeight: 700, color: T3, background: BG2, borderRadius: 20, padding: '3px 10px', alignSelf: 'flex-start' }}>Pick exam</span>}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Feed filter chips — stay pinned while the feed scrolls */}
        <div style={{ position: 'sticky', top: 0, zIndex: 5, background: FEED_BG, padding: '14px 0 10px' }}>
          <div className="scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 12px' }}>
            {[{ key: 'all', label: 'All' }, ...roomTiles].map(c => {
              const on = filter === c.key
              return (
                <button key={c.key} onClick={() => setFilter(c.key)} className="pill-btn pop-on" data-on={on}
                  style={{ flex: '0 0 auto', fontSize: FS.small, fontWeight: on ? 600 : 500, padding: '7px 14px', borderRadius: 20, cursor: 'pointer', border: `1.5px solid ${on ? AZ : '#E4F0FF'}`, background: on ? '#EAF6FF' : '#F0F7FF', color: on ? AZ : INK }}>
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>

        {needsExam && (
          <EmptyState icon="🎯" title="Pick your exam">Choose your exam above to see its Exam Room posts.</EmptyState>
        )}
        {!needsExam && feed.length === 0 && (
          <EmptyState icon={activeTile?.emoji || '💬'} title={q ? 'No matching posts' : 'Nothing here yet'}>
            {q ? 'Try a different word.' : 'No posts in this room yet — check back soon.'}
          </EmptyState>
        )}

        <div key={`${filter}|${q}`}>
        {feed.map((t, i) => {
          const tile = tileForRoomKey(t.roomKey, roomTiles)
          const room = rooms.find(r => r.key === t.roomKey)
          return (
            <PostCard key={t.id} index={i} t={t} tile={tile} roomLabel={room ? room.label : tile.label} contributors={contributors}
              joined={enrolledRoomKeys.includes(t.roomKey)} sharedId={sharedId}
              onOpen={() => onOpenThreadInRoom(t.id, tile)}
              onLike={() => onLikeThread(t.id)}
              onShare={() => share(t)}
              onRegister={() => onRegisterForWebinar(t.id)}
              onJoin={() => onSetRoomJoined(t.roomKey, true)} />
          )
        })}
        </div>
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
              {notifications.map((n, i) => (
                <button key={n.id} onClick={() => { setShowNotifs(false); onOpenThreadFromNotification(n.threadId) }} className="row-tap stagger"
                  style={{ '--i': Math.min(i, 8), width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: `1px solid ${BD}`, padding: '12px 18px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
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

const roundBtn = { width: 36, height: 36, borderRadius: '50%', background: '#fff', border: '1px solid #E3EAF6', boxShadow: '0 1px 3px rgba(19,27,99,0.08)', cursor: 'pointer', color: T1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 6 }
const iconBtn = { width: 40, height: 40, borderRadius: 12, background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex', alignItems: 'center', justifyContent: 'center' }
