import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-zinc-400 mb-6">Page not found.</p>
        <Link href="/" className="btn-primary">Go Home</Link>
      </div>
    </div>
  )
}
