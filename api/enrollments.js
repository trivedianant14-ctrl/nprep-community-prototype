import { sql } from './_lib/db.js'
import { DEMO_STUDENT_KEY } from './_lib/constants.js'

// Manual room join/leave from the room header (PRD P0 #5 acceptance criteria).
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { roomKey, action } = req.body || {}
  if (!roomKey || !['join', 'leave'].includes(action)) return res.status(400).json({ error: 'Invalid request' })
  const db = sql()

  if (action === 'join') {
    await db`INSERT INTO enrollments (student_key, room_key) VALUES (${DEMO_STUDENT_KEY}, ${roomKey}) ON CONFLICT DO NOTHING`
  } else {
    await db`DELETE FROM enrollments WHERE student_key = ${DEMO_STUDENT_KEY} AND room_key = ${roomKey}`
  }

  res.status(200).json({ ok: true })
}
