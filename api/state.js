import { sql } from './_lib/db.js'
import { serializeThread, serializeReply } from './_lib/serialize.js'
import { ROOMS, ROOM_TILES, EXAMS, SUBJECT_TAGS, DEMO_STUDENT_KEY, NPREP_TEAM_KEY, ACTIVE_CONTRIBUTOR_THRESHOLD, ELIGIBLE_TO_POST_THRESHOLD } from './_lib/constants.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const db = sql()

  const [profileRows, enrollmentRows, threads, replies, polls, pollOptions, pollVotes, notifications, questions, threadLikes, replyLikes, contributorRows, registrations] = await Promise.all([
    db`SELECT exam, onboarded FROM profiles WHERE student_key = ${DEMO_STUDENT_KEY}`,
    db`SELECT room_key FROM enrollments WHERE student_key = ${DEMO_STUDENT_KEY}`,
    db`SELECT * FROM threads ORDER BY created_at DESC`,
    db`SELECT * FROM replies ORDER BY created_at ASC`,
    db`SELECT * FROM polls`,
    db`SELECT * FROM poll_options ORDER BY position ASC`,
    db`SELECT * FROM poll_votes`,
    db`SELECT * FROM notifications WHERE student_key = ${DEMO_STUDENT_KEY} ORDER BY created_at DESC LIMIT 30`,
    db`SELECT * FROM questions ORDER BY id`,
    db`SELECT thread_id, student_key FROM thread_likes`,
    db`SELECT reply_id, student_key FROM reply_likes`,
    db`SELECT student_key, approved_to_post FROM contributors`,
    db`SELECT thread_id, student_key FROM webinar_registrations`,
  ])

  const threadLikeCounts = {}
  const myThreadLikes = new Set()
  for (const l of threadLikes) {
    threadLikeCounts[l.thread_id] = (threadLikeCounts[l.thread_id] || 0) + 1
    if (l.student_key === DEMO_STUDENT_KEY) myThreadLikes.add(l.thread_id)
  }
  const replyLikeCounts = {}
  const myReplyLikes = new Set()
  const nprepLikedReplyIds = new Set()
  for (const l of replyLikes) {
    replyLikeCounts[l.reply_id] = (replyLikeCounts[l.reply_id] || 0) + 1
    if (l.student_key === DEMO_STUDENT_KEY) myReplyLikes.add(l.reply_id)
    if (l.student_key === NPREP_TEAM_KEY) nprepLikedReplyIds.add(l.reply_id)
  }

  const repliesByThread = {}
  const repliesById = {}
  for (const r of replies) {
    (repliesByThread[r.thread_id] ??= []).push(r)
    repliesById[r.id] = r
  }

  // Contributor tiers — how many of a student's own (non-hidden) comments NPrep Team has
  // liked, badge tiers at 10/15, and whether an admin has actually turned posting on.
  const approvedByKey = {}
  for (const c of contributorRows) approvedByKey[c.student_key] = c.approved_to_post
  const authorNprepCounts = {}
  for (const r of replies) {
    if (r.hidden) continue
    if (nprepLikedReplyIds.has(r.id)) authorNprepCounts[r.student_key] = (authorNprepCounts[r.student_key] || 0) + 1
  }
  const contributorKeys = new Set([...Object.keys(authorNprepCounts), ...Object.keys(approvedByKey)])
  const contributorsOut = {}
  for (const key of contributorKeys) {
    const nprepLikedCount = authorNprepCounts[key] || 0
    contributorsOut[key] = {
      nprepLikedCount,
      isActiveContributor: nprepLikedCount >= ACTIVE_CONTRIBUTOR_THRESHOLD,
      isEligible: nprepLikedCount >= ELIGIBLE_TO_POST_THRESHOLD,
      approvedToPost: !!approvedByKey[key],
    }
  }

  const registrationCounts = {}
  const myRegistrations = new Set()
  for (const r of registrations) {
    registrationCounts[r.thread_id] = (registrationCounts[r.thread_id] || 0) + 1
    if (r.student_key === DEMO_STUDENT_KEY) myRegistrations.add(r.thread_id)
  }

  const pollByThread = {}
  for (const p of polls) pollByThread[p.thread_id] = p
  const optionsByPoll = {}
  for (const o of pollOptions) (optionsByPoll[o.poll_id] ??= []).push(o)
  const votesByPoll = {}
  for (const v of pollVotes) (votesByPoll[v.poll_id] ??= []).push(v)

  const threadsOut = threads.map(t => {
    const poll = pollByThread[t.id]
    let pollOut = null
    if (poll) {
      const opts = optionsByPoll[poll.id] || []
      const votes = votesByPoll[poll.id] || []
      const myVote = votes.find(v => v.student_key === DEMO_STUDENT_KEY)
      pollOut = {
        id: poll.id,
        totalVotes: votes.length,
        myOptionId: myVote ? myVote.option_id : null,
        options: opts.map(o => ({ id: o.id, label: o.label, voteCount: votes.filter(v => v.option_id === o.id).length })),
      }
    }
    return serializeThread(t, (repliesByThread[t.id] || []).length, pollOut, threadLikeCounts[t.id] || 0, myThreadLikes.has(t.id), registrationCounts[t.id] || 0, myRegistrations.has(t.id))
  })

  const repliesOut = {}
  for (const [threadId, list] of Object.entries(repliesByThread)) {
    repliesOut[threadId] = list.map(r => {
      const parent = r.parent_reply_id ? repliesById[r.parent_reply_id] : null
      const replyingToName = parent && !parent.hidden ? parent.author_name : null
      return serializeReply(r, replyLikeCounts[r.id] || 0, myReplyLikes.has(r.id), replyingToName, nprepLikedReplyIds.has(r.id))
    })
  }

  res.status(200).json({
    rooms: ROOMS,
    roomTiles: ROOM_TILES,
    exams: EXAMS,
    subjectTags: SUBJECT_TAGS,
    profile: { exam: profileRows[0]?.exam || null, onboarded: profileRows[0]?.onboarded || false },
    enrolledRoomKeys: enrollmentRows.map(e => e.room_key),
    threads: threadsOut,
    repliesByThread: repliesOut,
    notifications: notifications.map(n => ({
      id: n.id, kind: n.kind, roomKey: n.room_key, threadId: n.thread_id,
      title: n.title, body: n.body, createdAt: n.created_at,
    })),
    questions: questions.map(q => ({ id: q.id, question: q.question, options: q.options, correctIndex: q.correct_index, freeTier: q.free_tier })),
    contributors: contributorsOut,
  })
}
