let effects = [];
let selectedEffects = [];
let excludedEffects = [];
let displayMode = 0;

// Load effects from JSON file
fetch('effects.json')
    .then(response => response.json())
    .then(data => {
        effects = data;
        loadStateFromUrl();
    });

function loadStateFromUrl() {
    const params = new URLSearchParams(window.location.search);

    // Load selected effects
    const selected = params.get('s');
    if (selected) {
        selectedEffects = decodeIds(selected);
    }

    // Load excluded effects
    const excluded = params.get('e');
    if (excluded) {
        excludedEffects = decodeIds(excluded);
    }

    // Load number of effects
    const num = params.get('n');
    if (num) {
        document.getElementById('numEffects').value = num;
    }

    // Load display mode
    const mode = params.get('v');
    if (mode) {
        displayMode = 1;
    } else {
        displayMode = 0;
    }

    updateDisplay();
}

function updateUrl() {
    const params = new URLSearchParams();
    if (selectedEffects.length > 0) {
        params.set('s', encodeIds(selectedEffects));
    }
    if (excludedEffects.length > 0) {
        params.set('e', encodeIds(excludedEffects));
    }
    params.set('n', document.getElementById('numEffects').value);
    params.set('v', displayMode);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
}

function selectEffects() {
    const numEffects = parseInt(document.getElementById('numEffects').value);

    // Move current selected effects to excluded
    excludedEffects = [...excludedEffects, ...selectedEffects];
    console.log({ excludedEffects });

    // Get available effects (not excluded)
    let availableEffects = effects.filter((_, index) =>
        !excludedEffects.includes(index));
    availableEffects = availableEffects.filter(elem =>
        availableEffects.every(other =>
            other === elem || !("exclude" in other) || !other["exclude"].includes(elem["name"])
        ));
    console.log({ availableEffects });

    let shuffled = [...availableEffects].sort(() => 0.5 - Math.random());
    console.log({ shuffled });

    let select_shuffled_all = -1;
    for (let i = 0; i < Math.min(shuffled.length, numEffects); i++) {
        if ("exclude_all" in shuffled[i]) {
            select_shuffled_all = i;
            break;
        }
    }
    if (select_shuffled_all >= 0)
        shuffled = [shuffled[select_shuffled_all]];
    else
        shuffled = shuffled.filter(elem => !("exclude_all" in elem));
    console.log({ shuffled });

    if (select_shuffled_all < 0 && shuffled.length < numEffects) {
        alert("You've gone through all the effects. Confirm to start a new round.");
        excludedEffects = [];
        selectedEffects = [];
        return selectEffects();
    }

    // Randomly select new effects
    selectedEffects = shuffled.slice(0, numEffects).map((e1 => effects.findIndex(e2 => e1.name === e2.name)));

    updateDisplay();
    updateUrl();
}

function reset() {
    if (confirm("Are you sure you want to reset?")) {
        selectedEffects = [];
        excludedEffects = [];
        updateDisplay();
        updateUrl();
    }
}

function toggleNameDisplay() {
    displayMode = displayMode === 0 ? 1 : 0;
    updateUrl();
    updateDisplay();
}

function getEffectName(effect) {
    if (displayMode === 1)
        return effect["sgs_name"];
    else
        return effect["name"];
}

function updateDisplay() {
    const cardsDiv = document.getElementById('cards');
    cardsDiv.innerHTML = '';

    selectedEffects.forEach(effectId => {
        const effect = effects[effectId];
        if (effect) {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                        <div class="card-title">
                            <h3>${getEffectName(effect)}</h3>
                        </div>
                        <p>${effect.effect}</p>
                    `;
            cardsDiv.appendChild(card);
        }
    });

    const toggleNameButton = document.getElementById('toggleName');
    toggleNameButton.innerText = displayMode == 1 ? 'Normal Name' : 'SGS Name';
}

function showAllEffects() {
    const effectsList = document.getElementById('effectsList');
    effectsList.innerHTML = '<ul>' +
        effects.map(effect => `
                    <li>
                        <strong>${getEffectName(effect)}</strong>: ${effect.effect}
                    </li>
                `).join('') +
        '</ul>';
    document.getElementById('modalTitle').innerText = 'All Effects (' + effects.length + ')';
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}

function encodeIds(ids) {
    let result = 0;
    ids.forEach(id => {
        result |= (1 << id);
    });
    return result;
}

function decodeIds(code) {
    let ids = [];
    let id = 0;
    while (code > 0) {
        if (code & 1) {
            ids.push(id);
        }
        code >>= 1;
        id++;
    }
    return ids;
}

if (!window.location.href.includes("127.0.0.1") && !window.location.href.includes("localhost")) {
    window.addEventListener("beforeunload", function (e) {
        e.preventDefault();
        return 'Are you sure you want to quit?';
    });
}

function validateInput(input) {
    input.value = Math.min(effects.length, Math.max(1, parseInt(input.value) || 1));
}