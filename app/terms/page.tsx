import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
      <p className="text-zinc-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

      <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-zinc-300 leading-relaxed">

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using DrivenByFaith3D ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">2. Orders and Payments</h2>
          <p>All orders are subject to review and acceptance. We reserve the right to refuse any order. Prices quoted are valid for 7 days. Payment is required before production begins. All sales are final once production has started.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">3. File Requirements</h2>
          <p>You are responsible for ensuring any files you upload (STL, images, or other formats) are your own original work or that you have the rights to use them. We are not responsible for print quality issues arising from poorly prepared files.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">4. Shipping</h2>
          <p>Shipping times are estimates and not guaranteed. We are not responsible for delays caused by carriers. Risk of loss passes to you upon handoff to the carrier.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">5. Intellectual Property</h2>
          <p>You retain all rights to designs you submit. By placing an order, you grant us a limited license to reproduce your design for fulfillment purposes only. We will not sell or share your designs with third parties.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">6. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, DrivenByFaith3D shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount paid for the specific order giving rise to the claim.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">7. Changes to Terms</h2>
          <p>We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">8. Contact</h2>
          <p>Questions about these Terms? Reach out through the messaging system on any of your orders.</p>
        </section>

      </div>
    </div>
  )
}
