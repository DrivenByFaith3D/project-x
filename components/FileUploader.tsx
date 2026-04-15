'use client'

import { useRef, useState } from 'react'

interface Props {
  orderId: string
  onUploaded: () => void
}

const ALLOWED_TYPES = [
  'model/stl',
  'application/octet-stream',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]

export default function FileUploader({ orderId, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  async function uploadFile(file: File) {
    setError('')
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('orderId', orderId)

    const response = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Upload failed')
    } else {
      onUploaded()
    }

    setUploading(false)
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const file = files[0]
    const ext = file.name.split('.').pop()?.toLowerCase()
    const isStl = ext === 'stl'
    if (!isStl && !ALLOWED_TYPES.includes(file.type)) {
      setError('Only STL and image files (PNG, JPG, GIF, WebP) are allowed.')
      return
    }
    uploadFile(file)
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-300 hover:border-brand-400'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".stl,.png,.jpg,.jpeg,.gif,.webp"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Uploading…
          </div>
        ) : (
          <>
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-600">
              <span className="text-brand-600 font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-1">STL, PNG, JPG, GIF, WebP</p>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
