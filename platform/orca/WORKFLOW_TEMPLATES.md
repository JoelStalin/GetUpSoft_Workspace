# Ready-to-Use Workflow Templates for Orca

## How to Use Templates

### Option 1: Copy & Paste Template Code
1. Open Visual Editor in Orca
2. Click "Import" button
3. Paste the JSON below
4. Customize for your use case
5. Save and run

### Option 2: Generate from Description  
1. Click "✨ Generate"
2. Describe your workflow
3. System creates it automatically

---

## Template 1: Email Campaign Workflow

**Use Case:** Send personalized emails to customer list

```json
{
  "id": "email-campaign-001",
  "name": "Email Campaign Automation",
  "active": true,
  "nodes": [
    {
      "id": "1",
      "name": "Trigger",
      "type": "orca-nodes-base.trigger",
      "position": [100, 100],
      "parameters": {},
      "typeVersion": 1
    },
    {
      "id": "2",
      "name": "Get Customers",
      "type": "orca-nodes-base.httpRequest",
      "position": [350, 100],
      "parameters": {
        "method": "GET",
        "url": "https://api.yourcrm.com/customers"
      },
      "typeVersion": 1
    },
    {
      "id": "3",
      "name": "Loop Through Customers",
      "type": "orca-nodes-base.loop",
      "position": [600, 100],
      "parameters": {
        "field": "customers"
      },
      "typeVersion": 1
    },
    {
      "id": "4",
      "name": "Personalize Email",
      "type": "orca-nodes-base.aiPrompt",
      "position": [850, 100],
      "parameters": {
        "prompt": "Create personalized email for customer {{name}} based on {{purchase_history}}"
      },
      "typeVersion": 1
    },
    {
      "id": "5",
      "name": "Send Email",
      "type": "orca-nodes-base.httpRequest",
      "position": [1100, 100],
      "parameters": {
        "method": "POST",
        "url": "https://api.sendgrid.com/send"
      },
      "typeVersion": 1
    },
    {
      "id": "6",
      "name": "Log Results",
      "type": "orca-nodes-base.executeCommand",
      "position": [1350, 100],
      "parameters": {
        "command": "echo 'Email sent to {{email}}'"
      },
      "typeVersion": 1
    },
    {
      "id": "7",
      "name": "Complete",
      "type": "orca-nodes-base.end",
      "position": [1600, 100],
      "parameters": {},
      "typeVersion": 1
    }
  ],
  "connections": {
    "Trigger": {"main": [[{"node": "Get Customers", "type": "main", "index": 0}]]},
    "Get Customers": {"main": [[{"node": "Loop Through Customers", "type": "main", "index": 0}]]},
    "Loop Through Customers": {"main": [[{"node": "Personalize Email", "type": "main", "index": 0}]]},
    "Personalize Email": {"main": [[{"node": "Send Email", "type": "main", "index": 0}]]},
    "Send Email": {"main": [[{"node": "Log Results", "type": "main", "index": 0}]]},
    "Log Results": {"main": [[{"node": "Complete", "type": "main", "index": 0}]]}
  },
  "settings": {},
  "createdAt": "2026-05-20T00:00:00Z",
  "updatedAt": "2026-05-20T00:00:00Z"
}
```

**What It Does:**
1. Fetches customer list from your CRM
2. Loops through each customer
3. AI personalizes email content
4. Sends via SendGrid
5. Logs completion

**Customize:**
- Replace `https://api.yourcrm.com/customers` with your actual API
- Update SendGrid endpoint with your API key
- Modify the AI prompt for different content

---

## Template 2: Lead Scoring Workflow

**Use Case:** Auto-qualify leads from web form

