import { useState } from 'react'
import { P, PL, PB, PD, T1, T2, T3, BD, BG2, G, GL, GB, R, RL, RB, timeAgo } from '../shared'

export default function CommunityCMS({ state, onCreateThread, onSetThreadHidden, onSetReplyHidden, onPostReply, onExit }) {
  const [tab, setTab] = useState('create') // create | moderate
  const { rooms, subjectTags, questions } = state

  return (
    <div className="wide-panel">
      <div style={{ padding: '18px 28px', borderBottom: `1px solid ${BD}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onExit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex', padding: 2 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <span style={{ fontSize: 17, fontWeight: 800, color: T1 }}>Community CMS</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {[['create', 'Create Thread'], ['moderate', 'Moderate']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding: '8px 16px', borderRadius: 20, border: `1px solid ${tab === id ? PB : BD}`, background: tab === id ? PL : 'white', color: tab === id ? PD : T2, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 28px 60px', maxWidth: 720, margin: '0 auto' }}>
        {tab === 'create'
          ? <CreateThreadTab rooms={rooms} subjectTags={subjectTags} questions={questions} onCreateThread={onCreateThread} />
          : <ModerateTab state={state} onSetThreadHidden={onSetThreadHidden} onSetReplyHidden={onSetReplyHidden} onPostReply={onPostReply} />}
      </div>
    </div>
  )
}

function CreateThreadTab({ rooms, subjectTags, questions, onCreateThread }) {
  const [roomKey, setRoomKey] = useState(rooms[0].key)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [subjectTag, setSubjectTag] = useState(subjectTags[0])
  const [questionId, setQuestionId] = useState('')
  const [addPoll, setAddPoll] = useState(false)
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [done, setDone] = useState(false)

  const freeTierQuestions = questions.filter(q => q.freeTier)
  const isDailyDose = roomKey === 'daily_dose'
  const isSubjectRoom = roomKey === 'subject_room'

  const canSubmit = title.trim() && (!isDailyDose || questionId) && (!addPoll || pollOptions.filter(o => o.trim()).length >= 2)

  const submit = async () => {
    await onCreateThread({
      roomKey,
      title: title.trim(),
      body: body.trim(),
      subjectTag: isSubjectRoom ? subjectTag : null,
      questionId: isDailyDose ? Number(questionId) : null,
      pollOptions: addPoll ? pollOptions.filter(o => o.trim()) : null,
    })
    setTitle(''); setBody(''); setQuestionId(''); setAddPoll(false); setPollOptions(['', ''])
    setDone(true)
    setTimeout(() => setDone(false), 2500)
  }

  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: T2, marginBottom: 6 }}>ROOM</div>
      <select value={roomKey} onChange={e => setRoomKey(e.target.value)} style={sel}>
        {rooms.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
      </select>

      {isDailyDose && (
        <>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: T2, margin: '18px 0 6px' }}>FREE-TIER QUESTION (CMS filter — paid questions never appear here)</div>
          <select value={questionId} onChange={e => setQuestionId(e.target.value)} style={sel}>
            <option value="">Select a free-tier question…</option>
            {freeTierQuestions.map(q => <option key={q.id} value={q.id}>{q.question}</option>)}
          </select>
        </>
      )}

      {isSubjectRoom && (
        <>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: T2, margin: '18px 0 6px' }}>SUBJECT TAG</div>
          <select value={subjectTag} onChange={e => setSubjectTag(e.target.value)} style={sel}>
            {subjectTags.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </>
      )}

      <div style={{ fontSize: 12.5, fontWeight: 800, color: T2, margin: '18px 0 6px' }}>TITLE</div>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Thread title" style={inp} />

      <div style={{ fontSize: 12.5, fontWeight: 800, color: T2, margin: '18px 0 6px' }}>BODY (optional)</div>
      <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Add context, instructions, or a prompt…" rows={4} style={{ ...inp, resize: 'vertical' }} />

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '18px 0 6px', cursor: 'pointer' }}>
        <input type="checkbox" checked={addPoll} onChange={e => setAddPoll(e.target.checked)} />
        <span style={{ fontSize: 12.5, fontWeight: 800, color: T2 }}>Attach a poll (2–4 options)</span>
      </label>
      {addPoll && (
        <div>
          {pollOptions.map((opt, i) => (
            <input key={i} value={opt} onChange={e => setPollOptions(list => list.map((o, idx) => idx === i ? e.target.value : o))} placeholder={`Option ${i + 1}`} style={{ ...inp, marginBottom: 8 }} />
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            {pollOptions.length < 4 && <button onClick={() => setPollOptions(list => [...list, ''])} style={smBtn}>+ Add option</button>}
            {pollOptions.length > 2 && <button onClick={() => setPollOptions(list => list.slice(0, -1))} style={smBtn}>Remove last</button>}
          </div>
        </div>
      )}

      <button onClick={submit} disabled={!canSubmit} style={{ marginTop: 22, background: canSubmit ? P : BD, color: 'white', border: 'none', borderRadius: 24, padding: '12px 28px', fontSize: 13.5, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'default' }}>
        Post Thread
      </button>
      {done && <span style={{ marginLeft: 14, fontSize: 12, fontWeight: 700, color: '#3B6D11' }}>✓ Posted — notification fired if a student is enrolled/eligible</span>}
    </div>
  )
}

function ModerateTab({ state, onSetThreadHidden, onSetReplyHidden, onPostReply }) {
  const [expanded, setExpanded] = useState(null)
  const { threads, repliesByThread, rooms } = state
  const roomLabel = (key) => rooms.find(r => r.key === key)?.label || key
  const sorted = [...threads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div>
      {sorted.map(t => {
        const replies = repliesByThread[t.id] || repliesByThread[String(t.id)] || []
        const isOpen = expanded === t.id
        return (
          <div key={t.id} style={{ border: `1px solid ${BD}`, borderRadius: 14, marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : t.id)}>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: T3, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{roomLabel(t.roomKey)}{t.hidden ? ' · HIDDEN' : ''}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.hidden ? T3 : T1, marginTop: 2 }}>{t.title}</div>
                <div style={{ fontSize: 10.5, color: T3, marginTop: 2 }}>{replies.length} replies · {timeAgo(t.createdAt)}</div>
              </div>
              <button onClick={() => onSetThreadHidden(t.id, !t.hidden)} style={{ ...smBtn, borderColor: t.hidden ? GB : RB, color: t.hidden ? '#3B6D11' : '#791F1F', background: t.hidden ? GL : RL }}>
                {t.hidden ? 'Unhide thread' : 'Hide thread'}
              </button>
            </div>
            {isOpen && (
              <div style={{ borderTop: `1px solid ${BD}`, background: BG2, padding: '12px 16px' }}>
                <button onClick={() => onPostReply(t.id, 'Any updates on this from the team?', true)} style={{ ...smBtn, marginBottom: 12 }}>💬 Simulate a peer reply</button>
                {replies.length === 0 && <div style={{ fontSize: 11.5, color: T3 }}>No replies yet.</div>}
                {replies.map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: `1px solid ${BD}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T1 }}>{r.hidden ? '(hidden)' : r.authorName} <span style={{ fontWeight: 400, color: T3, fontSize: 9.5 }}>{timeAgo(r.createdAt)}</span></div>
                      <div style={{ fontSize: 11.5, color: r.hidden ? T3 : T1, fontStyle: r.hidden ? 'italic' : 'normal', marginTop: 2 }}>{r.hidden ? 'This reply was removed' : r.body}</div>
                    </div>
                    <button onClick={() => onSetReplyHidden(r.id, !r.hidden)} style={{ ...smBtn, flexShrink: 0, borderColor: r.hidden ? GB : RB, color: r.hidden ? '#3B6D11' : '#791F1F', background: r.hidden ? GL : RL }}>
                      {r.hidden ? 'Restore' : 'Delete'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

const sel = { width: '100%', border: `1.5px solid ${BD}`, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: T1, background: 'white' }
const inp = { width: '100%', border: `1.5px solid ${BD}`, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: T1, outline: 'none' }
const smBtn = { fontSize: 10.5, fontWeight: 700, padding: '6px 12px', borderRadius: 16, border: `1px solid ${BD}`, background: 'white', color: T2, cursor: 'pointer', whiteSpace: 'nowrap' }
