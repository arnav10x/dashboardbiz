# Phase 13 Implemented

Fixed the remaining deadends from the last working Phase 12 build:

- Removed the Calendar Day tab so Schedule Calendar only uses Week, Month, and Agenda.
- Add Event now includes a date picker, so users can choose the exact event date instead of only using today's date.
- Schedule Calendar Month view fetches and displays the current selected month instead of only the current week.
- Pipeline filters now apply to the board and table, close after selection, and include a visible filter status bar.
- Pipeline search is now global in the top controls, not hidden only inside the table.
- Pipeline view toggle now actually switches between Board and Table instead of showing both at once.
- Pipeline Columns button still controls visible table columns.
- Profile photo upload now saves immediately to local storage and user profile data, so it persists when switching pages.
- Team tab now loads and displays the profile picture for the current user and invited users when available.
- Team chat and thread replies now include the current user's profile picture.
- Overview Monthly Target circle and percent text are green.
- Achievements rows now have hover states.
- Rank cards now have hover preview styling and show each rank's full badge design on hover.

TypeScript check passed with `npx tsc --noEmit --pretty false`.
