---
name: google
description: "Manages Google Workspace via the google MCP server: calendar events and Gmail (including drafts). Uses OAuth. Use when the user mentions Google Calendar, Gmail, email, drafts, or Google Workspace."
version: 3.0.0
author: mblode
license: MIT
metadata:
  hermes:
    category: productivity
    tags: [google, calendar, gmail, workspace, drafts]
    platforms: [linux]
---

# Google Workspace

The `google` MCP server (`@a-bonus/google-docs-mcp`) provides access to Gmail and Google Calendar via the Gmail API and Calendar API with OAuth.

## Gmail

| Tool | Purpose |
|------|---------|
| `listMessages` | List emails with search (unread, from, subject) |
| `getMessage` | Read a specific email by ID |
| `sendEmail` | Send an email |
| `createDraft` | Create a draft email (saved to Drafts) |
| `sendDraft` | Send an existing draft |
| `updateDraft` | Modify a draft before sending |
| `listDrafts` | List all drafts |
| `trashMessage` | Move an email to trash |
| `modifyMessageLabels` | Add or remove labels (archive, star, etc.) |
| `listLabels` | List all Gmail labels |
| `triageInbox` | Triage inbox messages |

## Google Calendar

| Tool | Purpose |
|------|---------|
| `listEvents` | List upcoming events with time range |
| `createEvent` | Create a calendar event |
| `deleteEvent` | Delete a calendar event |
| `updateEvent` | Update an existing event |
| `quickAddEvent` | Create an event from natural language |

## Setup

OAuth — one-time browser consent, then headless:

1. Create a Google Cloud project at https://console.cloud.google.com
2. Enable Gmail API and Google Calendar API
3. Create OAuth 2.0 credentials (Desktop app type)
4. Run locally: `GOOGLE_CLIENT_ID="..." GOOGLE_CLIENT_SECRET="..." npx -y @a-bonus/google-docs-mcp auth`
5. Copy the generated token to `/opt/data/google-mcp-token.json` on Railway

Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` env vars.

## Routing

| User says | Action |
|-----------|--------|
| "check my email" | `listMessages` recent messages |
| "read that email from Sarah" | `listMessages` to find, then `getMessage` |
| "send an email to X" | `sendEmail` |
| "draft a reply to X" | `createDraft` |
| "send that draft" | `sendDraft` |
| "any calendar events today" | `listEvents` with today's range |
| "schedule a meeting" | `createEvent` |
| "archive that email" | `modifyMessageLabels` (remove INBOX label) |
