// Non-destructive migration for the decided community rules:
//  - comment reports (reply_reports)
//  - contributor posts held for approval (threads.approval_status)
//  - contributor expiry (contributors.expired_at)
//  - exams as a backend setting (exams table, seeded with the current three)
// Run with: node --env-file=.env.local scripts/migrate-community-rules.mjs
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('Creating reply_reports table...')
  await sql.query(`
    CREATE TABLE IF NOT EXISTS reply_reports (
      reply_id INTEGER NOT NULL REFERENCES replies(id) ON DELETE CASCADE,
      student_key TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (reply_id, student_key)
    )
  `)

  console.log("Adding approval_status to threads (existing posts stay 'approved')...")
  await sql.query(`ALTER TABLE threads ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'approved'`)

  console.log('Adding expired_at to contributors...')
  await sql.query(`ALTER TABLE contributors ADD COLUMN IF NOT EXISTS expired_at TIMESTAMPTZ`)

  console.log('Creating exams table and seeding NORCET / AIIMS / DSSSB...')
  await sql.query(`
    CREATE TABLE IF NOT EXISTS exams (
      name TEXT PRIMARY KEY,
      position INTEGER NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT true
    )
  `)
  await sql.query(`
    INSERT INTO exams (name, position) VALUES ('NORCET', 0), ('AIIMS', 1), ('DSSSB', 2)
    ON CONFLICT (name) DO NOTHING
  `)

  console.log('Done.')
}

main().catch(err => { console.error(err); process.exit(1) })
