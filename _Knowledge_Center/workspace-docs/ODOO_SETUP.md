# 🔗 Odoo ERP Integration Setup Guide

**Purpose:** Configure GetUpSoft website to connect with Odoo for CRM/helpdesk integration  
**Status:** Ready for production  
**Updated:** 2026-05-19

---

## Quick Start

### Development (Using Mock Provider)

By default, the app uses MockERPProvider for development:

```bash
npm run dev
# Forms submit to in-memory mock ERP
# No Odoo instance required
# Perfect for testing UI/UX
```

### Production (Real Odoo)

To connect to a real Odoo instance:

1. **Set environment variables** in `.env.production`:
   ```bash
   VITE_ERP_TYPE=odoo
   VITE_ODOO_HOST=odoo.example.com
   VITE_ODOO_PORT=8069
   VITE_ODOO_DATABASE=getupsoft
   VITE_ODOO_USERNAME=admin
   VITE_ODOO_PASSWORD=your_secure_password
   VITE_AUTO_CONNECT_ERP=true
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

3. **Test connection:**
   - Fill out Contact form
   - Should create Lead in Odoo CRM
   - Should create Ticket in Odoo Helpdesk

---

## Environment Variables

### Required for Odoo

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_ODOO_HOST` | `odoo.company.com` | Odoo server hostname |
| `VITE_ODOO_PORT` | `8069` | Odoo XML-RPC port (default: 8069) |
| `VITE_ODOO_DATABASE` | `getupsoft` | Odoo database name |
| `VITE_ODOO_USERNAME` | `admin` | Odoo user for API calls |
| `VITE_ODOO_PASSWORD` | `securepass123` | Odoo user password |

### Optional

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_ERP_TYPE` | `odoo` | Provider type: `odoo`, `erp-next`, `sap`, `iseries` |
| `VITE_AUTO_CONNECT_ERP` | `false` | Auto-connect on app load (disable in dev) |
| `VITE_USE_MOCK` | `false` | Force mock provider even in production |
| `VITE_DISABLE_ERP` | `false` | Disable ERP entirely (forms won't submit) |

---

## Odoo Configuration

### Prerequisites

- **Odoo Version:** 14.0 or later
- **Modules Required:**
  - `crm` — Lead/Opportunity management
  - `helpdesk` — Ticket management
  - `web` — Core web module (XML-RPC API)

- **User Permissions:**
  - API user needs permission to create leads in CRM
  - API user needs permission to create tickets in Helpdesk

### Odoo Setup Steps

#### 1. Enable XML-RPC API (Usually enabled by default)

In Odoo settings:
- Settings → Technical → External API → Activate XML-RPC

#### 2. Create API User

```
Users & Companies → Users → Create
- Name: "GetUpSoft API"
- Email: "api@getupsoft.com"
- Login: "getupsoft-api"
- Password: Use strong password
- Groups: 
  - CRM / User: Sales
  - Helpdesk / User: Helpdesk
```

#### 3. Test Connection

Using `curl`:

```bash
curl -X POST http://odoo.example.com:8069/jsonrpc -H "Content-Type: application/json" -d '{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "common",
    "method": "authenticate",
    "args": ["getupsoft", "getupsoft-api", "password", {}]
  },
  "id": 1
}'
```

Expected response:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "uid": 12,
    "session_id": "..."
  }
}
```

---

## Data Flow

### Contact Form → Odoo

```
User submits contact form
    ↓
useERPSubmission hook calls submitContact()
    ↓
OdooProvider.createLead()
  → Creates lead in crm.lead
  → Fields: name, contact_name, email_from, description, source_id
    ↓
OdooProvider.createTicket()
  → Creates ticket in helpdesk.ticket
  → Fields: name, description, priority, partner_id, tags
    ↓
Form shows success + ticket ID
User receives confirmation (email configured in Odoo)
```

### Diagnostic Form → Odoo

```
User submits diagnostic form
    ↓
useERPSubmission hook calls submitDiagnostic()
    ↓
OdooProvider.createDiagnosticLead()
  → Creates opportunity in crm.lead
  → Fields: All contact fields + industry, budget, expected_revenue
    ↓
OdooProvider.createDiagnosticTicket()
  → Creates ticket with priority based on timeline + budget
  → Fields: All ticket fields + tags for industry/diagnostic
    ↓
Form shows success + ticket ID
Admin notified of high-priority leads (configured in Odoo)
```

---

## Customization

### Add Custom Fields to Leads

In `src/lib/erp/odoo-provider.ts`, update `createLead()`:

```typescript
const leadId = await this.callRPC("execute", {
  model: "crm.lead",
  method: "create",
  args: [
    {
      // ... existing fields
      
      // Add custom field:
      x_custom_field: "value",
      
      // Add multi-select:
      tag_ids: [[6, 0, [1, 2, 3]]],  // IDs of tags to assign
    },
  ],
});
```

### Add Custom Fields to Tickets

In `src/lib/erp/odoo-provider.ts`, update `createTicket()`:

