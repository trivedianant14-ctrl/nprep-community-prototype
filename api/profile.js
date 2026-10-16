import { sql } from './_lib/db.js'
import { DEMO_STUDENT_KEY, examRoomKey } from './_lib/constants.js'
import { getExams } from './_lib/exams.js'

// Setting an exam (from the onboarding prompt or the Exam Room banner) auto-enrolls the
// matching Exam Room — PRD: "If student has no exam selected... shown a prompt to select
// their exam" and the auto-enroll acceptance criteria tie Exam Room membership to profile.exam.
export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })
  const { exam } = req.body || {}
  const db = sql()
  const exams = await getExams(db)
  if (!exams.includes(exam)) return res.status(400).json({ error: 'Invalid exam' })

  await db`
    INSERT INTO profiles (student_key, exam) VALUES (${DEMO_STUDENT_KEY}, ${exam})
    ON CONFLICT (student_key) DO UPDATE SET exam = ${exam}
  `
  await db`INSERT INTO enrollments (student_key, room_key) VALUES (${DEMO_STUDENT_KEY}, ${examRoomKey(exam)}) ON CONFLICT DO NOTHING`

  res.status(200).json({ ok: true })
}
