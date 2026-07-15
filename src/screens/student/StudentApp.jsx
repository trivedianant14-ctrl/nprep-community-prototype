import { useEffect, useState } from 'react'
import Home from './Home'
import CommunityHome from './community/CommunityHome'
import RoomView from './community/RoomView'
import ThreadDetail from './community/ThreadDetail'
import { T1, T3, P, BD } from '../shared'

export default function StudentApp({ state, onOnboard, onSetExam, onSetRoomJoined, onPostReply, onVote, onExit }) {
  const [screen, setScreen] = useState('home') // home | community | room | thread
  const [activeTile, setActiveTile] = useState(null)
  const [activeThreadId, setActiveThreadId] = useState(null)

  // PRD P0 #5 — auto-enroll fires on first Community tab open; onboard() is idempotent
  // server-side so calling it every time this screen mounts is safe.
  useEffect(() => {
    if (screen === 'community') onOnboard()
  }, [screen, onOnboard])

  const openThread = (id) => { setActiveThreadId(id); setScreen('thread') }

  const goHome = () => setScreen('home')
  const goCommunity = () => setScreen('community')

  return (
    <div className="phone">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {screen === 'home' && (
          <Home onOpenCommunity={goCommunity} onExit={onExit} state={state} />
        )}
        {screen === 'community' && (
          <CommunityHome
            state={state}
            onSetExam={onSetExam}
            onSetRoomJoined={onSetRoomJoined}
            onOpenTile={(tile) => { setActiveTile(tile); setScreen('room') }}
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
            onBack={() => setScreen('community')}
          />
        )}
        {screen === 'thread' && activeThreadId && (
          <ThreadDetail
            state={state}
            threadId={activeThreadId}
            onPostReply={onPostReply}
            onVote={onVote}
            onBack={() => setScreen(activeTile ? 'room' : 'community')}
          />
        )}
      </div>

      {(screen === 'home' || screen === 'community') && (
        <div style={{ flexShrink: 0, background: 'white', borderTop: `1px solid ${BD}`, display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {[
            { id: 'home', label: 'Home', onClick: goHome, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
            { id: 'community', label: 'Community', onClick: goCommunity, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5"/><path d="M15.5 15.2c2.5.3 4.5 2 4.5 4.8"/></svg> },
          ].map(t => (
            <button key={t.id} onClick={t.onClick} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 0 10px', background: 'none', border: 'none', color: screen === t.id ? P : T3, cursor: 'pointer' }}>
              {t.icon}
              <span style={{ fontSize: 10, fontWeight: screen === t.id ? 700 : 400 }}>{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
