// Non-destructive migration: adds one-level comment nesting (reply-to-a-comment).
// Run with: node --env-file=.env.local scripts/migrate-reply-nesting.mjs
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('Adding parent_reply_id to replies...')
  await sql.query(`
    ALTER TABLE replies ADD COLUMN IF NOT EXISTS parent_reply_id INTEGER REFERENCES replies(id) ON DELETE SET NULL
  `)
  console.log('Done.')
}

main().catch(err => { console.error(err); process.exit(1) })
