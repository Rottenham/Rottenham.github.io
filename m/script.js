let effects = [];
let selectedEffects = [];
let excludedEffects = [];

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

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
}

function selectEffects() {
    const numEffects = parseInt(document.getElementById('numEffects').value);

    // Move current selected effects to excluded
    excludedEffects = [...excludedEffects, ...selectedEffects];
    console.log(excludedEffects)

    // Get available effects (not excluded)
    const availableEffects = effects.filter((_, index) =>
        !excludedEffects.includes(index));

    if (availableEffects.length < numEffects) {
        alert('Not enough effects available. Clearing excluded effects.');
        excludedEffects = [];
        return selectEffects();
    }

    // Randomly select new effects
    const shuffled = [...availableEffects].sort(() => 0.5 - Math.random());
    console.log(shuffled);
    selectedEffects = shuffled.slice(0, numEffects).map((e1 => effects.findIndex(e2 => e1.name === e2.name)));
    console.log(selectedEffects);

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
                            <h3>${effect.name}</h3>
                        </div>
                        <p>${effect.effect}</p>
                    `;
            cardsDiv.appendChild(card);
        }
    });
}

function showAllEffects() {
    const effectsList = document.getElementById('effectsList');
    effectsList.innerHTML = '<ul>' +
        effects.map(effect => `
                    <li>
                        <strong>${effect.name}</strong>: ${effect.effect}
                    </li>
                `).join('') +
        '</ul>';
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
        bits >>= 1;
        id++;
    }
    return ids;
}

window.addEventListener("beforeunload", function (e) {
    e.preventDefault();
    return 'Are you sure you want to quit?';
});