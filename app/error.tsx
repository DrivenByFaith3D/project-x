'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-zinc-400 mb-6 text-sm">{error.message || 'An unexpected error occurred.'}</p>
        <button onClick={reset} className="btn-primary">Try again</button>
      </div>
    </div>
  )
}