```json
{
  "id": "lead-scoring-001",
  "name": "Lead Qualification System",
  "active": true,
  "nodes": [
    {
      "id": "1",
      "name": "New Lead Trigger",
      "type": "orca-nodes-base.trigger",
      "position": [100, 200],
      "parameters": {},
      "typeVersion": 1
    },
    {
      "id": "2",
      "name": "Validate Email",
      "type": "orca-nodes-base.condition",
      "position": [350, 200],
      "parameters": {
        "rule": "email_format_valid"
      },
      "typeVersion": 1
    },
    {
      "id": "3",
      "name": "Enrich Lead Data",
      "type": "orca-nodes-base.aiPrompt",
      "position": [600, 150],
      "parameters": {
        "prompt": "Analyze this company {{company_name}}: industry, size, funding, tech stack. Score relevance 1-10"
      },
      "typeVersion": 1
    },
    {
      "id": "4",
      "name": "Score Lead",
      "type": "orca-nodes-base.executeCommand",
      "position": [850, 150],
      "parameters": {
        "command": "echo 'Score: {{score}}'"
      },
      "typeVersion": 1
    },
    {
      "id": "5",
      "name": "Route by Score",
      "type": "orca-nodes-base.condition",
      "position": [1100, 150],
      "parameters": {
        "rule": "score > 7"
      },
      "typeVersion": 1
    },
    {
      "id": "6",
      "name": "Notify Sales - Hot",
      "type": "orca-nodes-base.httpRequest",
      "position": [1350, 100],
      "parameters": {
        "method": "POST",
        "url": "https://slack.com/api/chat.postMessage",
        "body": "Hot lead: {{name}} ({{company}})"
      },
      "typeVersion": 1
    },
    {
      "id": "7",
      "name": "Add to Nurture",
      "type": "orca-nodes-base.httpRequest",
      "position": [1350, 200],
      "parameters": {
        "method": "POST",
        "url": "https://api.marketo.com/leads/add"
      },
      "typeVersion": 1
    },
    {
      "id": "8",
      "name": "Invalid Email - Skip",
      "type": "orca-nodes-base.end",
      "position": [600, 350],
      "parameters": {},
      "typeVersion": 1
    },
    {
      "id": "9",
      "name": "Complete",
      "type": "orca-nodes-base.end",
      "position": [1600, 150],
      "parameters": {},
      "typeVersion": 1
    }
  ],
  "connections": {
    "New Lead Trigger": {"main": [[{"node": "Validate Email", "type": "main", "index": 0}]]},
    "Validate Email": {
      "main": [
        [{"node": "Enrich Lead Data", "type": "main", "index": 0}],
        [{"node": "Invalid Email - Skip", "type": "main", "index": 0}]
      ]
    },
    "Enrich Lead Data": {"main": [[{"node": "Score Lead", "type": "main", "index": 0}]]},
    "Score Lead": {"main": [[{"node": "Route by Score", "type": "main", "index": 0}]]},
    "Route by Score": {
      "main": [
        [{"node": "Notify Sales - Hot", "type": "main", "index": 0}],
        [{"node": "Add to Nurture", "type": "main", "index": 0}]
      ]
    },
    "Notify Sales - Hot": {"main": [[{"node": "Complete", "type": "main", "index": 0}]]},
    "Add to Nurture": {"main": [[{"node": "Complete", "type": "main", "index": 0}]]},
    "Invalid Email - Skip": {"main": [[{"node": "Complete", "type": "main", "index": 0}]]}
  },
  "settings": {},
  "createdAt": "2026-05-20T00:00:00Z",
  "updatedAt": "2026-05-20T00:00:00Z"
}
```

**What It Does:**
1. Validates email format
2. Enriches lead with company data
3. Scores based on relevance (AI)
4. Routes hot leads to sales (Slack notification)
5. Adds others to nurture sequence

---

## Template 3: Social Media Scheduler

**Use Case:** Auto-post to multiple platforms

