import { useEffect, useRef, useState } from 'react'
import { P, PL, PB, PD, T1, T2, T3, BD, BG2, G, GL, GB, R, RL, RB, INK, timeAgo, ContributorBadge, contributorTier, AttachmentPreview, ResourceLink, uploadAttachment, ATTACHMENT_ACCEPT, ROOM_TINT, ROOM_GRADIENT, roomKindFromKey, NPrepMark } from '../shared'
import PostCard from '../student/community/PostCard'

const icon = (d) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>

const TABS = [
  { id: 'create', label: 'Create thread', title: 'Create thread', desc: 'Post a thread in any room, with an optional poll and media. The preview shows how students will see it.', icon: icon(<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>) },
  { id: 'moderate', label: 'Moderate', title: 'Moderate', desc: 'Approve contributor posts, handle reported comments, hide threads, and endorse, pin or remove replies.', icon: icon(<path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z"/>) },
  { id: 'contributors', label: 'Contributors', title: 'Contributors', desc: 'Approve students who have earned posting rights.', icon: icon(<><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 15.2c2.5.3 4.5 2 4.5 4.8"/></>) },
]

const NAV_ITEM_PITCH = 44 // 40px item + 4px gap — drives the sliding active pill

export default function CommunityCMS({ state, onCreateThread, onSetThreadHidden, onSetReplyHidden, onPostReply, onNprepLikeReply, onTogglePinReply, onApproveContributor, onDismissReports, onDecideThread, onExit }) {
  const [tab, setTab] = useState('create') // create | moderate | contributors
  const [toast, setToast] = useState(null) // { id, msg }
  const toastTimer = useRef(null)
  const { rooms, subjectTags, questions, threads, repliesByThread, contributors = {} } = state
  const current = TABS.find(t => t.id === tab)
  const tabIndex = TABS.findIndex(t => t.id === tab)

  const showToast = (msg) => {
    clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), msg })
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  // Sidebar counts — what needs a human right now.
  const pendingPosts = threads.filter(t => t.approvalStatus === 'pending').length
  const openReports = Object.values(repliesByThread).flat().filter(r => !r.hidden && r.reportCount > 0).length
  const awaitingApproval = Object.values(contributors).filter(c => c.isEligible && !c.approvedToPost).length
  const counts = { moderate: pendingPosts + openReports, contributors: awaitingApproval }

  return (
    <div className="cms-shell">
      <aside className="cms-side">
        <div className="cms-brand" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 8px 10px' }}>
          <img src="/nprep-logo.jpg" alt="" style={{ width: 34, height: 34, borderRadius: 10 }} />
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: INK, lineHeight: 1.2 }}>NPrep</div>
            <div style={{ fontSize: 11.5, color: T3, fontWeight: 600 }}>Community CMS</div>
          </div>
        </div>
        <div className="cms-nav-label">Manage</div>
        <div className="cms-nav-list">
          <span className="cms-nav-ind" style={{ transform: `translateY(${tabIndex * NAV_ITEM_PITCH}px)` }} />
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`cms-nav${tab === t.id ? ' active' : ''}`}>
              {t.icon}{t.label}
              {counts[t.id] > 0 && <span key={counts[t.id]} className={`cms-count${t.id === 'contributors' ? ' calm' : ''}`}>{counts[t.id]}</span>}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={onExit} className="cms-nav exit">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6"/></svg>
            All flows
          </button>
          <div className="cms-user" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px 2px', borderTop: `1px solid ${BD}`, marginTop: 6 }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: PL, color: PD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>NT</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>NPrep Team</div>
              <div style={{ fontSize: 11, color: T3 }}>Admin</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="cms-main">
        <header style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderBottom: `1px solid ${BD}`, padding: '20px 32px', position: 'sticky', top: 0, zIndex: 10 }}>
          <h1 key={tab} className="fade-in" style={{ fontSize: 21, fontWeight: 800, color: INK, letterSpacing: '-0.01em' }}>{current.title}</h1>
          <p key={tab + 'd'} className="fade-in" style={{ fontSize: 13, color: T2, marginTop: 3, maxWidth: 720 }}>{current.desc}</p>
        </header>

        <div key={tab} className="cms-page" style={{ padding: '24px 32px 80px', maxWidth: 1180 }}>
          {tab === 'create' && <CreateThreadTab rooms={rooms} subjectTags={subjectTags} questions={questions} onCreateThread={onCreateThread} toast={showToast} />}
          {tab === 'moderate' && <ModerateTab state={state} toast={showToast} onSetThreadHidden={onSetThreadHidden} onSetReplyHidden={onSetReplyHidden} onPostReply={onPostReply} onNprepLikeReply={onNprepLikeReply} onTogglePinReply={onTogglePinReply} onDismissReports={onDismissReports} onDecideThread={onDecideThread} />}
          {tab === 'contributors' && <ContributorsTab state={state} toast={showToast} onApproveContributor={onApproveContributor} />}
        </div>
      </main>

      {toast && (
        <div key={toast.id} className="cms-toast" role="status">
          <span className="tick"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="4,12 10,18 20,6"/></svg></span>
          {toast.msg}
        </div>
      )}
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

