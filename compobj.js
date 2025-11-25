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
    if (!Array.isArray(data['tasks'])) return;

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
        } else if (task.description === 'FillFromCompTableBackup') {
            if (task.param1 >= newLine) task.param1 += amt;
            if (task.param2 >= newLine) task.param2 += amt;
            if (task.param3 >= newLine) task.param3 += amt;
        } else {
            if (task.param1 >= newLine) task.param1 += amt;
        }
    });
}

function updateAdvancementReferences(newLine, amt) {
    if (!Array.isArray(data['advancement'])) return;

    data['advancement'].forEach(entry => {
        if (entry.groupid >= newLine) entry.groupid += amt;
        if (entry.pushtocompetition >= newLine) entry.pushtocompetition += amt;
    });
}

function updateObjectivesReferences(newLine, amt) {
    if (!Array.isArray(data['objectives'])) return;

    data['objectives'].forEach(entry => {
        if (entry.id >= newLine) entry.id += amt;
    });
}

function updateScheduleReferences(newLine, amt) {
    if (!Array.isArray(data['schedule'])) return;

    data['schedule'].forEach(entry => {
        if (entry.id >= newLine) entry.id += amt;
    });
}

function updateSettingsReferences(newLine, amt) {
    if (!Array.isArray(data['settings'])) return;

    data['settings'].forEach(entry => {
        if (entry.id >= newLine) {
            entry.id += amt;
        }
        if (entry.tag && settingswithrefs.includes(entry.tag)) {
            // value is a comp / stage ref
            if (entry.value >= newLine) {
                entry.value += amt;
            }
        }
    });
}

function updateStandingsReferences(newLine, amt) {
    if (!Array.isArray(data['standings'])) return;

    data['standings'].forEach(entry => {
        if (entry.id >= newLine) entry.id += amt;
    });
}

