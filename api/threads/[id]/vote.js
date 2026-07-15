import { sql } from '../../_lib/db.js'
import { DEMO_STUDENT_KEY } from '../../_lib/constants.js'

// PRD P0 #4 — vote once per poll, vote cannot be changed. ON CONFLICT DO NOTHING makes a
// repeat vote attempt a silent no-op rather than an error, since the UI already disables
// the options once `myOptionId` is set.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { id } = req.query
  const { optionId } = req.body || {}
  const db = sql()

  const [poll] = await db`SELECT id FROM polls WHERE thread_id = ${id}`
  if (!poll) return res.status(404).json({ error: 'No poll on this thread' })

  await db`
    INSERT INTO poll_votes (poll_id, student_key, option_id) VALUES (${poll.id}, ${DEMO_STUDENT_KEY}, ${optionId})
    ON CONFLICT (poll_id, student_key) DO NOTHING
  `
  res.status(200).json({ ok: true })
}
