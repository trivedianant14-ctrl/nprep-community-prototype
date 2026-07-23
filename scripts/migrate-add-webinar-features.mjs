// Non-destructive migration: webinar scheduling (starts_at + live-status derived from it),
// a per-thread registration table, and a secondary downloadable resource (e.g. lecture
// notes PDF, separate from the primary media attachment).
// Run with: node --env-file=.env.local scripts/migrate-add-webinar-features.mjs
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('Adding starts_at and resource fields to threads...')
  await sql.query(`ALTER TABLE threads ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ`)
  await sql.query(`ALTER TABLE threads ADD COLUMN IF NOT EXISTS resource_url TEXT`)
  await sql.query(`ALTER TABLE threads ADD COLUMN IF NOT EXISTS resource_name TEXT`)

  console.log('Creating webinar_registrations table...')
  await sql.query(`
    CREATE TABLE IF NOT EXISTS webinar_registrations (
      thread_id INTEGER NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
      student_key TEXT NOT NULL,
      registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (thread_id, student_key)
    )
  `)

  console.log('Done.')
}

main().catch(err => { console.error(err); process.exit(1) })
