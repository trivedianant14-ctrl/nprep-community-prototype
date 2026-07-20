import { useCallback, useEffect, useState } from 'react'
import Landing from './screens/Landing'
import StudentApp from './screens/student/StudentApp'
import CommunityCMS from './screens/cms/CommunityCMS'

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
    await api(`/threads/${threadId}/replies`, { method: 'POST', body: { body, asPeer, parentReplyId, attachmentUrl: attachment?.url, attachmentName: attachment?.name } })
    await refresh()
  }
  const setReplyHidden = async (id, hidden) => { await api(`/replies/${id}`, { method: 'PATCH', body: { hidden } }); await refresh() }
  const vote = async (threadId, optionId) => { await api(`/threads/${threadId}/vote`, { method: 'POST', body: { optionId } }); await refresh() }
  const likeThread = async (threadId) => { await api(`/threads/${threadId}`, { method: 'POST' }); await refresh() }
  const likeReply = async (replyId) => { await api(`/replies/${replyId}`, { method: 'POST', body: { action: 'like' } }); await refresh() }
  const nprepLikeReply = async (replyId) => { await api(`/replies/${replyId}`, { method: 'POST', body: { action: 'nprep-like' } }); await refresh() }
  const togglePinReply = async (replyId) => { await api(`/replies/${replyId}`, { method: 'POST', body: { action: 'pin' } }); await refresh() }
  const approveContributor = async (studentKey) => { await api(`/contributors/${studentKey}/approve`, { method: 'POST' }); await refresh() }
  const createPost = async (payload) => { await api('/threads', { method: 'POST', body: { ...payload, asContributor: true } }); await refresh() }

  const exitToLanding = () => setTopScreen('landing')

  if (!state) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', color: error ? '#791F1F' : '#5a5a78', fontSize: 14, padding: 24, textAlign: 'center' }}>
        {error ? `Couldn't reach the backend: ${error}` : 'Loading…'}
      </div>
    )
  }

  return (
    <div className="desktop-wrapper">
      {topScreen === 'landing' && <Landing onSelect={setTopScreen} />}

      {topScreen === 'student' && (
        <div className="phone-wrapper">
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
          onExit={exitToLanding}
        />
      )}
    </div>
  )
}
