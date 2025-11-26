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

const selectTypeBuffer = new Map();
const selectTypeResetTimers = new Map();
const TYPEAHEAD_RESET_MS = 800;

function handleTypeaheadKey(select, event) {
    const key = event.key;
    const isCharacter = key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;

    if (isCharacter) {
        const newQuery = (selectTypeBuffer.get(select) || '') + key.toLowerCase();
        selectTypeBuffer.set(select, newQuery);
        populateSelectOptions(select, select.value, newQuery);
        scheduleTypeaheadReset(select);
        select.focus({ preventScroll: true });
        event.preventDefault();
    } else if (key === 'Backspace') {
        const currentQuery = selectTypeBuffer.get(select) || '';
        const updatedQuery = currentQuery.slice(0, -1);
        selectTypeBuffer.set(select, updatedQuery);
        populateSelectOptions(select, select.value, updatedQuery);
        scheduleTypeaheadReset(select);
        select.focus({ preventScroll: true });
        event.preventDefault();
    } else if (key === 'Escape') {
        resetTypeahead(select);
        populateSelectOptions(select, select.value);
    }
}

function sortOptionsWithQuery(query) {
    const lowerQuery = query.trim().toLowerCase();

    return [...options].sort((a, b) => {
        const scoreA = optionScore(a, lowerQuery);
        const scoreB = optionScore(b, lowerQuery);

        if (scoreA !== scoreB) return scoreA - scoreB;
        return a.localeCompare(b);
    });
}

function optionScore(option, query) {
    if (!query) return 0;

    const lowerOption = option.toLowerCase();

    if (lowerOption.startsWith(query)) return 0;

    const index = lowerOption.indexOf(query);

    if (index !== -1) return 1 + index;

    return 1000;
}

function populateSelectOptions(select, selectedValue, query = '') {
    const sortedOptions = sortOptionsWithQuery(query);

    select.innerHTML = '';

    sortedOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        if (option === selectedValue) optionElement.selected = true;
        select.appendChild(optionElement);
    });
}

function resetTypeahead(select) {
    selectTypeBuffer.set(select, '');
    populateSelectOptions(select, select.value);
}

function scheduleTypeaheadReset(select) {
    clearTimeout(selectTypeResetTimers.get(select));
    const timer = setTimeout(() => resetTypeahead(select), TYPEAHEAD_RESET_MS);
    selectTypeResetTimers.set(select, timer);
}

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

    // "Create New Setting" button (unchanged)
    const usedTags = settingsData.map(setting => setting.tag);
    const availableOptions = options.filter(option => !usedTags.includes(option));

    if (availableOptions.length > 0) {
        const createButton = document.createElement('button');
        createButton.textContent = 'Create New Setting';
        createButton.addEventListener('click', function () {
            const randomIndex = Math.floor(Math.random() * availableOptions.length);
            const selectedOption = availableOptions.splice(randomIndex, 1)[0];
            let newSetting = createNewSettingData(competitionid, selectedOption);
            addSettingRow(newSetting, tbody);
            cloneButton.disabled = false;

            if (availableOptions.length === 0) {
                createButton.disabled = true;
            }
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
        value: textTags.includes(defaultTag) ? '' : 0 // Default to empty string or 0 depending on type
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
    valueCell.classList.add('tablevalue');

    const select = document.createElement('select');
    select.classList.add('settingsselect');
    select.dataset.key = 'tag'; // Ensure this is set for duplicate checking

    // Populate the select options
    populateSelectOptions(select, setting.tag);

    const input = document.createElement('input');
    input.type = textTags.includes(setting.tag) ? 'text' : 'number';
    input.value = setting.value !== null ? setting.value : (input.type === 'text' ? '' : 0);
    input.min = input.type === 'number' ? -1 : undefined;
    input.classList.add('tablevalue-input');

    // Event listener for tag change
    select.addEventListener('change', function () {
        setting.tag = select.value;  // Update the local variable to reflect the change
        resetTypeahead(select);
        handleSettingTagChange(setting, input);
    });

    select.addEventListener('keydown', function (event) {
        handleTypeaheadKey(select, event);
    });

    // Some browsers don't bubble character keys to keydown while the dropdown is open,
    // so also listen on keypress to keep collecting multi-character queries.
    select.addEventListener('keypress', function (event) {
        handleTypeaheadKey(select, event);
    });

    select.addEventListener('blur', function () {
        resetTypeahead(select);
    });

    // Event listener for value change
    input.addEventListener('change', function () {
        
        if(input.value==''){
            deleteSetting(setting, select);
        }else{
            handleSettingValueChange(setting.id, setting.tag, input);
        }
    });

    tagCell.appendChild(select);
    valueCell.appendChild(input);
    row.appendChild(tagCell);
    row.appendChild(valueCell);
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
