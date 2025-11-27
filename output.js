async function download() {
    const zip = new JSZip();

    // Add each data export as a file in the ZIP
    zip.file('compobj.txt', compobjToTxt(data['compobj']));
    zip.file('compids.txt', compidsToTxt(data['compobj']));
    zip.file('advancement.txt', advancementToTxt(data['advancement']));
    zip.file('objectives.txt', objectivesToTxt(data['objectives']));
    zip.file('schedule.txt', scheduleToTxt(data['schedule']));
    zip.file('settings.txt', settingsToTxt(data['settings']));
    zip.file('standings.txt', standingsToTxt(data['standings']));
    zip.file('tasks.txt', tasksToTxt(data['tasks']));
    zip.file('weather.txt', weatherToTxt(data['weather']));
    zip.file('initteams.txt', initteamsToTxt(data['initteams']));

    // Generate JSON data blob
    const jsonDataBlob = await generateJsonDataBlob();

    // Define filename with timestamp
    const now = new Date();
    const datetimeString = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
    const jsonFileName = `scyppan-${datetimeString}-compdata.json`;

    // Add JSON data to ZIP with the specified filename
    zip.file(jsonFileName, jsonDataBlob);

    // Generate the ZIP file and trigger the download
    const content = await zip.generateAsync({ type: 'blob' });

    if (window.showSaveFilePicker) {
        // Modern browsers supporting the File System Access API
        const options = {
            suggestedName: `scyppan-${datetimeString}-compdata.zip`,
            types: [
                {
                    description: 'ZIP Files',
                    accept: { 'application/zip': ['.zip'] }
                }
            ]
        };
        
        try {
            const handle = await showSaveFilePicker(options);
            const writableStream = await handle.createWritable();
            await writableStream.write(content);
            await writableStream.close();
            alert('File successfully saved!');
        } catch (err) {
            console.error('Save canceled or failed:', err);
        }
    } else {
        // Fallback for browsers that don't support showSaveFilePicker
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `scyppan-${datetimeString}-compdata.zip`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

}

function exportCompobjData() {
    const dataStr = compobjToTxt(data['compobj']); // Convert compobj data to CSV format
    const blob = new Blob([dataStr], { type: 'text/plain;charset=utf-8;' }); // Create a Blob for a text file with UTF-8 encoding
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'compobj.txt'; // Set the file name with .txt extension
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportCompidsData() {
    const dataStr = compidsToTxt(data['compobj']); 
    const blob = new Blob([dataStr], { type: 'text/plain;charset=utf-8;' }); 
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'compids.txt'; 
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function compobjToTxt(compobjArray) {
    return compobjArray
        .filter(entry => !Object.values(entry).includes(null)) // Filter out rows with any null values
        .map(entry => `${entry.line},${entry.level},${entry.shortname},${entry.longname},${entry.parent}`)
        .join('\n') + '\n';
}

function compidsToTxt(compobjArray) {
    return compobjArray
        .filter(entry => entry.level === 3) // Filter only those with level 3
        .map(entry => entry.line) // Extract the 'line' value
        .join('\n') + '\n'; // Join them with new lines
}

function exportAdvancementData() {
    const dataStr = advancementToTxt(data['advancement']); 
    const blob = new Blob([dataStr], { type: 'text/plain;charset=utf-8;' }); 
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'advancement_data.txt'; 
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function advancementToTxt(advancementArray) {
    return advancementArray
        .filter(entry => !Object.values(entry).includes(null)) // Filter out rows with any null values
        .map(entry => `${entry.groupid},${entry.slot},${entry.pushtocompetition},${entry.pushtoposition}`)
        .join('\n') + '\n';
}

function exportObjectivesData() {
    const dataStr = objectivesToTxt(data['objectives']); 
    const blob = new Blob([dataStr], { type: 'text/plain;charset=utf-8;' }); 
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'objectives_data.txt'; 
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function objectivesToTxt(objectivesArray) {
    return objectivesArray
        .filter(entry => !Object.values(entry).includes(null)) // Filter out rows with any null values
        .map(entry => `${entry.id},${entry.objective},${entry.value}`)
        .join('\n') + '\n';
}

function exportScheduleData() {
    const dataStr = scheduleToTxt(data['schedule']); 
    const blob = new Blob([dataStr], { type: 'text/plain;charset=utf-8;' }); 
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'schedule_data.txt'; 
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function scheduleToTxt(scheduleArray) {
    return scheduleArray
        .filter(entry => !Object.values(entry).includes(null)) // Filter out rows with any null values
        .map(entry => `${entry.id},${entry.day},${entry.round},${entry.min},${entry.max},${entry.time}`)
        .join('\n') + '\n';
}

function exportSettingsData() {
    const dataStr = settingsToTxt(data['settings']); 
    const blob = new Blob([dataStr], { type: 'text/plain;charset=utf-8;' }); 
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'settings_data.txt'; 
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function settingsToTxt(settingsArray) {
    return settingsArray
        .filter(entry => !Object.values(entry).includes(null)) // Filter out rows with any null values
        .map(entry => `${entry.id},${entry.tag},${entry.value}`)
        .join('\n') + '\n';
}

function exportStandingsData() {
    const dataStr = standingsToTxt(data['standings']); 
    const blob = new Blob([dataStr], { type: 'text/plain;charset=utf-8;' }); 
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'standings_data.txt'; 
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function standingsToTxt(standingsArray) {
    return standingsArray
        .filter(entry => !Object.values(entry).includes(null)) // Filter out rows with any null values
    .map(entry => `${entry.id},${entry.position}`)
        .join('\n') + '\n';
}

function exportTasksData() {
    const dataStr = tasksToTxt(data['tasks']);
    const blob = new Blob([dataStr], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'tasks_data.txt';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function tasksToTxt(tasksArray) {
    return tasksArray
        .filter(entry => !Object.values(entry).includes(null)) // Filter out rows with any null values
        .map(entry => `${entry.id},${entry.when},${entry.description},${entry.param1},${entry.param2},${entry.param3},${entry.param4}`)
        .join('\n') + '\n';
}

function exportWeatherData() {
    const dataStr = weatherToTxt(data['weather']);
    const blob = new Blob([dataStr], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'weather_data.txt';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function weatherToTxt(weatherArray) {
    return weatherArray
        .filter(entry => !Object.values(entry).includes(null)) // Filter out rows with any null values
        .map(entry => `${entry.id},${entry.month},${entry.chancedry},${entry.chancerain},${entry.chancesnow},${entry.chanceovercast},${entry.unknown},${entry.sunset},${entry.nighttime}`)
        .join('\n') + '\n';
}

function initteamsToTxt(initteamsArray) {
    if (!Array.isArray(initteamsArray)) return '';

    return initteamsArray
        .filter(entry => !!entry)
        .map(entry => {
            if (Array.isArray(entry)) {
                // [compid, position, teamid]
                const compId   = entry[0];
                const position = entry[1];
                const teamId   = entry[2];
                return `${compId},${position},${teamId}`;
            } else {
                // Object formats:
                //  A: { compid, position, teamid }
                //  B: { id, finishpos, teamid }
                const compId =
                    entry.compid ?? entry.id;
                const position =
                    entry.position ?? entry.finishpos;
                const teamId = entry.teamid;

                return `${compId},${position},${teamId}`;
            }
        })
        .join('\n') + '\n';
}
async function generateJsonDataBlob() {
    const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== null)
    );

    const jsonData = JSON.stringify(filteredData, null, 2); // Convert filtered data to JSON string
    return new Blob([jsonData], { type: 'application/json' }); // Return the blob
}

// ===== Tournament-level export/import helpers =====
function buildTournamentPackage(rootId) {
    const ids = new Set(getSubtreeIdsFromCompobj(rootId).map(Number));
    if (ids.size === 0) return null;

    const safeClone = (arr = []) => JSON.parse(JSON.stringify(arr));
    const meta = {
        rootId,
        name: getCompetitionNameById(rootId),
        exportedAt: new Date().toISOString()
    };

    const compobj = safeClone(data['compobj'].filter(entry => ids.has(Number(entry.line))));
    const settings = safeClone(data['settings'].filter(entry => ids.has(Number(entry.id))));
    const tasks = safeClone(data['tasks'].filter(entry => ids.has(Number(entry.id))));
    const schedule = safeClone(data['schedule'].filter(entry => ids.has(Number(entry.id))));
    const advancement = safeClone((data['advancement'] || []).filter(entry => ids.has(Number(entry.groupid))));
    const objectives = safeClone((data['objectives'] || []).filter(entry => ids.has(Number(entry.id))));
    const standings = safeClone((data['standings'] || []).filter(entry => ids.has(Number(entry.id))));
    const initteams = safeClone((data['initteams'] || []).filter(entry => {
        const compId = entry.compid ?? entry.id ?? (Array.isArray(entry) ? entry[0] : null);
        return ids.has(Number(compId));
    }));

    return { meta, compobj, settings, tasks, schedule, advancement, objectives, standings, initteams };
}

function exportTournament(rootId) {
    const pkg = buildTournamentPackage(rootId);
    if (!pkg) {
        alert('No data found for this tournament.');
        return;
    }

    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tournament-${rootId}.json`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (typeof createMessage === 'function') {
        createMessage(`Exported tournament ${pkg.meta.name} (${rootId})`, 'info');
    }
}

function importTournamentPackage(pkg, targetRootId, mode = 'replace') {
    if (!pkg || !Array.isArray(pkg.compobj) || pkg.compobj.length === 0) {
        throw new Error('Invalid tournament package.');
    }

    const sourceRootId = Number(pkg.meta?.rootId ?? pkg.compobj[0].line);
    const targetRoot = data['compobj'].find(c => c.line === targetRootId);
    if (!targetRoot) {
        throw new Error('Target competition not found.');
    }

    const targetParent = targetRoot.parent;
    const idMap = new Map();
    const removeIds = getSubtreeIdsFromCompobj(targetRootId).map(Number);
    const removeSet = new Set(removeIds);
    const oldCount = removeIds.length;
    const oldMax = Math.max(...removeIds);

    const filterOutIds = (arr = [], key = 'id') =>
        Array.isArray(arr) ? arr.filter(entry => !removeSet.has(Number(entry[key]))) : [];

    // Remove existing subtree data
    data['compobj'] = data['compobj'].filter(entry => !removeSet.has(Number(entry.line)));
    data['settings'] = filterOutIds(data['settings'], 'id');
    data['tasks'] = filterOutIds(data['tasks'], 'id');
    data['schedule'] = filterOutIds(data['schedule'], 'id');
    data['objectives'] = filterOutIds(data['objectives'], 'id');
    data['standings'] = filterOutIds(data['standings'], 'id');
    data['advancement'] = (data['advancement'] || []).filter(entry => !removeSet.has(Number(entry.groupid)));
    data['initteams'] = (data['initteams'] || []).filter(entry => {
        const compId = entry.compid ?? entry.id ?? (Array.isArray(entry) ? entry[0] : null);
        return !removeSet.has(Number(compId));
    });

    // Shift everything after the old subtree to make room or close gaps
    const newCount = pkg.compobj.length;
    const delta = newCount - oldCount;
    if (delta !== 0) {
        data['compobj'].forEach(obj => {
            if (Number(obj.line) > oldMax) {
                obj.line += delta;
            }
            if (Number(obj.parent) > oldMax) {
                obj.parent += delta;
            }
        });
        updateAllReferences(oldMax + 1, delta);
    }

    // Assign new contiguous ids for the incoming subtree
    const baseId = mode === 'replace'
        ? Number(targetRootId)
        : (Math.max(...data['compobj'].map(entry => Number(entry.line)), 0) + 1);

    const sortedCompobj = [...pkg.compobj].sort((a, b) => Number(a.line) - Number(b.line));

    sortedCompobj.forEach((entry, idx) => {
        const oldId = Number(entry.line);
        const newId = baseId + idx;
        idMap.set(oldId, newId);
    });

    const mapId = (id) => {
        const num = Number(id);
        if (!Number.isFinite(num)) return id;
        return idMap.has(num) ? idMap.get(num) : num;
    };

    sortedCompobj.forEach(entry => {
        const oldId = Number(entry.line);
        const newId = idMap.get(oldId);
        const oldParent = Number(entry.parent);
        const newParent = (oldId === sourceRootId) ? targetParent : mapId(oldParent);
        data['compobj'].push({ ...entry, line: newId, parent: newParent });
    });

    const pushMapped = (sourceArr, targetArr, mapper) => {
        (sourceArr || []).forEach(entry => targetArr.push(mapper(entry)));
    };

    pushMapped(pkg.settings, data['settings'], entry => ({
        ...entry,
        id: mapId(entry.id),
        value: (entry.tag && typeof settingswithrefs !== 'undefined' && settingswithrefs.includes(entry.tag))
            ? mapId(entry.value)
            : entry.value
    }));

    pushMapped(pkg.tasks, data['tasks'], entry => {
        const maybeMap = (val) => {
            const num = Number(val);
            return Number.isFinite(num) ? mapId(num) : val;
        };
        const mapped = { ...entry, id: mapId(entry.id) };
        ['param1', 'param2', 'param3', 'param4'].forEach(k => {
            if (k in entry) mapped[k] = maybeMap(entry[k]);
        });
        return mapped;
    });

    pushMapped(pkg.schedule, data['schedule'], entry => ({ ...entry, id: mapId(entry.id) }));
    pushMapped(pkg.objectives, data['objectives'], entry => ({ ...entry, id: mapId(entry.id) }));
    pushMapped(pkg.standings, data['standings'], entry => ({ ...entry, id: mapId(entry.id) }));

    pushMapped(pkg.advancement, data['advancement'], entry => ({
        ...entry,
        groupid: mapId(entry.groupid),
        pushtocompetition: mapId(entry.pushtocompetition)
    }));

    pushMapped(pkg.initteams, data['initteams'], entry => {
        if (Array.isArray(entry)) {
            const mapped = [...entry];
            mapped[0] = mapId(entry[0]);
            return mapped;
        }
        const compId = entry.compid ?? entry.id;
        return { ...entry, compid: mapId(compId), id: mapId(entry.id ?? compId) };
    });

    data['compobj'].sort((a, b) => a.line - b.line);
    data['settings'].sort((a, b) => a.id - b.id);
    data['tasks'].sort((a, b) => a.id - b.id);
    data['schedule'].sort((a, b) => a.id - b.id);
    data['advancement'].sort((a, b) => a.groupid - b.groupid || a.slot - b.slot);

    return idMap.get(sourceRootId) ?? targetRootId;
}

function handleTournamentImportFile(file, targetRootId, mode = 'replace') {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const pkg = JSON.parse(e.target.result);
            const newRootId = importTournamentPackage(pkg, targetRootId, mode);

            if (typeof organizeCompetitions === 'function') {
                organizeCompetitions(data);
            }
            if (typeof showWindow === 'function' && typeof populateWindow === 'function') {
                showWindow(3);
                populateWindow(3, newRootId);
            }
            if (typeof createMessage === 'function') {
                const label = mode === 'replace' ? 'replaced' : 'imported copy';
                createMessage(`Tournament ${label} successfully. Root id: ${newRootId}`, 'info');
            }
        } catch (err) {
            console.error('Failed to import tournament package', err);
            alert('Failed to import tournament package. Please ensure it is a valid export.');
        }
    };
    reader.readAsText(file);
}
