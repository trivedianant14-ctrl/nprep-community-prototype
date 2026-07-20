import { sql } from '../../_lib/db.js'

// Admin-only action: toggle a contributor's posting rights (Subject Room / Exam Room,
// Phase 1). Reaching the 15-like threshold makes a student *eligible*; this is the
// separate approval step that actually turns posting on.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { studentKey } = req.query
  const db = sql()

  const [existing] = await db`SELECT approved_to_post FROM contributors WHERE student_key = ${studentKey}`
  const approve = !existing?.approved_to_post

  await db`
    INSERT INTO contributors (student_key, approved_to_post, approved_at)
    VALUES (${studentKey}, ${approve}, ${approve ? new Date().toISOString() : null})
    ON CONFLICT (student_key) DO UPDATE SET approved_to_post = ${approve}, approved_at = ${approve ? new Date().toISOString() : null}
  `

  res.status(200).json({ approvedToPost: approve })
}
