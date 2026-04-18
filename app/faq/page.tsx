import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'FAQ' }

const FAQS = [
  {
    q: 'What file formats do you accept?',
    a: 'We accept STL and 3MF files — the two standard formats for 3D printing. If you only have an image or idea, no worries — just describe what you want and we\'ll take it from there.',
  },
  {
    q: 'How long does it take to get a quote?',
    a: 'We aim to provide a quote within 24 hours of receiving your order. Complex or large prints may take a bit longer to assess.',
  },
  {
    q: 'How long does printing take?',
    a: 'Most orders ship within 3–7 business days depending on size and complexity. Rush orders may be available — just mention it in your description.',
  },
  {
    q: 'What material do you print with?',
    a: 'We print exclusively with PLA. It\'s a high-quality, eco-friendly material that produces great detail and is available in a wide range of colors.',
  },
  {
    q: 'What colors are available?',
    a: 'We carry a wide range of colors. If you have a specific color in mind, mention it in your order and we\'ll do our best to match it or let you know what\'s available.',
  },
  {
    q: 'How does payment work?',
    a: 'After we review your order and send a quote, you\'ll receive an email with a link to pay securely via Stripe. We accept all major credit and debit cards. Production begins after payment.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Since every order is custom-made, we generally do not offer refunds once printing has started. However, if there is a defect or error on our end, we\'ll reprint or refund — just reach out through your order chat.',
  },
  {
    q: 'Can I track my order?',
    a: 'Yes! Once your order ships, you\'ll get a tracking number via email and can track it live from your order page or at our public tracking page.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Currently we ship within the United States only. International shipping may be available in the future.',
  },
  {
    q: 'Can I cancel my order?',
    a: 'You can request a cancellation before printing starts by messaging us through your order chat. Once printing has begun, cancellations are not possible.',
  },
]

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-2">Help</p>
        <h1 className="text-3xl font-bold text-white">Frequently Asked Questions</h1>
        <p className="text-zinc-400 mt-2">Everything you need to know about ordering from DrivenByFaith3D.</p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, i) => (
          <details key={i} className="card group">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none">
              <span className="font-medium text-white pr-4">{faq.q}</span>
              <svg className="w-4 h-4 text-zinc-500 shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-5 pb-4 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800 pt-3">
              {faq.a}
            </div>
          </details>
        ))}
      </div>

      <div className="card p-6 mt-10 text-center">
        <p className="text-zinc-400 text-sm mb-3">Still have questions? Send us a message through your order chat or create an order and ask.</p>
        <a href="/orders/new" className="btn-primary text-sm">Start an Order</a>
      </div>
    </div>
  )
}
