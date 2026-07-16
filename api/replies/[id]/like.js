import { sql } from '../../_lib/db.js'
import { DEMO_STUDENT_KEY } from '../../_lib/constants.js'

// Toggle the demo student's like on a reply.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { id } = req.query
  const db = sql()

  const [existing] = await db`SELECT 1 FROM reply_likes WHERE reply_id = ${id} AND student_key = ${DEMO_STUDENT_KEY}`
  if (existing) {
    await db`DELETE FROM reply_likes WHERE reply_id = ${id} AND student_key = ${DEMO_STUDENT_KEY}`
  } else {
    await db`INSERT INTO reply_likes (reply_id, student_key) VALUES (${id}, ${DEMO_STUDENT_KEY}) ON CONFLICT DO NOTHING`
  }

  res.status(200).json({ liked: !existing })
}
