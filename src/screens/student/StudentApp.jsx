import { useEffect, useState } from 'react'
import Home from './Home'
import CommunityHome from './community/CommunityHome'
import RoomView from './community/RoomView'
import ThreadDetail from './community/ThreadDetail'
import LoadingScreen from '../LoadingScreen'
import { P, BD, T3 } from '../shared'

const OPEN_COMMUNITY_MESSAGES = ['Opening your rooms…', "Loading today's posts…", 'Almost there…']
const LOADER_HOLD_MS = 1300 // how long the loader covers Home before Community slides in
const LOADER_EXIT_MS = 500

export default function StudentApp({ state, onOnboard, onSetExam, onSetRoomJoined, onPostReply, onVote, onLikeThread, onLikeReply, onCreatePost, onReportReply, onRegisterForWebinar, onExit }) {
  const [screen, setScreen] = useState('home') // home | community | room | thread
  const [activeTile, setActiveTile] = useState(null)
  const [activeThreadId, setActiveThreadId] = useState(null)
  const [loader, setLoader] = useState(null) // null | 'in' | 'out' — the "opening Community" loading screen
  // Directional screen motion: going deeper (community -> room -> thread) slides in from the
  // right, going back slides in from the left, and hopping between the two bottom tabs fades.
  const [anim, setAnim] = useState('')
  const DEPTH = { home: 0, community: 1, room: 2, thread: 3 }
  const go = (next) => {
    if (next === screen) return
    const bothTabs = DEPTH[next] <= 1 && DEPTH[screen] <= 1
    setAnim(bothTabs ? 'screen-fade' : DEPTH[next] > DEPTH[screen] ? 'screen-forward' : 'screen-backward')
    setScreen(next)
  }

  // PRD P0 #5 — auto-enroll fires on first Community tab open; onboard() is idempotent
  // server-side so calling it every time this screen mounts is safe.
  useEffect(() => {
    if (screen === 'community') onOnboard()
  }, [screen, onOnboard])

  const openThread = (id) => { setActiveThreadId(id); go('thread') }
  // Opening a post from the mixed all-rooms feed also sets the matching room tile, so the
  // thread's Back button lands on that post's own room instead of a stale previous one.
  const openThreadInRoom = (id, tile) => { setActiveTile(tile); setActiveThreadId(id); go('thread') }

  const goHome = () => go('home')
  const goCommunity = () => go('community')
  // Home's "Join the Conversation" CTA: cover Home with the loader, open Community underneath
  // once it has held for a moment, then fade the loader out to reveal it.
  const openCommunityWithLoader = () => {
    if (loader) return
    setLoader('in')
    setTimeout(() => {
      go('community')
      setLoader('out')
      setTimeout(() => setLoader(null), LOADER_EXIT_MS)
    }, LOADER_HOLD_MS)
  }
  // Room-chip switch — jumps straight into the new room's thread list without a popup
  // and without detouring back through the Community landing screen.
  const switchRoom = (tile) => { setActiveTile(tile); go('room') }

  return (
    <div className="phone">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div key={screen === 'thread' ? `thread-${activeThreadId}` : screen} className={`screen-trans ${anim}`}>
        {screen === 'home' && (
          <Home onOpenCommunity={openCommunityWithLoader} onExit={onExit} state={state} />
        )}
        {screen === 'community' && (
          <CommunityHome
            state={state}
            onSetExam={onSetExam}
            onSetRoomJoined={onSetRoomJoined}
            onOpenTile={(tile) => { setActiveTile(tile); go('room') }}
            onOpenThreadInRoom={openThreadInRoom}
            onLikeThread={onLikeThread}
            onRegisterForWebinar={onRegisterForWebinar}
            onOpenThreadFromNotification={openThread}
            onBack={goHome}
          />
        )}
        {screen === 'room' && activeTile && (
          <RoomView
            state={state}
            tile={activeTile}
            onSetExam={onSetExam}
            onSetRoomJoined={onSetRoomJoined}
            onOpenThread={openThread}
            onSwitchRoom={switchRoom}
            onLikeThread={onLikeThread}
            onCreatePost={onCreatePost}
            onRegisterForWebinar={onRegisterForWebinar}
            onBack={() => go('community')}
          />
        )}
        {screen === 'thread' && activeThreadId && (
          <ThreadDetail
            state={state}
            threadId={activeThreadId}
            onPostReply={onPostReply}
            onVote={onVote}
            onLikeThread={onLikeThread}
            onLikeReply={onLikeReply}
            onReportReply={onReportReply}
            onRegisterForWebinar={onRegisterForWebinar}
            onBack={() => go(activeTile ? 'room' : 'community')}
          />
        )}
        </div>
      </div>

      {(screen === 'home' || screen === 'community') && (
        <div className="tab-bar" style={{ flexShrink: 0, background: 'white', borderTop: `1px solid ${BD}`, display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {/* One indicator that slides between the tabs */}
          <div className="tab-ind" style={{ transform: `translateX(${screen === 'community' ? 100 : 0}%)` }}><span /></div>
          {[
            { id: 'home', label: 'Home', onClick: goHome, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
            { id: 'community', label: 'Community', onClick: goCommunity, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5"/><path d="M15.5 15.2c2.5.3 4.5 2 4.5 4.8"/></svg> },
          ].map(t => (
            <button key={t.id} onClick={t.onClick} className="action-btn tab-btn" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '9px 0 10px', background: 'none', border: 'none', borderRadius: 0, color: screen === t.id ? P : T3, cursor: 'pointer', transition: 'color 0.2s' }}>
              <span key={screen === t.id ? 'on' : 'off'} className={`tab-ico${screen === t.id ? ' on' : ''}`}>{t.icon}</span>
              <span style={{ fontSize: 10.5, fontWeight: screen === t.id ? 700 : 500 }}>{t.label}</span>
            </button>
          ))}
        </div>
      )}

      {loader && <LoadingScreen inline leaving={loader === 'out'} messages={OPEN_COMMUNITY_MESSAGES} />}
    </div>
  )
}
