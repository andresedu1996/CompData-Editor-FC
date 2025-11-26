# CompData-Editor-FC

Lightweight editor to view and edit FIFA/FC CompData JSON files. This project builds on the foundation created by Scyppan and Eshortx and focuses on improving the base with a cleaner UI and workflow and a set of practical features.

## Goals
- Improve the base UX/UI and navigation.
- Provide commonly used workflow features missing from the original tools.
- Keep edits safe and exportable back to compdata JSON.

## Key features
- Improved competitions hierarchy UI and quick editing ([`organizeCompetitions`](leftpanel.js), [leftpanel.js](leftpanel.js)).
- Competition cloning and inline editing in the competitions panel ([`createCompetitionsListDiv`](competitionswindow.js), [competitionswindow.js](competitionswindow.js)).
- Init teams integrated into competition edit flows ([`createInitTeamsDiv`](initteamswindow.js), [initteamswindow.js](initteamswindow.js); export via [`initteamsToTxt`](output.js), [output.js](output.js)).
- Calendar / schedule generation with configurable rules and automatic round/match calculations ([`generateAutoSchedule`](schedulewindow.js), [schedulewindow.js](schedulewindow.js)).
- Settings editor with many common compdata tags exposed ([`createSettingsDiv`](settingswindow.js), [settingswindow.js](settingswindow.js)).
- Export/download tool for saved JSON/ZIP ([`download`](output.js), [output.js](output.js)).
- Uses the provided example dataset: [practicefile.json](practicefile.json).
- Frontend served locally via [local.html](local.html) and styled with [style.css](style.css).

## Quick start
1. Open `local.html` in a modern browser: [local.html](local.html)  
2. Click the file upload control and select your combined JSON (e.g. produced with scyppan/json-maker): [practicefile.json](practicefile.json)  
   - File loading and parsing handled in [`main.js`](main.js).
3. Browse competitions in the left panel, edit settings, clone competitions, manage init teams, or generate schedules.
4. Use the Download button to export changes (`download()` in [output.js](output.js)).

## Notes & Credits
- This project intends to improve the base work by Scyppan and Eshortx by adding UI/UX refinements and features such as competition cloning, integrated init teams editing, and calendar generation.
- Inspect relevant implementation points for features in:

Contributions and bug reports are welcome.