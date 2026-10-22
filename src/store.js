// In-browser data store — replaces the old Neon Postgres + /api/* backend. Everything lives
// in this module and is persisted to localStorage, so the prototype works as a static site.
// Each mutation function below mirrors one of the old API handlers; getState() mirrors the
// old GET /api/state response, so the screens keep reading the same shape.
import { seedVolume } from './data/seedVolume'
import {
  DEMO_STUDENT_KEY, DEMO_STUDENT_NAME, NPREP_TEAM_KEY, EXAMS, SUBJECT_TAGS, REPORT_REASONS,
  CONTRIBUTOR_POST_ROOM_KINDS, ACTIVE_CONTRIBUTOR_THRESHOLD, ELIGIBLE_TO_POST_THRESHOLD,
  CONTRIBUTOR_INACTIVITY_DAYS, buildRooms, buildRoomTiles, examRoomKey,
} from './data/constants'

const STORAGE_KEY = 'nprep-community-prototype-v2' // v1 held the small seed; v2 adds the volume seed
const OLD_STORAGE_KEYS = ['nprep-community-prototype-v1']
const MIN = 60 * 1000, HOUR = 60 * MIN, DAY = 24 * HOUR
const PEER_NAMES = ['Priya S.', 'Rohit K.', 'Anjali M.', 'Kavya R.', 'Suresh M.', 'Deepak V.', 'Sneha R.', 'Meera J.']

const iso = (ms) => new Date(ms).toISOString()

// ---------------------------------------------------------------------------------------
// Seed data (was scripts/setup-db.mjs)
// ---------------------------------------------------------------------------------------

const QUESTIONS = [
  { question: 'Which of the following levels of care includes super-specialty hospitals like AIIMS?', options: ['Primary Care', 'Secondary Care', 'Tertiary Care', 'Home Care'], correctIndex: 2, freeTier: true },
  { question: 'Which attribute is most likely to cause conflict in nursing administration?', options: ['Role ambiguity', 'Shift timing', 'Uniform code', 'Ward color'], correctIndex: 0, freeTier: true },
  { question: 'Normal fasting blood glucose range is approximately?', options: ['40-60 mg/dL', '70-100 mg/dL', '140-160 mg/dL', '200-220 mg/dL'], correctIndex: 1, freeTier: true },
  { question: 'Which nursing theory focuses on self-care deficit?', options: ['Orem', 'Roy', 'Peplau', 'Henderson'], correctIndex: 0, freeTier: true },
  { question: 'A paid-tier mock question used to demo the CMS filter — should NEVER be selectable for Daily Dose.', options: ['A', 'B', 'C', 'D'], correctIndex: 0, freeTier: false },
  { question: 'Another paid QBank question — filtered out of the free-tier picker.', options: ['A', 'B', 'C', 'D'], correctIndex: 1, freeTier: false },
]

function emptyDb() {
  return {
    seq: { question: 0, thread: 0, reply: 0, poll: 0, option: 0, notification: 0 },
    profile: { exam: null, onboarded: false },
    enrollments: [],
    questions: [], threads: [], replies: [],
    polls: [], pollOptions: [], pollVotes: [],
    notifications: [],
    threadLikes: [], replyLikes: [], replyReports: [],
    contributors: {},
    registrations: [],
  }
}

