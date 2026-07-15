import { sql } from '../_lib/db.js'

// Moderator delete/hide a reply — content is preserved in the DB (not nulled) so
// un-hiding restores it; serialize.js masks body/authorName whenever hidden=true so the
// student view renders the PRD's "This reply was removed" placeholder. (PRD P0 #7)
export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })
  const { id } = req.query
  const { hidden } = req.body || {}
  const db = sql()
  await db`UPDATE replies SET hidden = ${!!hidden} WHERE id = ${id}`
  res.status(200).json({ ok: true })
}
