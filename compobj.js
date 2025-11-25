const settingswithrefs = [
    'rule_suspension', 'schedule_forcecomp', 'schedule_use_dates_comp',
    'advance_maxteamsstageref', 'advance_standingskeep', 'advance_standingsrank',
    'advance_pointskeep', 'standings_checkrank'
];

function updateAllReferences(newLine, amt) {
    updateAdvancementReferences(newLine, amt);
    updateObjectivesReferences(newLine, amt);
    updateScheduleReferences(newLine, amt);
    updateSettingsReferences(newLine, amt);
    updateStandingsReferences(newLine, amt);
    updateTaskReferences(newLine, amt);
    updateWeatherReferences(newLine, amt);
    updateInitTeamsReferences(newLine, amt);
}

function updateTaskReferences(newLine, amt) {
    data['tasks'].forEach(task => {
        if (task.id >= newLine) {
            task.id += amt;
        }

        if (
            task.description === 'UpdateTable' ||
            task.description === 'FillFromCompTablePosBackupSameLeague' ||
            task.description === 'FillFromCompTableBackupLeague' ||
            task.description === 'FillFromCompTable'
        ) {
            if (task.param1 >= newLine) task.param1 += amt;
            if (task.param2 >= newLine) task.param2 += amt;
        } else if (task.description == 'FillFromCompTableBackup') {
            if (task.param1 >= newLine) task.param1 += amt;
            if (task.param2 >= newLine) task.param2 += amt;
            if (task.param3 >= newLine) task.param3 += amt;
        } else {
            if (task.param1 >= newLine) task.param1 += amt;
        }
    });
}

function updateAdvancementReferences(newLine, amt) {
    data['advancement'].forEach(entry => {
        if (entry.groupid >= newLine) entry.groupid += amt;
        if (entry.pushtocompetition >= newLine) entry.pushtocompetition += amt;
    });
}

function updateObjectivesReferences(newLine, amt) {
    data['objectives'].forEach(entry => {
        if (entry.id >= newLine) entry.id += amt;
    });
}

function updateScheduleReferences(newLine, amt) {
    data['schedule'].forEach(entry => {
        if (entry.id >= newLine) entry.id += amt;
    });
}

function updateSettingsReferences(newLine, amt) {
    data['settings'].forEach(entry => {
        if (entry.id >= newLine) {
            entry.id += amt;
            if (entry.tag && settingswithrefs.includes(entry.tag)) {
                entry.value += amt;
            }
        }
    });
}

function updateStandingsReferences(newLine, amt) {
    data['standings'].forEach(entry => {
        if (entry.id >= newLine) entry.id += amt;
    });
}

function updateWeatherReferences(newLine, amt) {
    data['weather'].forEach(entry => {
        if (entry.id >= newLine) entry.id += amt;
    });
}

function updateCompObj(removedObj, amt) {
    const removedLine = removedObj.line;
    data['compobj'].forEach(obj => {
        if (obj.line > removedLine) {
            if (obj.parent >= removedLine) obj.parent += amt;
            obj.line += amt;
        }
    });
}

function updateInitTeamsReferences(newLine, amt) {
    if (!data['initteams']) return;

    data['initteams'] = data['initteams'].map(entry => {
        // We support:
        //  - array:    [compid, position, teamid]
        //  - object A: { compid, position, teamid }
        //  - object B: { id, finishpos, teamid }  // your JSON format

        if (Array.isArray(entry)) {
            let compId = parseInt(entry[0]);
            if (Number.isFinite(compId) && compId >= newLine) {
                entry[0] = compId + amt;
            }
            return entry;
        }

        // Object style
        const hasCompid = Object.prototype.hasOwnProperty.call(entry, 'compid');
        const hasId     = Object.prototype.hasOwnProperty.call(entry, 'id');

        let compId = null;
        if (hasCompid) compId = parseInt(entry.compid);
        else if (hasId) compId = parseInt(entry.id);

        if (!Number.isFinite(compId)) return entry;

        if (compId >= newLine) {
            if (hasCompid) entry.compid = compId + amt;
            else if (hasId) entry.id = compId + amt;
        }

        return entry;
    });
}

/* ============================================================
   ✅ MODIFIED FUNCTION: createNewCompObj
   Adds optional 5th parameter "insertAfterId" so you can insert
   a new competition (e.g., stage) between existing ones.
   ============================================================ */
