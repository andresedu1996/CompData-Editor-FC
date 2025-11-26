function updateScheduleData(entry, key, value) {

    if (entry) {
        switch (key) {
            case 'day':
                entry.day = parseInt(value);
                break;
            case 'min':
                entry.min = parseInt(value);
                break;
            case 'max':
                entry.max = parseInt(value);
                break;
            case 'time':
                entry.time = parseInt(value);
                break;
            default:
                console.error(`Unknown key: ${key}`);
                return;
        }
    } else {
        console.error(`Schedule entry not found for id ${id}`);
    }
}

function deleteScheduleData(id, day, min, max, time) {
    // Find the index of the relevant schedule entry that matches all the provided parameters
    const index = data['schedule'].findIndex(item =>
        parseInt(item.id) === parseInt(id) &&
        parseInt(item.day) === parseInt(day) &&
        parseInt(item.min) === parseInt(min) &&
        parseInt(item.max) === parseInt(max) &&
        parseInt(item.time) === parseInt(time)
    );

    if (index !== -1) {
        data['schedule'].splice(index, 1);
    } else {
        console.error(`Schedule entry not found for id ${id}, day ${day}, min ${min}, max ${max}, time ${time}.`);
    }
}

// Bootstrap icon snippets (inline SVG so we don't rely on external assets)
function bootstrapIcon(name) {
    const base = 'width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false"';
    switch (name) {
        case 'plus':
            return `<svg ${base} class="bi bi-plus-lg"><path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/></svg>`;
        case 'dash':
            return `<svg ${base} class="bi bi-dash-lg"><path d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8Z"/></svg>`;
        case 'plus-circle':
            return `<svg ${base} class="bi bi-plus-circle"><path d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16Z"/><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4Z"/></svg>`;
        case 'trash':
            return `<svg ${base} class="bi bi-trash"><path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5v-8z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9.5A1.5 1.5 0 0 1 11.5 15h-7A1.5 1.5 0 0 1 3 13.5V4h-.5a1 1 0 0 1 0-2h3.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4 4v9.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V4H4z"/></svg>`;
        default:
            return '';
    }
}

function createIconButton(iconName, classNames, title, onClick, text) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = classNames;
    button.title = title;
    const label = text ? `<span>${text}</span>` : '';
    button.innerHTML = `${bootstrapIcon(iconName)}${label}`;
    if (onClick) {
        button.addEventListener('click', onClick);
    }
    return button;
}

function addNewRound(id) {
    const newRoundNumber = getNextRoundNumber(id);
    const newRoundData = {
        id: id,
        day: 1,  // Default day
        round: newRoundNumber,
        min: 0,  // Default min
        max: 0,  // Default max
        time: 1200  // Default time
    };

    // Ensure the schedule array exists
    if (!data['schedule']) data['schedule'] = [];

    // Add the new entry to the schedule data
    data['schedule'].push(newRoundData);

    // Get the schedule div in the DOM
    const scheduleDiv = document.getElementById('schedule');
    if (!scheduleDiv) {
        console.error('Schedule div not found.');
        return;
    }

    // Create the new round wrapper for this round
    const newRoundWrapper = createRoundWrapper(id, newRoundData);

    // Create the new table with the first row
    const table = createTable(id, newRoundNumber, [newRoundData]);

    // Append the table to the new round wrapper
    newRoundWrapper.appendChild(table);

    // Insert the new round wrapper as the penultimate child
    const childrenCount = scheduleDiv.children.length;
    if (childrenCount > 0) {
        // Insert the new round wrapper before the last child (which is the "New Round" control)
        scheduleDiv.insertBefore(newRoundWrapper, scheduleDiv.children[childrenCount - 1]);
    } else {
        // If there are no children, append the new round wrapper as the first child
        scheduleDiv.appendChild(newRoundWrapper);
    }

    // Reorder the rounds for the specified competition id to be sequential starting from 1
    reorderRounds(id);
}

function getNextRoundNumber(id) {
    // Get all schedule entries for this competition id
    const scheduleData = getDataForId('schedule', id);

    // Extract the round numbers from the schedule data
    const existingRounds = scheduleData.map(entry => entry.round);

    // If there are no rounds yet, start from 1
    return existingRounds.length > 0 ? Math.max(...existingRounds) + 1 : 1;
}

