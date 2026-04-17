import { put } from '@vercel/blob'

export async function uploadFile(file: File, orderId: string): Promise<{ url: string; name: string }> {
  const ext = file.name.split('.').pop()
  const filename = `uploads/${orderId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const blob = await put(filename, file, {
    access: 'public',
    contentType: file.type || 'application/octet-stream',
  })

  return { url: blob.url, name: file.name }
}
