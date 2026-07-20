import { handleUpload } from '@vercel/blob/client'

// Issues short-lived client tokens for direct-to-Blob uploads (bypasses the function
// body-size limit a proxied upload would hit) — currently used for the PDF attach button
// in Webinar Threads. Restricted to PDFs only; the client never sees BLOB_READ_WRITE_TOKEN.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['application/pdf'],
        addRandomSuffix: true,
        maximumSizeInBytes: 20 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {},
    })
    res.status(200).json(jsonResponse)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