function removeRound(id, round, wrapper) {
    console.log(`Removing round ${round} for id ${id}`);

    // Remove the entries in the schedule data
    data['schedule'] = data['schedule'].filter(entry => {
        if (entry.id === id && entry.round === round) {
            console.log('Removing entry:', entry);
            return false; // Exclude this entry
        }
        return true; // Keep other entries
    });

    // Remove the table (round) from the DOM
    wrapper.remove();

    // Reorder the rounds for the remaining entries
    reorderRounds(id);
}

function reorderRounds(id) {
    sortSchedules();
    const scheduleData = data['schedule'].filter(entry => entry.id === id);

    // Get all unique rounds sorted in ascending order
    const uniqueRounds = [...new Set(scheduleData.map(entry => entry.round))].sort((a, b) => a - b);

    // Reassign round numbers to be sequential starting from 1
    uniqueRounds.forEach((oldRound, index) => {
        const newRound = index + 1; // New round number
        scheduleData.forEach(entry => {
            if (entry.round === oldRound) {
                entry.round = newRound;
            }
        });
    });

    // Update the DOM to reflect the reordered round numbers
    let rounds = document.getElementsByClassName('schedule-round');

    for (let i = 0; i < rounds.length; i++) {
        // Update the dataset.round attribute
        rounds[i].dataset.round = i + 1;

        // Update the displayed round number in the header
        rounds[i].children[0].childNodes[0].textContent = `Round ${i + 1}`;
    }
}

function addNewEntryToRound(id, round) {
    const newEntry = {
        id: id,
        round: round,
        day: 1,  // Default values
        min: 0,
        max: 0,
        time: 0
    };

    // Ensure the schedule array exists
    if (!data['schedule']) data['schedule'] = [];

    // Add to the global schedule data
    data['schedule'].push(newEntry);

    // Find the appropriate table by round
    const table = document.querySelector(`#schedule-table-round-${round} tbody`);
    if (table) {
        // Append a new row to the table
        table.appendChild(createScheduleRow(newEntry));
    } else {
        console.error('Could not find table for round:', round);
    }
}

function createRoundWrapper(id, roundData) {
    const roundNumber = roundData.round; // Get the round number from the data

    // Create the wrapper div for this round
    const newRoundWrapper = document.createElement('div');
    newRoundWrapper.id = `schedule-table-round-${roundNumber}`;
    newRoundWrapper.classList.add('schedule-round');
    newRoundWrapper.dataset.round = roundNumber;

    // Create the header with controls
    const headerWithControls = createHeaderWithControls(
        roundNumber,
        () => addNewEntryToRound(id, roundNumber),
        () => removeRound(id, roundNumber, newRoundWrapper)
    );

    newRoundWrapper.appendChild(headerWithControls);

    return newRoundWrapper;
}

// Helper function to create a table row
function createTableRow(entry, keys) {
    const row = document.createElement('tr');
    row.dataset.id = entry.id;

    keys.forEach(key => {
        const { cell, input } = createTableCellWithInput('number', entry[key], key);
        row.appendChild(cell);

        input.addEventListener('change', function () {
            if (key === 'day' && input.value === '') {
                // If the "day" input is deleted, remove the row and entry
                const tbody = row.parentNode;
                tbody.removeChild(row);
                deleteScheduleData(entry.id, entry.day, entry.min, entry.max, entry.time);
            } else {
                updateScheduleData(entry, key, input.value);
                entry[key] = parseInt(input.value);  // Update the local variable to reflect the change
                sortSchedules();
            }
        });
    });

    return row;
}

// Helper function to create a table cell with an input
function createTableCellWithInput(type, value, key) {
    const cell = document.createElement('td');
    const input = document.createElement('input');
    input.type = type;
    input.value = value !== undefined ? value : '';
    input.classList.add('tablevalue-input');
    input.dataset.key = key;
    input.dataset.context = 'schedule';
    cell.appendChild(input);
    return { cell, input };
}

// Helper function to create a header with controls
function createHeaderWithControls(roundNumber, addEntryCallback, removeRoundCallback) {
    const roundHeader = document.createElement('h3');
    roundHeader.textContent = `Round ${roundNumber}`;

    const roundControls = document.createElement('div');
    roundControls.classList.add('round-controls');

    const addEntryBtn = createIconButton(
        'plus',
        'entry-control icon-btn',
        `Add Entry to Round ${roundNumber}`,
        addEntryCallback
    );

    const removeRoundBtn = createIconButton(
        'trash',
        'round-control icon-btn',
        `Remove Round ${roundNumber}`,
        removeRoundCallback
    );

    roundControls.appendChild(addEntryBtn);
    roundControls.appendChild(removeRoundBtn);

    roundHeader.appendChild(roundControls);

    return roundHeader;
}

