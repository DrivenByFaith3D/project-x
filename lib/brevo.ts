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

export function newMessageEmailHtml(orderId: string, appUrl: string) {
  const orderUrl = `${appUrl}/orders/${orderId}`
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #0369a1;">You have a new message</h2>
      <p>Someone has sent a new message in your order thread.</p>
      <a href="${orderUrl}"
         style="display: inline-block; background: #0369a1; color: white; padding: 12px 24px;
                border-radius: 6px; text-decoration: none; margin-top: 16px;">
        View Order
      </a>
      <p style="color: #6b7280; margin-top: 24px; font-size: 14px;">
        If you did not expect this email, you can safely ignore it.
      </p>
    </div>
  `
}