function updateWeatherReferences(newLine, amt) {
    if (!Array.isArray(data['weather'])) return;

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
    if (!Array.isArray(data['initteams'])) return;

    data['initteams'] = data['initteams'].map(entry => {
        // [compid, position, teamid]
        if (Array.isArray(entry)) {
            let compId = parseInt(entry[0]);
            if (Number.isFinite(compId) && compId >= newLine) {
                entry[0] = compId + amt;
            }
            return entry;
        }

        // Object style: { compid, position, teamid } OR { id, finishpos, teamid }
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
   createNewCompObj with optional insertAfterId
   ============================================================ */
function createNewCompObj(parentId, compName, level, listElement, insertAfterId = null) {
    const expandedState = getExpandedState();
    let insertionPoint = -1;

    if (insertAfterId !== null && !isNaN(insertAfterId)) {
        const foundIndex = data['compobj'].findIndex(o => o.line === insertAfterId);
        if (foundIndex !== -1) {
            insertionPoint = foundIndex + 1;
        } else {
            insertionPoint = data['compobj'].length;
        }
    } else {
        switch (level) {
            case 1:
                insertionPoint = findInsertionPoint(findLastCompOfLvl(1, 0), 1);
                break;
            case 2:
                insertionPoint = findInsertionPoint(findLastCompOfLvl(2, parentId), 2);
                break;
            case 3:
                insertionPoint = findInsertionPoint(findLastCompOfLvl(3, parentId), 3);
                break;
            case 4:
                insertionPoint = findInsertionPoint(findLastCompOfLvl(4, parentId), 4);
                break;
            case 5:
                insertionPoint = findInsertionPoint(findLastCompOfLvl(5, parentId), 5);
                break;
            default:
                insertionPoint = data['compobj'].length;
                break;
        }
    }

    // IMPORTANT: `line` is NOT the array index; we need a new line number.
    const newLine = findLastValidLine() + 1;

    const newCompObj = {
        line: newLine,
        level: level,
        shortname: compName,
        longname: compName,
        parent: parentId
    };

    // Shift all compobjs after insertion point in the *array*
    pushSubsequentCompObjs(insertionPoint);

    // Insert into array
    data['compobj'].splice(insertionPoint, 0, newCompObj);

    // Shift ID-based references >= newLine
    updateAllReferences(newLine, 1);

    if (listElement) {
        const newCompElement = createCompetitionDivElement(newCompObj);
        listElement.appendChild(newCompElement);
    }

    data['compobj'].sort((a, b) => a.line - b.line);
    organizeCompetitions(data);
    restoreExpandedState(expandedState);
}

function pushSubsequentCompObjs(startPoint) {
    data['compobj'].forEach((obj, idx) => {
        if (idx >= startPoint) {
            obj.line++;
        }
    });

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

    for (let i = firstDeletionPoint; i <= lastDeletionPoint; i++) {
        const line = data['compobj'][i].line;
        linesToRemove.add(line);
    }

    const tablesToUpdate = ['settings', 'tasks', 'schedule', 'standings', 'objectives', 'weather'];

    tablesToUpdate.forEach(table => {
        if (data[table] && Array.isArray(data[table])) {
            data[table] = data[table].filter(entry => {
                const entryId = entry.id || entry.compid;
                return !linesToRemove.has(entryId);
            });
        }
    });

    if (data['advancement'] && Array.isArray(data['advancement'])) {
        data['advancement'] = data['advancement'].filter(entry => {
            return !linesToRemove.has(entry.pushtocompetition) &&
                   !linesToRemove.has(entry.groupid);
        });
    }
}

/* ============================================================
   ✅ Duplicating competitions (global functions)
   ============================================================ */

function duplicateCompetition(rootId) {
    const rootComp = data['compobj'].find(c => c.line === rootId);
    if (!rootComp) {
        alert("Competition not found: " + rootId);
        return;
    }

    const subtreeIds = new Set();
    const queue = [rootId];
    subtreeIds.add(rootId);

    while (queue.length > 0) {
        const current = queue.shift();

        data['compobj'].forEach(comp => {
            if (comp.parent === current && !subtreeIds.has(comp.line)) {
                subtreeIds.add(comp.line);
                queue.push(comp.line);
            }
        });
    }

    const subtreeComps = data['compobj']
        .filter(c => subtreeIds.has(c.line))
        .sort((a, b) => a.line - b.line);

    if (subtreeComps.length === 0) return;

    const startNewId = findLastValidLine() + 1;
    let nextId = startNewId;
    const idMap = {};

    subtreeComps.forEach(comp => {
        idMap[comp.line] = nextId++;
    });

    let suffix = prompt(
        "Enter a suffix for the duplicated competition names (optional):",
        "Copy"
    );
    if (suffix === null) return;
    suffix = suffix.trim();

    const newComps = subtreeComps.map(orig => {
        const clone = JSON.parse(JSON.stringify(orig));

        clone.line = idMap[orig.line];

        if (subtreeIds.has(orig.parent)) {
            clone.parent = idMap[orig.parent];
        } else {
            clone.parent = orig.parent;
        }

        if (suffix !== "") {
            if (clone.shortname) {
                clone.shortname = clone.shortname + "_" + suffix;
            }
            if (clone.longname) {
                clone.longname = clone.longname + " (" + suffix + ")";
            }
        }

        return clone;
    });

    data['compobj'] = data['compobj'].concat(newComps);

    duplicateCompetitionDataForSubtree(idMap, subtreeIds);

    const expandedState = getExpandedState && getExpandedState();
    organizeCompetitions(data);
    if (expandedState && restoreExpandedState) {
        restoreExpandedState(expandedState);
    }

    if (typeof populateWindow === "function") {
        const parentId = rootComp.parent;
        const level = rootComp.level;
        if (parentId >= 0) {
            populateWindow(level - 1, parentId);
        } else {
            populateWindow(0, 0);
        }
    }
}

function duplicateCompetitionDataForSubtree(idMap, subtreeIds) {
    function mapId(oldId) {
        return Object.prototype.hasOwnProperty.call(idMap, oldId)
            ? idMap[oldId]
            : oldId;
    }

    const tables = ['settings', 'tasks', 'schedule', 'standings', 'objectives', 'weather'];

    tables.forEach(table => {
        if (!data[table] || !Array.isArray(data[table])) return;

        const extra = [];

        data[table].forEach(entry => {
            const keyNames = [];
            if ('id' in entry) keyNames.push('id');
            if ('compid' in entry) keyNames.push('compid');

            let belongs = false;
            keyNames.forEach(k => {
                if (subtreeIds.has(entry[k])) belongs = true;
            });

            if (!belongs) return;

            const clone = JSON.parse(JSON.stringify(entry));
            keyNames.forEach(k => {
                if (subtreeIds.has(entry[k])) {
                    clone[k] = mapId(entry[k]);
                }
            });

            extra.push(clone);
        });

        if (extra.length > 0) {
            data[table] = data[table].concat(extra);
        }
    });

    if (data['advancement'] && Array.isArray(data['advancement'])) {
        const extraAdv = [];

        data['advancement'].forEach(entry => {
            const touchesSubtree =
                subtreeIds.has(entry.groupid) ||
                subtreeIds.has(entry.pushtocompetition);

            if (!touchesSubtree) return;

            const clone = JSON.parse(JSON.stringify(entry));

            if (subtreeIds.has(entry.groupid)) {
                clone.groupid = mapId(entry.groupid);
            }
            if (subtreeIds.has(entry.pushtocompetition)) {
                clone.pushtocompetition = mapId(entry.pushtocompetition);
            }

            extraAdv.push(clone);
        });

        if (extraAdv.length > 0) {
            data['advancement'] = data['advancement'].concat(extraAdv);
        }
    }

    if (data['initteams'] && Array.isArray(data['initteams'])) {
        const extraInit = [];

        data['initteams'].forEach(entry => {
            const oldId = entry.compid != null ? entry.compid : entry.id;
            if (!subtreeIds.has(oldId)) return;

            const clone = JSON.parse(JSON.stringify(entry));

            if (clone.compid != null) {
                clone.compid = mapId(oldId);
            } else {
                clone.id = mapId(oldId);
            }

            extraInit.push(clone);
        });

        if (extraInit.length > 0) {
            data['initteams'] = data['initteams'].concat(extraInit);
        }
    }
}

function moveCompetitionToNation(rootId, newNationLine) {
    // Only meant for competition-level nodes (level 3)
    const comp = data['compobj'].find(c => c.line === rootId);
    if (!comp) {
        alert("Competition not found: " + rootId);
        return;
    }

    if (comp.level !== 3) {
        alert("Move is only supported for competition-level entries (level 3).");
        return;
    }

    const oldNation = comp.parent;
    if (oldNation === newNationLine) {
        // nothing to do
        return;
    }

    // Re-parent this competition to the new nation
    comp.parent = newNationLine;

    // Rebuild hierarchy and refresh UI
    const expandedState = (typeof getExpandedState === "function") ? getExpandedState() : null;
    organizeCompetitions(data);
    if (expandedState && typeof restoreExpandedState === "function") {
        restoreExpandedState(expandedState);
    }

    if (typeof populateWindow === "function") {
        const nationObj = data['compobj'].find(c => c.line === newNationLine);
        if (nationObj) {
            // Show the nation’s window after moving
            populateWindow(nationObj.level, newNationLine);
        }
    }
}