// Helper function to create a table for a specific round with schedule data
function createTable(id, roundNumber, roundData) {
    const table = document.createElement('table');
    table.classList.add('window-tables', 'groupedtables');
    table.id = `schedule-table-round-${roundNumber}`;
    table.dataset.round = roundNumber;

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    ['Day', 'Min', 'Max', 'Time'].forEach(title => {
        const th = document.createElement('th');
        th.textContent = title;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    roundData.forEach(entry => {
        tbody.appendChild(createTableRow(entry, ['day', 'min', 'max', 'time']));
    });
    table.appendChild(tbody);

    return table;
}

// Helper function to create a schedule row
function createScheduleRow(entry) {
    return createTableRow(entry, ['day', 'min', 'max', 'time']);
}

// Helper function to create a header div with given text
function createDivHeader(text) {
    const header = document.createElement('h2');
    header.textContent = text;
    return header;
}

function handleEmptySchedule(div, id) {
    // Create a paragraph to indicate no schedules
    const scheduleParagraph = document.createElement('p');
    scheduleParagraph.textContent = 'No schedules';
    scheduleParagraph.style.fontSize = "12px";
    div.appendChild(scheduleParagraph);

    const createButton = createButtonWithClickHandler(
        'Create Schedule Data for Round 1',
        () => {
            addNewRound(id);
            const newDiv = createScheduleDiv(id);
            div.innerHTML = ''; // Clear the current content
            div.appendChild(newDiv); // Append the newly created content
        }
    );

    div.appendChild(createButton);
}

// Helper function to group schedule data by round
function groupScheduleDataByRound(scheduleData) {
    return scheduleData.reduce((acc, entry) => {
        if (!acc[entry.round]) {
            acc[entry.round] = [];
        }
        acc[entry.round].push(entry);
        return acc;
    }, {});
}

// Helper function to create a control for adding new rounds
function createAddRoundControl(callback) {
    return createIconButton('plus-circle', 'add-round-btn icon-btn', 'Add new round', callback, 'New Round');
}

// Helper to create buttons with a click handler
function createButtonWithClickHandler(text, clickHandler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.classList.add('primary-btn');
    button.addEventListener('click', clickHandler);
    return button;
}

function createScheduleDiv(id) {
    const div = document.createElement('div');
    div.id = 'schedule';
    div.classList.add('level-content', 'standard-div');

    const header = createDivHeader(`Schedule - ${getRoundData(id)}`);
    div.appendChild(header);

    // Toolbar: auto-generator button
    const toolbar = document.createElement('div');
    toolbar.classList.add('schedule-toolbar');

    const generateBtn = document.createElement('button');
    generateBtn.type = 'button';
    generateBtn.textContent = 'Auto-generate schedule';
    generateBtn.classList.add('primary-btn');
    generateBtn.addEventListener('click', () => openScheduleGeneratorModal(id));
    toolbar.appendChild(generateBtn);

    div.appendChild(toolbar);

    const scheduleData = getDataForId('schedule', id);

    if (scheduleData.length === 0) {
        handleEmptySchedule(div, id);
        return div;
    }

    const groupedSchedule = groupScheduleDataByRound(scheduleData);

    Object.values(groupedSchedule).forEach((roundData, index) => {
        const roundWrapper = createRoundWrapper(id, roundData[0]);
        div.appendChild(roundWrapper);

        const table = createTable(id, index + 1, roundData);
        roundWrapper.appendChild(table);
    });

    const addRoundDiv = createAddRoundControl(() => addNewRound(id));
    div.appendChild(addRoundDiv);

    return div;
}

function sortSchedules() {
    data['schedule'].sort((a, b) => {
        if (a.id !== b.id) {
            return a.id - b.id;  // Sort by id first
        } else if (a.round !== b.round) {
            return a.round - b.round;  // Then by round
        } else if (a.day !== b.day) {
            return a.day - b.day;  // Then by day
        } else {
            return a.time - b.time;  // Finally by time
        }
    });
}

// =========================================
// 🔧 Helpers for schedule generation
// =========================================

function dayOfYearFromDate(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

function getNationLineForCompetition(compLine) {
    let node = data['compobj'].find(c => c.line === compLine);
    if (!node) return null;

    while (node && node.level > 2) {
        node = data['compobj'].find(c => c.line === node.parent);
    }
    return node ? node.line : null;
}

function getCompLinesInNation(nationLine) {
    if (nationLine == null) return [];

    const result = [];
    data['compobj'].forEach(comp => {
        let node = comp;
        while (node && node.level > 2) {
            node = data['compobj'].find(c => c.line === node.parent);
        }
        if (node && node.line === nationLine) {
            result.push(comp.line);
        }
    });
    return result;
}

// =========================================
// 🧮 Core generator
// =========================================

function generateAutoSchedule(compLine, config) {
    let {
        year,
        type,
        numTeams,
        rounds,
        matchesPerRound,
        startMonth,
        endMonth,
        breakMonths,
        weekendOnly,
        avoidClashes,
        clearExisting
    } = config;

    // Auto-calc rounds & matches for leagues if not provided
    if (type === 'League' && numTeams > 1) {
        if (!rounds || rounds <= 0) {
            rounds = (numTeams - 1) * 2; // home & away
        }
        if (!matchesPerRound || matchesPerRound <= 0) {
            matchesPerRound = Math.floor(numTeams / 2);
        }
    }

    if (!rounds || !matchesPerRound) {
        alert('Please enter a valid number of teams / rounds / matches per round.');
        return;
    }

    if (!data['schedule']) data['schedule'] = [];

    // Optionally clear existing schedule for this competition
    if (clearExisting) {
        data['schedule'] = data['schedule'].filter(entry => entry.id !== compLine);
    }

    // Build list of allowed dates
    const allowedDates = [];
    const startDate = new Date(year, startMonth - 1, 1);
    const endDate = new Date(year, endMonth, 0); // last day of end month

    const breakSet = new Set(
        breakMonths
            .map(m => parseInt(m.trim(), 10))
            .filter(m => !isNaN(m))
    );

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const month = d.getMonth() + 1;
        const dayOfWeek = d.getDay(); // Sun=0, Sat=6

        if (breakSet.has(month)) continue; // skip break months

        if (type === 'League' && weekendOnly) {
            // weekend focus for leagues
            if (!(dayOfWeek === 0 || dayOfWeek === 6)) {
                continue; // only weekends
            }
        }

        allowedDates.push(new Date(d.getTime()));
    }

    if (allowedDates.length === 0) {
        alert('No available dates in the selected range.');
        return;
    }

    // For clash avoidance, build a set of (day,time) used by other comps in same nation
    let clashSet = new Set();
    if (avoidClashes) {
        const nationLine = getNationLineForCompetition(compLine);
        const compLinesInNation = getCompLinesInNation(nationLine);

        data['schedule'].forEach(entry => {
            if (entry.id === compLine) return;
            if (!compLinesInNation.includes(entry.id)) return;

            const key = entry.day + ':' + (entry.time || 0);
            clashSet.add(key);
        });
    }

    // Default times we’ll use for generated matches
    const defaultTimes = [1755, 2000];  // general slots
    const finalRunTimes = [2000];       // last 3 rounds all same time

    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const MIN_DAYS_BETWEEN_ROUNDS = 5;

    const newEntries = [];
    let dateIndex = 0;
    let lastRoundDate = null;

    for (let round = 1; round <= rounds; round++) {

        // Ensure minimum spacing between rounds (5+ days)
        if (lastRoundDate) {
            while (dateIndex < allowedDates.length) {
                const diffDays = Math.floor(
                    (allowedDates[dateIndex] - lastRoundDate) / MS_PER_DAY
                );
                if (diffDays >= MIN_DAYS_BETWEEN_ROUNDS) break;
                dateIndex++;
            }
        }

        if (dateIndex >= allowedDates.length) break;

        // Decide which times to use for this round
        const isFinalRunIn = (type === 'League') && rounds >= 3 && (round > rounds - 3);
        const timesThisRound = isFinalRunIn ? finalRunTimes : defaultTimes;

        let chosenDate = allowedDates[dateIndex];

        // Adjust to avoid clash if needed
        if (avoidClashes) {
            let attempts = 0;
            while (attempts < allowedDates.length) {
                const dayTmp = dayOfYearFromDate(chosenDate);
                const hasClash = timesThisRound.some(time =>
                    clashSet.has(dayTmp + ':' + time)
                );
                if (!hasClash) break;

                // try next allowed date
                dateIndex++;
                if (dateIndex >= allowedDates.length) break;
                chosenDate = allowedDates[dateIndex];
                attempts++;
            }
            if (dateIndex >= allowedDates.length) break;
        }

        const day = dayOfYearFromDate(chosenDate);

        // Add entries for this round
        timesThisRound.forEach(time => {
            newEntries.push({
                id: compLine,
                round,
                day,
                min: 1,
                max: matchesPerRound,
                time
            });

            if (avoidClashes) {
                clashSet.add(day + ':' + time);
            }
        });

        lastRoundDate = chosenDate;
        dateIndex++;
    }

    if (newEntries.length === 0) {
        alert('Could not generate any schedule entries with the current settings.');
        return;
    }

    data['schedule'] = data['schedule'].concat(newEntries);

    // Sort + refresh UI
    if (typeof sortSchedules === 'function') {
        sortSchedules();
    }

    if (typeof populateWindow === 'function') {
        const mainHeader = document.getElementById('mainheader');
        let id, level;

        if (mainHeader && mainHeader.dataset && mainHeader.dataset.id) {
            // Use the window that’s currently open
            id = parseInt(mainHeader.dataset.id, 10);
            level = mainHeader.dataset.level
                ? parseInt(mainHeader.dataset.level, 10)
                : 5; // default to round window
        } else {
            // Fallback: derive from compobj
            const comp = data['compobj'].find(c => c.line === compLine);
            id = comp ? comp.line : compLine;
            level = comp ? comp.level : 5;
        }

        populateWindow(level, id);
    }
}

// =========================================
// 🪟 Modal for user options
// =========================================

function openScheduleGeneratorModal(compLine) {
    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = '0';
    backdrop.style.right = '0';
    backdrop.style.bottom = '0';
    backdrop.style.backgroundColor = 'rgba(0,0,0,0.5)';
    backdrop.style.display = 'flex';
    backdrop.style.alignItems = 'center';
    backdrop.style.justifyContent = 'center';
    backdrop.style.zIndex = '10000';

    // Modal
    const modal = document.createElement('div');
    modal.style.background = '#020617';
    modal.style.border = '1px solid #1f2937';
    modal.style.borderRadius = '0.75rem';
    modal.style.padding = '1rem';
    modal.style.minWidth = '320px';
    modal.style.maxWidth = '420px';
    modal.style.color = '#e5e7eb';
    modal.style.boxShadow = '0 18px 45px rgba(0,0,0,0.85)';

    const title = document.createElement('h3');
    title.textContent = 'Generate schedule';
    title.style.marginBottom = '0.5rem';
    modal.appendChild(title);

    const form = document.createElement('div');
    form.style.display = 'grid';
    form.style.gridTemplateColumns = '1fr 1fr';
    form.style.gap = '0.5rem 0.75rem';

    function addLabel(text, forId) {
        const label = document.createElement('label');
        label.textContent = text;
        label.htmlFor = forId;
        label.style.fontSize = '0.75rem';
        label.style.color = '#94a3b8';
        return label;
    }

    function addInput(id, type, defaultValue) {
        const input = document.createElement('input');
        input.id = id;
        input.type = type;
        input.value = defaultValue;
        input.style.width = '100%';
        return input;
    }

    function addSelect(id, options) {
        const select = document.createElement('select');
        select.id = id;
        options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt.value;
            o.textContent = opt.label;
            select.appendChild(o);
        });
        select.style.width = '100%';
        return select;
    }

    // Type
    form.appendChild(addLabel('Type', 'sched-type'));
    const typeSelect = addSelect('sched-type', [
        { value: 'League', label: 'League' },
        { value: 'Cup',    label: 'Cup' }
    ]);
    form.appendChild(typeSelect);

    // Year
    const currentYear = new Date().getFullYear();
    form.appendChild(addLabel('Year', 'sched-year'));
    const yearInput = addInput('sched-year', 'number', currentYear);
    form.appendChild(yearInput);

    // Teams
    form.appendChild(addLabel('Teams', 'sched-teams'));
    const teamsInput = addInput('sched-teams', 'number', 20);
    form.appendChild(teamsInput);

    // Rounds (optional – auto if blank for leagues)
    form.appendChild(addLabel('Rounds', 'sched-rounds'));
    const roundsInput = addInput('sched-rounds', 'number', 0);
    form.appendChild(roundsInput);

    // Matches per round (optional – auto from teams)
    form.appendChild(addLabel('Matches / round', 'sched-matches'));
    const matchesInput = addInput('sched-matches', 'number', 0);
    form.appendChild(matchesInput);

    // Start month
    form.appendChild(addLabel('Start month', 'sched-start-month'));
    const startMonthSelect = addSelect('sched-start-month', [
        { value: 1,  label: 'Jan' }, { value: 2,  label: 'Feb' },
        { value: 3,  label: 'Mar' }, { value: 4,  label: 'Apr' },
        { value: 5,  label: 'May' }, { value: 6,  label: 'Jun' },
        { value: 7,  label: 'Jul' }, { value: 8,  label: 'Aug' },
        { value: 9,  label: 'Sep' }, { value: 10, label: 'Oct' },
        { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
    ]);
    startMonthSelect.value = 8;
    form.appendChild(startMonthSelect);

    // End month
    form.appendChild(addLabel('End month', 'sched-end-month'));
    const endMonthSelect = addSelect('sched-end-month', [
        { value: 1,  label: 'Jan' }, { value: 2,  label: 'Feb' },
        { value: 3,  label: 'Mar' }, { value: 4,  label: 'Apr' },
        { value: 5,  label: 'May' }, { value: 6,  label: 'Jun' },
        { value: 7,  label: 'Jul' }, { value: 8,  label: 'Aug' },
        { value: 9,  label: 'Sep' }, { value: 10, label: 'Oct' },
        { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
    ]);
    endMonthSelect.value = 5;
    form.appendChild(endMonthSelect);

    // Break months
    form.appendChild(addLabel('Break months (comma)', 'sched-breaks'));
    const breaksInput = addInput('sched-breaks', 'text', '1');
    form.appendChild(breaksInput);

    // Weekend only checkbox (mostly for leagues)
    const weekendLabel = document.createElement('label');
    weekendLabel.style.fontSize = '0.75rem';
    weekendLabel.style.color = '#94a3b8';
    const weekendCheckbox = document.createElement('input');
    weekendCheckbox.type = 'checkbox';
    weekendCheckbox.id = 'sched-weekend';
    weekendCheckbox.checked = true;
    weekendLabel.appendChild(weekendCheckbox);
    weekendLabel.appendChild(document.createTextNode(' Weekend focus (league)'));
    form.appendChild(weekendLabel);
    form.appendChild(document.createElement('span'));

    // Avoid clashes
    const clashLabel = document.createElement('label');
    clashLabel.style.fontSize = '0.75rem';
    clashLabel.style.color = '#94a3b8';
    const clashCheckbox = document.createElement('input');
    clashCheckbox.type = 'checkbox';
    clashCheckbox.id = 'sched-clash';
    clashCheckbox.checked = true;
    clashLabel.appendChild(clashCheckbox);
    clashLabel.appendChild(document.createTextNode(' Avoid clashes (same nation)'));
    form.appendChild(clashLabel);
    form.appendChild(document.createElement('span'));

    // Clear existing
    const clearLabel = document.createElement('label');
    clearLabel.style.fontSize = '0.75rem';
    clearLabel.style.color = '#94a3b8';
    const clearCheckbox = document.createElement('input');
    clearCheckbox.type = 'checkbox';
    clearCheckbox.id = 'sched-clear';
    clearCheckbox.checked = false;
    clearLabel.appendChild(clearCheckbox);
    clearLabel.appendChild(document.createTextNode(' Clear existing schedule'));
    form.appendChild(clearLabel);
    form.appendChild(document.createElement('span'));

    modal.appendChild(form);

    // Buttons
    const buttonBar = document.createElement('div');
    buttonBar.style.display = 'flex';
    buttonBar.style.justifyContent = 'flex-end';
    buttonBar.style.gap = '0.5rem';
    buttonBar.style.marginTop = '0.8rem';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(backdrop);
    });

    const generateBtn = document.createElement('button');
    generateBtn.type = 'button';
    generateBtn.textContent = 'Generate';
    generateBtn.addEventListener('click', () => {
        const config = {
            year: parseInt(yearInput.value, 10) || currentYear,
            type: typeSelect.value,
            numTeams: parseInt(teamsInput.value, 10) || 0,
            rounds: parseInt(roundsInput.value, 10) || 0,
            matchesPerRound: parseInt(matchesInput.value, 10) || 0,
            startMonth: parseInt(startMonthSelect.value, 10),
            endMonth: parseInt(endMonthSelect.value, 10),
            breakMonths: breaksInput.value.split(','),
            weekendOnly: weekendCheckbox.checked,
            avoidClashes: clashCheckbox.checked,
            clearExisting: clearCheckbox.checked
        };

        generateAutoSchedule(compLine, config);
        document.body.removeChild(backdrop);
    });

    buttonBar.appendChild(cancelBtn);
    buttonBar.appendChild(generateBtn);
    modal.appendChild(buttonBar);

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
}
