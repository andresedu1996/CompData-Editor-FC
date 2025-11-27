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
- Tournament export/import with full subtree remapping across compobj, settings, tasks, schedule, advancement, standings, objectives, and initteams ([`exportTournament`/`importTournamentPackage`](output.js), panel in [`createTournamentTransferDiv`](competitionswindow.js)).
- Add-stage/add-group now inserts using the next local ID and shifts following items/references to stay contiguous ([`createNewCompObj`](compobj.js)).
- Task management improvements: clone last setting, per-row delete, typeahead tags; tasks now support inline reordering (▲/▼) and safe deletion ([settingswindow.js], [`createTaskSection`/`moveTask`](taskswindow.js)).
- Hierarchy UI polish: chevron toggles, padded alignment, pill download button, and hover fixes ([leftpanel.js], [style.css], [local.html]).
- Uses the provided example dataset: [practicefile.json](practicefile.json).
- Frontend served locally via [local.html](local.html) and styled with [style.css](style.css).

## Quick start
1. Open the landing page: [index.html](index.html)  
   - Comp Editor: [local.html](local.html)  
   - JSON Maker (modified): [jsonmaker/local.html](jsonmaker/local.html)  
2. Click the file upload control and select your combined JSON (e.g. produced with scyppan/json-maker): [practicefile.json](practicefile.json)  
   - File loading and parsing handled in [`main.js`](main.js).
3. Browse competitions in the left panel, edit settings, clone competitions, manage init teams, or generate schedules.
4. Use the Download button to export changes (`download()` in [output.js](output.js)).

## Hosting (free)
- GitHub Pages: push this repo to GitHub, then enable Pages (Settings → Pages → Source: `main`/`master`, root). Access via `https://<username>.github.io/<repo>/`.
- Netlify/Vercel: drop the repo or the built static files (index.html, local.html, jsonmaker/local.html, assets) into a new project; no server needed.
- Any static host works—the tools are entirely client-side.

## Notes & Credits
- This project intends to improve the base work by Scyppan and Eshortx by adding UI/UX refinements and features such as competition cloning, integrated init teams editing, and calendar generation.
- Inspect relevant implementation points for features in:

Contributions and bug reports are welcome.
