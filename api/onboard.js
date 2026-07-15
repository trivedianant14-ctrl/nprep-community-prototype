import { sql } from './_lib/db.js'
import { DEMO_STUDENT_KEY } from './_lib/constants.js'

// PRD P0 #5 — fires once on the student's first Community tab open: auto-enrolls Daily
// Dose (always) and the Exam Room matching their profile (if an exam is already set).
// Idempotent — calling again after onboarded=true is a no-op, so the frontend can safely
// call this on every Community tab mount without re-triggering enrollment.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const db = sql()

  const [profile] = await db`
    INSERT INTO profiles (student_key) VALUES (${DEMO_STUDENT_KEY})
    ON CONFLICT (student_key) DO NOTHING
    RETURNING exam, onboarded
  `
  const row = profile || (await db`SELECT exam, onboarded FROM profiles WHERE student_key = ${DEMO_STUDENT_KEY}`)[0]

  if (!row.onboarded) {
    await db`INSERT INTO enrollments (student_key, room_key) VALUES (${DEMO_STUDENT_KEY}, 'daily_dose') ON CONFLICT DO NOTHING`
    if (row.exam) {
      await db`INSERT INTO enrollments (student_key, room_key) VALUES (${DEMO_STUDENT_KEY}, ${'exam_room_' + row.exam.toLowerCase()}) ON CONFLICT DO NOTHING`
    }
    await db`UPDATE profiles SET onboarded = true WHERE student_key = ${DEMO_STUDENT_KEY}`
  }

  res.status(200).json({ ok: true })
}