function seed() {
  const now = Date.now()
  const at = (offset) => iso(now + offset)
  const db = emptyDb()

  const addThread = (t) => {
    const row = {
      id: ++db.seq.thread, roomKey: t.roomKey, title: t.title, body: t.body || '', subjectTag: t.subjectTag || null,
      questionId: t.questionId || null, hidden: false, approvalStatus: t.approvalStatus || 'approved', archiveAt: t.archiveAt || null,
      authorKey: t.authorKey || null, authorName: t.authorName || null,
      attachmentUrl: t.attachmentUrl || null, attachmentName: t.attachmentName || null, attachmentType: t.attachmentType || null,
      startsAt: t.startsAt || null, resourceUrl: null, resourceName: null, createdAt: t.createdAt,
    }
    db.threads.push(row)
    return row
  }
  const addReply = (threadId, studentKey, authorName, body, createdAt, parentReplyId = null) => {
    const row = {
      id: ++db.seq.reply, threadId, studentKey, authorName, body, hidden: false, parentReplyId, pinnedAt: null,
      attachmentUrl: null, attachmentName: null, attachmentType: null, createdAt,
    }
    db.replies.push(row)
    return row
  }

  for (const q of QUESTIONS) db.questions.push({ id: ++db.seq.question, ...q })
  const qId = (i) => db.questions[i].id

  // Daily Dose — linked to a free-tier question, a couple of replies including one from the
  // demo student (so the CMS "simulate peer reply" tool can demo the reply-notification rule).
  const dailyDose = addThread({
    roomKey: 'daily_dose', title: "Today's Daily Dose 🔥",
    body: "Today's QOTD — drop your reasoning below, right or wrong. Tertiary care covers super-specialty institutes like AIIMS.",
    questionId: qId(0), createdAt: at(-3 * HOUR),
  })
  addReply(dailyDose.id, 'peer-1', 'Priya S.', 'Got it right! Tertiary = super-specialty.', at(-2 * HOUR))
  addReply(dailyDose.id, 'demo', 'You', "I picked Secondary Care first, makes sense now why it's Tertiary.", at(-90 * MIN))
  addReply(dailyDose.id, 'peer-2', 'Rohit K.', 'Same mistake here 😅 thanks for the thread.', at(-40 * MIN))

  // Subject Room — one plain discussion thread, one with a poll.
  const subj1 = addThread({
    roomKey: 'subject_room', title: 'Quick way to remember cranial nerves?',
    body: 'Sharing mnemonics that actually stuck for you — drop yours below.',
    subjectTag: 'Medical Surgical Nursing', createdAt: at(-1 * DAY),
  })
  addReply(subj1.id, 'peer-3', 'Anjali M.', '"Oh Oh Oh To Touch And Feel Very Good Velvet AH" — never forgot it since.', at(-20 * HOUR))

  const subj2 = addThread({
    roomKey: 'subject_room', title: 'Which subject is eating most of your revision time right now?',
    body: "Curious what everyone's grinding through this week.",
    subjectTag: 'Community Health Nursing', createdAt: at(-2 * DAY),
  })
  const poll = { id: ++db.seq.poll, threadId: subj2.id }
  db.polls.push(poll)
  const optIds = ['Medical Surgical', 'Community Health', 'OBG', 'Pediatrics'].map((label, position) => {
    const o = { id: ++db.seq.option, pollId: poll.id, label, position }
    db.pollOptions.push(o)
    return o.id
  })
  ;[0, 0, 1, 0, 2, 3, 0, 1].forEach((opt, i) => db.pollVotes.push({ pollId: poll.id, studentKey: 'peer-vote-' + i, optionId: optIds[opt] }))

  // Exam Room — one thread per exam.
  const norcet = addThread({
    roomKey: 'exam_room_norcet', title: 'NORCET 10 notification — expected timeline?',
    body: 'Sharing what we know so far, will keep this updated.', createdAt: at(-6 * HOUR),
  })
  addReply(norcet.id, 'peer-4', 'Kavya R.', 'Heard forms open next month, fingers crossed.', at(-5 * HOUR))
  const aiims = addThread({
    roomKey: 'exam_room_aiims', title: 'AIIMS cutoff trend — last 3 years',
    body: "Posting the cutoff numbers we've tracked so far for AIIMS Nursing Officer.", createdAt: at(-1 * DAY),
  })

  // Webinar Threads — one still active, one auto-archived (48h past its session). Each
  // carries a sample "related content" PDF (bundled in /public/samples).
  const webinarLive = addThread({
    roomKey: 'webinar_threads', title: 'Live now: MCQ Discussion — Community Health High-Yield',
    body: 'Drop your questions here during the session.', archiveAt: at(20 * HOUR), createdAt: at(-4 * HOUR),
    attachmentUrl: '/samples/mcq-discussion-notes.pdf', attachmentName: 'mcq-discussion-notes.pdf', attachmentType: 'pdf',
  })
  const webinarRecap = addThread({
    roomKey: 'webinar_threads', title: 'Recap: Topper Journey session',
    body: 'Session wrapped — thanks for joining! This thread is now archived.', archiveAt: at(-1 * HOUR), createdAt: at(-49 * HOUR),
    attachmentUrl: '/samples/topper-journey-recap.pdf', attachmentName: 'topper-journey-recap.pdf', attachmentType: 'pdf',
  })

  // Daily Dose can also carry a "Current Affairs" post (no linked question).
  const affairs = addThread({
    roomKey: 'daily_dose', title: 'Current Affairs: New national nursing curriculum rollout',
    body: 'The health ministry announced a phased rollout of the revised B.Sc Nursing curriculum starting next academic year — expect NORCET/AIIMS questions to reference the updated syllabus.',
    subjectTag: 'Current Affairs', createdAt: at(-6 * HOUR),
  })

  // The handful of hand-written threads above stay as they are; this layers the bulk
  // conversation (hundreds of comments, likes, reports, contributors) on top of them.
  seedVolume({ db, now, addThread, addReply, topThreads: { dailyDose, subj1, subj2, norcet, aiims, webinarLive, webinarRecap, affairs } })

  return db
}

