// Non-destructive migration: pinned comments + the contributor approval pipeline.
// Run with: node --env-file=.env.local scripts/migrate-contributors.mjs
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('Adding pinned_at to replies...')
  await sql.query(`ALTER TABLE replies ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ`)

  console.log('Creating contributors table...')
  await sql.query(`
    CREATE TABLE IF NOT EXISTS contributors (
      student_key TEXT PRIMARY KEY,
      approved_to_post BOOLEAN NOT NULL DEFAULT false,
      approved_at TIMESTAMPTZ
    )
  `)

  console.log('Adding author fields to threads (null = official NPrep post)...')
  await sql.query(`ALTER TABLE threads ADD COLUMN IF NOT EXISTS author_key TEXT`)
  await sql.query(`ALTER TABLE threads ADD COLUMN IF NOT EXISTS author_name TEXT`)

  console.log('Done.')
}

main().catch(err => { console.error(err); process.exit(1) })
