# Briefing Templates

## Morning briefing format

The morning briefing is delivered to WhatsApp at 7am daily. Plain text only, 5-8 sentences. Lead with calendar since meetings are time-sensitive.

### Section order

1. Calendar — today's events with times (via `listEvents`)
2. Tasks — what's due today or overdue
3. Linear — in-progress issues and anything due soon
4. Email — unread count and notable senders
5. GitHub — PR reviews requested, notable notifications
6. Vault — unprocessed inbox items

### Example briefing

```
You have 3 events today: standup at 9am, design review at 10:30am with Sarah, and sprint planning at 2pm in Room 4B.

4 tasks due today in Done Bear, including the API spec review. 2 overdue from last week.

2 Linear issues in progress: the auth middleware rewrite is blocked, and the onboarding flow is due Thursday.

12 unread emails overnight. Notable: Sarah Chen sent the Q3 budget draft, and there's a calendar invite from James for Thursday.

2 PR reviews waiting on you: mfe-messaging #412 and consumer-agent #89.

3 items in your vault inbox waiting to be processed.
```

### Rules

- If a section has nothing to report, skip it entirely. Don't say "no meetings today" unless calendar is the only thing to report.
- Use 12-hour time for events.
- Name people by first name when the sender is recognisable.
- Don't list every email. Highlight 1-3 notable ones and give a count for the rest.
- For Linear, only mention issues assigned to me that are in progress or due within 3 days.
- For GitHub, only mention PR reviews requested of me and @-mentions. Skip bot notifications.
- Keep the whole briefing under 700 characters when possible. WhatsApp messages should fit on one screen.

## Calendar reminder format

One line, plain text:

```
Meeting in 15 min: Design review with Sarah (Zoom link in calendar)
```

Include location or video call platform if present. No greeting, no sign-off.
