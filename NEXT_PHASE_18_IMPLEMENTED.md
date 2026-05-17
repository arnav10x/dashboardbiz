# Phase 18 — Mobile, Automation, and Real-Time Collaboration

This phase adds the next major operating-system layer focused on mobile usage, sticky automations, and team collaboration.

## Mobile optimization
- Added a stronger mobile bottom navigation with a swipe-down More drawer.
- Added quick mobile access to Calendar, Team, Achievements, and Settings.
- Added global mobile utility classes for responsive stacks, horizontal card strips, touch-friendly targets, and swipeable kanban/calendar areas.
- Optimized Pipeline, Calendar, and Team layouts for phones with horizontal card strips, swipeable kanban columns, mobile-safe padding, and touch-first controls.

## Automation system
- Added `/api/founderos/automations/run`.
- Added `AutomationRunner` to the dashboard layout so automations run automatically on a safe interval instead of needing a manual button.
- Added auto follow-up tasks for stale or overdue pipeline leads.
- Added overdue task reminders.
- Added recurring task groundwork with `daily`, `weekly`, and `monthly` recurrence support.
- Added smart notifications when automations create tasks or detect risk.
- Added automation metadata so duplicate tasks are not blindly created.

## Real-time collaboration
- Added `RealtimeCollaborationLayer` to subscribe to workspace-level live updates.
- Added real-time event hooks for tasks, pipeline leads, activity events, and typing indicators.
- Added typing indicator broadcast support for the Team chat.
- Added collaborative notes API at `/api/founderos/collaboration/notes`.
- Added shared Notes tab inside Team.
- Added activity logging when team notes are updated.

## Database additions
- Added workspace/due date/recurrence/source/automation metadata fields to tasks.
- Added workspace/owner/last contacted/priority/tags/close probability fields to pipeline leads.
- Added workspace_id to activity events.
- Added `collaboration_notes` table with workspace collaborator RLS policies.

## Goal
FounderOS now moves closer to a daily operating system: it works better on phones, creates useful follow-up work automatically, alerts users when work is slipping, and gives teams live shared workspace behavior.
