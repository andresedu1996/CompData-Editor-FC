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

    if (!data['schedule']) data['schedule'] = [];
    data['schedule'].push(newRoundData);

    const scheduleDiv = document.getElementById('schedule');
    if (!scheduleDiv) {
        console.error('Schedule div not found.');
        return;
    }

    const newRoundWrapper = createRoundWrapper(id, newRoundData);
    const table = createTable(id, newRoundNumber, [newRoundData]);
    newRoundWrapper.appendChild(table);

    const childrenCount = scheduleDiv.children.length;
    if (childrenCount > 0) {
        scheduleDiv.insertBefore(newRoundWrapper, scheduleDiv.children[childrenCount - 1]);
    } else {
        scheduleDiv.appendChild(newRoundWrapper);
    }

    reorderRounds(id);
}

function getNextRoundNumber(id) {
    const scheduleData = getDataForId('schedule', id);
    const existingRounds = scheduleData.map(entry => entry.round);
    return existingRounds.length > 0 ? Math.max(...existingRounds) + 1 : 1;
}

function removeRound(id, round, wrapper) {
    console.log(`Removing round ${round} for id ${id}`);

    data['schedule'] = data['schedule'].filter(entry => {
        if (entry.id === id && entry.round === round) {
            console.log('Removing entry:', entry);
            return false;
        }
        return true;
    });

    wrapper.remove();
    reorderRounds(id);
}

function reorderRounds(id) {
    sortSchedules();
    const scheduleData = data['schedule'].filter(entry => entry.id === id);

    const uniqueRounds = [...new Set(scheduleData.map(entry => entry.round))].sort((a, b) => a - b);

    uniqueRounds.forEach((oldRound, index) => {
        const newRound = index + 1;
        scheduleData.forEach(entry => {
            if (entry.round === oldRound) {
                entry.round = newRound;
            }
        });
    });

    let rounds = document.getElementsByClassName('schedule-round');

    for (let i = 0; i < rounds.length; i++) {
        rounds[i].dataset.round = i + 1;
        rounds[i].children[0].childNodes[0].textContent = `Round ${i + 1}`;
    }
}

function addNewEntryToRound(id, round) {
    const newEntry = {
        id: id,
        round: round,
        day: 1,
        min: 0,
        max: 0,
        time: 0
    };

    if (!data['schedule']) data['schedule'] = [];
    data['schedule'].push(newEntry);

    const table = document.querySelector(`#schedule-table-round-${round} tbody`);
    if (table) {
        table.appendChild(createScheduleRow(newEntry));
    } else {
        console.error('Could not find table for round:', round);
    }
}

function createRoundWrapper(id, roundData) {
    const roundNumber = roundData.round;

    const newRoundWrapper = document.createElement('div');
    newRoundWrapper.id = `schedule-table-round-${roundNumber}`;
    newRoundWrapper.classList.add('schedule-round');
    newRoundWrapper.dataset.round = roundNumber;

    const headerWithControls = createHeaderWithControls(
        roundNumber,
        () => addNewEntryToRound(id, roundNumber),
        () => removeRound(id, roundNumber, newRoundWrapper)
    );

    newRoundWrapper.appendChild(headerWithControls);

    return newRoundWrapper;
}

function createTableRow(entry, keys) {
    const row = document.createElement('tr');
    row.dataset.id = entry.id;

    keys.forEach(key => {
        const { cell, input } = createTableCellWithInput('number', entry[key], key);
        row.appendChild(cell);

        input.addEventListener('change', function () {
            if (key === 'day' && input.value === '') {
                const tbody = row.parentNode;
                tbody.removeChild(row);
                deleteScheduleData(entry.id, entry.day, entry.min, entry.max, entry.time);
            } else {
                updateScheduleData(entry, key, input.value);
                entry[key] = parseInt(input.value);
                sortSchedules();
            }
        });
    });

    return row;
}

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

