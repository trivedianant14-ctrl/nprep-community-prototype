import { DEFAULT_EXAMS } from './constants.js'

// The exam list is a backend setting: add/remove/reorder rows in the `exams` table and the
// app (profile prompt, Exam Rooms, room tile copy) follows — no code change or app update.
// Falls back to the built-in list if the table is empty or the migration hasn't run yet.
export async function getExams(db) {
  try {
    const rows = await db`SELECT name FROM exams WHERE active ORDER BY position ASC, name ASC`
    if (rows.length) return rows.map(r => r.name)
  } catch {
    // table not migrated yet
  }
  return DEFAULT_EXAMS
}
