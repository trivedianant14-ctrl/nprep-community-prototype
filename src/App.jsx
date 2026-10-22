import { useCallback, useEffect, useState } from 'react'
import Landing from './screens/Landing'
import StudentApp from './screens/student/StudentApp'
import CommunityCMS from './screens/cms/CommunityCMS'
import LoadingScreen from './screens/LoadingScreen'
import * as store from './store'

const SPLASH_MIN_MS = 1400

export default function App() {
  const [topScreen, setTopScreen] = useState('landing') // landing | student | cms
  const [state, setState] = useState(() => store.getState())
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)
  const [splashGone, setSplashGone] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), SPLASH_MIN_MS)
    return () => clearTimeout(t)
  }, [])

  const refresh = useCallback(() => setState(store.getState()), [])

  // Every mutation writes to the in-browser store (persisted to localStorage), then re-reads
  // the derived state — CMS and student flows always see the same computed truth (enrollment,
  // poll tallies, notifications). Wrapped as async so a thrown validation error still reaches
  // callers as a rejected promise, as it did when these were network calls.
  const act = (fn) => async (...args) => { fn(...args); refresh() }
  const onboard = act(store.onboard)
  const setExam = act(store.setExam)
  const setRoomJoined = act(store.setRoomJoined)
  const createThread = act(store.createThread)
  const setThreadHidden = act(store.setThreadHidden)
  const postReply = act(store.postReply)
  const setReplyHidden = act(store.setReplyHidden)
  const vote = act(store.vote)
  const likeThread = act(store.likeThread)
  const registerForWebinar = act(store.registerForWebinar)
  const likeReply = act(store.likeReply)
  const nprepLikeReply = act(store.nprepLikeReply)
  const togglePinReply = act(store.togglePinReply)
  const approveContributor = act(store.approveContributor)
  const reportReply = act(store.reportReply)
  const dismissReports = act(store.dismissReports)
  const decideThread = act(store.decideThread)
  const createPost = (payload) => act(store.createThread)({ ...payload, asContributor: true })

  const exitToLanding = () => setTopScreen('landing')

  // Splash: stays up for a minimum time (so it doesn't just flash), then plays its exit
  // animation and unmounts.
  const ready = minTimeElapsed
  useEffect(() => {
    if (!ready || splashGone) return
    const t = setTimeout(() => setSplashGone(true), 500)
    return () => clearTimeout(t)
  }, [ready, splashGone])

  return (
    <>
    {state && (
    <div className="desktop-wrapper">
      {topScreen === 'landing' && <div className="fade-in"><Landing onSelect={setTopScreen} /></div>}

      {topScreen === 'student' && (
        <div className="phone-wrapper fade-in">
          <StudentApp
            state={state}
            onOnboard={onboard}
            onSetExam={setExam}
            onSetRoomJoined={setRoomJoined}
            onPostReply={postReply}
            onVote={vote}
            onLikeThread={likeThread}
            onLikeReply={likeReply}
            onCreatePost={createPost}
            onReportReply={reportReply}
            onRegisterForWebinar={registerForWebinar}
            onExit={exitToLanding}
          />
        </div>
      )}

      {topScreen === 'cms' && (
        <CommunityCMS
          state={state}
          onCreateThread={createThread}
          onSetThreadHidden={setThreadHidden}
          onSetReplyHidden={setReplyHidden}
          onPostReply={postReply}
          onNprepLikeReply={nprepLikeReply}
          onTogglePinReply={togglePinReply}
          onApproveContributor={approveContributor}
          onDismissReports={dismissReports}
          onDecideThread={decideThread}
          onExit={exitToLanding}
        />
      )}
    </div>
    )}
    {!splashGone && <LoadingScreen leaving={ready} />}
    </>
  )
}
