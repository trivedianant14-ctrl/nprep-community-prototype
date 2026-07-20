// Non-destructive migration: PDF attachments on threads and replies (Vercel Blob URLs).
// Run with: node --env-file=.env.local scripts/migrate-add-attachments.mjs
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('Adding attachment columns to threads...')
  await sql.query(`ALTER TABLE threads ADD COLUMN IF NOT EXISTS attachment_url TEXT`)
  await sql.query(`ALTER TABLE threads ADD COLUMN IF NOT EXISTS attachment_name TEXT`)

  console.log('Adding attachment columns to replies...')
  await sql.query(`ALTER TABLE replies ADD COLUMN IF NOT EXISTS attachment_url TEXT`)
  await sql.query(`ALTER TABLE replies ADD COLUMN IF NOT EXISTS attachment_name TEXT`)

  console.log('Done.')
}

main().catch(err => { console.error(err); process.exit(1) })
