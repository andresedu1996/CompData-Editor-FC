function getChildren(parentId) {
    return data['compobj'].filter(entry => entry.parent === parentId);
}

function createCompetitionsListDiv(parentId) {
    const div = document.createElement('div');
    div.classList.add('level-content', 'standard-div');

    const parentObj = data['compobj'].find(comp => comp.line === parentId);
    let level = parentObj ? parentObj.level : 0;

    const leftDiv = document.createElement('div');
    const rightDiv = document.createElement('div');
    leftDiv.classList.add('confederations-container');
    rightDiv.classList.add('confederations-container');
  leftDiv.id = "leftcompdiv";
rightDiv.id = "rightcompdiv";

    const leftHeader = document.createElement('h2');
    const rightHeader = document.createElement('h2');

    leftDiv.appendChild(leftHeader);
    rightDiv.appendChild(rightHeader);

    const leftList = document.createElement('ul');
    const rightList = document.createElement('ul');
    leftDiv.appendChild(leftList);
    rightDiv.appendChild(rightList);

    // Separate children based on their levels
    const children = getChildren(parentId);

    children.forEach(child => {
        const li = createCompetitionDivElement(child);
        if (level == 0 && child.level == 1) {
            leftList.appendChild(li);
        } else if (level == 0 && child.level == 3) {
            rightList.appendChild(li);
        } else if (level == 1 && child.level == 2) {
            leftList.appendChild(li);
        } else if (level == 1 && child.level == 3) {
            rightList.appendChild(li);
        } else {
            leftList.appendChild(li);
        }
    });

    div.appendChild(leftDiv);

    const leftAddDiv = document.createElement('div');
    leftAddDiv.classList.add('add-compobj-container');
    const inputleft = document.createElement('input');
    inputleft.type = 'text';
    inputleft.placeholder = 'Add new confederation...';
    inputleft.classList.add('add-compobj-input');
    leftAddDiv.appendChild(inputleft);
    leftDiv.appendChild(leftAddDiv);

    const rightAddDiv = document.createElement('div');
    rightAddDiv.classList.add('add-compobj-container');
    const inputright = document.createElement('input');
    inputright.type = 'text';
    inputright.placeholder = 'Add new competition...';
    inputright.classList.add('add-compobj-input');
    rightAddDiv.appendChild(inputright);
    rightDiv.appendChild(rightAddDiv);

    // Event listener for Enter on left input — skip default action for levels that have custom handlers
inputleft.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter') return;
    if (inputleft.value.trim() === '') return;

    // Skip the default behaviour when level 3 (Stages) or 4 (Groups)
    // so the case-specific prompt handlers can run instead.
    if (level === 3 || level === 4) {
        return;
    }

    // Default behaviour for other levels: add a new item at level+1
    createNewCompObj(parentId, inputleft.value.trim(), level + 1, leftList);
    inputleft.value = ''; // Clear input after adding
});

    switch (level) {
        case 0:
            leftHeader.textContent = 'Confederations';
            rightHeader.textContent = 'Competitions';
            div.appendChild(rightDiv);

            // Add new competition
            inputright.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' && inputright.value.trim() !== '') {
                    createNewCompObj(parentId, inputright.value.trim(), 3, rightList);
                    inputright.value = '';
                }
            });

            div.classList.remove('standard-div');
            div.classList.add('competition-div');
            break;

        case 1:
            leftHeader.textContent = 'Nations';
            rightHeader.textContent = 'Competitions';
            div.appendChild(rightDiv);

            inputright.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' && inputright.value.trim() !== '') {
                    createNewCompObj(parentId, inputright.value.trim(), 3, rightList);
                    inputright.value = '';
                }
            });

            inputleft.placeholder = 'Add new nation...';
            div.classList.remove('standard-div');
            div.classList.add('competition-div');
            break;

        case 2:
            rightDiv.appendChild(rightList);
            leftHeader.textContent = 'Competitions';
            inputleft.placeholder = 'Add new competition...';
            leftDiv.classList.remove('standard-div');
            leftDiv.classList.remove('confederations-container');
            break;

        case 3:
            rightDiv.appendChild(rightList);
            leftHeader.textContent = 'Stages';
            inputleft.placeholder = 'Add new stage...';

            // ✅ NEW: Allow inserting stage between existing ones
            inputleft.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' && inputleft.value.trim() !== '') {
                    const name = inputleft.value.trim();

                    // Ask user if they want to insert between
                    const insertAfter = prompt(
                        "Enter the line ID of the stage you want to insert after (or leave blank to add at the end):"
                    );
                    const insertAfterId = insertAfter ? parseInt(insertAfter, 10) : null;

                    createNewCompObj(parentId, name, 4, leftList, insertAfterId);
                    inputleft.value = '';
                }
            });

            leftDiv.classList.remove('standard-div');
            leftDiv.classList.remove('confederations-container');
            break;

        case 4:
    rightDiv.appendChild(rightList);
    leftHeader.textContent = 'Groups';
    inputleft.placeholder = 'Add new group...';

    // ✅ Allow inserting groups or stages between existing ones
    inputleft.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && inputleft.value.trim() !== '') {
            const name = inputleft.value.trim();
            const insertAfter = prompt(
                "Enter the line ID you want to insert after (or leave blank to add at the end):"
            );
            const insertAfterId = insertAfter ? parseInt(insertAfter, 10) : null;

            // 👇 notice this level argument (5 for groups, 4 for stages)
            createNewCompObj(parentId, name, level + 1, leftList, insertAfterId);
            inputleft.value = '';
        }
    });

    leftDiv.classList.remove('standard-div');
    leftDiv.classList.remove('confederations-container');
    break;

    }

    return div;
}