// ---------------------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------------------

// Attachments uploaded in a previous session are blob: URLs that no longer resolve after a
// reload — drop them rather than render broken media.
function dropDeadBlobUrls(db) {
  const dead = (u) => typeof u === 'string' && u.startsWith('blob:')
  for (const row of [...db.threads, ...db.replies]) {
    if (dead(row.attachmentUrl)) { row.attachmentUrl = null; row.attachmentName = null; row.attachmentType = null }
    if (dead(row.resourceUrl)) { row.resourceUrl = null; row.resourceName = null }
  }
  return db
}

function load() {
  try {
    for (const k of OLD_STORAGE_KEYS) localStorage.removeItem(k)
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return dropDeadBlobUrls(JSON.parse(raw))
  } catch {
    // storage blocked or corrupt — fall through to a fresh seed
  }
  return seed()
}

let db = load()

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)) } catch { /* private mode / quota — stay in memory */ }
}

// Wipes local changes and re-seeds the demo content.
export function resetStore() {
  db = seed()
  save()
}

// ---------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------

const byCreated = (a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : a.id - b.id)
const threadById = (id) => db.threads.find(t => t.id === Number(id))
const replyById = (id) => db.replies.find(r => r.id === Number(id))
const isEnrolled = (roomKey) => db.enrollments.includes(roomKey)
const enroll = (roomKey) => { if (!isEnrolled(roomKey)) db.enrollments.push(roomKey) }
const notify = (kind, roomKey, threadId, title, body) => {
  db.notifications.push({ id: ++db.seq.notification, kind, roomKey, threadId: threadId == null ? null : Number(threadId), title, body, createdAt: iso(Date.now()) })
}
const roomKind = (roomKey) => (roomKey && roomKey.startsWith('exam_room') ? 'exam_room' : roomKey)

// Contributor expiry: no activity (comment, post, or admin approval) for
// CONTRIBUTOR_INACTIVITY_DAYS revokes posting rights; the admin has to approve again.
// Runs lazily on every state read and before a contributor post is accepted.
function expireInactiveContributors() {
  const cutoff = Date.now() - CONTRIBUTOR_INACTIVITY_DAYS * DAY
  for (const [key, c] of Object.entries(db.contributors)) {
    if (!c.approvedToPost) continue
    const times = [c.approvedAt, ...db.replies.filter(r => r.studentKey === key).map(r => r.createdAt), ...db.threads.filter(t => t.authorKey === key).map(t => t.createdAt)]
    const last = Math.max(0, ...times.filter(Boolean).map(t => new Date(t).getTime()))
    if (last < cutoff) { c.approvedToPost = false; c.expiredAt = iso(Date.now()) }
  }
}

// ---------------------------------------------------------------------------------------
// Read: the whole app state (was GET /api/state)
// ---------------------------------------------------------------------------------------