```typescript
const ticketId = await this.callRPC("execute", {
  model: "helpdesk.ticket",
  method: "create",
  args: [
    {
      // ... existing fields
      
      // Add custom field:
      x_customer_segment: "Enterprise",
      x_contract_value: 50000,
      
      // Assign to specific user:
      user_id: 5,
    },
  ],
});
```

### Change Lead Source Mapping

In `src/lib/erp/odoo-provider.ts`, update `getSourceId()`:

```typescript
private getSourceId(source: string): number {
  // Fetch real IDs from Odoo:
  // Settings → CRM → CRM → Source
  
  const sourceMap: Record<string, number> = {
    "contact-form": 1,      // Change to your actual Odoo IDs
    "diagnostic-form": 2,
    "web-inquiry": 3,
    "event": 4,
    "phone": 5,
  };
  return sourceMap[source] || 1;
}
```

---

## Troubleshooting

### Connection Errors

**Error:** "Failed to connect to Odoo"

**Causes:**
- Odoo server not running
- Wrong host/port
- Firewall blocking connection
- XML-RPC disabled

**Solution:**
1. Verify Odoo is running: `http://odoo.example.com:8069/`
2. Check port: Default is 8069 (not 80 or 443)
3. Test XML-RPC: Use curl command above
4. Check firewall: Port 8069 should be open

### Authentication Errors

**Error:** "Authentication failed"

**Causes:**
- Wrong username/password
- User doesn't exist
- User doesn't have API permissions

**Solution:**
1. Verify credentials in `.env.production`
2. Check user exists in Odoo: Users & Companies → Users
3. Verify user permissions: CRM User, Helpdesk User groups

### Form Doesn't Create Lead

**Error:** Form submits but no lead in Odoo

**Causes:**
- Wrong database name
- CRM module not installed
- User doesn't have permission to create leads

**Solution:**
1. Check database name: Odoo database selector
2. Install CRM: Apps → Search "CRM" → Install
3. Add CRM User to API user: Settings → Manage Groups

### Ticket Not Created

**Error:** Lead created but no ticket in Odoo

**Causes:**
- Helpdesk module not installed
- Model name wrong (helpdesk.ticket vs helpdesk.support.ticket)
- User doesn't have helpdesk permissions

**Solution:**
1. Install Helpdesk: Apps → Search "Helpdesk" → Install
2. Check model name in your Odoo version
3. Add Helpdesk User group to API user

---

## Performance Considerations

### Connection Pooling

The OdooProvider maintains a single session. For high-traffic sites:

```typescript
// Current approach (works for < 100 submissions/hour)
const provider = await getERPProvider()
await provider.connect()  // Creates new session

// For higher traffic, implement connection pooling:
// - Keep persistent connection
// - Reuse session until expiry
// - Implement retry logic with backoff
```

### Async Operations

Form submission is asynchronous (~500ms for Odoo RPC):

```typescript
// User won't see delay since it's async
// But show loading spinner to prevent double-submission
```

### Mock Provider for Testing

Keep mock provider enabled in development:

```bash
# .env.development
VITE_USE_MOCK=true
VITE_AUTO_CONNECT_ERP=false
```

---

## Security Checklist

- [ ] API user has minimal permissions (CRM User, Helpdesk User only)
- [ ] Passwords stored in `.env.production` (not in Git)
- [ ] Use HTTPS for production Odoo instances
- [ ] Rotate API password periodically
- [ ] Monitor Odoo API logs for suspicious activity
- [ ] Validate all form inputs before sending to Odoo
- [ ] Use firewall to restrict Odoo API access to trusted IPs

---

## API Reference

### Contact Form Creates

**Lead:**
- `name`: Company name
- `contact_name`: Person name
- `email_from`: Email address
- `description`: Message
- `type`: "lead"
- `source_id`: 1 (contact-form)
- `lang`: "es_ES" or "en_US"

**Ticket:**
- `name`: Subject from form
- `description`: Message
- `priority`: 1 (medium, or based on routing)
- `partner_id`: Lead ID
- `tag_ids`: ["contact-form"]

### Diagnostic Form Creates

**Lead (as Opportunity):**
- All contact form fields +
- `type`: "opportunity"
- `expected_revenue`: Estimated from budget
- `source_id`: 2 (diagnostic-form)
- Description includes: industry, systems, timeline, budget

**Ticket:**
- All contact form fields +
- `priority`: Based on timeline + budget (urgent=3, high=2, medium=1, low=0)
- `tag_ids`: ["diagnostic", industry-name]

---

## Advanced Usage

### Webhook Notifications

When lead/ticket created, trigger Odoo automation:

```
CRM → Lead Automation Rules
Trigger: Lead created via web form
Action: Send email to salesperson
```

### Custom Workflows

In Odoo, set up automated actions:

```
Settings → Automation → Automation Rules
When: Lead type = "opportunity" AND budget > $50k
Then: Assign to VP Sales + Set priority to High
```

### Reporting

Track form submissions in Odoo:

```
CRM → Dashboard → Leads by Source
→ Filter: Source = "Contact Form"
→ See conversion rate, pipeline value, etc.
```

---

_Odoo Setup Guide v1.0 · Updated 2026-05-19 · Production Ready_