function createCompetitionDivElement(child) {
    const divElement = document.createElement('div');
    divElement.classList.add('competition-item');
    divElement.dataset.compid = child.line;
    divElement.dataset.name = child.longname && child.longname.trim() ? child.longname.trim() : (child.shortname ? child.shortname.trim() : "Unnamed Competition");

    // Set cursor to pointer to indicate clickability
    divElement.style.cursor = 'pointer';

    // Create a container for the inputs and save button
    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'flex';
    inputContainer.style.alignItems = 'center'; // Vertically center the items
    inputContainer.style.gap = '10px'; // Space between elements

    divElement.appendChild(inputContainer);

    // Create the text node (editable)
    const nameToDisplay = replaceNames(divElement.dataset.name, data["compobj"]);
    const textNode = document.createElement('span');
    textNode.textContent = nameToDisplay;
    textNode.contentEditable = false; // Disable editing by default

    // Create the input fields for shortname and longname
    const shortNameInput = document.createElement('input');
    shortNameInput.type = 'text';
    shortNameInput.value = child.shortname;
    shortNameInput.style.display = 'none'; // Hide initially

    const longNameInput = document.createElement('input');
    longNameInput.type = 'text';
    longNameInput.value = child.longname;
    longNameInput.style.display = 'none'; // Hide initially

    // Create the save button (✔)
    const saveButton = document.createElement('span');
    saveButton.innerHTML = '✔';
    saveButton.style.display = 'none'; // Hide initially
    saveButton.style.cursor = 'pointer'; // Set cursor to pointer

    inputContainer.appendChild(shortNameInput);
    inputContainer.appendChild(longNameInput);
    inputContainer.appendChild(textNode);
    inputContainer.appendChild(saveButton);

    saveButton.style.color = 'green';
    saveButton.style.fontSize = '16px'; // Adjust size to match input fields
    saveButton.style.lineHeight = '1'; // Align vertically with text
    shortNameInput.style.width = '60px';
    shortNameInput.style.height = '25px'; // Match with text height
    longNameInput.style.width = '120px';
    longNameInput.style.height = '25px'; // Match with text height

    // Create the delete button
    const deleteButton = document.createElement('span');
    deleteButton.classList.add('delete-button');
    deleteButton.innerHTML = '⊖'; // Use the correct HTML entity for a minus sign inside a circle
    deleteButton.style.display = 'none'; // Hidden by default
    deleteButton.style.cursor = 'pointer'; // Set cursor to pointer for delete button
    inputContainer.appendChild(deleteButton);

    // Create the duplicate button
    const duplicateButton = document.createElement('span');
    duplicateButton.classList.add('duplicate-button');
    duplicateButton.innerHTML = '⧉'; // copy/duplicate symbol
    duplicateButton.style.cursor = 'pointer';
    // If you want it always visible, comment this out:
    // duplicateButton.style.display = 'none';

    inputContainer.appendChild(duplicateButton);

        // Create the move button
    const moveButton = document.createElement('span');
    moveButton.classList.add('move-button');
    moveButton.innerHTML = '⇄'; // move symbol (use whatever you like)
    moveButton.style.cursor = 'pointer';
    inputContainer.appendChild(moveButton);

    // Event listener to make the text editable and show the delete button
    divElement.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent triggering the document click event
        closeAllEditableElements(); // Close all other editable elements before opening this one

        textNode.style.display = 'none';
        shortNameInput.style.display = 'inline';
        longNameInput.style.display = 'inline';
        saveButton.style.display = 'inline';
        
        // Check if neither input is focused, then focus on the shortNameInput
        if (document.activeElement !== shortNameInput && document.activeElement !== longNameInput) {
            shortNameInput.focus(); // Focus on the shortname input only if neither input is already focused
        }

        deleteButton.style.display = 'inline'; // Show delete button
    });

    saveButton.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent triggering other click events
        commitChangesAndClose(shortNameInput, longNameInput, textNode, divElement);
    });    
    
    shortNameInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            commitChangesAndClose(shortNameInput, longNameInput, textNode, divElement);
        }
    });
    
    longNameInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            commitChangesAndClose(shortNameInput, longNameInput, textNode, divElement);
        }
    });  

    // Event listener for the delete button
    deleteButton.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent triggering the divElement click event
        const id = parseInt(divElement.dataset.compid, 10);
        removeCompObj(id, divElement); // Pass the divElement to remove it later
    });

        // Event listener for the duplicate button
    duplicateButton.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent triggering the divElement click event
        const id = parseInt(divElement.dataset.compid, 10);

        // Optional: only allow duplicating real competitions (level >= 3)
        const level = child.level;
        if (level < 3) {
            alert("Duplication is only supported for competition / cup / league entries.");
            return;
        }

        duplicateCompetition(id);
    });

      // Event listener for the move button
    moveButton.addEventListener('click', function (e) {
        e.stopPropagation(); // Prevent triggering the divElement click event
        const id = parseInt(divElement.dataset.compid, 10);
        const level = child.level;

        // We only support moving competition-level nodes (level 3)
        if (level !== 3) {
            alert("Move is only supported for competition-level entries.");
            return;
        }

        openMoveCompetitionModal(id);
    });


    // Handle saving the edited name
    textNode.addEventListener('blur', function() {
        textNode.contentEditable = false;
        divElement.dataset.name = textNode.textContent.trim();
        updateCompObjName(divElement.dataset.compid, divElement.dataset.name);
    });

    shortNameInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            commitChangesAndClose(shortNameInput,longNameInput,textNode, divElement);
        }
    });
    
    longNameInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            commitChangesAndClose(shortNameInput,longNameInput, textNode, divElement);
        }
    });
    
    return divElement;
}

