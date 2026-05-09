import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Contact Us' }

const contacts = [
  {
    icon: '📬',
    label: 'General Inquiries',
    email: 'info@drivenbyfaith3d.com',
    desc: 'Questions about our business, partnerships, or anything else.',
  },
  {
    icon: '🛠️',
    label: 'Customer Support',
    email: 'support@drivenbyfaith3d.com',
    desc: 'Help with an existing order, shipping issues, or product questions.',
  },
  {
    icon: '🖨️',
    label: 'Custom Orders',
    email: 'orders@drivenbyfaith3d.com',
    desc: 'Have a specific project in mind? Reach out before placing an order.',
  },
]

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs font-semibold tracking-widest text-warm-gray uppercase mb-3">Get In Touch</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">Contact Us</h1>
        <p className="text-warm-gray leading-relaxed max-w-xl">
          We're a small team and we read every email. Whether you have a question, a project idea, or need help with an order — we'll get back to you within 24 hours.
        </p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {contacts.map((c) => (
          <div key={c.email} className="card p-6 flex flex-col gap-3">
            <div className="text-2xl">{c.icon}</div>
            <div>
              <h2 className="font-semibold text-charcoal mb-1">{c.label}</h2>
              <p className="text-xs text-warm-gray leading-relaxed mb-3">{c.desc}</p>
              <a
                href={`mailto:${c.email}`}
                className="text-sm font-medium text-charcoal underline underline-offset-2 hover:text-taupe-dark transition-colors break-all"
              >
                {c.email}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Response time note */}
      <div className="card p-6 flex items-start gap-4 mb-12">
        <span className="text-2xl shrink-0">⏱️</span>
        <div>
          <h3 className="font-semibold text-charcoal mb-1">Response Times</h3>
          <p className="text-sm text-warm-gray leading-relaxed">
            We typically respond within <span className="text-charcoal font-medium">24 hours</span> on business days. For the fastest help with an active order, use the built-in chat on your order page — we monitor that throughout the day.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="card p-8 text-center">
        <h2 className="text-xl font-bold text-charcoal mb-2">Ready to start a project?</h2>
        <p className="text-warm-gray text-sm mb-5">Place an order and we'll be in touch to work out the details.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/orders/new" className="btn-primary">Start Custom Order</Link>
          <Link href="/listings" className="btn-secondary">Browse Shop</Link>
        </div>
      </div>
    </div>
  )
}
