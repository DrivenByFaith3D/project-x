interface SendEmailParams {
  to: string
  toName?: string
  subject: string
  htmlContent: string
}

export async function sendEmail({ to, toName, subject, htmlContent }: SendEmailParams) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL!,
        name: process.env.BREVO_SENDER_NAME || '3D Print Shop',
      },
      to: [{ email: to, name: toName || to }],
      subject,
      htmlContent,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Brevo API error: ${error}`)
  }

  return response.json()
}

function baseTemplate(title: string, body: string, ctaUrl: string, ctaLabel: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff;">
      <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 20px; color: #111827;">DrivenByFaith3D</h1>
      </div>
      <h2 style="color: #111827; margin-top: 0;">${title}</h2>
      ${body}
      <a href="${ctaUrl}"
         style="display: inline-block; background: #111827; color: white; padding: 12px 24px;
                border-radius: 6px; text-decoration: none; margin-top: 20px; font-weight: 600;">
        ${ctaLabel}
      </a>
      <p style="color: #9ca3af; margin-top: 32px; font-size: 13px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
        You're receiving this because you have an order with DrivenByFaith3D.
      </p>
    </div>
  `
}

export function newMessageEmailHtml(orderId: string, appUrl: string) {
  const orderUrl = `${appUrl}/orders/${orderId}`
  return baseTemplate(
    'New message on your order',
    '<p style="color: #374151;">You have a new message in your order thread. Click below to view and reply.</p>',
    orderUrl,
    'View Message'
  )
}

export function quoteReadyEmailHtml(orderId: string, orderLabel: string, amount: number, appUrl: string) {
  const orderUrl = `${appUrl}/orders/${orderId}`
  return baseTemplate(
    'Your quote is ready',
    `
      <p style="color: #374151;">Great news! Your quote for order <strong>${orderLabel}</strong> is ready.</p>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Total Due</p>
        <p style="margin: 8px 0 0; font-size: 36px; font-weight: 700; color: #111827;">$${amount.toFixed(2)}</p>
      </div>
      <p style="color: #374151;">Click below to review your order and complete payment to get it into production.</p>
    `,
    orderUrl,
    'Pay Now →'
  )
}

const STATUS_EMAIL: Record<string, { subject: string; title: string; body: (label: string) => string; cta: string }> = {
  label_created: {
    subject: 'Your order has been shipped',
    title: 'Your order is on its way!',
    body: (label) => `<p style="color: #374151;">Order <strong>${label}</strong> has been packed and a shipping label has been created. You'll get another update once it's picked up by the carrier.</p>`,
    cta: 'Track Order',
  },
  in_transit: {
    subject: 'Your order is in transit',
    title: 'Your order is in transit',
    body: (label) => `<p style="color: #374151;">Order <strong>${label}</strong> is on its way to you! Click below to see live tracking updates.</p>`,
    cta: 'Track Order',
  },
  out_for_delivery: {
    subject: 'Your order is out for delivery today',
    title: 'Out for delivery today!',
    body: (label) => `<p style="color: #374151;">Order <strong>${label}</strong> is out for delivery and should arrive today. Make sure someone is available to receive it!</p>`,
    cta: 'Track Order',
  },
  delivered: {
    subject: 'Your order has been delivered',
    title: 'Your order was delivered',
    body: (label) => `<p style="color: #374151;">Order <strong>${label}</strong> has been delivered. We hope you love your print! If you have any issues, reply in your order thread.</p>`,
    cta: 'View Order',
  },
}

export function statusChangeEmailHtml(orderId: string, orderLabel: string, status: string, appUrl: string): { subject: string; html: string } | null {
  const template = STATUS_EMAIL[status]
  if (!template) return null
  const orderUrl = `${appUrl}/orders/${orderId}`
  return {
    subject: template.subject,
    html: baseTemplate(template.title, template.body(orderLabel), orderUrl, template.cta),
  }
}
