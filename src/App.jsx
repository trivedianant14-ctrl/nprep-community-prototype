import { useCallback, useEffect, useState } from 'react'
import Landing from './screens/Landing'
import StudentApp from './screens/student/StudentApp'
import CommunityCMS from './screens/cms/CommunityCMS'
import LoadingScreen from './screens/LoadingScreen'

const SPLASH_MIN_MS = 1400

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Request failed (${res.status})`)
  }
  return res.status === 204 ? null : res.json()
}

export default function App() {
  const [topScreen, setTopScreen] = useState('landing') // landing | student | cms
  const [state, setState] = useState(null)
  const [error, setError] = useState(null)
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)
  const [splashGone, setSplashGone] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), SPLASH_MIN_MS)
    return () => clearTimeout(t)
  }, [])

  const refresh = useCallback(async () => {
    try {
      const data = await api('/state')
      setState(data)
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    const onShow = () => refresh()
    window.addEventListener('focus', onShow)
    window.addEventListener('pageshow', onShow)
    return () => {
      window.removeEventListener('focus', onShow)
      window.removeEventListener('pageshow', onShow)
    }
  }, [refresh])

  // Every mutation hits the backend, then re-hydrates from /api/state — CMS and student
  // flows always read the same server-computed truth (enrollment, poll tallies, notifications).
  const onboard = async () => { await api('/onboard', { method: 'POST' }); await refresh() }
  const setExam = async (exam) => { await api('/profile', { method: 'PATCH', body: { exam } }); await refresh() }
  const setRoomJoined = async (roomKey, join) => { await api('/enrollments', { method: 'POST', body: { roomKey, action: join ? 'join' : 'leave' } }); await refresh() }
  const createThread = async (payload) => { await api('/threads', { method: 'POST', body: payload }); await refresh() }
  const setThreadHidden = async (id, hidden) => { await api(`/threads/${id}`, { method: 'PATCH', body: { hidden } }); await refresh() }
  const postReply = async (threadId, body, asPeer, parentReplyId, attachment) => {
    await api(`/threads/${threadId}/replies`, { method: 'POST', body: { body, asPeer, parentReplyId, attachmentUrl: attachment?.url, attachmentName: attachment?.name, attachmentType: attachment?.type } })
    await refresh()
  }
  const setReplyHidden = async (id, hidden) => { await api(`/replies/${id}`, { method: 'PATCH', body: { hidden } }); await refresh() }
  const vote = async (threadId, optionId) => { await api(`/threads/${threadId}/vote`, { method: 'POST', body: { optionId } }); await refresh() }
  const likeThread = async (threadId) => { await api(`/threads/${threadId}`, { method: 'POST' }); await refresh() }
  const registerForWebinar = async (threadId) => { await api(`/threads/${threadId}`, { method: 'POST', body: { action: 'register' } }); await refresh() }
  const likeReply = async (replyId) => { await api(`/replies/${replyId}`, { method: 'POST', body: { action: 'like' } }); await refresh() }
  const nprepLikeReply = async (replyId) => { await api(`/replies/${replyId}`, { method: 'POST', body: { action: 'nprep-like' } }); await refresh() }
  const togglePinReply = async (replyId) => { await api(`/replies/${replyId}`, { method: 'POST', body: { action: 'pin' } }); await refresh() }
  const approveContributor = async (studentKey) => { await api(`/contributors/${studentKey}/approve`, { method: 'POST' }); await refresh() }
  const reportReply = async (replyId, reason) => { await api(`/replies/${replyId}`, { method: 'POST', body: { action: 'report', reason } }); await refresh() }
  const dismissReports = async (replyId) => { await api(`/replies/${replyId}`, { method: 'POST', body: { action: 'dismiss-reports' } }); await refresh() }
  const decideThread = async (id, approval) => { await api(`/threads/${id}`, { method: 'PATCH', body: { approval } }); await refresh() }
  const createPost = async (payload) => { await api('/threads', { method: 'POST', body: { ...payload, asContributor: true } }); await refresh() }

  const exitToLanding = () => setTopScreen('landing')

  // Splash: stays up until the first /api/state has arrived AND a minimum time has passed (so a
  // fast response doesn't flash it), then plays its exit animation and unmounts.
  const ready = !!state && minTimeElapsed
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
    {!splashGone && <LoadingScreen error={state ? null : error} leaving={ready} onRetry={refresh} />}
    </>
  )
}
