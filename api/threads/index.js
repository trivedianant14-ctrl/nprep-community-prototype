import { sql } from '../_lib/db.js'
import { DEMO_STUDENT_KEY } from '../_lib/constants.js'

const DAY_MS = 24 * 60 * 60 * 1000

// PRD P0 #2 (admin thread creation) + P0 #8 (content rule enforcement) + P0 #6 (push
// notifications fired on new-thread creation, gated by enrollment / once-per-day).
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const db = sql()
  const { roomKey, title, body, subjectTag, questionId, pollOptions } = req.body || {}

  if (!roomKey || !title || !title.trim()) return res.status(400).json({ error: 'Room and title are required' })

  // P0 #8 — no manual workaround to attach a paid question to Daily Dose. Server-side
  // enforced: even if a client sent a paid questionId, it's rejected here.
  if (roomKey === 'daily_dose' && questionId) {
    const [q] = await db`SELECT free_tier FROM questions WHERE id = ${questionId}`
    if (!q || !q.free_tier) return res.status(400).json({ error: 'Daily Dose can only use free-tier questions' })
  }

  const archiveAt = roomKey === 'webinar_threads' ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() : null

  const [thread] = await db`
    INSERT INTO threads (room_key, title, body, subject_tag, question_id, archive_at)
    VALUES (${roomKey}, ${title.trim()}, ${body || ''}, ${subjectTag || null}, ${questionId || null}, ${archiveAt})
    RETURNING *
  `

  if (Array.isArray(pollOptions) && pollOptions.length >= 2 && pollOptions.length <= 4) {
    const [poll] = await db`INSERT INTO polls (thread_id) VALUES (${thread.id}) RETURNING id`
    for (let i = 0; i < pollOptions.length; i++) {
      await db`INSERT INTO poll_options (poll_id, label, position) VALUES (${poll.id}, ${pollOptions[i]}, ${i})`
    }
  }

  // Notification fan-out for the single demo student.
  if (roomKey === 'daily_dose') {
    const [recent] = await db`
      SELECT id FROM notifications
      WHERE student_key = ${DEMO_STUDENT_KEY} AND kind = 'daily_dose' AND created_at > ${new Date(Date.now() - DAY_MS).toISOString()}
      LIMIT 1
    `
    if (!recent) {
      await db`
        INSERT INTO notifications (student_key, kind, room_key, thread_id, title, body)
        VALUES (${DEMO_STUDENT_KEY}, 'daily_dose', ${roomKey}, ${thread.id}, 'Today''s Daily Dose is live 🔥', ${title.trim()})
      `
    }
  } else {
    const [enrolled] = await db`SELECT 1 FROM enrollments WHERE student_key = ${DEMO_STUDENT_KEY} AND room_key = ${roomKey}`
    if (enrolled) {
      await db`
        INSERT INTO notifications (student_key, kind, room_key, thread_id, title, body)
        VALUES (${DEMO_STUDENT_KEY}, 'room', ${roomKey}, ${thread.id}, 'New thread posted', ${title.trim()})
      `
    }
  }

  res.status(201).json({ id: thread.id })
}