function createHeaderWithControls(roundNumber, addEntryCallback, removeRoundCallback) {
    const roundHeader = document.createElement('h3');
    roundHeader.textContent = `Round ${roundNumber}`;

    const roundControls = document.createElement('div');
    roundControls.classList.add('round-controls');

    const addEntryDiv = document.createElement('div');
    addEntryDiv.innerHTML = '⊕';
    addEntryDiv.classList.add('entry-control');
    addEntryDiv.title = `Add Entry to Round ${roundNumber}`;
    addEntryDiv.addEventListener('click', addEntryCallback);

    const removeRoundDiv = document.createElement('div');
    removeRoundDiv.innerHTML = '⊖';
    removeRoundDiv.classList.add('round-control');
    removeRoundDiv.title = `Remove Round ${roundNumber}`;
    removeRoundDiv.addEventListener('click', removeRoundCallback);

    roundControls.appendChild(addEntryDiv);
    roundControls.appendChild(removeRoundDiv);
    roundHeader.appendChild(roundControls);

    return roundHeader;
}

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

// Single row helper
function createScheduleRow(entry) {
    return createTableRow(entry, ['day', 'min', 'max', 'time']);
}

function createDivHeader(text) {
    const header = document.createElement('h2');
    header.textContent = text;
    return header;
}

function handleEmptySchedule(div, id) {
    const scheduleParagraph = document.createElement('p');
    scheduleParagraph.textContent = 'No schedules';
    scheduleParagraph.style.fontSize = "12px";
    div.appendChild(scheduleParagraph);

    const createButton = createButtonWithClickHandler(
        'Create Schedule Data for Round 1',
        () => {
            addNewRound(id);
            const newDiv = createScheduleDiv(id);
            div.innerHTML = '';
            div.appendChild(newDiv);
        }
    );
    div.appendChild(createButton);
}

function groupScheduleDataByRound(scheduleData) {
    return scheduleData.reduce((acc, entry) => {
        if (!acc[entry.round]) {
            acc[entry.round] = [];
        }
        acc[entry.round].push(entry);
        return acc;
    }, {});
}

function createAddRoundControl(callback) {
    const addRoundDiv = document.createElement('div');
    addRoundDiv.innerHTML = '⊕ New Round';
    addRoundDiv.classList.add('round-control');
    addRoundDiv.addEventListener('click', callback);
    return addRoundDiv;
}

function createButtonWithClickHandler(text, clickHandler) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', clickHandler);
    return button;
}

