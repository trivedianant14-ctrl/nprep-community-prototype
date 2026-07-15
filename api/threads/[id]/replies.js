import { sql } from '../../_lib/db.js'
import { DEMO_STUDENT_KEY, DEMO_STUDENT_NAME } from '../../_lib/constants.js'

const PEER_NAMES = ['Priya S.', 'Rohit K.', 'Anjali M.', 'Kavya R.', 'Suresh M.', 'Deepak V.', 'Sneha R.', 'Meera J.']

// PRD P0 #3 (student reply, flat + chronological) and the "Simulate peer reply" CMS
// action, which also demonstrates P0 #6's reply-notification rule: a peer reply only
// notifies the demo student if they'd previously replied in that same thread.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { id } = req.query
  const { body, asPeer } = req.body || {}
  if (!body || !body.trim()) return res.status(400).json({ error: 'Reply body required' })
  const db = sql()

  const studentKey = asPeer ? `peer-${Math.random().toString(36).slice(2, 8)}` : DEMO_STUDENT_KEY
  const authorName = asPeer ? PEER_NAMES[Math.floor(Math.random() * PEER_NAMES.length)] : DEMO_STUDENT_NAME

  const [reply] = await db`
    INSERT INTO replies (thread_id, student_key, author_name, body)
    VALUES (${id}, ${studentKey}, ${authorName}, ${body.trim()})
    RETURNING *
  `

  if (asPeer) {
    const [priorReply] = await db`SELECT 1 FROM replies WHERE thread_id = ${id} AND student_key = ${DEMO_STUDENT_KEY} AND id != ${reply.id} LIMIT 1`
    if (priorReply) {
      const [thread] = await db`SELECT title, room_key FROM threads WHERE id = ${id}`
      await db`
        INSERT INTO notifications (student_key, kind, room_key, thread_id, title, body)
        VALUES (${DEMO_STUDENT_KEY}, 'reply', ${thread.room_key}, ${id}, ${authorName + ' replied in a thread you joined'}, ${thread.title})
      `
    }
  }

  res.status(201).json({ id: reply.id })
}