function StatCard({ label, value, note, index = 0, onClick, tone }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className="stat-card" onClick={onClick} style={{ '--i': index }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={tone ? { color: tone } : undefined}>{value}</div>
      {note && <div className="stat-note">{note}</div>}
    </Tag>
  )
}

function CreateThreadTab({ rooms, subjectTags, questions, onCreateThread, toast }) {
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
  const [posting, setPosting] = useState(false)

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
    setPosting(true)
    try {
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
      toast('Thread posted — students in this room are notified')
    } catch (err) {
      toast(err.message || 'Could not post the thread')
    } finally {
      setPosting(false)
    }
  }

  // Live preview of the post exactly as the student feed card renders it.
  const room = rooms.find(r => r.key === roomKey)
  const previewThread = {
    id: 'preview', roomKey, title: title.trim() || 'Your title appears here', body: body.trim(),
    subjectTag: (isSubjectRoom || isYtLectures) ? subjectTag : isCurrentAffairs ? DAILY_DOSE_TAG : null,
    poll: addPoll ? { totalVotes: 0 } : null, likeCount: 0, likedByMe: false, replyCount: 0, registeredByMe: false,
    createdAt: new Date().toISOString(), authorName: null, archived: false, isLive: false,
    startsAt: isWebinar && startsAt ? new Date(startsAt).toISOString() : null,
    attachmentUrl: attachment?.url || null, attachmentName: attachment?.name || null, attachmentType: attachment?.type || null,
    resourceUrl: resource?.url || null, resourceName: resource?.name || null,
  }
  const noop = () => {}

  return (
    <div className="cms-grid-create">
      <div className="cms-card" style={{ padding: '26px 28px 28px' }}>
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
            <div className="reveal" style={{ marginTop: 14 }}>
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
          <button onClick={submit} disabled={!canSubmit || posting} style={{ marginTop: 18, background: canSubmit ? P : BD, color: canSubmit ? 'white' : T3, border: 'none', borderRadius: 10, padding: '11px 26px', fontSize: 13.5, fontWeight: 700, cursor: canSubmit && !posting ? 'pointer' : 'default', opacity: posting ? 0.7 : 1 }}>
            {posting ? 'Posting…' : 'Post thread'}
          </button>
        </div>
      </div>

      {/* Student-app preview, using the same card the feed renders */}
      <div className="cms-preview">
        <div style={{ fontSize: 12, fontWeight: 700, color: T2, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>Student app preview</div>
        <div style={{ background: '#F4F5FA', border: `1px solid ${BD}`, borderRadius: 24, padding: '16px 0 6px', pointerEvents: 'none' }}>
          <PostCard t={previewThread} tile={room} roomLabel={room?.label} onOpen={noop} onLike={noop} onShare={noop} onRegister={noop} />
        </div>
        {addPoll && pollOptions.some(o => o.trim()) && (
          <div className="reveal cms-card" style={{ marginTop: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T2, letterSpacing: '0.04em', marginBottom: 8 }}>📊 POLL OPTIONS</div>
            {pollOptions.filter(o => o.trim()).map((o, i) => (
              <div key={i} style={{ fontSize: 13, color: T1, border: `1.5px solid ${BD}`, borderRadius: 10, padding: '8px 12px', marginBottom: 6 }}>{o}</div>
            ))}
          </div>
        )}
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
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: t.fg, background: t.bg, borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.fg, opacity: 0.75 }} />{children}
    </span>
  )
}

function Collapsible({ leaving, children }) {
  return <div className={`collapse${leaving ? ' leaving' : ''}`}><div className="collapse-inner">{children}</div></div>
}

