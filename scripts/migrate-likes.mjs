// Non-destructive migration: adds like tables without touching existing data.
// Run with: node --env-file=.env.local scripts/migrate-likes.mjs
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const SCHEMA = `
CREATE TABLE IF NOT EXISTS thread_likes (
  thread_id INTEGER NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  student_key TEXT NOT NULL,
  liked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (thread_id, student_key)
);

CREATE TABLE IF NOT EXISTS reply_likes (
  reply_id INTEGER NOT NULL REFERENCES replies(id) ON DELETE CASCADE,
  student_key TEXT NOT NULL,
  liked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (reply_id, student_key)
);
`

async function main() {
  console.log('Creating like tables...')
  for (const stmt of SCHEMA.split(';').map(s => s.trim()).filter(Boolean)) {
    await sql.query(stmt)
  }

  console.log('Seeding a few peer likes so counts aren\'t all zero on first load...')
  const [dailyDose] = await sql`SELECT id FROM threads WHERE room_key = 'daily_dose' ORDER BY created_at DESC LIMIT 1`
  if (dailyDose) {
    await sql`INSERT INTO thread_likes (thread_id, student_key) VALUES (${dailyDose.id}, 'peer-1'), (${dailyDose.id}, 'peer-2') ON CONFLICT DO NOTHING`
    const replies = await sql`SELECT id FROM replies WHERE thread_id = ${dailyDose.id} AND hidden = false`
    for (const r of replies) {
      await sql`INSERT INTO reply_likes (reply_id, student_key) VALUES (${r.id}, 'peer-3') ON CONFLICT DO NOTHING`
    }
  }

  console.log('Done.')
}

main().catch(err => { console.error(err); process.exit(1) })
