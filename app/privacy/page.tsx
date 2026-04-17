import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-zinc-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

      <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-zinc-300 leading-relaxed">

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly, including:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
            <li>Name and email address when you create an account</li>
            <li>Shipping address when provided</li>
            <li>Order descriptions, files, and messages</li>
            <li>Payment information (processed securely by Stripe — we do not store card details)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your orders</li>
            <li>Send order status and shipping notifications</li>
            <li>Improve our services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">3. Information Sharing</h2>
          <p>We do not sell your personal information. We share your information only with:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
            <li><strong className="text-zinc-300">Stripe</strong> — for payment processing</li>
            <li><strong className="text-zinc-300">Shippo</strong> — for shipping label generation and tracking</li>
            <li><strong className="text-zinc-300">Brevo</strong> — for transactional email delivery</li>
          </ul>
          <p className="mt-3">These services are bound by their own privacy policies and are used solely to provide our service to you.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">4. Data Retention</h2>
          <p>We retain your account and order data for as long as your account is active. You may request deletion of your account and associated data by contacting us through your order thread.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">5. Security</h2>
          <p>We use industry-standard security practices including encrypted connections (HTTPS) and hashed passwords. We never store your payment card information.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">6. Cookies</h2>
          <p>We use session cookies solely for authentication purposes. We do not use tracking or advertising cookies.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">7. Contact</h2>
          <p>For any privacy-related questions or requests, please reach out through the messaging system on your order.</p>
        </section>

      </div>
    </div>
  )
}
