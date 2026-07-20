import { sql } from '../_lib/db.js'
import { DEMO_STUDENT_KEY } from '../_lib/constants.js'

// Moderator hide/unhide a whole thread from student view without deleting it (PRD P0 #7).
// Also handles the demo student's like toggle (POST) — folded in here, rather than its own
// file, to stay under the Hobby-plan serverless function count.
export default async function handler(req, res) {
  const { id } = req.query
  const db = sql()

  if (req.method === 'PATCH') {
    const { hidden } = req.body || {}
    await db`UPDATE threads SET hidden = ${!!hidden} WHERE id = ${id}`
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'POST') {
    // Instagram-style single heart, not a Reddit up/down vote. Liking a post you haven't
    // joined auto-joins its room (engagement -> instant membership) — unliking never un-joins.
    const [existing] = await db`SELECT 1 FROM thread_likes WHERE thread_id = ${id} AND student_key = ${DEMO_STUDENT_KEY}`
    if (existing) {
      await db`DELETE FROM thread_likes WHERE thread_id = ${id} AND student_key = ${DEMO_STUDENT_KEY}`
    } else {
      await db`INSERT INTO thread_likes (thread_id, student_key) VALUES (${id}, ${DEMO_STUDENT_KEY}) ON CONFLICT DO NOTHING`
      const [thread] = await db`SELECT room_key FROM threads WHERE id = ${id}`
      if (thread) {
        await db`INSERT INTO enrollments (student_key, room_key) VALUES (${DEMO_STUDENT_KEY}, ${thread.room_key}) ON CONFLICT DO NOTHING`
      }
    }
    return res.status(200).json({ liked: !existing })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