function createNewCompObj(parentId, compName, level, listElement, insertAfterId = null) {
    const expandedState = getExpandedState();
    let insertionPoint = -1;

    // 🔹 NEW: If user specified a stage ID to insert after
    if (insertAfterId !== null && !isNaN(insertAfterId)) {
        const foundIndex = data['compobj'].findIndex(o => o.line === insertAfterId);
        if (foundIndex !== -1) {
            insertionPoint = foundIndex + 1; // insert after that ID
        } else {
            insertionPoint = data['compobj'].length;
        }
    } else {
        // 🔸 Original logic: adds stage after the last one
        switch (level) {
            case 1:
                let lastConfedLine = findLastCompOfLvl(1, 0);
                insertionPoint = findIntlInsertionPoint(lastConfedLine);
                break;
            case 2:
                let lastNatLine = findLastCompOfLvl(2, parentId);
                insertionPoint = findInsertionPoint(lastNatLine, 2);
                break;
            case 3:
                let lastCompLine = findLastCompOfLvl(3, parentId);
                insertionPoint = findInsertionPoint(lastCompLine, 3);
                break;
            case 4:
                let lastStageLine = findLastCompOfLvl(4, parentId);
                insertionPoint = findInsertionPoint(lastStageLine, 4);
                break;
            case 5:
                let lastGroupLine = findLastCompOfLvl(5, parentId);
                insertionPoint = findInsertionPoint(lastGroupLine, 5);
                break;
            default:
                insertionPoint = data['compobj'].length;
                break;
        }
    }

    const newCompObj = {
        line: insertionPoint,
        level: level,
        shortname: compName,
        longname: compName,
        parent: parentId
    };

    // Push subsequent elements down by 1 to make space
    pushSubsequentCompObjs(insertionPoint);

    // Insert object at the computed point
    data['compobj'].splice(insertionPoint, 0, newCompObj);

    updateAllReferences(insertionPoint, 1);

    if (listElement) {
        const newCompElement = createCompetitionDivElement(newCompObj);
        listElement.appendChild(newCompElement);
    }

    data['compobj'].sort((a, b) => a.line - b.line);
    organizeCompetitions(data);
    restoreExpandedState(expandedState);
}

function pushSubsequentCompObjs(startPoint) {
    // Shift every object line after the insertion point
    data['compobj'].forEach(obj => {
        if (obj.line >= startPoint) {
            obj.line++;
        }
    });

    // 🔹 NEW: update parent references for any child whose parent is after the insertion
    data['compobj'].forEach(obj => {
        if (obj.parent >= startPoint) {
            obj.parent++;
        }
    });
}


function removeCompObj(id, elementToRemove) {
    const firstDeletionPoint = data['compobj'].findIndex(obj => obj.line === id);
    if (firstDeletionPoint === -1) return;

    const compobj = data['compobj'][firstDeletionPoint];
    const lastDeletionPoint = findLastCompInHierarchy(id, compobj.level);
    const deletionCount = (lastDeletionPoint !== -1) ? lastDeletionPoint - firstDeletionPoint + 1 : 1;

    data['compobj'].forEach(comp => {
        if (comp.line > lastDeletionPoint) {
            comp.line -= deletionCount;
            if (comp.parent >= id) comp.parent -= deletionCount;
        }
    });

    data['compobj'].splice(firstDeletionPoint, deletionCount);
    removeCompObjReferences(firstDeletionPoint, lastDeletionPoint);
    updateAllReferences(id, -deletionCount);

    elementToRemove.remove();

    let expandedState = getExpandedState();
    organizeCompetitions(data);
    restoreExpandedState(expandedState);
}
function removeCompObjReferences(firstDeletionPoint, lastDeletionPoint) {
    const linesToRemove = new Set();

    // Collect all lines that will be removed
    for (let i = firstDeletionPoint; i <= lastDeletionPoint; i++) {
        const line = data['compobj'][i].line;
        linesToRemove.add(line);
    }

    // List of tables to check for references
    const tablesToUpdate = ['settings', 'tasks', 'schedule', 'standings', 'objectives', 'weather']; 

    // Loop through each table and remove any references to the lines being deleted
    tablesToUpdate.forEach(table => {
        if (data[table] && Array.isArray(data[table])) {
            data[table] = data[table].filter(entry => {
                const entryId = entry.id || entry.compid; // Adjust this if your IDs are stored under a different field
                return !linesToRemove.has(entryId);
            });
        }
    });

    // Special handling for the 'advancement' table
    if (data['advancement'] && Array.isArray(data['advancement'])) {
        data['advancement'] = data['advancement'].filter(entry => {
            return !linesToRemove.has(entry.pushtocompetition) && !linesToRemove.has(entry.groupid);
        });
    }
}