function serializeThread(t, replyCount, poll, likeCount, likedByMe, registeredCount, registeredByMe) {
  const now = new Date()
  const startsAt = t.startsAt ? new Date(t.startsAt) : null
  const archiveAt = t.archiveAt ? new Date(t.archiveAt) : null
  return {
    id: t.id,
    roomKey: t.roomKey,
    title: t.title,
    body: t.body,
    subjectTag: t.subjectTag,
    hidden: t.hidden,
    // 'approved' | 'pending' | 'rejected' — contributor posts start 'pending' until NPrep approves.
    approvalStatus: t.approvalStatus || 'approved',
    createdAt: t.createdAt,
    archiveAt: t.archiveAt,
    archived: archiveAt ? archiveAt < now : false,
    replyCount,
    poll,
    questionId: t.questionId,
    likeCount,
    likedByMe,
    authorKey: t.authorKey,
    authorName: t.authorName,
    attachmentUrl: t.attachmentUrl,
    attachmentName: t.attachmentName,
    attachmentType: t.attachmentType,
    resourceUrl: t.resourceUrl,
    resourceName: t.resourceName,
    // Webinar scheduling — a thread with a future startsAt is "upcoming" (shows Register),
    // once startsAt has passed and it isn't archived yet it's "live" (shows the LIVE badge).
    startsAt: t.startsAt,
    isUpcoming: !!startsAt && startsAt > now,
    isLive: !!startsAt && startsAt <= now && (!archiveAt || archiveAt > now),
    registeredCount,
    registeredByMe,
  }
}

function serializeReply(r, likeCount, likedByMe, replyingToName, likedByNPrepTeam, reports, reportedByMe) {
  return {
    id: r.id,
    threadId: r.threadId,
    studentKey: r.studentKey,
    authorName: r.hidden ? '' : r.authorName,
    body: r.hidden ? '' : r.body,
    hidden: r.hidden,
    createdAt: r.createdAt,
    likeCount: r.hidden ? 0 : likeCount,
    likedByMe: r.hidden ? false : likedByMe,
    parentReplyId: r.parentReplyId,
    replyingToName: r.hidden ? null : replyingToName,
    pinned: !!r.pinnedAt,
    likedByNPrepTeam: r.hidden ? false : likedByNPrepTeam,
    // Open (not dismissed) reports, for the CMS queue; reportedByMe stops a student reporting twice.
    reportCount: reports.length,
    reportReasons: reports.map(x => x.reason),
    reportedByMe,
    attachmentUrl: r.hidden ? null : r.attachmentUrl,
    attachmentName: r.hidden ? null : r.attachmentName,
    attachmentType: r.hidden ? null : r.attachmentType,
  }
}

