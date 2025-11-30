function createInitTeamsDiv(compId) {
    const div = document.createElement('div');
    div.classList.add('standard-div');

    const title = document.createElement('h2');
    title.textContent = `Init Teams – Competition ${compId}`;
    div.appendChild(title);

    const table = document.createElement('table');
    table.classList.add('data-table');

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Position</th>
            <th>Team ID</th>
            <th>Actions</th>
        </tr>`;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    div.appendChild(table);

    const entries = (data['initteams'] || []).filter(e => {
        const eid = e.compid ?? e.id;
        return eid === compId;
    });

    const addEntryRow = (entry) => {
        const pos = entry.position ?? entry.finishpos;
        const tr = document.createElement('tr');

        const posInput = document.createElement('input');
        posInput.type = 'number';
        posInput.value = pos;
        posInput.addEventListener('change', () => {
            if ('position' in entry) entry.position = parseInt(posInput.value);
            else entry.finishpos = parseInt(posInput.value);
        });

        const teamInput = document.createElement('input');
        teamInput.type = 'number';
        teamInput.value = entry.teamid;
        teamInput.addEventListener('change', () => {
            entry.teamid = parseInt(teamInput.value);
        });

        const posTd = document.createElement('td');
        posTd.appendChild(posInput);
        const teamTd = document.createElement('td');
        teamTd.appendChild(teamInput);

        const actionsTd = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            data['initteams'] = data['initteams'].filter(x => x !== entry);
            tr.remove();
        });
        actionsTd.appendChild(deleteBtn);

        tr.appendChild(posTd);
        tr.appendChild(teamTd);
        tr.appendChild(actionsTd);
        tbody.appendChild(tr);
    };

    entries.forEach(addEntryRow);

    // Simple "Add row" button
    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Init Team';
    addBtn.addEventListener('click', () => {
        const newEntry = {
            compid: compId,
            finishpos: (tbody.children.length || 0) + 1,
            teamid: -1
        };
        (data['initteams'] ||= []).push(newEntry);
        addEntryRow(newEntry);
    });
    div.appendChild(addBtn);

    return div;
}
