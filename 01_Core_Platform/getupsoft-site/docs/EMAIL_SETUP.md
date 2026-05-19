# 📧 Email Notification Setup Guide

**Purpose:** Configure GetUpSoft website to send email confirmations for form submissions  
**Status:** Ready for development and production  
**Updated:** 2026-05-19

---

## Quick Start

### Development (Using Mock Provider)

By default, the app uses MockEmailProvider for development:

```bash
npm run dev
# Forms submit and send confirmation emails to console (no SMTP required)
# Perfect for testing UI/UX without email infrastructure
```

### Production (Real SMTP)

To send actual emails in production:

1. **Set environment variables** in `.env.production`:
   ```bash
   VITE_SMTP_HOST=smtp.gmail.com
   VITE_SMTP_PORT=587
   VITE_SMTP_SECURE=false
   VITE_SMTP_USER=your-email@gmail.com
   VITE_SMTP_PASS=your-app-password
   VITE_SMTP_FROM=noreply@getupsoft.com
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

3. **Test form submission:**
   - Fill out Contact or Diagnostic form
   - Should receive confirmation email at provided email address
   - Check logs for email sending confirmation

---

## Environment Variables

### Required for SMTP

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_SMTP_HOST` | `smtp.gmail.com` | SMTP server hostname |
| `VITE_SMTP_PORT` | `587` | SMTP port (typically 587 for TLS, 465 for SSL) |
| `VITE_SMTP_SECURE` | `false` | Use TLS security (true for port 465, false for 587) |
| `VITE_SMTP_USER` | `your-email@gmail.com` | SMTP authentication username |
| `VITE_SMTP_PASS` | `app-specific-password` | SMTP authentication password |
| `VITE_SMTP_FROM` | `noreply@getupsoft.com` | Sender email address |

### Optional

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_USE_MOCK_EMAIL` | `false` | Force mock provider even in production |
| `VITE_DISABLE_EMAIL` | `false` | Disable email notifications entirely |

---

## Email Provider Types

### MockEmailProvider (Development)

**When Used:**
- Development environment (npm run dev)
- Or when VITE_USE_MOCK_EMAIL=true

**Behavior:**
- Logs emails to console instead of sending
- Useful for testing UI/UX without SMTP setup
- Includes email template generation
- In-memory storage of sent emails for testing

**Configuration:**
```typescript
// Automatically used in development
// No configuration required
```

### SMTPEmailProvider (Production)

**When Used:**
- Production environment (npm run build)
- Or explicitly configured SMTP credentials

**Behavior:**
- Sends emails via configured SMTP server
- Makes backend API call to /api/email/send endpoint
- Requires backend service to handle SMTP delivery
- Graceful error handling with fallback

**Configuration:**
```typescript
// Requires environment variables
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_SECURE=false
VITE_SMTP_USER=your-email@gmail.com
VITE_SMTP_PASS=your-app-password
VITE_SMTP_FROM=noreply@getupsoft.com
```

---

## Email Templates

### Contact Form Email

**Sent After:** Successful contact form submission  
**Languages:** Spanish (es) and English (en)  
**Contents:**
- Confirmation message with ticket ID
- Summary of submitted information
- Contact details

**Example Subject:**
- ES: "Confirmación de tu solicitud de contacto"
- EN: "Confirmation of your contact request"

### Diagnostic Form Email

**Sent After:** Successful diagnostic form submission  
**Languages:** Spanish (es) and English (en)  
**Contents:**
- Confirmation message with ticket ID
- Summary of diagnostic information (industry, timeline, budget)
- Company details

**Example Subject:**
- ES: "Tu diagnóstico empresarial ha sido enviado"
- EN: "Your business diagnostic has been submitted"

---

## Gmail SMTP Setup

### Step 1: Enable 2-Factor Authentication

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click "Security" in the left sidebar
3. Enable "2-Step Verification"

### Step 2: Create App Password

1. Return to Security settings
2. Scroll down to "App passwords" (only appears if 2FA is enabled)
3. Select "Mail" and "Windows Computer"
4. Google will generate a 16-character password
5. Copy this password (without spaces) as VITE_SMTP_PASS

### Step 3: Configure Environment Variables

```bash
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_SECURE=false
VITE_SMTP_USER=your-email@gmail.com
VITE_SMTP_PASS=xxxx xxxx xxxx xxxx  # 16-character app password
VITE_SMTP_FROM=noreply@getupsoft.com
```

### Step 4: Test Connection

1. Fill out a contact form on the site
2. Check your email inbox for confirmation
3. Check server logs for any errors

---

## Troubleshooting

### Email Not Sending

**Error:** "Failed to connect to SMTP server"

**Causes:**
- Wrong SMTP host or port
- SMTP credentials invalid
- Firewall blocking SMTP port
- 2FA not enabled (Gmail)

**Solution:**
1. Verify SMTP host and port are correct
2. Check SMTP credentials in environment variables
3. Test SMTP connection: `telnet smtp.gmail.com 587`
4. Enable 2FA and app passwords (Gmail)

### Authentication Failed

**Error:** "SMTP authentication failed"

**Causes:**
- Wrong username or password
- App password not generated (Gmail)
- Wrong 2FA setup

**Solution:**
1. For Gmail, use app-specific password (not account password)
2. Regenerate app password and try again
3. Verify 2FA is enabled before generating app password

### Email Template Issues

**Error:** "Email sent but formatting broken"

**Solution:**
- Templates are auto-generated from form data
- Check that form data is properly validated before sending
- Verify language field is set correctly (es or en)

### Backend API Not Available

**Error:** "Backend email API not responding"

**Causes:**
- /api/email/send endpoint not implemented in backend
- Backend service not running
- CORS issues

**Solution:**
1. Implement /api/email/send endpoint in backend
2. Ensure backend is running and accessible
3. Add CORS headers if needed

---

## Integration with ERP

### Email After ERP Success

Emails are sent **after** successful ERP submission:

```
User submits form
    ↓