export function getState() {
  expireInactiveContributors()

  const exams = EXAMS
  const threads = [...db.threads].sort((a, b) => -byCreated(a, b))
  const replies = [...db.replies].sort(byCreated)

  const threadLikeCounts = {}
  const myThreadLikes = new Set()
  for (const l of db.threadLikes) {
    threadLikeCounts[l.threadId] = (threadLikeCounts[l.threadId] || 0) + 1
    if (l.studentKey === DEMO_STUDENT_KEY) myThreadLikes.add(l.threadId)
  }
  const replyLikeCounts = {}
  const myReplyLikes = new Set()
  const nprepLikedReplyIds = new Set()
  for (const l of db.replyLikes) {
    replyLikeCounts[l.replyId] = (replyLikeCounts[l.replyId] || 0) + 1
    if (l.studentKey === DEMO_STUDENT_KEY) myReplyLikes.add(l.replyId)
    if (l.studentKey === NPREP_TEAM_KEY) nprepLikedReplyIds.add(l.replyId)
  }

  const repliesByThread = {}
  const repliesById = {}
  for (const r of replies) {
    (repliesByThread[r.threadId] ??= []).push(r)
    repliesById[r.id] = r
  }

  // Contributor tiers — how many of a student's own (non-hidden) comments NPrep Team has
  // liked, badge tiers at 10/15, and whether an admin has actually turned posting on.
  const authorNprepCounts = {}
  for (const r of replies) {
    if (r.hidden) continue
    if (nprepLikedReplyIds.has(r.id)) authorNprepCounts[r.studentKey] = (authorNprepCounts[r.studentKey] || 0) + 1
  }

  // Last activity = latest comment, authored post, or admin approval. No activity for
  // CONTRIBUTOR_INACTIVITY_DAYS switches the badge tier off (posting rights are revoked
  // separately in expireInactiveContributors). A new comment brings the badge back, but
  // posting rights need a fresh admin approval.
  const lastActiveMs = {}
  const bump = (key, isoStr) => {
    const ms = isoStr ? new Date(isoStr).getTime() : 0
    if (key && ms > (lastActiveMs[key] || 0)) lastActiveMs[key] = ms
  }
  for (const r of replies) bump(r.studentKey, r.createdAt)
  for (const t of threads) bump(t.authorKey, t.createdAt)
  for (const [key, c] of Object.entries(db.contributors)) bump(key, c.approvedAt)

  const contributorKeys = new Set([...Object.keys(authorNprepCounts), ...Object.keys(db.contributors)])
  const contributorsOut = {}
  const nowMs = Date.now()
  for (const key of contributorKeys) {
    const c = db.contributors[key]
    const nprepLikedCount = authorNprepCounts[key] || 0
    const last = lastActiveMs[key] || 0
    const inactive = last > 0 && nowMs - last > CONTRIBUTOR_INACTIVITY_DAYS * DAY
    contributorsOut[key] = {
      nprepLikedCount,
      isActiveContributor: !inactive && nprepLikedCount >= ACTIVE_CONTRIBUTOR_THRESHOLD,
      isEligible: !inactive && nprepLikedCount >= ELIGIBLE_TO_POST_THRESHOLD,
      approvedToPost: !inactive && !!c?.approvedToPost,
      inactive,
      lastActiveAt: last ? new Date(last).toISOString() : null,
      expiresAt: last ? new Date(last + CONTRIBUTOR_INACTIVITY_DAYS * DAY).toISOString() : null,
      expiredAt: c?.expiredAt || null,
    }
  }

  // Open (not dismissed) comment reports, grouped per comment for the CMS queue.
  const reportsByReply = {}
  const myReportedReplyIds = new Set()
  for (const rp of db.replyReports) {
    if (rp.status !== 'open') continue
    (reportsByReply[rp.replyId] ??= []).push(rp)
    if (rp.studentKey === DEMO_STUDENT_KEY) myReportedReplyIds.add(rp.replyId)
  }

  const registrationCounts = {}
  const myRegistrations = new Set()
  for (const r of db.registrations) {
    registrationCounts[r.threadId] = (registrationCounts[r.threadId] || 0) + 1
    if (r.studentKey === DEMO_STUDENT_KEY) myRegistrations.add(r.threadId)
  }

  const pollByThread = {}
  for (const p of db.polls) pollByThread[p.threadId] = p

  const threadsOut = threads.map(t => {
    const p = pollByThread[t.id]
    let pollOut = null
    if (p) {
      const opts = db.pollOptions.filter(o => o.pollId === p.id).sort((a, b) => a.position - b.position)
      const votes = db.pollVotes.filter(v => v.pollId === p.id)
      const myVote = votes.find(v => v.studentKey === DEMO_STUDENT_KEY)
      pollOut = {
        id: p.id,
        totalVotes: votes.length,
        myOptionId: myVote ? myVote.optionId : null,
        options: opts.map(o => ({ id: o.id, label: o.label, voteCount: votes.filter(v => v.optionId === o.id).length })),
      }
    }
    return serializeThread(t, (repliesByThread[t.id] || []).length, pollOut, threadLikeCounts[t.id] || 0, myThreadLikes.has(t.id), registrationCounts[t.id] || 0, myRegistrations.has(t.id))
  })

  const repliesOut = {}
  for (const [threadId, list] of Object.entries(repliesByThread)) {
    repliesOut[threadId] = list.map(r => {
      const parent = r.parentReplyId ? repliesById[r.parentReplyId] : null
      const replyingToName = parent && !parent.hidden ? parent.authorName : null
      return serializeReply(r, replyLikeCounts[r.id] || 0, myReplyLikes.has(r.id), replyingToName, nprepLikedReplyIds.has(r.id), reportsByReply[r.id] || [], myReportedReplyIds.has(r.id))
    })
  }

  return {
    rooms: buildRooms(exams),
    roomTiles: buildRoomTiles(exams),
    exams,
    examRoomKeys: Object.fromEntries(exams.map(e => [e, examRoomKey(e)])),
    reportReasons: REPORT_REASONS,
    inactivityDays: CONTRIBUTOR_INACTIVITY_DAYS,
    subjectTags: SUBJECT_TAGS,
    profile: { exam: db.profile.exam || null, onboarded: db.profile.onboarded || false },
    enrolledRoomKeys: [...db.enrollments],
    threads: threadsOut,
    repliesByThread: repliesOut,
    notifications: [...db.notifications].sort((a, b) => -byCreated(a, b)).slice(0, 30).map(n => ({
      id: n.id, kind: n.kind, roomKey: n.roomKey, threadId: n.threadId,
      title: n.title, body: n.body, createdAt: n.createdAt,
    })),
    questions: db.questions.map(q => ({ id: q.id, question: q.question, options: q.options, correctIndex: q.correctIndex, freeTier: q.freeTier })),
    contributors: contributorsOut,
  }
}

