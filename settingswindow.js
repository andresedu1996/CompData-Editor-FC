const textTags = [
    'comp_type', 'rule_bookings', 'rule_offsides', 'rule_injuries', 'match_stagetype',
    'match_matchsituation', 'match_endruleleague', 'match_endruleko1leg', 'match_endruleko2leg1',
    'match_endruleko2leg2', 'match_endrulefriendly', 'standings_sort', 'schedule_seasonstartmonth',
    'is_women_competition', 'rule_allowadditionalsub', 'advance_pointskeeprounding',
    'match_celebrationlevel', 'schedule_matchup_behavior', 'standings_use_shadow_table', 
    'schedule_push_jan_season_year', 'rule_fixedmatchesdates', 'match_canusefancards', 'schedule_year_real_version',
    'rule_bookings', 'rule_offsides', 'rule_injuries', 'rule_allowadditionalsub', 'schedule_internationaldependency'
];
const options = [
    'comp_type', 'rule_bookings', 'rule_offsides', 'rule_injuries', 'rule_numsubsbench',
    'rule_numsubsmatch', 'rule_numsubmatchinterruptions', 'rule_suspension',
    'rule_numyellowstored', 'rule_numgamesbanredmax', 'rule_numgamesbanredmin',
    'rule_numgamesbandoubleyellowmax', 'rule_numgamesbandoubleyellowmin',
    'rule_numgamesbanyellowsmax', 'rule_numgamesbanyellowsmin', 'standings_pointswin',
    'standings_pointsdraw', 'standings_pointsloss', 'match_matchimportance',
    'match_stagetype', 'match_matchsituation', 'nation_id', 'asset_id',
    'match_endruleleague', 'match_endruleko1leg', 'match_endruleko2leg1',
    'match_endruleko2leg2', 'match_endrulefriendly', 'info_prize_money',
    'info_prize_money_drop', 'standings_sort', 'schedule_seasonstartmonth',
    'schedule_year_start', 'schedule_year_offset', 'schedule_internationaldependency',
    'is_women_competition', 'num_games', 'rule_allowadditionalsub', 'info_slot_champ',
    'uefa_seeded_slots_special_teams', 'women_uefa_seeded_slots_special_teams',
    'advance_random_draw_event', 'schedule_use_dates_comp', 'schedule_checkconflict',
    'rule_fixedmatchesdates', 'match_canusefancards', 'advance_maxteamsassoc',
    'schedule_stage_draw_date', 'schedule_matchup_behavior', 'info_cup_advgroup_slot',
    'info_cup_ko_othercomp_slot', 'info_cup_ko_slot', 'advance_standingskeep',
    'advance_does_not_adv_further', 'advance_maxteamsgroup', 'advance_maxteamsstageref',
    'advance_randomdraw', 'advance_teamcompdependency', 'info_special_team_id',
    'uefa_seeded_slots', 'schedule_forcecomp', 'advance_pointskeep',
    'advance_pointskeeppercentage', 'advance_pointskeeprounding', 'advance_calccompavgs',
    'women_uefa_seeded_slots', 'match_celebrationlevel', 'schedule_matchreplay',
    'match_stadium', 'info_league_releg', 'info_slot_releg', 'info_league_promo',
    'info_prize_money_promo', 'info_slot_promo', 'info_slot_promo_poss', 'info_slot_releg_poss',
    'standings_use_shadow_table', 'schedule_refcomp', 'num_limited_games',
    'schedule_year_real', 'schedule_year_real_version', 'advance_standingsrank',
    'schedule_push_jan_season_year', 'conmebol_seeded_slots_special_teams',
    'conmebol_seeded_slots', 'schedule_preseason_invite_date', 'info_label_slot_acl',
    'schedule_custom_matchup_behavior', 'info_label_slot_libert', 'info_label_slot_libert_qual',
    'info_label_slot_sudame', 'info_label_slot_adv_group', 'schedule_redo_matchups',
    'info_label_slot_adv_playoff', 'info_cup_ko_playoff_slot', 'info_label_slot_champ',
    'info_label_slot_ucl', 'info_label_slot_uecl', 'info_label_slot_uel',
    'match_matchsituation_round', 'info_label_slot_releg', 'info_label_slot_promo',
    'info_label_slot_promo_playoff', 'info_label_slot_releg_playoff', 'first_transfer_window',
    'second_transfer_window'
];