// ===============================
// Main Schedule Window
// ===============================

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
            return a.id - b.id;
        } else if (a.round !== b.round) {
            return a.round - b.round;
        } else if (a.day !== b.day) {
            return a.day - b.day;
        } else {
            return a.time - b.time;
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

// Build weekend blocks (Fri–Mon) within date range
function buildWeekendBlocks(year, startMonth, endMonth, breakSet) {
    const blocks = [];
    const startDate = new Date(year, startMonth - 1, 1);
    const endDate = new Date(year, endMonth, 0);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 5) continue; // Friday

        const fri = new Date(d.getTime());
        const sat = new Date(d.getTime()); sat.setDate(sat.getDate() + 1);
        const sun = new Date(d.getTime()); sun.setDate(sun.getDate() + 2);
        const mon = new Date(d.getTime()); mon.setDate(mon.getDate() + 3);

        const monthOk = [fri, sat, sun, mon].every(dt => {
            const m = dt.getMonth() + 1;
            return m >= startMonth && m <= endMonth && !breakSet.has(m);
        });

        if (!monthOk) continue;

        blocks.push({ fri, sat, sun, mon });
    }

    return blocks;
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

    if (!data['schedule']) data['schedule'] = [];

    // Auto-calculate rounds & matches for leagues if not provided
    if ((!rounds || rounds <= 0) && type === 'League' && numTeams > 1) {
        rounds = (numTeams - 1) * 2; // home & away
    }
    if ((!matchesPerRound || matchesPerRound <= 0) && numTeams > 1) {
        matchesPerRound = Math.floor(numTeams / 2);
    }

    if (!rounds || !matchesPerRound) {
        alert("Please enter a valid number of teams / rounds / matches per round.");
        return;
    }

    // Optionally clear existing schedule for this competition
    if (clearExisting) {
        data['schedule'] = data['schedule'].filter(entry => entry.id !== compLine);
    }

    // Break months
    const breakSet = new Set(
        breakMonths
            .map(m => parseInt(m.trim(), 10))
            .filter(m => !isNaN(m))
    );

    // For leagues, we work with weekend blocks
    let weekendBlocks = [];
    let allowedDates = [];

    if (type === 'League') {
        weekendBlocks = buildWeekendBlocks(year, startMonth, endMonth, breakSet);
        if (weekendBlocks.length === 0) {
            alert("No available weekend blocks in the selected months.");
            return;
        }
    } else {
        // Cups or others: use all non-break days
        const startDate = new Date(year, startMonth - 1, 1);
        const endDate = new Date(year, endMonth, 0);
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const m = d.getMonth() + 1;
            if (breakSet.has(m)) continue;
            allowedDates.push(new Date(d.getTime()));
        }
        if (allowedDates.length === 0) {
            alert("No available dates in the selected months.");
            return;
        }
    }

    // Build clash set for other competitions in same nation (if requested)
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

    const newEntries = [];

    // Helper to check if a set of (day,time) pairs clashes
    function blockHasClash(pairs) {
        if (!avoidClashes) return false;
        return pairs.some(p => clashSet.has(p.day + ':' + p.time));
    }

    // Helper to remember clashes
    function registerClashes(pairs) {
        pairs.forEach(p => clashSet.add(p.day + ':' + p.time));
    }

    if (type === 'League') {
        // League logic – rounds attached to successive weekend blocks
        const lastThreeStart = Math.max(1, rounds - 2); // 1-based index

        let blockIndex = 0;

        for (let round = 1; round <= rounds; round++) {
            if (blockIndex >= weekendBlocks.length) break;

            // Find next block without clashes (if possible)
            let chosenBlock = null;
            while (blockIndex < weekendBlocks.length) {
                const b = weekendBlocks[blockIndex];

                // For last 3 rounds: all matches same time on Sunday 18:00
                if (round >= lastThreeStart) {
                    const daySun = dayOfYearFromDate(b.sun);
                    const pairs = [{ day: daySun, time: 1800 }];
                    if (!blockHasClash(pairs)) {
                        chosenBlock = b;
                        break;
                    }
                } else {
                    const pairs = [
                        { day: dayOfYearFromDate(b.fri), time: 2000 },
                        { day: dayOfYearFromDate(b.sat), time: 1600 },
                        { day: dayOfYearFromDate(b.sun), time: 1600 },
                        { day: dayOfYearFromDate(b.mon), time: 2000 }
                    ];
                    if (!blockHasClash(pairs)) {
                        chosenBlock = b;
                        break;
                    }
                }

                blockIndex++;
            }

            if (!chosenBlock) break;

            // Build entries for this round
            const pairsUsed = [];

            if (round >= lastThreeStart) {
                // All matches same time on Sunday
                const daySun = dayOfYearFromDate(chosenBlock.sun);
                newEntries.push({
                    id: compLine,
                    round,
                    day: daySun,
                    min: 1,
                    max: matchesPerRound,
                    time: 1800
                });
                pairsUsed.push({ day: daySun, time: 1800 });
            } else {
                let currentMatch = 1;

                // Distribution: 1 Friday, 1 Monday, rest spread Sat/Sun
                if (matchesPerRound === 1) {
                    const daySat = dayOfYearFromDate(chosenBlock.sat);
                    newEntries.push({
                        id: compLine,
                        round,
                        day: daySat,
                        min: 1,
                        max: 1,
                        time: 1600
                    });
                    pairsUsed.push({ day: daySat, time: 1600 });
                } else {
                    const dayFri = dayOfYearFromDate(chosenBlock.fri);
                    const daySat = dayOfYearFromDate(chosenBlock.sat);
                    const daySun = dayOfYearFromDate(chosenBlock.sun);
                    const dayMon = dayOfYearFromDate(chosenBlock.mon);

                    // One match Friday
                    newEntries.push({
                        id: compLine,
                        round,
                        day: dayFri,
                        min: currentMatch,
                        max: currentMatch,
                        time: 2000
                    });
                    pairsUsed.push({ day: dayFri, time: 2000 });
                    currentMatch++;

                    // One match Monday
                    let lastMatchForMon = currentMatch;
                    if (matchesPerRound >= 2) {
                        lastMatchForMon = currentMatch; // exactly 1 on Monday
                        newEntries.push({
                            id: compLine,
                            round,
                            day: dayMon,
                            min: currentMatch,
                            max: lastMatchForMon,
                            time: 2000
                        });
                        pairsUsed.push({ day: dayMon, time: 2000 });
                        currentMatch = lastMatchForMon + 1;
                    }

                    // Remaining matches on Sat/Sun
                    const remaining = matchesPerRound - 2; // we allocated 2 already
                    if (remaining > 0) {
                        const satMatches = Math.ceil(remaining / 2);
                        const sunMatches = remaining - satMatches;

                        if (satMatches > 0) {
                            const minSat = currentMatch;
                            const maxSat = currentMatch + satMatches - 1;
                            newEntries.push({
                                id: compLine,
                                round,
                                day: daySat,
                                min: minSat,
                                max: maxSat,
                                time: 1600
                            });
                            pairsUsed.push({ day: daySat, time: 1600 });
                            currentMatch = maxSat + 1;
                        }

                        if (sunMatches > 0) {
                            const minSun = currentMatch;
                            const maxSun = currentMatch + sunMatches - 1;
                            newEntries.push({
                                id: compLine,
                                round,
                                day: daySun,
                                min: minSun,
                                max: maxSun,
                                time: 1600
                            });
                            pairsUsed.push({ day: daySun, time: 1600 });
                            currentMatch = maxSun + 1;
                        }
                    }
                }
            }

            registerClashes(pairsUsed);
            blockIndex++;
        }
    } else {
        // Cup / generic: simple sequential dates, all matches in one slot
        let dateIndex = 0;
        for (let round = 1; round <= rounds; round++) {
            if (dateIndex >= allowedDates.length) break;
            let chosenDate = allowedDates[dateIndex];

            // Try to avoid clash by moving forward
            if (avoidClashes) {
                let attempts = 0;
                while (attempts < allowedDates.length) {
                    const day = dayOfYearFromDate(chosenDate);
                    const pair = { day, time: 2000 };
                    if (!blockHasClash([pair])) break;
                    dateIndex++;
                    if (dateIndex >= allowedDates.length) break;
                    chosenDate = allowedDates[dateIndex];
                    attempts++;
                }
                if (dateIndex >= allowedDates.length) break;
            }

            const day = dayOfYearFromDate(chosenDate);
            const pair = { day, time: 2000 };

            newEntries.push({
                id: compLine,
                round,
                day,
                min: 1,
                max: matchesPerRound,
                time: 2000
            });

            registerClashes([pair]);
            dateIndex++;
        }
    }

    if (newEntries.length === 0) {
        alert("Could not generate any schedule entries with the current settings.");
        return;
    }

    data['schedule'] = data['schedule'].concat(newEntries);

    sortSchedules();

    if (typeof populateWindow === 'function') {
        const mainHeader = document.getElementById('mainheader');
        const id = parseInt(mainHeader.dataset.id || compLine, 10);
        const level = parseInt(mainHeader.dataset.level || 5, 10);
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
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(backdrop);
    });

    const generateBtn = document.createElement('button');
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
