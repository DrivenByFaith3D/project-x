import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = { title: 'About Us' }

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="flex flex-col md:flex-row items-center gap-10 mb-16">
        <div className="flex-1">
          <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-3">Our Story</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Driven by Faith, Built by Hand</h1>
          <p className="text-zinc-400 leading-relaxed mb-4">
            DrivenByFaith3D started with a simple belief — that anyone should be able to bring their ideas to life, no matter how big or small. What began as a passion project turned into a custom 3D printing service dedicated to quality, honesty, and fast turnaround.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Every print is made with care. Whether you have an STL file ready to go, a reference image, or just an idea in your head — we work with you from concept to delivery.
          </p>
        </div>
        <div className="shrink-0">
          <div className="relative w-40 h-40 md:w-48 md:h-48">
            <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl" />
            <Image src="/logo.png" alt="DrivenByFaith3D" fill className="object-contain relative" />
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-white mb-6">What We Stand For</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: '✝️',
              title: 'Faith',
              desc: 'Our name says it all. We operate with integrity, honesty, and a commitment to doing right by every customer.',
            },
            {
              icon: '🎯',
              title: 'Precision',
              desc: 'We take printing seriously. Every layer matters, and we don\'t ship until we\'re proud of what came off the bed.',
            },
            {
              icon: '🤝',
              title: 'Service',
              desc: 'You\'re not a ticket number. Every order gets personal attention and direct communication through your order chat.',
            },
          ].map(v => (
            <div key={v.title} className="card p-5">
              <div className="text-2xl mb-3">{v.icon}</div>
              <h3 className="font-semibold text-white mb-1">{v.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Process */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-white mb-6">How It Works</h2>
        <div className="space-y-3">
          {[
            { step: '01', title: 'Submit Your Order', desc: 'Upload a file, share an image, or describe your idea. We handle all types of requests.' },
            { step: '02', title: 'Get a Quote',       desc: 'We review your order and send a personalized quote within 24 hours.' },
            { step: '03', title: 'We Print',          desc: 'Once you pay, we get to work. You can track progress through your order page.' },
            { step: '04', title: 'We Ship',           desc: 'Your print is packed carefully and shipped with full tracking.' },
          ].map(s => (
            <div key={s.step} className="card p-5 flex items-start gap-4">
              <span className="text-2xl font-bold text-zinc-700 shrink-0">{s.step}</span>
              <div>
                <h3 className="font-semibold text-white">{s.title}</h3>
                <p className="text-sm text-zinc-400 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="card p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Ready to print something?</h2>
        <p className="text-zinc-400 text-sm mb-5">Create an account and submit your first order today.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/orders/new" className="btn-primary">Start Custom Order</Link>
          <Link href="/listings" className="btn-secondary">Browse Listings</Link>
        </div>
      </div>
    </div>
  )
}
