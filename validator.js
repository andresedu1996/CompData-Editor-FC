// Tournament Filling Validator
// Uses global `data` (compobj, tasks, standings, advancement, initteams)

function getSubtreeForCompetition(compLine) {
    const nodesByLine = new Map();
    (data['compobj'] || []).forEach(c => nodesByLine.set(c.line, c));

    const root = nodesByLine.get(compLine);
    if (!root) {
        return [];
    }

    const result = [];
    const queue = [root];

    while (queue.length > 0) {
        const node = queue.shift();
        result.push(node);

        (data['compobj'] || []).forEach(c => {
            if (c.parent === node.line) {
                queue.push(c);
            }
        });
    }

    return result;
}

// Heuristic: estimate how many teams a task tries to add into param1
function estimateTeamsFromTask(task) {
    const desc = (task.description || '').toLowerCase();

    if (desc.includes('fillfromleaguemax')) {
        return task.param3 ? parseInt(task.param3, 10) || 0 : 0;
    }

    if (desc.includes('fillfromspecialteam') && desc.includes('nation')) {
        return task.param2 ? parseInt(task.param2, 10) || 0 : 0;
    }

    if (desc.includes('fillwithteam')) {
        return 1;
    }

    if (desc.includes('fillfromcomp') || desc.includes('fillfromleague')) {
        const param = parseInt(task.param2, 10);
        return Number.isNaN(param) ? 0 : param;
    }

    return 0;
}

function validateCompetitionFilling(compLine) {
    const analysis = {
        compLine,
        competition: null,
        subtreeSize: 0,
        initSeedsForComp: 0,
        groups: [],
        warning: null,
        error: null
    };

    if (!data || !Array.isArray(data['compobj'])) {
        analysis.error = 'Global data not loaded yet.';
        return analysis;
    }

    const subtree = getSubtreeForCompetition(compLine);
    if (subtree.length === 0) {
        analysis.error = `Competition ${compLine} not found.`;
        return analysis;
    }

    analysis.competition = subtree[0];
    analysis.subtreeSize = subtree.length;

    const groupNodes = subtree.filter(n => n.level === 5);
    if (groupNodes.length === 0) {
        analysis.warning = 'No level 5 groups detected in this subtree.';
    }

    const standingsById = new Map();
    (data['standings'] || []).forEach(s => {
        if (!standingsById.has(s.id)) {
            standingsById.set(s.id, []);
        }
        standingsById.get(s.id).push(s);
    });

    const tasks = data['tasks'] || [];
    const advancement = data['advancement'] || [];
    const initteams = data['initteams'] || [];

    analysis.initSeedsForComp = initteams.filter(entry => entry.id === compLine || entry.compid === compLine).length;

    groupNodes.forEach(group => {
        const gid = group.line;

        const standings = standingsById.get(gid) || [];
        const expectedSlots = standings.length;

        const directTasks = tasks.filter(t => t.param1 === gid && (t.when || '').toLowerCase() === 'start');
        let directSeeds = 0;
        directTasks.forEach(t => {
            directSeeds += estimateTeamsFromTask(t);
        });

        const advIn = advancement.filter(a => a.pushtocompetition === gid);
        const advSlots = advIn.length;

        const totalSources = directSeeds + advSlots;
        const diff = totalSources - expectedSlots;

        let status;
        if (expectedSlots === 0) {
            status = 'No standings (could be an intermediate node)';
        } else if (diff === 0) {
            status = 'OK (sources match expected slots)';
        } else if (diff < 0) {
            status = `UNDERFILLED (${diff})`;
        } else {
            status = `POSSIBLE OVERFILL (+${diff})`;
        }

        analysis.groups.push({
            id: gid,
            shortname: group.shortname,
            expectedSlots,
            directSeeds,
            advSlots,
            totalSources,
            diff,
            status,
            directTasks,
            advIn
        });
    });

    return analysis;
}

function formatTask(task) {
    const parts = [];
    if (task.description) {
        parts.push(task.description);
    }
    if (task.param2 !== undefined && task.param2 !== null) {
        parts.push(`p2=${task.param2}`);
    }
    if (task.param3 !== undefined && task.param3 !== null) {
        parts.push(`p3=${task.param3}`);
    }
    return parts.join(' • ');
}

function formatAdvancementRow(row) {
    return `from group ${row.groupid} slot ${row.slot}${row.pushtoposition ? ` → pos ${row.pushtoposition}` : ''}`;
}