// ---------------------------------------------------------------------------------------
// Mutations (were the POST/PATCH handlers under api/). Each one saves, then returns.
// ---------------------------------------------------------------------------------------

function mutation(fn) {
  return (...args) => {
    const result = fn(...args)
    save()
    return result
  }
}

// PRD P0 #5 — fires once on the student's first Community tab open: auto-enrolls Daily Dose
// (always) and the Exam Room matching their profile (if an exam is already set). Idempotent.
export const onboard = mutation(() => {
  if (!db.profile.onboarded) {
    enroll('daily_dose')
    if (db.profile.exam) enroll(examRoomKey(db.profile.exam))
    db.profile.onboarded = true
  }
})

// Setting an exam auto-enrolls the matching Exam Room.
export const setExam = mutation((exam) => {
  if (!EXAMS.includes(exam)) throw new Error('Invalid exam')
  db.profile.exam = exam
  enroll(examRoomKey(exam))
})

export const setRoomJoined = mutation((roomKey, join) => {
  if (!roomKey) throw new Error('Invalid request')
  if (join) enroll(roomKey)
  else db.enrollments = db.enrollments.filter(k => k !== roomKey)
})

// PRD P0 #2 (admin thread creation) + P0 #8 (content rule enforcement) + P0 #6 (notifications
// on new-thread creation, gated by enrollment / once-per-day). Also used by approved
// contributors (asContributor: true), gated to Subject Room / Exam Room.
export const createThread = mutation((payload) => {
  const { roomKey, title, body, subjectTag, questionId, pollOptions, asContributor, attachmentUrl, attachmentName, attachmentType, startsAt, resourceUrl, resourceName } = payload || {}
  if (!roomKey || !title || !title.trim()) throw new Error('Room and title are required')

  let authorKey = null
  let authorName = null
  // Contributor posts are held for NPrep approval; official CMS posts go live straight away.
  let approvalStatus = 'approved'
  if (asContributor) {
    if (!CONTRIBUTOR_POST_ROOM_KINDS.includes(roomKind(roomKey))) throw new Error('Contributors can only post in Subject Room or Exam Room')
    expireInactiveContributors()
    if (!db.contributors[DEMO_STUDENT_KEY]?.approvedToPost) throw new Error('Not approved to post yet')
    authorKey = DEMO_STUDENT_KEY
    authorName = DEMO_STUDENT_NAME
    approvalStatus = 'pending'
  }

  // P0 #8 — no manual workaround to attach a paid question to Daily Dose.
  if (roomKey === 'daily_dose' && questionId) {
    const q = db.questions.find(x => x.id === Number(questionId))
    if (!q || !q.freeTier) throw new Error('Daily Dose can only use free-tier questions')
  }

  // A scheduled webinar archives 48h after its own session start, not 48h after creation.
  const isWebinar = roomKey === 'webinar_threads'
  const sessionStart = isWebinar && startsAt ? new Date(startsAt).getTime() : Date.now()
  const archiveAt = isWebinar ? iso(sessionStart + 48 * HOUR) : null

  const thread = {
    id: ++db.seq.thread, roomKey, title: title.trim(), body: body || '', subjectTag: subjectTag || null,
    questionId: questionId ? Number(questionId) : null, hidden: false, approvalStatus, archiveAt,
    authorKey, authorName,
    attachmentUrl: attachmentUrl || null, attachmentName: attachmentName || null, attachmentType: attachmentUrl ? attachmentType || null : null,
    startsAt: isWebinar && startsAt ? startsAt : null,
    resourceUrl: resourceUrl || null, resourceName: resourceUrl ? resourceName || null : null,
    createdAt: iso(Date.now()),
  }
  db.threads.push(thread)

  if (Array.isArray(pollOptions) && pollOptions.length >= 2 && pollOptions.length <= 4) {
    const poll = { id: ++db.seq.poll, threadId: thread.id }
    db.polls.push(poll)
    pollOptions.forEach((label, position) => db.pollOptions.push({ id: ++db.seq.option, pollId: poll.id, label, position }))
  }

  // A pending contributor post notifies nobody yet — the new-thread notification fires on approval.
  if (approvalStatus === 'pending') {
    // held until approval
  } else if (roomKey === 'daily_dose') {
    const since = Date.now() - DAY
    const recent = db.notifications.some(n => n.kind === 'daily_dose' && new Date(n.createdAt).getTime() > since)
    if (!recent) notify('daily_dose', roomKey, thread.id, "Today's Daily Dose is live 🔥", thread.title)
  } else if (isEnrolled(roomKey)) {
    notify('room', roomKey, thread.id, 'New thread posted', thread.title)
  }

  return { id: thread.id, approvalStatus }
})

