# Next Phase Implemented — Dopamine Polish, Team Invites, and Patch Announcements

This update focuses on making FounderOS feel more alive while fixing the team invite flow.

## Team invite acceptance

When a user accepts a workspace invite from Notifications, the app now adds them to the inviter’s workspace through `workspace_members` while keeping their own workspace separate. Their own workspace is not replaced or deleted, and the joined workspace becomes available in the workspace switcher.

The inviter also receives a notification when the invite is accepted. The Team tab now loads members from the active workspace instead of relying only on local browser placeholders.

## Patch announcements

A new patch announcement notification type was added so product updates can show up in the Notifications tab. Users can turn these off in Settings under Preferences with the new Patch announcements toggle.

## Settings update

The `user_settings` table now supports a `patch_announcements` boolean preference. This lets each user control whether product update announcements appear.

## Dopamine / polish direction

The app already has global hover, glow, and card feedback. This phase keeps leaning into that direction so future updates can add unlock animations, badge reveal moments, motion transitions, and more premium feedback loops.

## Database changes

Run the updated `supabase_founderos_upgrade.sql` to add:

- `user_settings.patch_announcements`
- unique team member workspace/user index
- team member visibility policies
- team member self-insert policy
