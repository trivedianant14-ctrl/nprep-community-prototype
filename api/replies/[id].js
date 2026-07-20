import { sql } from '../_lib/db.js'
import { DEMO_STUDENT_KEY, NPREP_TEAM_KEY } from '../_lib/constants.js'

// Moderator delete/hide a reply — content is preserved in the DB (not nulled) so
// un-hiding restores it; serialize.js masks body/authorName whenever hidden=true so the
// student view renders the PRD's "This reply was removed" placeholder. (PRD P0 #7)
// Also handles the student like, the NPrep Team endorsement like, and admin pin/unpin
// (POST with an `action`) — folded into this one file to stay under the Hobby-plan
// serverless function count rather than one file per action.
export default async function handler(req, res) {
  const { id } = req.query
  const db = sql()

  if (req.method === 'PATCH') {
    const { hidden } = req.body || {}
    await db`UPDATE replies SET hidden = ${!!hidden} WHERE id = ${id}`
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'POST') {
    const { action } = req.body || {}

    if (action === 'like' || action === 'nprep-like') {
      const likerKey = action === 'nprep-like' ? NPREP_TEAM_KEY : DEMO_STUDENT_KEY
      const [existing] = await db`SELECT 1 FROM reply_likes WHERE reply_id = ${id} AND student_key = ${likerKey}`
      if (existing) {
        await db`DELETE FROM reply_likes WHERE reply_id = ${id} AND student_key = ${likerKey}`
      } else {
        await db`INSERT INTO reply_likes (reply_id, student_key) VALUES (${id}, ${likerKey}) ON CONFLICT DO NOTHING`
      }
      return res.status(200).json({ liked: !existing })
    }

    if (action === 'pin') {
      const [existing] = await db`SELECT pinned_at FROM replies WHERE id = ${id}`
      if (!existing) return res.status(404).json({ error: 'Reply not found' })
      const pin = !existing.pinned_at
      await db`UPDATE replies SET pinned_at = ${pin ? new Date().toISOString() : null} WHERE id = ${id}`
      return res.status(200).json({ pinned: pin })
    }

    return res.status(400).json({ error: 'Unknown action' })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