function AllCaughtUp({ title, children }) {
  return (
    <div className="fade-up cms-card" style={{ padding: '44px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 30, marginBottom: 8 }}>🎉</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{title}</div>
      <div style={{ fontSize: 13, color: T3, marginTop: 4 }}>{children}</div>
    </div>
  )
}

function ModerateTab({ state, toast, onSetThreadHidden, onSetReplyHidden, onPostReply, onNprepLikeReply, onTogglePinReply, onDismissReports, onDecideThread }) {
  const { threads, repliesByThread, rooms, contributors = {} } = state
  const roomLabel = (key) => rooms.find(r => r.key === key)?.label || key
  const sorted = [...threads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  // Contributor posts held for approval, and comments students have reported (open reports only).
  const pendingPosts = sorted.filter(t => t.approvalStatus === 'pending')
  const reported = []
  for (const t of threads) {
    for (const r of repliesByThread[t.id] || repliesByThread[String(t.id)] || []) {
      if (!r.hidden && r.reportCount > 0) reported.push({ thread: t, reply: r })
    }
  }
  reported.sort((a, b) => b.reply.reportCount - a.reply.reportCount)
  const hiddenCount = threads.filter(t => t.hidden).length
  const reasonSummary = (r) => Object.entries(r.reportReasons.reduce((m, x) => { m[x] = (m[x] || 0) + 1; return m }, {}))
    .map(([reason, n]) => (n > 1 ? `${reason} ×${n}` : reason)).join(', ')

  const [view, setView] = useState(() => pendingPosts.length ? 'approval' : reported.length ? 'reports' : 'all')
  const [expanded, setExpanded] = useState(null)
  const [leaving, setLeaving] = useState(() => new Set())

  // Queue action: collapse the row first, then run the action and confirm with a toast.
  const act = (key, fn, msg) => {
    setLeaving(s => new Set(s).add(key))
    setTimeout(async () => {
      try { await fn(); toast(msg) } catch (e) { toast(e.message || 'Something went wrong') }
      setLeaving(s => { const n = new Set(s); n.delete(key); return n })
    }, 280)
  }
  // Inline action (no collapse): run it and confirm with a toast.
  const run = async (fn, msg) => {
    try { await fn(); toast(msg) } catch (e) { toast(e.message || 'Something went wrong') }
  }

  const tabs = [
    { id: 'approval', label: 'Awaiting approval', count: pendingPosts.length, hot: pendingPosts.length > 0 },
    { id: 'reports', label: 'Reported comments', count: reported.length, hot: reported.length > 0 },
    { id: 'all', label: 'All threads', count: threads.length },
  ]

  return (
    <div>
      <div className="stat-grid">
        <StatCard index={0} label="Total threads" value={threads.length} note={`${hiddenCount} hidden`} onClick={() => setView('all')} />
        <StatCard index={1} label="Awaiting approval" value={pendingPosts.length} note="Contributor posts" tone={pendingPosts.length ? '#B45309' : undefined} onClick={() => setView('approval')} />
        <StatCard index={2} label="Open reports" value={reported.length} note="Reported comments" tone={reported.length ? '#B42343' : undefined} onClick={() => setView('reports')} />
        <StatCard index={3} label="Top contributors" value={Object.values(contributors).filter(c => c.isActiveContributor || c.isEligible || c.approvedToPost).length} note="Badge holders" />
      </div>

      <div className="cms-tabs" role="tablist">
        {tabs.map(t => (
          <button key={t.id} role="tab" aria-selected={view === t.id} onClick={() => setView(t.id)} className={`cms-tab${view === t.id ? ' active' : ''}`}>
            {t.label}
            <span className={`cms-tab-count${t.hot ? ' hot' : ''}`}>{t.count}</span>
          </button>
        ))}
      </div>

      <div key={view} className="fade-up">
        {view === 'approval' && (
          pendingPosts.length === 0
            ? <AllCaughtUp title="Nothing waiting for approval">Posts written by Top Contributors will show up here.</AllCaughtUp>
            : (
              <div className="cms-card" style={{ overflow: 'hidden' }}>
                {pendingPosts.map(t => (
                  <Collapsible key={t.id} leaving={leaving.has('p' + t.id)}>
                    <div style={queueRow}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: INK, fontSize: 14 }}>{t.title}</span>
                          <StatusBadge tone="grey">{roomLabel(t.roomKey)}</StatusBadge>
                        </div>
                        <div style={{ fontSize: 12, color: T2, marginTop: 3 }}>by {t.authorName || 'Unknown'} · {timeAgo(t.createdAt)}</div>
                        {t.body && <div style={{ fontSize: 13, color: T1, marginTop: 8, lineHeight: 1.5 }}>{t.body}</div>}
                      </div>
                      <button onClick={() => act('p' + t.id, () => onDecideThread(t.id, 'approved'), 'Post approved — now visible to students')} style={{ ...smBtn, flexShrink: 0, borderColor: P, color: 'white', background: P }}>Approve</button>
                      <button onClick={() => act('p' + t.id, () => onDecideThread(t.id, 'rejected'), 'Post rejected')} style={{ ...smBtn, flexShrink: 0 }}>Reject</button>
                    </div>
                  </Collapsible>
                ))}
              </div>
            )
        )}

        {view === 'reports' && (
          reported.length === 0
            ? <AllCaughtUp title="No open reports">Comments students flag will show up here.</AllCaughtUp>
            : (
              <div className="cms-card" style={{ overflow: 'hidden' }}>
                {reported.map(({ thread, reply }) => (
                  <Collapsible key={reply.id} leaving={leaving.has('r' + reply.id)}>
                    <div style={queueRow}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: T1, fontSize: 13 }}>{reply.authorName}</span>
                          <StatusBadge tone="red">Reported ×{reply.reportCount}</StatusBadge>
                          <span style={{ fontSize: 12, color: T3 }}>{reasonSummary(reply)}</span>
                        </div>
                        <div style={{ fontSize: 13.5, color: T1, marginTop: 6, lineHeight: 1.5 }}>{reply.body}</div>
                        <div style={{ fontSize: 12, color: T3, marginTop: 5 }}>in “{thread.title}” · {roomLabel(thread.roomKey)}</div>
                      </div>
                      <button onClick={() => act('r' + reply.id, () => onDismissReports(reply.id), 'Report dismissed')} style={{ ...smBtn, flexShrink: 0 }}>Dismiss</button>
                      <button onClick={() => act('r' + reply.id, () => onSetReplyHidden(reply.id, true), 'Comment deleted')} style={{ ...smBtn, flexShrink: 0, borderColor: RB, color: R, background: RL }}>Delete</button>
                    </div>
                  </Collapsible>
                ))}
              </div>
            )
        )}

        {view === 'all' && (
          <div className="cms-card" style={{ overflow: 'hidden' }}>
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
                {sorted.map((t, i) => {
                  const replies = repliesByThread[t.id] || repliesByThread[String(t.id)] || []
                  const isOpen = expanded === t.id
                  const kind = roomKindFromKey(t.roomKey)
                  return [
                    <tr key={t.id} className="cms-click" onClick={() => setExpanded(isOpen ? null : t.id)} style={{ '--i': Math.min(i, 14), background: isOpen ? '#FAFBFF' : undefined }}>
                      <td style={{ maxWidth: 380 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }}><polyline points="9,18 15,12 9,6"/></svg>
                          <span style={{ fontWeight: 600, color: t.hidden ? T3 : INK }}>{t.title}</span>
                        </div>
                      </td>
                      <td className="hide-narrow">
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: ROOM_GRADIENT[kind], background: ROOM_TINT[kind], borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap' }}>{roomLabel(t.roomKey)}</span>
                      </td>
                      <td style={{ color: T2 }}>{replies.length}</td>
                      <td className="hide-narrow" style={{ color: T2, whiteSpace: 'nowrap' }}>{timeAgo(t.createdAt)}</td>
                      <td>{t.approvalStatus === 'pending' ? <StatusBadge tone="amber">Awaiting approval</StatusBadge> : t.approvalStatus === 'rejected' ? <StatusBadge tone="red">Rejected</StatusBadge> : t.hidden ? <StatusBadge tone="grey">Hidden</StatusBadge> : <StatusBadge tone="green">Visible</StatusBadge>}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={e => { e.stopPropagation(); run(() => onSetThreadHidden(t.id, !t.hidden), t.hidden ? 'Thread is visible again' : 'Thread hidden from students') }} style={{ ...smBtn, borderColor: t.hidden ? GB : RB, color: t.hidden ? G : R, background: t.hidden ? GL : RL }}>
                          {t.hidden ? 'Unhide thread' : 'Hide thread'}
                        </button>
                      </td>
                    </tr>,
                    isOpen && (
                      <tr key={t.id + '-open'}>
                        <td colSpan={6} style={{ background: '#F9FAFD', padding: '16px 20px 18px 40px' }}>
                          <div className="reveal">
                            <button onClick={() => run(() => onPostReply(t.id, 'Any updates on this from the team?', true), 'Peer reply added')} style={{ ...smBtn, marginBottom: 12 }}>💬 Simulate a peer reply</button>
                            {replies.length === 0 && <div style={{ fontSize: 12.5, color: T3 }}>No replies yet.</div>}
                            {replies.map(r => (
                              <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderTop: `1px solid ${BD}` }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 12.5, fontWeight: 700, color: T1 }}>{r.hidden ? '(hidden)' : r.authorName}</span>
                                    <ContributorBadge tier={contributorTier(contributors[r.studentKey])} />
                                    {r.pinned && <StatusBadge tone="amber">Pinned</StatusBadge>}
                                    {r.likedByNPrepTeam && <NPrepMark size={14} />}
                                    {r.reportCount > 0 && !r.hidden && <StatusBadge tone="red">Reported ×{r.reportCount}</StatusBadge>}
                                    <span style={{ fontWeight: 400, color: T3, fontSize: 11 }}>{timeAgo(r.createdAt)}</span>
                                  </div>
                                  <div style={{ fontSize: 12.5, color: r.hidden ? T3 : T1, fontStyle: r.hidden ? 'italic' : 'normal', marginTop: 3, lineHeight: 1.45 }}>{r.hidden ? 'This reply was removed' : r.body}</div>
                                </div>
                                {!r.hidden && (
                                  <>
                                    {r.reportCount > 0 && (
                                      <button onClick={() => run(() => onDismissReports(r.id), 'Report dismissed')} style={{ ...smBtn, flexShrink: 0 }}>Dismiss report</button>
                                    )}
                                    <button onClick={() => run(() => onNprepLikeReply(r.id), r.likedByNPrepTeam ? 'NPrep like removed' : 'Liked as NPrep Team')} style={{ ...smBtn, flexShrink: 0, borderColor: r.likedByNPrepTeam ? PB : BD, color: r.likedByNPrepTeam ? PD : T2, background: r.likedByNPrepTeam ? PL : 'white' }}>
                                      {r.likedByNPrepTeam ? '❤️ NPrep liked' : '🤍 NPrep like'}
                                    </button>
                                    {!r.parentReplyId && (
                                      <button onClick={() => run(() => onTogglePinReply(r.id), r.pinned ? 'Comment unpinned' : 'Comment pinned to the top')} style={{ ...smBtn, flexShrink: 0, borderColor: r.pinned ? '#FAC775' : BD, color: r.pinned ? '#8A5300' : T2, background: r.pinned ? '#FFF1D6' : 'white' }}>
                                        {r.pinned ? 'Unpin' : 'Pin'}
                                      </button>
                                    )}
                                  </>
                                )}
                                <button onClick={() => run(() => onSetReplyHidden(r.id, !r.hidden), r.hidden ? 'Comment restored' : 'Comment deleted')} style={{ ...smBtn, flexShrink: 0, borderColor: r.hidden ? GB : RB, color: r.hidden ? G : R, background: r.hidden ? GL : RL }}>
                                  {r.hidden ? 'Restore' : 'Delete'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ),
                  ]
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// Students eligible (15+ NPrep-liked comments) or already approved to post in Subject Room /
// Exam Room — the admin-approval step that actually turns on their posting rights (Phase 1).
function ContributorsTab({ state, toast, onApproveContributor }) {
  const { contributors = {}, repliesByThread } = state
  const inactivityDays = state.inactivityDays || 30
  const nameByKey = {}
  for (const list of Object.values(repliesByThread)) {
    for (const r of list) if (!nameByKey[r.studentKey]) nameByKey[r.studentKey] = r.authorName
  }

  const rows = Object.entries(contributors)
    .map(([studentKey, c]) => ({ studentKey, name: nameByKey[studentKey] || studentKey, ...c }))
    .filter(row => row.nprepLikedCount > 0 || row.approvedToPost)
    .sort((a, b) => b.nprepLikedCount - a.nprepLikedCount)

  const eligible = rows.filter(r => r.isEligible && !r.approvedToPost).length
  const approved = rows.filter(r => r.approvedToPost).length
  const inactive = rows.filter(r => r.inactive).length

  const approve = async (row) => {
    try {
      await onApproveContributor(row.studentKey)
      toast(row.approvedToPost ? `Posting rights revoked for ${row.name}` : `Posting approved for ${row.name}`)
    } catch (e) {
      toast(e.message || 'Something went wrong')
    }
  }

  return (
    <div>
      <div className="stat-grid">
        <StatCard index={0} label="Tracked students" value={rows.length} note="With NPrep-liked comments" />
        <StatCard index={1} label="Awaiting your approval" value={eligible} note="Eligible, not yet approved" tone={eligible ? '#B45309' : undefined} />
        <StatCard index={2} label="Approved to post" value={approved} note="Subject & Exam rooms" tone={approved ? G : undefined} />
        <StatCard index={3} label="Inactive" value={inactive} note={`No activity in ${inactivityDays}+ days`} tone={inactive ? '#B42343' : undefined} />
      </div>

      <div style={{ fontSize: 13, color: T2, marginBottom: 16, lineHeight: 1.55, maxWidth: 780 }}>
        A student becomes an Active Contributor at 10 NPrep-liked comments, and Eligible to post at 15 — like a comment from the Moderate tab to count it. Eligibility alone doesn't grant posting; approve them below to turn it on for Subject Room / Exam Room. Every post they write still waits for your approval in the Moderate tab. After {inactivityDays} days with no comment or post, the badge pauses and posting rights are removed — a new comment brings the badge back, and you approve posting again.
      </div>
      {rows.length === 0 ? (
        <AllCaughtUp title="No contributors yet">NPrep-like some comments in Moderate to get started.</AllCaughtUp>
      ) : (
        <div className="cms-card" style={{ overflow: 'hidden' }}>
          <table className="cms-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>NPrep-liked comments</th>
                <th>Last active</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const pct = Math.min(100, Math.round((row.nprepLikedCount / 15) * 100))
                return (
                  <tr key={row.studentKey} style={{ '--i': Math.min(i, 14) }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: INK }}>{row.name}</span>
                        <ContributorBadge tier={contributorTier(row)} />
                      </div>
                    </td>
                    <td style={{ minWidth: 220 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 4, background: BG2, overflow: 'hidden', maxWidth: 120 }}>
                          <div className="grow-x" style={{ width: `${pct}%`, height: '100%', background: row.isEligible ? G : P, borderRadius: 4, animationDelay: `${Math.min(i, 8) * 60}ms` }} />
                        </div>
                        <span style={{ fontSize: 12, color: T2, whiteSpace: 'nowrap' }}>{row.nprepLikedCount} comment{row.nprepLikedCount === 1 ? '' : 's'} liked by NPrep Team</span>
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {row.lastActiveAt ? (
                        <>
                          <div style={{ fontSize: 12.5, color: T1 }}>{timeAgo(row.lastActiveAt)}</div>
                          <div style={{ fontSize: 11, color: row.inactive ? R : T3 }}>
                            {row.inactive ? 'Inactive — badge paused' : `Badge pauses in ${Math.max(0, Math.ceil((new Date(row.expiresAt) - Date.now()) / 86400000))}d`}
                          </div>
                        </>
                      ) : <span style={{ fontSize: 12, color: T3 }}>—</span>}
                    </td>
                    <td>
                      {row.approvedToPost ? <StatusBadge tone="green">Approved</StatusBadge>
                        : row.inactive ? <StatusBadge tone="red">{row.expiredAt ? 'Posting rights expired' : 'Inactive'}</StatusBadge>
                        : row.isEligible ? <StatusBadge tone="amber">Approval pending</StatusBadge>
                        : <StatusBadge tone="grey">Below threshold</StatusBadge>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {row.isEligible ? (
                        <button onClick={() => approve(row)}
                          style={{ ...smBtn, borderColor: row.approvedToPost ? GB : PB, color: row.approvedToPost ? G : PD, background: row.approvedToPost ? GL : PL }}>
                          {row.approvedToPost ? 'Approved ✓ — revoke' : 'Approve to post'}
                        </button>
                      ) : (
                        <span style={{ fontSize: 11.5, color: T3 }}>{row.inactive ? 'Needs new activity first' : `${Math.max(0, 15 - row.nprepLikedCount)} more to become eligible`}</span>
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

const queueRow = { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '16px 20px', borderTop: `1px solid ${BD}` }
const sel = { width: '100%', border: `1.5px solid ${BD}`, borderRadius: 10, padding: '10px 12px', fontSize: 13.5, color: T1, background: 'white' }
const inp = { width: '100%', border: `1.5px solid ${BD}`, borderRadius: 10, padding: '10px 12px', fontSize: 13.5, color: T1, background: 'white' }
const smBtn = { fontSize: 12, fontWeight: 600, padding: '7px 13px', borderRadius: 8, border: `1px solid ${BD}`, background: 'white', color: T2, cursor: 'pointer', whiteSpace: 'nowrap' }
