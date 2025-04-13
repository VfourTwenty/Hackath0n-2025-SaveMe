function search(query) {
    query = query.trim().toLowerCase();
    console.log("Search query:", query);

    // Process the query
}

function setupSpeciesFilterCheckboxes() {
    const allBox = document.getElementById("species-all");
    const label = allBox.closest("label"); // Find the label element
    const speciesBoxes = [...document.querySelectorAll('input[name="species"]:not(#species-all)')];

    if (!allBox || speciesBoxes.length === 0) return;

    function updateLabelText() {
        label.lastChild.textContent = allBox.checked ? " Clear all" : " All";
    }

    allBox.addEventListener("change", () => {
        speciesBoxes.forEach(box => box.checked = allBox.checked);
        updateLabelText();
    });

    speciesBoxes.forEach(box => {
        box.addEventListener("change", () => {
            if (!box.checked) allBox.checked = false;
            else if (speciesBoxes.every(b => b.checked)) allBox.checked = true;
            updateLabelText();
        });
    });

    updateLabelText(); // Initial sync
}


function setupHealthFilterCheckboxes() {
    const allBox = document.getElementById("health-all");
    const label = allBox.closest("label");
    const healthBoxes = [...document.querySelectorAll('input[name="health"]:not(#health-all)')];

    if (!allBox || healthBoxes.length === 0) return;

    function updateLabelText() {
        label.lastChild.textContent = allBox.checked ? " Clear all" : " All";
    }

    allBox.addEventListener("change", () => {
        healthBoxes.forEach(box => box.checked = allBox.checked);
        updateLabelText();
    });

    healthBoxes.forEach(box => {
        box.addEventListener("change", () => {
            if (!box.checked) allBox.checked = false;
            else if (healthBoxes.every(b => b.checked)) allBox.checked = true;
            updateLabelText();
        });
    });

    updateLabelText();
}


function applyFiltersAndSearch(query = null) {
    const allAnimals = JSON.parse(localStorage.getItem("animals") || "{}");
    const ids = Object.keys(allAnimals);

    const searchQuery = (query ?? document.getElementById("global-search")?.value)?.toLowerCase() || "";

    const selectedSpecies = [...document.querySelectorAll('input[name="species"]:checked')]
        .map(cb => cb.value)
        .filter(v => v !== "All");

    const selectedHealth = [...document.querySelectorAll('input[name="health"]:checked')]
        .map(cb => cb.value)
        .filter(v => v !== "All");

    const filtered = ids.filter(id => {
        const a = allAnimals[id];
        if (!a) return false;

        const matchText = searchQuery === "" ||
            a.name.toLowerCase().includes(searchQuery) ||
            a.description.toLowerCase().includes(searchQuery) ||
            a.species?.toLowerCase().includes(searchQuery);

        const matchSpecies = selectedSpecies.length === 0 || selectedSpecies.includes(a.species);
        const matchHealth = selectedHealth.length === 0 || selectedHealth.includes(a.health);

        return matchText && matchSpecies && matchHealth;
    });

    sessionStorage.setItem("filteredAnimalIds", JSON.stringify(filtered));
    renderAllAnnouncements(filtered);
}

