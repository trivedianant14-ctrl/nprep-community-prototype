import { useState } from 'react'
import { P, PL, PB, PD, T1, T2, T3, BD, BG2, G, GL, GB, R, RL, RB, INK, timeAgo, ContributorBadge, contributorTier, AttachmentPreview, ResourceLink, uploadAttachment, ATTACHMENT_ACCEPT, ROOM_TINT, ROOM_GRADIENT, roomKindFromKey, NPrepMark } from '../shared'

const TABS = [
  { id: 'create', label: 'Create Thread', title: 'Create thread', desc: 'Post a thread in any room, with an optional poll and media.', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
  { id: 'moderate', label: 'Moderate', title: 'Moderate', desc: 'Hide threads, and review, endorse, pin or hide replies.', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z"/></svg> },
  { id: 'contributors', label: 'Contributors', title: 'Contributors', desc: 'Approve students who have earned posting rights.', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 15.2c2.5.3 4.5 2 4.5 4.8"/></svg> },
]

export default function CommunityCMS({ state, onCreateThread, onSetThreadHidden, onSetReplyHidden, onPostReply, onNprepLikeReply, onTogglePinReply, onApproveContributor, onExit }) {
  const [tab, setTab] = useState('create') // create | moderate | contributors
  const { rooms, subjectTags, questions } = state
  const current = TABS.find(t => t.id === tab)

  return (
    <div className="cms-shell">
      <aside className="cms-side">
        <div className="cms-brand" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 8px 18px' }}>
          <img src="/nprep-logo.jpg" alt="" style={{ width: 32, height: 32, borderRadius: 9 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>NPrep</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Community CMS</div>
          </div>
        </div>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`cms-nav${tab === t.id ? ' active' : ''}`}>
            {t.icon}{t.label}
          </button>
        ))}
        <button onClick={onExit} className="cms-nav" style={{ marginTop: 'auto' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6"/></svg>
          All flows
        </button>
      </aside>

      <main className="cms-main">
        <header style={{ background: 'white', borderBottom: `1px solid ${BD}`, padding: '20px 32px' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: INK }}>{current.title}</h1>
          <p style={{ fontSize: 13, color: T2, marginTop: 3 }}>{current.desc}</p>
        </header>

        <div style={{ padding: '24px 32px 64px', maxWidth: 1040 }}>
          {tab === 'create' && <CreateThreadTab rooms={rooms} subjectTags={subjectTags} questions={questions} onCreateThread={onCreateThread} />}
          {tab === 'moderate' && <ModerateTab state={state} onSetThreadHidden={onSetThreadHidden} onSetReplyHidden={onSetReplyHidden} onPostReply={onPostReply} onNprepLikeReply={onNprepLikeReply} onTogglePinReply={onTogglePinReply} />}
          {tab === 'contributors' && <ContributorsTab state={state} onApproveContributor={onApproveContributor} />}
        </div>
      </main>
    </div>
  )
}

const DAILY_DOSE_TAG = 'Current Affairs'

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T1, marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11.5, color: T3, marginTop: 6, lineHeight: 1.45 }}>{hint}</div>}
    </div>
  )
}

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
    <div style={{ background: 'white', border: `1px solid ${BD}`, borderRadius: 14, padding: '26px 28px 28px', maxWidth: 720 }}>
      <Field label="Room">
        <select value={roomKey} onChange={e => setRoomKey(e.target.value)} className="field" style={sel}>
          {rooms.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
      </Field>

      {isDailyDose && (
        <Field label="Post type">
          <div style={{ display: 'inline-flex', gap: 4, background: BG2, borderRadius: 10, padding: 3 }}>
            {[['qotd', 'Question of the Day'], ['currentAffairs', 'Current Affairs']].map(([id, label]) => (
              <button key={id} onClick={() => setDailyPostType(id)}
                style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: dailyPostType === id ? 'white' : 'transparent', boxShadow: dailyPostType === id ? '0 1px 3px rgba(11,18,48,0.12)' : 'none', color: dailyPostType === id ? PD : T2, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>
        </Field>
      )}

      {isDailyDose && !isCurrentAffairs && (
        <Field label="Free-tier question" hint="CMS filter — paid questions never appear here.">
          <select value={questionId} onChange={e => setQuestionId(e.target.value)} className="field" style={sel}>
            <option value="">Select a free-tier question…</option>
            {freeTierQuestions.map(q => <option key={q.id} value={q.id}>{q.question}</option>)}
          </select>
        </Field>
      )}

      {(isSubjectRoom || isYtLectures) && (
        <Field label="Subject tag">
          <select value={subjectTag} onChange={e => setSubjectTag(e.target.value)} className="field" style={sel}>
            {subjectTags.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      )}

      {isWebinar && (
        <Field label="Starts at (optional)" hint="Schedule a session. A LIVE badge appears automatically once it starts.">
          <input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} className="field" style={inp} />
        </Field>
      )}

      <Field label="Title">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Thread title" className="field" style={inp} />
      </Field>

      <Field label="Body (optional)">
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Add context, instructions, or a prompt…" rows={4} className="field" style={{ ...inp, resize: 'vertical' }} />
      </Field>

      <div style={{ border: `1px solid ${BD}`, borderRadius: 12, padding: '14px 16px', marginBottom: 20, background: '#FBFBFE' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={addPoll} onChange={e => setAddPoll(e.target.checked)} style={{ width: 16, height: 16, accentColor: P }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>Attach a poll</span>
          <span style={{ fontSize: 12, color: T3 }}>2–4 options</span>
        </label>
        {addPoll && (
          <div style={{ marginTop: 14 }}>
            {pollOptions.map((opt, i) => (
              <input key={i} value={opt} onChange={e => setPollOptions(list => list.map((o, idx) => idx === i ? e.target.value : o))} placeholder={`Option ${i + 1}`} className="field" style={{ ...inp, marginBottom: 8, background: 'white' }} />
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              {pollOptions.length < 4 && <button onClick={() => setPollOptions(list => [...list, ''])} style={smBtn}>+ Add option</button>}
              {pollOptions.length > 2 && <button onClick={() => setPollOptions(list => list.slice(0, -1))} style={smBtn}>Remove last</button>}
            </div>
          </div>
        )}
      </div>

      <Field label="Attachment (optional)" hint="Image, video, or PDF.">
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
        {uploadError && <div style={{ fontSize: 12, color: R, marginTop: 6 }}>{uploadError}</div>}
      </Field>

      <Field label="Additional download (optional)" hint="For example lecture notes or a slides PDF, separate from the media above.">
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
        {resourceError && <div style={{ fontSize: 12, color: R, marginTop: 6 }}>{resourceError}</div>}
      </Field>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 6, borderTop: `1px solid ${BD}`, marginTop: 4 }}>
        <button onClick={submit} disabled={!canSubmit} style={{ marginTop: 18, background: canSubmit ? P : BD, color: canSubmit ? 'white' : T3, border: 'none', borderRadius: 10, padding: '11px 26px', fontSize: 13.5, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'default' }}>
          Post Thread
        </button>
        {done && <span style={{ marginTop: 18, fontSize: 12.5, fontWeight: 600, color: G }}>✓ Posted — notification fired if a student is enrolled/eligible</span>}
      </div>
    </div>
  )
}

function StatusBadge({ tone, children }) {
  const t = {
    green: { bg: GL, fg: G },
    red: { bg: RL, fg: R },
    grey: { bg: BG2, fg: T2 },
    blue: { bg: PL, fg: PD },
    amber: { bg: '#FFF1D6', fg: '#8A5300' },
  }[tone]
  return <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 600, color: t.fg, background: t.bg, borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap' }}>{children}</span>
}

function ModerateTab({ state, onSetThreadHidden, onSetReplyHidden, onPostReply, onNprepLikeReply, onTogglePinReply }) {
  const [expanded, setExpanded] = useState(null)
  const { threads, repliesByThread, rooms, contributors = {} } = state
  const roomLabel = (key) => rooms.find(r => r.key === key)?.label || key
  const sorted = [...threads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div style={{ background: 'white', border: `1px solid ${BD}`, borderRadius: 14, overflow: 'hidden' }}>
      <table className="cms-table">
        <thead>
          <tr>
            <th>Thread</th>
            <th className="hide-narrow">Room</th>
            <th>Replies</th>
            <th className="hide-narrow">Posted</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(t => {
            const replies = repliesByThread[t.id] || repliesByThread[String(t.id)] || []
            const isOpen = expanded === t.id
            const kind = roomKindFromKey(t.roomKey)
            return [
              <tr key={t.id} className="cms-click" onClick={() => setExpanded(isOpen ? null : t.id)} style={{ background: isOpen ? '#FAFBFF' : undefined }}>
                <td style={{ maxWidth: 380 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}><polyline points="9,18 15,12 9,6"/></svg>
                    <span style={{ fontWeight: 600, color: t.hidden ? T3 : INK }}>{t.title}</span>
                  </div>
                </td>
                <td className="hide-narrow">
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: ROOM_GRADIENT[kind], background: ROOM_TINT[kind], borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap' }}>{roomLabel(t.roomKey)}</span>
                </td>
                <td style={{ color: T2 }}>{replies.length}</td>
                <td className="hide-narrow" style={{ color: T2, whiteSpace: 'nowrap' }}>{timeAgo(t.createdAt)}</td>
                <td>{t.hidden ? <StatusBadge tone="grey">Hidden</StatusBadge> : <StatusBadge tone="green">Visible</StatusBadge>}</td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={e => { e.stopPropagation(); onSetThreadHidden(t.id, !t.hidden) }} style={{ ...smBtn, borderColor: t.hidden ? GB : RB, color: t.hidden ? G : R, background: t.hidden ? GL : RL }}>
                    {t.hidden ? 'Unhide thread' : 'Hide thread'}
                  </button>
                </td>
              </tr>,
              isOpen && (
                <tr key={t.id + '-open'}>
                  <td colSpan={6} style={{ background: '#F9FAFD', padding: '16px 20px 18px 40px' }}>
                    <button onClick={() => onPostReply(t.id, 'Any updates on this from the team?', true)} style={{ ...smBtn, marginBottom: 12 }}>💬 Simulate a peer reply</button>
                    {replies.length === 0 && <div style={{ fontSize: 12.5, color: T3 }}>No replies yet.</div>}
                    {replies.map(r => (
                      <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderTop: `1px solid ${BD}` }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: T1 }}>{r.hidden ? '(hidden)' : r.authorName}</span>
                            <ContributorBadge tier={contributorTier(contributors[r.studentKey])} />
                            {r.pinned && <StatusBadge tone="amber">Pinned</StatusBadge>}
                            {r.likedByNPrepTeam && <NPrepMark size={14} />}
                            <span style={{ fontWeight: 400, color: T3, fontSize: 11 }}>{timeAgo(r.createdAt)}</span>
                          </div>
                          <div style={{ fontSize: 12.5, color: r.hidden ? T3 : T1, fontStyle: r.hidden ? 'italic' : 'normal', marginTop: 3, lineHeight: 1.45 }}>{r.hidden ? 'This reply was removed' : r.body}</div>
                        </div>
                        {!r.hidden && (
                          <>
                            <button onClick={() => onNprepLikeReply(r.id)} style={{ ...smBtn, flexShrink: 0, borderColor: r.likedByNPrepTeam ? PB : BD, color: r.likedByNPrepTeam ? PD : T2, background: r.likedByNPrepTeam ? PL : 'white' }}>
                              {r.likedByNPrepTeam ? '❤️ NPrep liked' : '🤍 NPrep like'}
                            </button>
                            {!r.parentReplyId && (
                              <button onClick={() => onTogglePinReply(r.id)} style={{ ...smBtn, flexShrink: 0, borderColor: r.pinned ? '#FAC775' : BD, color: r.pinned ? '#8A5300' : T2, background: r.pinned ? '#FFF1D6' : 'white' }}>
                                {r.pinned ? 'Unpin' : 'Pin'}
                              </button>
                            )}
                          </>
                        )}
                        <button onClick={() => onSetReplyHidden(r.id, !r.hidden)} style={{ ...smBtn, flexShrink: 0, borderColor: r.hidden ? GB : RB, color: r.hidden ? G : R, background: r.hidden ? GL : RL }}>
                          {r.hidden ? 'Restore' : 'Delete'}
                        </button>
                      </div>
                    ))}
                  </td>
                </tr>
              ),
            ]
          })}
        </tbody>
      </table>
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
      <div style={{ fontSize: 13, color: T2, marginBottom: 16, lineHeight: 1.55, maxWidth: 760 }}>
        A student becomes an Active Contributor at 10 NPrep-liked comments, and Eligible to post at 15 — like a comment from the Moderate tab to count it. Eligibility alone doesn't grant posting; approve them below to actually turn it on for Subject Room / Exam Room.
      </div>
      {rows.length === 0 ? (
        <div style={{ background: 'white', border: `1px solid ${BD}`, borderRadius: 14, padding: '36px 20px', textAlign: 'center', fontSize: 13, color: T3 }}>
          No contributors yet — NPrep-like some comments in Moderate to get started.
        </div>
      ) : (
        <div style={{ background: 'white', border: `1px solid ${BD}`, borderRadius: 14, overflow: 'hidden' }}>
          <table className="cms-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>NPrep-liked comments</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const pct = Math.min(100, Math.round((row.nprepLikedCount / 15) * 100))
                return (
                  <tr key={row.studentKey}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: INK }}>{row.name}</span>
                        <ContributorBadge tier={contributorTier(row)} />
                      </div>
                    </td>
                    <td style={{ minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 4, background: BG2, overflow: 'hidden', maxWidth: 120 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: row.isEligible ? G : P }} />
                        </div>
                        <span style={{ fontSize: 12, color: T2, whiteSpace: 'nowrap' }}>{row.nprepLikedCount} comment{row.nprepLikedCount === 1 ? '' : 's'} liked by NPrep Team</span>
                      </div>
                    </td>
                    <td>
                      {row.approvedToPost ? <StatusBadge tone="green">Approved</StatusBadge>
                        : row.isEligible ? <StatusBadge tone="amber">Approval pending</StatusBadge>
                        : <StatusBadge tone="grey">Below threshold</StatusBadge>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {row.isEligible ? (
                        <button onClick={() => onApproveContributor(row.studentKey)}
                          style={{ ...smBtn, borderColor: row.approvedToPost ? GB : PB, color: row.approvedToPost ? G : PD, background: row.approvedToPost ? GL : PL }}>
                          {row.approvedToPost ? 'Approved ✓ — revoke' : 'Approve to post'}
                        </button>
                      ) : (
                        <span style={{ fontSize: 11.5, color: T3 }}>{15 - row.nprepLikedCount} more to become eligible</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const sel = { width: '100%', border: `1.5px solid ${BD}`, borderRadius: 10, padding: '10px 12px', fontSize: 13.5, color: T1, background: 'white' }
const inp = { width: '100%', border: `1.5px solid ${BD}`, borderRadius: 10, padding: '10px 12px', fontSize: 13.5, color: T1, background: 'white' }
const smBtn = { fontSize: 12, fontWeight: 600, padding: '7px 13px', borderRadius: 8, border: `1px solid ${BD}`, background: 'white', color: T2, cursor: 'pointer', whiteSpace: 'nowrap' }
