import { sql } from './_lib/db.js'
import { serializeThread, serializeReply } from './_lib/serialize.js'
import { ROOMS, ROOM_TILES, EXAMS, SUBJECT_TAGS, DEMO_STUDENT_KEY } from './_lib/constants.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const db = sql()

  const [profileRows, enrollmentRows, threads, replies, polls, pollOptions, pollVotes, notifications, questions] = await Promise.all([
    db`SELECT exam, onboarded FROM profiles WHERE student_key = ${DEMO_STUDENT_KEY}`,
    db`SELECT room_key FROM enrollments WHERE student_key = ${DEMO_STUDENT_KEY}`,
    db`SELECT * FROM threads ORDER BY created_at DESC`,
    db`SELECT * FROM replies ORDER BY created_at ASC`,
    db`SELECT * FROM polls`,
    db`SELECT * FROM poll_options ORDER BY position ASC`,
    db`SELECT * FROM poll_votes`,
    db`SELECT * FROM notifications WHERE student_key = ${DEMO_STUDENT_KEY} ORDER BY created_at DESC LIMIT 30`,
    db`SELECT * FROM questions ORDER BY id`,
  ])

  const repliesByThread = {}
  for (const r of replies) (repliesByThread[r.thread_id] ??= []).push(r)

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
    return serializeThread(t, (repliesByThread[t.id] || []).length, pollOut)
  })

  const repliesOut = {}
  for (const [threadId, list] of Object.entries(repliesByThread)) repliesOut[threadId] = list.map(serializeReply)

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
  })
}