function closeEditableElement(element) {
    const inputContainer = element.querySelector('div');
    
    if (!inputContainer) return; // Safeguard to ensure the input container exists

    const shortNameInput = inputContainer.querySelector('input:nth-child(1)');
    const longNameInput = inputContainer.querySelector('input:nth-child(2)');
    const saveButton = inputContainer.querySelector('span:nth-child(4)'); // Ensure this targets the correct save button
    const deleteButton = inputContainer.querySelector('.delete-button');
    const textNode = inputContainer.querySelector('span'); // Ensure this targets the correct text element

    // Hide inputs and buttons
    if (shortNameInput) shortNameInput.style.display = 'none';
    if (longNameInput) longNameInput.style.display = 'none';
    if (saveButton) saveButton.style.display = 'none';
    if (deleteButton) deleteButton.style.display = 'none';

    // Show the text node
    if (textNode) textNode.style.display = 'inline';
}

function closeAllEditableElements() {
    document.querySelectorAll('.competition-item').forEach(item => {
        closeEditableElement(item);
    });
}

document.addEventListener('click', function() {
    closeAllEditableElements(); // Close all editable elements when clicking outside
});

function updateCompObjNames(compId, newShortName, newLongName) {
    const compObj = data['compobj'].find(obj => obj.line === compId);
    if (compObj) {
        compObj.shortname = newShortName;
        compObj.longname = newLongName;
    }

    // Update names in the left panel UI
    const listItem = document.querySelector(`#competitionList li[data-compid='${compId}']`);
    if (listItem) {
        const textNode = listItem.querySelector('span');
        if (textNode) {
            textNode.textContent = `${newLongName} (${compId})`;
        }
    }
}

