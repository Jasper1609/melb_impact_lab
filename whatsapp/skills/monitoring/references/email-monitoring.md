# Email Monitoring

## Priority alert rules

The email priority alert runs every 30 minutes during business hours. It checks for unread emails that warrant an immediate WhatsApp notification.

### When to alert

Alert the user when an unread email arrives from:
- Contacts the user regularly corresponds with (check recent sent mail for patterns)
- Senders with subjects containing urgent keywords: "urgent", "asap", "action required", "deadline", "time-sensitive"
- Calendar invitations or meeting changes
- Replies to threads the user started

### When to stay silent

Do not alert for:
- Marketing emails, newsletters, automated notifications
- Emails from noreply addresses
- Shipping notifications, receipts, order confirmations
- Social media notifications
- Mailing list digests

### Alert format

One line per email, plain text for WhatsApp:

```
New email from Sarah Chen — "Q3 budget review needed by Friday"
New email from James (reply) — "Re: API migration timeline"
```

## Daily digest rules

The email digest runs at 6pm on weekdays. It summarises all emails received that day.

### Digest format

Group by sender or topic. Lead with emails needing a response:

```
3 emails today.

Needs response:
Sarah Chen — Q3 budget review, asked for your input by Friday.

For your info:
GitHub — 2 PR notifications on hermes-agent.
Google — storage notification for May.
```

### Actionable items

When an email contains a clear task, idea, or deadline, suggest filing it to the vault inbox:

```
Worth capturing: Sarah's budget review deadline (Friday) could go in your inbox as a task.
```

## Email search patterns

Use the `listMessages` tool from the google MCP server for all email searches.

```
# Unread emails (for priority alert)
listMessages({ query: "is:unread", maxResults: 20 })

# Emails from a specific sender
listMessages({ query: "from:sender@example.com", maxResults: 10 })

# Today's emails (for digest)
listMessages({ query: "after:YYYY/MM/DD", maxResults: 50 })
```