function createSettingsDiv(competitionid) {
    const div = document.createElement('div');
    div.id = 'settings';
    div.classList.add('standard-div', 'level-content');

    const header = document.createElement('h2');
    header.textContent = 'Settings';
    div.appendChild(header);

    // Fetch settings for the specified competitionid
    const settingsData = getDataForId('settings', competitionid);

    const table = document.createElement('table');
    table.classList.add('window-tables');
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    div.appendChild(table);

    // Existing settings rows
    settingsData.forEach(setting => {
        addSettingRow(setting, tbody);
    });

    const controlsContainer = document.createElement('div');
    controlsContainer.classList.add('settings-controls');

    const cloneButton = document.createElement('button');
    cloneButton.textContent = 'Clone Last Setting';
    cloneButton.disabled = settingsData.length === 0;
    cloneButton.addEventListener('click', function () {
        const competitionSettings = data['settings'].filter(entry => entry.id == competitionid);
        const lastSetting = competitionSettings[competitionSettings.length - 1];

        if (!lastSetting) return;

        const clonedSetting = {
            id: competitionid,
            tag: lastSetting.tag,
            value: lastSetting.value
        };

        data['settings'].push(clonedSetting);
        data['settings'].sort((a, b) => a.id - b.id);

        addSettingRow(clonedSetting, tbody);
        cloneButton.disabled = false;
    });

    // "Create New Setting" button (now starts empty with a placeholder)
    const usedTags = settingsData.map(setting => setting.tag);
    const availableOptions = options.filter(option => !usedTags.includes(option));

    if (availableOptions.length > 0) {
        const createButton = document.createElement('button');
        createButton.textContent = 'Create New Setting';
        createButton.addEventListener('click', function () {
            let newSetting = createNewSettingData(competitionid, '');
            addSettingRow(newSetting, tbody);
            cloneButton.disabled = false;
        });
        controlsContainer.appendChild(createButton);
    }
    controlsContainer.appendChild(cloneButton);

    div.appendChild(controlsContainer);

    // 🔹 NEW: embed Init Teams inside the Settings window
    if (typeof createInitTeamsDiv === 'function' && data && Array.isArray(data['initteams'])) {
        // Only show if this competition actually has initteams entries
        const hasEntries = data['initteams'].some(e => {
            const eid = e.compid ?? e.id;
            return eid === competitionid;
        });

        if (hasEntries) {
            const initTeamsDiv = createInitTeamsDiv(competitionid);
            div.appendChild(initTeamsDiv);
        }
    }

    return div;
}


function createNewSettingData(competitionid, defaultTag) {
    // Create the new setting entry with a provided default tag and value
    let newSetting = {
        id: competitionid,
        tag: defaultTag, // Use the provided default option
        value: (textTags.includes(defaultTag) || defaultTag === '') ? '' : 0 // Default to empty string or 0 depending on type
    };

    // Add the new setting to the data array
    data['settings'].push(newSetting);
    data['settings'].sort((a, b) => a.id - b.id);


    return newSetting;
}