// Moderator hide/unhide a whole thread from student view without deleting it (PRD P0 #7).
export const setThreadHidden = mutation((id, hidden) => {
  const t = threadById(id)
  if (t) t.hidden = !!hidden
})

// Admin decision on a contributor's post. Only 'pending' posts can be decided; the author is
// told either way, and an approved post also notifies students enrolled in its room.
export const decideThread = mutation((id, approval) => {
  if (!['approved', 'rejected'].includes(approval)) throw new Error('Invalid decision')
  const t = threadById(id)
  if (!t || t.approvalStatus !== 'pending') throw new Error('This post is not waiting for approval')
  t.approvalStatus = approval

  if (t.authorKey === DEMO_STUDENT_KEY) {
    notify('post_status', t.roomKey, t.id, approval === 'approved' ? 'Your post was approved' : "Your post wasn't approved", t.title)
  }
  if (approval === 'approved' && t.authorKey !== DEMO_STUDENT_KEY && isEnrolled(t.roomKey)) {
    notify('room', t.roomKey, t.id, 'New thread posted', t.title)
  }
})

// PRD P0 #3 (student reply) and the "Simulate peer reply" CMS action (asPeer), which also
// demonstrates P0 #6's reply-notification rule: a peer reply only notifies the demo student
// if they'd previously replied in that same thread.
export const postReply = mutation((threadId, body, asPeer, parentReplyId, attachment) => {
  if (!body || !body.trim()) throw new Error('Reply body required')
  const thread = threadById(threadId)
  if (!thread) throw new Error('Thread not found')
  // Related-content attachments are a Webinar Threads reply feature — ignore them elsewhere.
  const isWebinar = thread.roomKey === 'webinar_threads'

  const authorName = asPeer ? PEER_NAMES[Math.floor(Math.random() * PEER_NAMES.length)] : DEMO_STUDENT_NAME
  // Deterministic per-persona key so repeated "Simulate peer reply" clicks that land on the
  // same name accumulate under one identity (needed to cross the contributor thresholds).
  const studentKey = asPeer ? `peer-${authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : DEMO_STUDENT_KEY

  // Reddit-style arbitrary-depth nesting — the parent can be any reply in this thread.
  const parent = parentReplyId ? db.replies.find(r => r.id === Number(parentReplyId) && r.threadId === thread.id) : null

  const reply = {
    id: ++db.seq.reply, threadId: thread.id, studentKey, authorName, body: body.trim(), hidden: false,
    parentReplyId: parent ? parent.id : null, pinnedAt: null,
    attachmentUrl: isWebinar ? attachment?.url || null : null,
    attachmentName: isWebinar ? attachment?.name || null : null,
    attachmentType: isWebinar ? attachment?.type || null : null,
    createdAt: iso(Date.now()),
  }
  db.replies.push(reply)

  if (asPeer && db.replies.some(r => r.threadId === thread.id && r.studentKey === DEMO_STUDENT_KEY && r.id !== reply.id)) {
    notify('reply', thread.roomKey, thread.id, authorName + ' replied in a thread you joined', thread.title)
  }
  return { id: reply.id }
})

// PRD P0 #4 — vote once per poll, the vote can't be changed (a repeat is a silent no-op).
export const vote = mutation((threadId, optionId) => {
  const poll = db.polls.find(p => p.threadId === Number(threadId))
  if (!poll) throw new Error('No poll on this thread')
  if (!db.pollVotes.some(v => v.pollId === poll.id && v.studentKey === DEMO_STUDENT_KEY)) {
    db.pollVotes.push({ pollId: poll.id, studentKey: DEMO_STUDENT_KEY, optionId: Number(optionId) })
  }
})

// Instagram-style single heart. Liking a post you haven't joined auto-joins its room;
// unliking never un-joins.
export const likeThread = mutation((threadId) => {
  const id = Number(threadId)
  const idx = db.threadLikes.findIndex(l => l.threadId === id && l.studentKey === DEMO_STUDENT_KEY)
  if (idx >= 0) {
    db.threadLikes.splice(idx, 1)
  } else {
    db.threadLikes.push({ threadId: id, studentKey: DEMO_STUDENT_KEY })
    const t = threadById(id)
    if (t) enroll(t.roomKey)
  }
})

// RSVP for a specific webinar session (distinct from joining the Webinars room).
export const registerForWebinar = mutation((threadId) => {
  const id = Number(threadId)
  const idx = db.registrations.findIndex(r => r.threadId === id && r.studentKey === DEMO_STUDENT_KEY)
  if (idx >= 0) db.registrations.splice(idx, 1)
  else db.registrations.push({ threadId: id, studentKey: DEMO_STUDENT_KEY })
})

// Moderator delete/hide a reply — content is preserved so un-hiding restores it; the
// serializer masks body/authorName while hidden so the student view shows "This reply was removed".
export const setReplyHidden = mutation((id, hidden) => {
  const r = replyById(id)
  if (r) r.hidden = !!hidden
})

function toggleReplyLike(replyId, likerKey) {
  const id = Number(replyId)
  const idx = db.replyLikes.findIndex(l => l.replyId === id && l.studentKey === likerKey)
  if (idx >= 0) db.replyLikes.splice(idx, 1)
  else db.replyLikes.push({ replyId: id, studentKey: likerKey })
}
export const likeReply = mutation((replyId) => toggleReplyLike(replyId, DEMO_STUDENT_KEY))
// A like from NPrep Team is an endorsement that counts toward the contributor tiers.
export const nprepLikeReply = mutation((replyId) => toggleReplyLike(replyId, NPREP_TEAM_KEY))

export const togglePinReply = mutation((replyId) => {
  const r = replyById(replyId)
  if (!r) throw new Error('Reply not found')
  r.pinnedAt = r.pinnedAt ? null : iso(Date.now())
})

// Student reports someone else's comment — lands in the CMS Moderate queue. A dismissed
// report can be raised again.
export const reportReply = mutation((replyId, reason) => {
  if (!reason || !REPORT_REASONS.includes(reason)) throw new Error('Pick a reason')
  const r = replyById(replyId)
  if (!r || r.hidden) throw new Error('Comment not found')
  if (r.studentKey === DEMO_STUDENT_KEY) throw new Error("You can't report your own comment")
  const existing = db.replyReports.find(x => x.replyId === r.id && x.studentKey === DEMO_STUDENT_KEY)
  if (existing) Object.assign(existing, { reason, status: 'open', reportedAt: iso(Date.now()) })
  else db.replyReports.push({ replyId: r.id, studentKey: DEMO_STUDENT_KEY, reason, status: 'open', reportedAt: iso(Date.now()) })
})

// Admin closes the open reports on a comment without removing it.
export const dismissReports = mutation((replyId) => {
  for (const rp of db.replyReports) if (rp.replyId === Number(replyId) && rp.status === 'open') rp.status = 'dismissed'
})

// Admin toggles a contributor's posting rights. Reaching the 15-like threshold makes a
// student *eligible*; this is the separate approval step that actually turns posting on.
export const approveContributor = mutation((studentKey) => {
  const approve = !db.contributors[studentKey]?.approvedToPost
  db.contributors[studentKey] = { ...db.contributors[studentKey], approvedToPost: approve, approvedAt: approve ? iso(Date.now()) : null }
})
