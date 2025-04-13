
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

    const ageComp = document.getElementById("age-comparator")?.value;
    const ageYears = parseInt(document.getElementById("filter-age-years")?.value) || 0;
    const ageMonths = parseInt(document.getElementById("filter-age-months")?.value) || 0;
    const ageInMonths = ageYears * 12 + ageMonths;

    const filtered = ids.filter(id => {
        const a = allAnimals[id];
        if (!a) return false;

        const matchText = searchQuery === "" ||
            a.name.toLowerCase().includes(searchQuery) ||
            a.description.toLowerCase().includes(searchQuery) ||
            a.species?.toLowerCase().includes(searchQuery) ||
            a.location?.toLowerCase().includes(searchQuery); // ✅ Location match

        const matchSpecies = selectedSpecies.length === 0 || selectedSpecies.includes(a.species);
        const matchHealth = selectedHealth.length === 0 || selectedHealth.includes(a.health);

        const matchAge =
            isNaN(ageInMonths) || ageInMonths === 0
            || (ageComp === "younger" && a.age < ageInMonths)
            || (ageComp === "equal" && a.age === ageInMonths)
            || (ageComp === "older" && a.age > ageInMonths);

        return matchText && matchSpecies && matchHealth && matchAge;
    });

    sessionStorage.setItem("filteredAnimalIds", JSON.stringify(filtered));
    renderAllAnnouncements(filtered);
}


function clearFilters() {
    // 🔄 Uncheck all species checkboxes
    const speciesCheckboxes = document.querySelectorAll('input[name="species"]');
    speciesCheckboxes.forEach(cb => cb.checked = false);
    const speciesAll = document.getElementById("species-all");
    if (speciesAll) speciesAll.checked = false;

    // 🔄 Uncheck all health checkboxes
    const healthCheckboxes = document.querySelectorAll('input[name="health"]');
    healthCheckboxes.forEach(cb => cb.checked = false);
    const healthAll = document.getElementById("health-all");
    if (healthAll) healthAll.checked = false;

    // 🔄 Reset age comparator and fields
    const comparator = document.getElementById("age-comparator");
    if (comparator) comparator.value = "";

    const ageYears = document.getElementById("filter-age-years");
    if (ageYears) ageYears.value = "";

    const ageMonths = document.getElementById("filter-age-months");
    if (ageMonths) ageMonths.value = "";

    // 🔄 Clear search bar
    const search = document.getElementById("global-search");
    if (search) search.value = "";

    // 🔄 Clear filtered IDs
    sessionStorage.removeItem("filteredAnimalIds");

    // 🔄 Render all announcements again
    renderAllAnnouncements();
}
