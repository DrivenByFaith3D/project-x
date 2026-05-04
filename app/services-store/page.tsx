import Image from 'next/image'
import Link from 'next/link'
import ContactForm from './ContactForm'

export default function ServicesStorePage() {
  return (
    <div>
      {/* Section 1 ��� Hero Banner */}
      <section className="w-full h-[50vh] min-h-[400px] relative bg-taupe/30">
        <Image
          src="/hero-living-room.jpg"
          alt="Cozy living space with 3D printed organizers"
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </section>

      {/* Section 2 ��� Services Intro */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display leading-tight">
            Our Printing Services
          </h2>
          <p className="text-charcoal/80 text-base sm:text-lg leading-relaxed">
            We specialize in one thing: high-quality 3D printed desk organizers. Every print is made to order and priced per print hour, so you only pay for exactly what&apos;s made. No mass production, no shortcuts — just precision craftsmanship tailored to your space.
          </p>
        </div>
      </section>

      {/* Section 3 — Service Listings */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="space-y-16">

          {/* Service 1: Shop Collection → links to /listings */}
          <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
            <div className="w-[150px] h-[150px] shrink-0 rounded-lg overflow-hidden bg-taupe/20 relative">
              <Image
                src="/services/shop-collection.jpg"
                alt="Shop Collection"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <h3 className="text-2xl sm:text-3xl font-display">Shop Collection</h3>
                <span className="text-xl font-display text-charcoal shrink-0">$12/hr</span>
              </div>
              <p className="text-charcoal/70 text-base leading-relaxed mb-5">
                Browse our ready-made desk organizer designs. Pick a style, choose your color, and we print it for you. Simple, fast, and affordable — perfect if you already know what you want.
              </p>
              <Link href="/listings" className="btn-primary inline-block text-sm">
                Browse the Shop
              </Link>
            </div>
          </div>

          {/* Service 2: Custom Print */}
          <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
            <div className="w-[150px] h-[150px] shrink-0 rounded-lg overflow-hidden bg-taupe/20 relative">
              <Image
                src="/services/custom-print.jpg"
                alt="Custom Print"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <h3 className="text-2xl sm:text-3xl font-display">Custom Print</h3>
                <span className="text-xl font-display text-charcoal shrink-0">$15/hr</span>
              </div>
              <p className="text-charcoal/70 text-base leading-relaxed mb-5">
                Have a file or an idea? Send it over and we&apos;ll bring it to life. Upload your STL, share a reference image, or describe what you need — we handle the rest with precision and care.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="https://calendar.google.com" target="_blank" className="btn-primary inline-block text-sm">
                  Book a Free Consultation
                </Link>
                <Link href="#contact" className="btn-secondary inline-block text-sm">
                  Submit a Ticket
                </Link>
              </div>
            </div>
          </div>

          {/* Service 3: Full Design & Print */}
          <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
            <div className="w-[150px] h-[150px] shrink-0 rounded-lg overflow-hidden bg-taupe/20 relative">
              <Image
                src="/services/design-print.jpg"
                alt="Design & Print"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <h3 className="text-2xl sm:text-3xl font-display">Design & Print</h3>
                <span className="text-xl font-display text-charcoal shrink-0">$20/hr</span>
              </div>
              <p className="text-charcoal/70 text-base leading-relaxed mb-5">
                The full package. We design a completely custom organizer from scratch based on your space and needs, then print and ship it to you. Includes a one-on-one consultation to nail every detail.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="https://calendar.google.com" target="_blank" className="btn-primary inline-block text-sm">
                  Book a Free Consultation
                </Link>
                <Link href="#contact" className="btn-secondary inline-block text-sm">
                  Submit a Ticket
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Section 4 — Contact/CTA Form */}
      <section id="contact" className="bg-taupe/40 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display leading-tight mb-4">
                Ready to Unleash Your Print?
              </h2>
              <p className="text-charcoal/70 text-lg">
                Complete the form. Let&apos;s build something unstoppable.
              </p>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  )
}
