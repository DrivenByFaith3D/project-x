const STEPS = [
  { key: 'pending',           label: 'Received' },
  { key: 'in_progress',       label: 'Printing' },
  { key: 'label_created',     label: 'Shipped' },
  { key: 'in_transit',        label: 'In Transit' },
  { key: 'out_for_delivery',  label: 'Out for Delivery' },
  { key: 'delivered',         label: 'Delivered' },
]

export default function OrderProgressBar({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <p className="text-sm text-red-400 font-medium">Order Cancelled</p>
        </div>
      </div>
    )
  }

  const currentIndex = STEPS.findIndex(s => s.key === status)
  const activeIndex = currentIndex === -1 ? 0 : currentIndex

  return (
    <div className="card p-5 mb-6">
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-4">Order Progress</h2>
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const done = i < activeIndex
          const active = i === activeIndex
          const isLast = i === STEPS.length - 1

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  done ? 'bg-white border-white text-black' :
                  active ? 'bg-transparent border-white text-white' :
                  'bg-transparent border-zinc-700 text-zinc-600'
                }`}>
                  {done ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${active ? 'bg-white' : 'bg-zinc-700'}`} />
                  )}
                </div>
                <span className={`text-[10px] font-medium text-center leading-tight ${
                  active ? 'text-white' : done ? 'text-zinc-400' : 'text-zinc-600'
                }`}>
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < activeIndex ? 'bg-white' : 'bg-zinc-700'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
