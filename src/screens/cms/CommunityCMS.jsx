import { useState } from 'react'
import { P, PL, PB, PD, T1, T2, T3, BD, BG2, G, GL, GB, R, RL, RB, timeAgo, ContributorBadge, contributorTier, AttachmentPreview, ResourceLink, uploadAttachment, ATTACHMENT_ACCEPT } from '../shared'

export default function CommunityCMS({ state, onCreateThread, onSetThreadHidden, onSetReplyHidden, onPostReply, onNprepLikeReply, onTogglePinReply, onApproveContributor, onExit }) {
  const [tab, setTab] = useState('create') // create | moderate | contributors
  const { rooms, subjectTags, questions } = state

  return (
    <div className="wide-panel">
      <div style={{ padding: '18px 28px', borderBottom: `1px solid ${BD}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onExit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex', padding: 2 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <span style={{ fontSize: 17, fontWeight: 800, color: T1 }}>Community CMS</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {[['create', 'Create Thread'], ['moderate', 'Moderate'], ['contributors', 'Contributors']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding: '8px 16px', borderRadius: 20, border: `1px solid ${tab === id ? PB : BD}`, background: tab === id ? PL : 'white', color: tab === id ? PD : T2, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 28px 60px', maxWidth: 720, margin: '0 auto' }}>
        {tab === 'create' && <CreateThreadTab rooms={rooms} subjectTags={subjectTags} questions={questions} onCreateThread={onCreateThread} />}
        {tab === 'moderate' && <ModerateTab state={state} onSetThreadHidden={onSetThreadHidden} onSetReplyHidden={onSetReplyHidden} onPostReply={onPostReply} onNprepLikeReply={onNprepLikeReply} onTogglePinReply={onTogglePinReply} />}
        {tab === 'contributors' && <ContributorsTab state={state} onApproveContributor={onApproveContributor} />}
      </div>
    </div>
  )
}

const DAILY_DOSE_TAG = 'Current Affairs'

function CreateThreadTab({ rooms, subjectTags, questions, onCreateThread }) {
  const [roomKey, setRoomKey] = useState(rooms[0].key)
  const [dailyPostType, setDailyPostType] = useState('qotd') // 'qotd' | 'currentAffairs' — Daily Dose only
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [subjectTag, setSubjectTag] = useState(subjectTags[0])
  const [questionId, setQuestionId] = useState('')
  const [addPoll, setAddPoll] = useState(false)
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [attachment, setAttachment] = useState(null) // { url, name, type } | null
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [resource, setResource] = useState(null) // { url, name, type } | null — secondary downloadable file
  const [resourceUploading, setResourceUploading] = useState(false)
  const [resourceError, setResourceError] = useState('')
  const [startsAt, setStartsAt] = useState('') // datetime-local string — Webinars only
  const [done, setDone] = useState(false)

  const freeTierQuestions = questions.filter(q => q.freeTier)
  const isDailyDose = roomKey === 'daily_dose'
  const isSubjectRoom = roomKey === 'subject_room'
  const isYtLectures = roomKey === 'yt_lectures'
  const isWebinar = roomKey === 'webinar_threads'
  const isCurrentAffairs = isDailyDose && dailyPostType === 'currentAffairs'

  const canSubmit = title.trim() && (!isDailyDose || isCurrentAffairs || questionId) && (!addPoll || pollOptions.filter(o => o.trim()).length >= 2)

  const pickAttachment = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadError('')
    setUploading(true)
    try {
      setAttachment(await uploadAttachment(file))
    } catch (err) {
      setUploadError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const pickResource = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setResourceError('')
    setResourceUploading(true)
    try {
      setResource(await uploadAttachment(file))
    } catch (err) {
      setResourceError(err.message || 'Upload failed')
    } finally {
      setResourceUploading(false)
    }
  }

  const submit = async () => {
    await onCreateThread({
      roomKey,
      title: title.trim(),
      body: body.trim(),
      subjectTag: (isSubjectRoom || isYtLectures) ? subjectTag : isCurrentAffairs ? DAILY_DOSE_TAG : null,
      questionId: isDailyDose && !isCurrentAffairs ? Number(questionId) : null,
      pollOptions: addPoll ? pollOptions.filter(o => o.trim()) : null,
      attachmentUrl: attachment?.url || null,
      attachmentName: attachment?.name || null,
      attachmentType: attachment?.type || null,
      resourceUrl: resource?.url || null,
      resourceName: resource?.name || null,
      startsAt: isWebinar && startsAt ? new Date(startsAt).toISOString() : null,
    })
    setTitle(''); setBody(''); setQuestionId(''); setAddPoll(false); setPollOptions(['', '']); setAttachment(null); setResource(null); setStartsAt('')
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
          <div style={{ fontSize: 12.5, fontWeight: 800, color: T2, margin: '18px 0 6px' }}>POST TYPE</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['qotd', 'Question of the Day'], ['currentAffairs', 'Current Affairs']].map(([id, label]) => (
              <button key={id} onClick={() => setDailyPostType(id)}
                style={{ padding: '8px 16px', borderRadius: 20, border: `1px solid ${dailyPostType === id ? PB : BD}`, background: dailyPostType === id ? PL : 'white', color: dailyPostType === id ? PD : T2, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {isDailyDose && !isCurrentAffairs && (
        <>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: T2, margin: '18px 0 6px' }}>FREE-TIER QUESTION (CMS filter — paid questions never appear here)</div>
          <select value={questionId} onChange={e => setQuestionId(e.target.value)} style={sel}>
            <option value="">Select a free-tier question…</option>
            {freeTierQuestions.map(q => <option key={q.id} value={q.id}>{q.question}</option>)}
          </select>
        </>
      )}

      {(isSubjectRoom || isYtLectures) && (
        <>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: T2, margin: '18px 0 6px' }}>SUBJECT TAG</div>
          <select value={subjectTag} onChange={e => setSubjectTag(e.target.value)} style={sel}>
            {subjectTags.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </>
      )}

      {isWebinar && (
        <>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: T2, margin: '18px 0 6px' }}>STARTS AT (optional — schedule a session; a LIVE badge appears automatically once it starts)</div>
          <input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} style={inp} />
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

      <div style={{ fontSize: 12.5, fontWeight: 800, color: T2, margin: '18px 0 6px' }}>ATTACHMENT (optional — image, video, or PDF)</div>
      {attachment ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ maxWidth: 260 }}><AttachmentPreview url={attachment.url} name={attachment.name} type={attachment.type} /></div>
          <button onClick={() => setAttachment(null)} style={{ ...smBtn, flexShrink: 0 }}>Remove</button>
        </div>
      ) : (
        <label style={{ ...smBtn, display: 'inline-flex', alignItems: 'center', cursor: uploading ? 'default' : 'pointer' }}>
          <input type="file" accept={ATTACHMENT_ACCEPT} onChange={pickAttachment} disabled={uploading} style={{ display: 'none' }} />
          {uploading ? 'Uploading…' : '📎 Attach media'}
        </label>
      )}
      {uploadError && <div style={{ fontSize: 11, color: '#791F1F', marginTop: 6 }}>{uploadError}</div>}

      <div style={{ fontSize: 12.5, fontWeight: 800, color: T2, margin: '18px 0 6px' }}>ADDITIONAL DOWNLOAD (optional — e.g. lecture notes or slides PDF, separate from the media above)</div>
      {resource ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ResourceLink url={resource.url} name={resource.name} />
          <button onClick={() => setResource(null)} style={smBtn}>Remove</button>
        </div>
      ) : (
        <label style={{ ...smBtn, display: 'inline-flex', alignItems: 'center', cursor: resourceUploading ? 'default' : 'pointer' }}>
          <input type="file" accept={ATTACHMENT_ACCEPT} onChange={pickResource} disabled={resourceUploading} style={{ display: 'none' }} />
          {resourceUploading ? 'Uploading…' : '⬇️ Attach download'}
        </label>
      )}
      {resourceError && <div style={{ fontSize: 11, color: '#791F1F', marginTop: 6 }}>{resourceError}</div>}

      <button onClick={submit} disabled={!canSubmit} style={{ marginTop: 22, background: canSubmit ? P : BD, color: 'white', border: 'none', borderRadius: 24, padding: '12px 28px', fontSize: 13.5, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'default' }}>
        Post Thread
      </button>
      {done && <span style={{ marginLeft: 14, fontSize: 12, fontWeight: 700, color: '#3B6D11' }}>✓ Posted — notification fired if a student is enrolled/eligible</span>}
    </div>
  )
}

function ModerateTab({ state, onSetThreadHidden, onSetReplyHidden, onPostReply, onNprepLikeReply, onTogglePinReply }) {
  const [expanded, setExpanded] = useState(null)
  const { threads, repliesByThread, rooms, contributors = {} } = state
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: T1 }}>{r.hidden ? '(hidden)' : r.authorName}</span>
                        <ContributorBadge tier={contributorTier(contributors[r.studentKey])} />
                        {r.pinned && <span style={{ fontSize: 9.5, fontWeight: 700, color: '#B96A00' }}>📌 pinned</span>}
                        <span style={{ fontWeight: 400, color: T3, fontSize: 9.5 }}>{timeAgo(r.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: r.hidden ? T3 : T1, fontStyle: r.hidden ? 'italic' : 'normal', marginTop: 2 }}>{r.hidden ? 'This reply was removed' : r.body}</div>
                    </div>
                    {!r.hidden && (
                      <>
                        <button onClick={() => onNprepLikeReply(r.id)} style={{ ...smBtn, flexShrink: 0, borderColor: r.likedByNPrepTeam ? PB : BD, color: r.likedByNPrepTeam ? PD : T2, background: r.likedByNPrepTeam ? PL : 'white' }}>
                          {r.likedByNPrepTeam ? '❤️ NPrep liked' : '🤍 NPrep like'}
                        </button>
                        {!r.parentReplyId && (
                          <button onClick={() => onTogglePinReply(r.id)} style={{ ...smBtn, flexShrink: 0, borderColor: r.pinned ? '#FAC775' : BD, color: r.pinned ? '#B96A00' : T2, background: r.pinned ? '#FAEEDA' : 'white' }}>
                            {r.pinned ? 'Unpin' : 'Pin'}
                          </button>
                        )}
                      </>
                    )}
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

// Students eligible (15+ NPrep-liked comments) or already approved to post in Subject Room /
// Exam Room — the admin-approval step that actually turns on their posting rights (Phase 1).
function ContributorsTab({ state, onApproveContributor }) {
  const { contributors = {}, repliesByThread } = state
  const nameByKey = {}
  for (const list of Object.values(repliesByThread)) {
    for (const r of list) if (!nameByKey[r.studentKey]) nameByKey[r.studentKey] = r.authorName
  }

  const rows = Object.entries(contributors)
    .map(([studentKey, c]) => ({ studentKey, name: nameByKey[studentKey] || studentKey, ...c }))
    .filter(row => row.nprepLikedCount > 0 || row.approvedToPost)
    .sort((a, b) => b.nprepLikedCount - a.nprepLikedCount)

  return (
    <div>
      <div style={{ fontSize: 11.5, color: T2, marginBottom: 16, lineHeight: 1.5 }}>
        A student becomes an Active Contributor at 10 NPrep-liked comments, and Eligible to post at 15 — like a comment from the Moderate tab to count it. Eligibility alone doesn't grant posting; approve them below to actually turn it on for Subject Room / Exam Room.
      </div>
      {rows.length === 0 && <div style={{ fontSize: 11.5, color: T3 }}>No contributors yet — NPrep-like some comments in Moderate to get started.</div>}
      {rows.map(row => (
        <div key={row.studentKey} style={{ display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${BD}`, borderRadius: 12, padding: '12px 16px', marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>{row.name}</span>
              <ContributorBadge tier={contributorTier(row)} />
            </div>
            <div style={{ fontSize: 10.5, color: T3, marginTop: 2 }}>{row.nprepLikedCount} comment{row.nprepLikedCount === 1 ? '' : 's'} liked by NPrep Team</div>
          </div>
          {row.isEligible ? (
            <button onClick={() => onApproveContributor(row.studentKey)}
              style={{ ...smBtn, borderColor: row.approvedToPost ? GB : PB, color: row.approvedToPost ? '#3B6D11' : PD, background: row.approvedToPost ? GL : PL }}>
              {row.approvedToPost ? 'Approved ✓ — revoke' : 'Approve to post'}
            </button>
          ) : (
            <span style={{ fontSize: 10, color: T3 }}>{15 - row.nprepLikedCount} more to become eligible</span>
          )}
        </div>
      ))}
    </div>
  )
}

const sel = { width: '100%', border: `1.5px solid ${BD}`, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: T1, background: 'white' }
const inp = { width: '100%', border: `1.5px solid ${BD}`, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: T1, outline: 'none' }
const smBtn = { fontSize: 10.5, fontWeight: 700, padding: '6px 12px', borderRadius: 16, border: `1px solid ${BD}`, background: 'white', color: T2, cursor: 'pointer', whiteSpace: 'nowrap' }