Form validation (Zod)
    ↓
ERP submission (create lead + ticket)
    ↓
Email confirmation sent (async, non-blocking)
    ↓
User sees success message with ticket ID
```

### Email Payload

Contact form email includes:
- User name and company
- User email address
- Ticket ID from ERP
- Submitted message (summary)
- Language preference

Diagnostic form email includes:
- User name and company
- Industry and timeline
- Budget range
- Ticket ID from ERP
- Language preference

---

## Security Considerations

- [ ] SMTP passwords stored in `.env.production` (not in Git)
- [ ] Use app-specific passwords (Gmail) or strong passwords (other providers)
- [ ] HTTPS required for production email API
- [ ] Validate email addresses before sending
- [ ] Rate-limit email sending to prevent spam
- [ ] Log email sending attempts for audit trail
- [ ] Consider email service provider (SendGrid, Mailgun) for production

---

## Performance Notes

### Email Sending

Email sending is **asynchronous and non-blocking**:

```typescript
// Email send doesn't block form completion
await submitContact(data)  // Returns immediately with success
sendEmail(data)            // Sends in background
```

### Rate Limiting

For high-traffic sites (100+ submissions/hour):

1. Implement queue-based email sending
2. Add rate limiting per email address
3. Consider email service provider (SendGrid)
4. Monitor SMTP connection pool

---

## Testing

### Manual Testing

1. **Development (Mock):**
   ```bash
   npm run dev
   # Fill out form → Check console for email log
   ```

2. **Production (SMTP):**
   ```bash
   npm run build
   # Fill out form → Check inbox for confirmation email
   ```

### Automated Testing

```typescript
import { MockEmailProvider } from '@/lib/email'

const provider = new MockEmailProvider()
const result = await provider.send({
  type: 'contact-form',
  to: 'test@example.com',
  name: 'Test User',
  email: 'test@example.com',
  company: 'Test Corp',
  message: 'Test message',
  language: 'en',
})

expect(result.success).toBe(true)
```

---

## Advanced Usage

### Custom Email Provider

Implement a custom provider for Sendgrid, Mailgun, etc:

```typescript
import { IEmailProvider, EmailData, SendEmailResult } from '@/lib/email'

export class SendgridProvider implements IEmailProvider {
  async send(data: EmailData): Promise<SendEmailResult> {
    // Your implementation
  }

  generateTemplate(data: EmailData) {
    // Your implementation
  }
}
```

Then update `index.ts` to use it:

```typescript
case "sendgrid":
  return new SendgridProvider()
```

### Webhook Notifications

Set up automated responses in email provider:

```
Contact form submitted → Email sent → Webhook to CRM
→ Auto-create task for sales team
```

---

## References

- [Gmail App Passwords Guide](https://support.google.com/accounts/answer/185833)
- [SMTP Configuration Guide](https://www.siteground.com/tutorials/email/smtp-settings/)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Mailgun Documentation](https://documentation.mailgun.com/)

---

_Email Setup Guide v1.0 · Updated 2026-05-19 · Ready for Production_