function getRemovalCount(){
    let i = groupIndex + 1;
    let removalCount = 0;

    

    while (i < data['compobj'].length) {
        const currentGroup = data['compobj'][i];

        // If the current group's level is less than or equal to the removed level, break the loop
        if (currentGroup.level <= removedLevel) {
            break;
        }

        // Remove the group from compobj
        data['compobj'].splice(i, 1);
        removalCount++;
    }

    return removalCount;
}

function commitChangesAndClose(shortNameInput, longNameInput, textNode, divElement) {
    if (!shortNameInput || !longNameInput) {
        console.error("Input elements are not defined!");
        return;
    }

    const newShortName = shortNameInput.value.trim();
    const newLongName = longNameInput.value.trim();
    textNode.textContent = newLongName;

    // Commit the changes
    updateCompObjNames(divElement.dataset.compid, newShortName, newLongName);
    let compObj=data['compobj'][divElement.dataset.compid];
    compObj.shortname=newShortName;
    compObj.longname=newLongName;

    // Close the input mode
    closeAllEditableElements(); // Use the existing function to close the inputs and restore the text
}

function openMoveCompetitionModal(compLine) {
    const comp = data['compobj'].find(function (c) {
        return c.line === compLine;
    });
    if (!comp) {
        alert("Competition not found: " + compLine);
        return;
    }

    // Nations are level 2 in compobj
    const nationNodes = data['compobj'].filter(function (c) {
        return c.level === 2;
    });
    if (nationNodes.length === 0) {
        alert("No nations found in compobj.");
        return;
    }

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'move-competition-backdrop';
    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = '0';
    backdrop.style.right = '0';
    backdrop.style.bottom = '0';
    backdrop.style.backgroundColor = 'rgba(0,0,0,0.4)';
    backdrop.style.display = 'flex';
    backdrop.style.alignItems = 'center';
    backdrop.style.justifyContent = 'center';
    backdrop.style.zIndex = '9999';

    // Modal
    const modal = document.createElement('div');
    modal.style.backgroundColor = '#1b1b1bff';
    modal.style.padding = '16px';
    modal.style.borderRadius = '8px';
    modal.style.minWidth = '280px';
    modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';

    const title = document.createElement('h3');
    title.textContent = 'Move competition to nation';
    modal.appendChild(title);

    const label = document.createElement('label');
    label.textContent = 'Target nation:';
    label.style.display = 'block';
    label.style.marginBottom = '8px';
    modal.appendChild(label);

    const select = document.createElement('select');
    select.style.width = '100%';
    select.style.marginBottom = '12px';

    nationNodes.forEach(function (nation) {
        const option = document.createElement('option');
        option.value = nation.line;

        var rawName;
        if (nation.longname && nation.longname.trim()) {
            rawName = nation.longname.trim();
        } else if (nation.shortname && nation.shortname.trim()) {
            rawName = nation.shortname.trim();
        } else {
            rawName = 'Nation ' + nation.line;
        }

        var displayName = rawName;
        if (typeof replaceNames === 'function') {
            // reuse same helper as for the competition labels
            displayName = replaceNames(rawName, data["compobj"]);
        }

        option.textContent = displayName + ' (' + nation.line + ')';

        // Preselect current nation if this competition is already under one
        if (nation.line === comp.parent) {
            option.selected = true;
        }

        select.appendChild(option);
    });

    modal.appendChild(select);

    // Buttons container
    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.justifyContent = 'flex-end';
    btnContainer.style.gap = '8px';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Move';

    btnContainer.appendChild(cancelBtn);
    btnContainer.appendChild(confirmBtn);
    modal.appendChild(btnContainer);

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    function closeModal() {
        if (backdrop && backdrop.parentNode) {
            backdrop.parentNode.removeChild(backdrop);
        }
    }

    cancelBtn.addEventListener('click', function () {
        closeModal();
    });

    // Click outside to close
    backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) {
            closeModal();
        }
    });

    confirmBtn.addEventListener('click', function () {
        const selected = parseInt(select.value, 10);
        if (!isNaN(selected)) {
            // This function must exist in compobj.js
            moveCompetitionToNation(compLine, selected);
        }
        closeModal();
    });
}