function createTournamentValidatorDiv() {
    const container = document.createElement('div');
    container.classList.add('standard-div');

    const header = document.createElement('h2');
    header.textContent = 'Tournament Fill Validator';
    container.appendChild(header);

    const hint = document.createElement('p');
    hint.classList.add('validator-hint');
    hint.textContent = 'Run a quick balance check for a competition subtree. Select the competition root line and the tool will compare expected group slots to incoming seeds.';
    container.appendChild(hint);

    const inputRow = document.createElement('div');
    inputRow.classList.add('validator-input-row');

    const input = document.createElement('input');
    input.type = 'number';
    input.placeholder = 'Competition line (e.g., 1656)';
    input.classList.add('validator-input');
    input.setAttribute('list', 'validatorCompetitionList');

    const datalist = document.createElement('datalist');
    datalist.id = 'validatorCompetitionList';
    (data['compobj'] || []).forEach(comp => {
        const option = document.createElement('option');
        option.value = comp.line;
        const name = comp.longname || comp.shortname || 'Competition';
        option.textContent = `${comp.line} – ${name}`;
        datalist.appendChild(option);
    });

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Validate';
    button.classList.add('toggle-button');

    const resultArea = document.createElement('div');
    resultArea.classList.add('validator-results');
    resultArea.textContent = 'Pick a competition line to begin.';

    button.addEventListener('click', () => {
        const compId = parseInt(input.value, 10);
        if (Number.isNaN(compId)) {
            resultArea.textContent = 'Enter a valid competition line number first.';
            return;
        }
        const analysis = validateCompetitionFilling(compId);
        renderValidatorResults(analysis, resultArea);
    });

    inputRow.appendChild(input);
    inputRow.appendChild(button);

    container.appendChild(inputRow);
    container.appendChild(datalist);
    container.appendChild(resultArea);

    return container;
}

function renderValidatorResults(analysis, target) {
    target.innerHTML = '';

    if (analysis.error) {
        target.textContent = analysis.error;
        return;
    }

    const title = document.createElement('div');
    title.classList.add('validator-summary');
    const name = analysis.competition?.longname || analysis.competition?.shortname || analysis.compLine;
    title.textContent = `Competition ${analysis.compLine} – ${name}`;
    target.appendChild(title);

    if (analysis.warning) {
        const warn = document.createElement('div');
        warn.classList.add('validator-warning');
        warn.textContent = analysis.warning;
        target.appendChild(warn);
    }

    const meta = document.createElement('div');
    meta.classList.add('validator-meta');
    meta.textContent = `Subtree nodes: ${analysis.subtreeSize} • Init team seeds: ${analysis.initSeedsForComp}`;
    target.appendChild(meta);

    if (analysis.groups.length === 0) {
        const empty = document.createElement('div');
        empty.textContent = 'No group-level nodes to analyze.';
        target.appendChild(empty);
        return;
    }

    const table = document.createElement('table');
    table.classList.add('validator-table');

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Group', 'Expected', 'Tasks', 'Advancement', 'Total', 'Status'].forEach(label => {
        const th = document.createElement('th');
        th.textContent = label;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    analysis.groups.forEach(group => {
        const tr = document.createElement('tr');
        const groupName = group.shortname || group.id;

        const statusPill = document.createElement('span');
        statusPill.classList.add('status-pill');
        if (group.diff === 0) {
            statusPill.classList.add('status-ok');
        } else if (group.diff < 0) {
            statusPill.classList.add('status-under');
        } else {
            statusPill.classList.add('status-over');
        }
        statusPill.textContent = group.status;

        const taskDetail = document.createElement('div');
        taskDetail.classList.add('validator-subtext');
        taskDetail.textContent = group.directTasks.length ? group.directTasks.map(formatTask).join('; ') : 'No start tasks to seed group';

        const advDetail = document.createElement('div');
        advDetail.classList.add('validator-subtext');
        advDetail.textContent = group.advIn.length ? group.advIn.map(formatAdvancementRow).join('; ') : 'No advancement rows into group';

        const cells = [
            groupName,
            group.expectedSlots,
            `${group.directSeeds}`,
            `${group.advSlots}`,
            `${group.totalSources}`,
            statusPill
        ];

        cells.forEach((value, index) => {
            const td = document.createElement('td');
            if (value instanceof HTMLElement) {
                td.appendChild(value);
            } else {
                td.textContent = value;
            }
            if (index === 2) {
                td.appendChild(taskDetail);
            }
            if (index === 3) {
                td.appendChild(advDetail);
            }
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    target.appendChild(table);
}
