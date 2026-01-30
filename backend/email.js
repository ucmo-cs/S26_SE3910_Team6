/**
 * Sends appointment confirmation emails via Resend (API key only, no password).
 * Set RESEND_API_KEY in backend/.env. Optionally set RESEND_FROM (e.g. Appointments <onboarding@resend.dev>).
 */

const { Resend } = require('resend');

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function formatDateTime(isoDateTime) {
  const d = new Date(isoDateTime);
  return d.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Send appointment confirmation email to the customer.
 * @param {Object} appointment - { name, email, topicId, branchId, dateTime, reason }
 * @param {string} topicName
 * @param {string} branchName
 * @param {string} branchAddress
 * @returns {Promise<boolean>} - true if sent, false if skipped or failed
 */
async function sendAppointmentConfirmation(appointment, topicName, branchName, branchAddress) {
  const resend = getResendClient();
  if (!resend) {
    console.warn(
      '[email] Not configured: set RESEND_API_KEY in backend/.env (or project root .env). Get a free key at https://resend.com/api-keys'
    );
    return false;
  }

  // Resend: onboarding@resend.dev can only send TO your Resend account email. To send to anyone, verify a domain at resend.com/domains and set RESEND_FROM.
  const from = process.env.RESEND_FROM || 'Appointments <onboarding@resend.dev>';
  const dateTimeFormatted = formatDateTime(appointment.dateTime);

  console.log('[email] Sending confirmation to', appointment.email, 'from', from);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmation</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 560px; margin: 0 auto; padding: 24px;">
  <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; background: #fafafa;">
    <h1 style="margin: 0 0 8px 0; font-size: 1.5rem; color: #016649;">Appointment Confirmed</h1>
    <p style="margin: 0 0 24px 0; color: #6b7280;">Hi ${escapeHtml(appointment.name)},</p>
    <p style="margin: 0 0 16px 0;">Your appointment has been scheduled. Here are the details:</p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Topic</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${escapeHtml(topicName)}</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Date &amp; time</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${escapeHtml(dateTimeFormatted)}</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Location</td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${escapeHtml(branchName)}<br><span style="color: #6b7280; font-weight: normal;">${escapeHtml(branchAddress)}</span></td></tr>
    </table>
    ${appointment.reason ? `<p style="margin: 0 0 16px 0;"><strong>Your notes:</strong> ${escapeHtml(appointment.reason)}</p>` : ''}
    <p style="margin: 0; font-size: 0.875rem; color: #6b7280;">If you need to change or cancel, please contact the branch directly.</p>
  </div>
</body>
</html>
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [appointment.email],
      subject: 'Appointment Confirmation',
      html,
    });
    if (error) {
      console.error('[email] Resend error:', JSON.stringify(error, null, 2));
      if (error.message && error.message.includes('only send testing emails to your own')) {
        console.error('[email] To send to any email: verify a domain at https://resend.com/domains and set RESEND_FROM=Appointments <you@yourdomain.com> in .env');
      }
      return false;
    }
    console.log('[email] Confirmation sent to', appointment.email, data?.id ? `(id: ${data.id})` : '');
    return true;
  } catch (err) {
    console.error('[email] Failed to send:', err.message);
    if (err.response) console.error('[email] Response:', err.response);
    return false;
  }
}

function escapeHtml(s) {
  if (s == null) return '';
  const str = String(s);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = {
  sendAppointmentConfirmation,
};