function addSettingRow(setting, tbody) {
    const row = document.createElement('tr');
    row.dataset.id = setting.id; // Set data-id attribute
    row.dataset.tag = setting.tag; // Set data-tag attribute

    const tagCell = document.createElement('td');
    const valueCell = document.createElement('td');
    const deleteCell = document.createElement('td');
    valueCell.classList.add('tablevalue');

    const tagInput = document.createElement('input');
    const datalistId = `settings-options-${setting.id}-${Math.random().toString(16).slice(2)}`;
    const datalist = document.createElement('datalist');

    tagInput.type = 'text';
    tagInput.classList.add('settingsselect', 'settings-dropdown-input');
    tagInput.dataset.key = 'tag'; // Ensure this is set for duplicate checking
    tagInput.setAttribute('list', datalistId);
    tagInput.placeholder = 'Select a setting';
    tagInput.value = setting.tag;

    datalist.id = datalistId;

    // Populate the list of selectable options
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        datalist.appendChild(optionElement);
    });

    const valueInput = document.createElement('input');
    valueInput.type = textTags.includes(setting.tag) ? 'text' : 'number';
    valueInput.value = setting.value !== null ? setting.value : (valueInput.type === 'text' ? '' : 0);
    valueInput.min = valueInput.type === 'number' ? -1 : undefined;
    valueInput.classList.add('tablevalue-input');

    // Event listener for tag change
    tagInput.addEventListener('change', function () {
        const newTag = tagInput.value.trim();

        if (!options.includes(newTag)) {
            tagInput.value = setting.tag;
            return;
        }

        if (newTag === setting.tag) {
            return;
        }

        setting.tag = newTag;  // Update the local variable to reflect the change
        row.dataset.tag = newTag;
        handleSettingTagChange(setting, valueInput);
    });

    // Event listener for value change
    valueInput.addEventListener('change', function () {
        
        if(valueInput.value==''){
            deleteSetting(setting, tagInput);
        }else{
            handleSettingValueChange(setting.id, setting.tag, valueInput);
        }
    });

    tagCell.appendChild(tagInput);
    tagCell.appendChild(datalist);
    valueCell.appendChild(valueInput);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function () {
        deleteSetting(setting, tagInput);
    });
    deleteCell.appendChild(deleteButton);

    row.appendChild(tagCell);
    row.appendChild(valueCell);
    row.appendChild(deleteCell);
    tbody.appendChild(row);
}

function handleSettingTagChange(setting, input){
    console.log("I'm running!", setting, input);

    console.log(textTags.includes(setting.tag));
    input.type = textTags.includes(setting.tag) ? 'text' : 'number';
}

function mapAndFilterMatchingEntries(id, tag) {

    const mappedEntries = data['settings'].map((entry, index) => ({ entry, index }));

    const filteredEntries = mappedEntries.filter(item => item.entry.id == id && item.entry.tag == tag);

    return filteredEntries;
}

// Helper function to find matching rows in the table
function findMatchingRows(tbody, tag) {
    const rows = tbody.querySelectorAll('tr');
    let matchingrows = [];

    rows.forEach((row) => {
        if (row.children[0].children[0].value == tag) {
            matchingrows.push(row);
        }
    });

    return matchingrows;
}

// Helper function to find the final matching index in matching rows
function findFinalMatchingIndex(matchingrows, element) {

    for (let i = 0; i < matchingrows.length; i++) {
        if (matchingrows[i] == element.parentElement.parentElement) {
            return i;
        }
    }
    return -1;
}

// Helper function to find matching indices in the data array
function findMatchingIndices(id, tag) {
    let matchingindices = [];
    data['settings'].forEach((entry, index) => { 
        if (entry.tag == tag && entry.id == id) {
            matchingindices.push(index);
        }
    });
    return matchingindices;
}

function handleSettingValueChange(id, tag, input) {

            const matchingEntries = mapAndFilterMatchingEntries(id, tag);
            let tbody = input.closest('tbody');
            const matchingrows = findMatchingRows(tbody, tag);
            let finalmatchingindex = findFinalMatchingIndex(matchingrows, input);

            if (finalmatchingindex === -1 || finalmatchingindex >= matchingEntries.length) {
                return;
            }

            let matchingentry = matchingEntries[finalmatchingindex].entry;

            if (matchingentry) {
                matchingentry.value = input.value;
            }        

}

function deleteSetting(setting, select) {
    const matchingEntries = mapAndFilterMatchingEntries(setting.id, setting.tag);
    let tbody = select.closest('tbody');
    const matchingrows = findMatchingRows(tbody, setting.tag);
    let finalmatchingindex = findFinalMatchingIndex(matchingrows, select);

    const row = select.parentElement.parentElement; 

    row.remove();

    const getnthmatchingindex = matchingEntries[finalmatchingindex].index;
    data['settings'].splice(getnthmatchingindex, 1);
    

}