```json
{
  "id": "social-scheduler-001",
  "name": "Social Media Content Distribution",
  "active": true,
  "nodes": [
    {
      "id": "1",
      "name": "Schedule Trigger",
      "type": "orca-nodes-base.trigger",
      "position": [100, 200],
      "parameters": {
        "schedule": "daily_9am"
      },
      "typeVersion": 1
    },
    {
      "id": "2",
      "name": "Fetch Blog Post",
      "type": "orca-nodes-base.httpRequest",
      "position": [350, 200],
      "parameters": {
        "url": "https://api.yoursite.com/latest-blog-post"
      },
      "typeVersion": 1
    },
    {
      "id": "3",
      "name": "Loop - For Each Platform",
      "type": "orca-nodes-base.loop",
      "position": [600, 200],
      "parameters": {
        "items": ["twitter", "linkedin", "facebook"]
      },
      "typeVersion": 1
    },
    {
      "id": "4",
      "name": "Tailor Content for Platform",
      "type": "orca-nodes-base.aiPrompt",
      "position": [850, 200],
      "parameters": {
        "prompt": "Rewrite this blog post for {{platform}}: {{title}}. {{platform}} limits: twitter=280 chars, linkedin=3000, facebook=5000"
      },
      "typeVersion": 1
    },
    {
      "id": "5",
      "name": "Post to Platform",
      "type": "orca-nodes-base.httpRequest",
      "position": [1100, 200],
      "parameters": {
        "url": "https://{{platform}}-api.com/post",
        "body": "{{content}}"
      },
      "typeVersion": 1
    },
    {
      "id": "6",
      "name": "Log Analytics",
      "type": "orca-nodes-base.executeCommand",
      "position": [1350, 200],
      "parameters": {
        "command": "echo 'Posted to {{platform}}'"
      },
      "typeVersion": 1
    },
    {
      "id": "7",
      "name": "Done",
      "type": "orca-nodes-base.end",
      "position": [1600, 200],
      "parameters": {},
      "typeVersion": 1
    }
  ],
  "connections": {
    "Schedule Trigger": {"main": [[{"node": "Fetch Blog Post", "type": "main", "index": 0}]]},
    "Fetch Blog Post": {"main": [[{"node": "Loop - For Each Platform", "type": "main", "index": 0}]]},
    "Loop - For Each Platform": {"main": [[{"node": "Tailor Content for Platform", "type": "main", "index": 0}]]},
    "Tailor Content for Platform": {"main": [[{"node": "Post to Platform", "type": "main", "index": 0}]]},
    "Post to Platform": {"main": [[{"node": "Log Analytics", "type": "main", "index": 0}]]},
    "Log Analytics": {"main": [[{"node": "Done", "type": "main", "index": 0}]]}
  },
  "settings": {},
  "createdAt": "2026-05-20T00:00:00Z",
  "updatedAt": "2026-05-20T00:00:00Z"
}
```

---

## Testing Templates

### Quick Test:
```
1. Copy template JSON above
2. Open Workflow Editor
3. Click "Import"
4. Paste JSON
5. Click "Run"
6. Watch execution logs
```

### Production Checklist:
- [ ] Replace example API URLs
- [ ] Add API authentication keys
- [ ] Test with sample data
- [ ] Review logs for errors
- [ ] Schedule for recurring run
- [ ] Set up monitoring/alerts

---

## Common Customizations

### Change Trigger:
```json
"parameters": {
  "type": "webhook",  // or "schedule", "manual"
  "schedule": "daily_9am"
}
```

### Modify AI Prompts:
```json
"parameters": {
  "prompt": "Your custom instruction here with {{variables}}"
}
```

### Add Conditions:
```json
"type": "orca-nodes-base.condition",
"parameters": {
  "condition": "field > value"
}
```

---

## Next Steps

1. **Copy a template above**
2. **Import into Orca Visual Editor**
3. **Customize for your APIs**
4. **Test and run**
5. **Set schedule (optional)**
6. **Monitor logs**

🚀 **Ready? Open the Visual Editor and import a template!**
