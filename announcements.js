function toggleAnnouncementForm() {
    const section = document.getElementById("announcement-form-section");
    section.classList.toggle("hidden");
}

function createAnnouncement() {
    const name = document.getElementById("animal-name").value.trim();
    let years = parseInt(document.getElementById("animal-age-years").value) || 0;
    let months = parseInt(document.getElementById("animal-age-months").value) || 0;

    // Normalize months
    if (months > 11) {
        years += Math.floor(months / 12);
        months = months % 12;
    }

    const totalMonths = years * 12 + months;
    const species = document.getElementById("animal-species").value;
    const health = document.getElementById("animal-health").value.trim();
    const location = document.getElementById("animal-location").value.trim();
    const description = document.getElementById("animal-description").value.trim();
    const photoInput = document.getElementById("animal-photo");
    const photoFile = photoInput.files[0];

    if (!name || !species || totalMonths === 0 || !health || !location || !description || !photoFile) {
        alert("Please fill out all fields.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function () {
        const photoUrl = reader.result;
        const id = crypto.randomUUID();
        const shelterEmail = sessionStorage.getItem("userEmail");

        const animal = {
            id,
            name,
            species,
            age: totalMonths,
            health,
            location,
            description,
            photoUrl,
            creatorId: shelterEmail,
            createdAt: Date.now()
        };

        // Save to animals
        const animals = JSON.parse(localStorage.getItem("animals") || "{}");
        animals[id] = animal;
        localStorage.setItem("animals", JSON.stringify(animals));

        // Update shelter animal list
        const shelters = JSON.parse(localStorage.getItem("shelters") || "{}");
        const shelter = shelters[shelterEmail];
        if (!shelter.animals) shelter.animals = [];
        shelter.animals.push(id);
        localStorage.setItem("shelters", JSON.stringify(shelters));

        // Refresh UI
        renderShelterAnnouncements();
        document.getElementById("announcement-form-section").classList.add("hidden");
    };

    reader.readAsDataURL(photoFile);
}



let editingAnimalId = null;

function editAnnouncement(id) {
    const animals = JSON.parse(localStorage.getItem("animals") || "{}");
    const animal = animals[id];
    if (!animal) return alert("Animal not found.");

    editingAnimalId = id;

    // Split age in months into years and months
    const years = Math.floor(animal.age / 12);
    const months = animal.age % 12;

    // Fill form fields
    document.getElementById("edit-animal-name").value = animal.name;
    document.getElementById("edit-animal-species").value = animal.species || "";
    document.getElementById("edit-animal-age-years").value = years;
    document.getElementById("edit-animal-age-months").value = months;
    document.getElementById("edit-animal-health").value = animal.health;
    document.getElementById("edit-animal-location").value = animal.location || "";
    document.getElementById("edit-animal-description").value = animal.description;

    // Show and scroll to edit form
    document.getElementById("edit-form-section").classList.remove("hidden");
    document.getElementById("edit-form-section").scrollIntoView({ behavior: "smooth" });
}


function updateAnnouncement() {
    if (!editingAnimalId) return;

    const animals = JSON.parse(localStorage.getItem("animals") || "{}");
    const animal = animals[editingAnimalId];
    if (!animal) return;

    const years = parseInt(document.getElementById("edit-animal-age-years").value) || 0;
    const months = parseInt(document.getElementById("edit-animal-age-months").value) || 0;
    const totalMonths = years * 12 + months;

    // Update fields
    animal.name = document.getElementById("edit-animal-name").value.trim();
    animal.species = document.getElementById("edit-animal-species").value.trim();
    animal.age = totalMonths;
    animal.health = document.getElementById("edit-animal-health").value.trim();
    animal.location = document.getElementById("edit-animal-location").value.trim();
    animal.description = document.getElementById("edit-animal-description").value.trim();

    // Save
    animals[editingAnimalId] = animal;
    localStorage.setItem("animals", JSON.stringify(animals));

    // Hide form and refresh
    document.getElementById("edit-form-section").classList.add("hidden");
    renderShelterAnnouncements();
}



function deleteAnnouncement(id) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const animals = JSON.parse(localStorage.getItem("animals") || "{}");
    const shelters = JSON.parse(localStorage.getItem("shelters") || "{}");

    const animal = animals[id];
    if (!animal || animal.creatorId !== currentUser.email) {
        alert("You can only delete your own announcements.");
        return;
    }

    // Remove from global animals
    delete animals[id];
    localStorage.setItem("animals", JSON.stringify(animals));

    // Remove from the shelter's own list
    currentUser.animals = currentUser.animals.filter(aid => aid !== id);
    shelters[currentUser.email] = currentUser;
    localStorage.setItem("shelters", JSON.stringify(shelters));

    renderShelterAnnouncements(); // Refresh view
}


function formatAge(months) {
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    const yStr = years > 0 ? `${years} year${years > 1 ? "s" : ""}` : "";
    const mStr = remMonths > 0 ? `${remMonths} month${remMonths > 1 ? "s" : ""}` : "";
    const parts = [yStr, mStr].filter(Boolean).join(" ");
    return parts ? `${parts} old` : "0 months old";
}


function renderShelterAnnouncements() {
    console.log("rendering shelter");
    const user = getCurrentUser();
    if (!user || !user.animals || user.animals.length === 0) {
        document.getElementById("shelter-announcements").innerHTML = "<p style='color:white;'>No announcements yet.</p>";
        return;
    }

    const container = document.getElementById("shelter-announcements");
    container.innerHTML = "";

    const allAnimals = JSON.parse(localStorage.getItem("animals") || "{}");

    user.animals.forEach(id => {
        const animal = allAnimals[id];
        if (!animal) return;

        const isOwner = user.email === animal.creatorId;
        const ageDisplay = formatAge(animal.age);

        const card = document.createElement("div");
        card.className = "announcement-card";

        card.innerHTML = `
        <img class="announcement-photo" src="${animal.photoUrl}" alt="${animal.name}">
        <div class="announcement-info">
            <h3 class="announcement-name">${animal.name}</h3>
            <p class="announcement-species">${animal.species}</p> <!-- 👈 Added -->
            <p class="announcement-age">${ageDisplay}</p>
            <p class="announcement-health">${animal.health}</p>
             <p class="announcement-location">${animal.location}</p> <!-- 👈 New -->
            <p class="announcement-description">${animal.description}</p>
            ${isOwner ? `
                <button class="delete-btn" onclick="deleteAnnouncement('${animal.id}')">Delete</button>
                <button class="edit-btn" onclick="editAnnouncement('${animal.id}')">Edit</button>
            ` : ''}
        </div>
    `;

        container.appendChild(card);
    });

}


function renderVolunteerFavorites() {
    const user = getCurrentUser();
    if (!user || !user.favorites || user.favorites.length === 0) {
        document.getElementById("favorite-animals").innerHTML = "<p style='color:white;'>You haven’t saved any animals yet.</p>";
        return;
    }

    const container = document.getElementById("favorite-animals");
    container.innerHTML = "";

    const allAnimals = JSON.parse(localStorage.getItem("animals") || "{}");
    const allShelters = JSON.parse(localStorage.getItem("shelters") || "{}");

    user.favorites.forEach(id => {
        const animal = allAnimals[id];
        if (!animal) return;

        const shelter = allShelters[animal.creatorId];
        const ageDisplay = formatAge(animal.age);

        const card = document.createElement("div");
        card.className = "announcement-card";

        card.innerHTML = `
            <img class="announcement-photo" src="${animal.photoUrl}" alt="${animal.name}">
            <div class="announcement-info">
                <h3 class="announcement-name">${animal.name}</h3>
                <p class="announcement-species">${animal.species}</p>
                <p class="announcement-age">${ageDisplay}</p>
                <p class="announcement-health">${animal.health}</p>
                <p class="announcement-location">${animal.location || 'Unknown location'}</p>
                <p class="announcement-description">${animal.description}</p>
                <hr style="margin: 1rem 0;">
                <p class="shelter-info">
                    <strong>Shelter:</strong> ${shelter?.name || "Unknown"}<br>
                    <strong>Contact:</strong> ${shelter?.contact || "N/A"}
                </p>
                <div class="volunteer-buttons">
                    <button class="favorite-btn" onclick="toggleFavorite('${id}'); renderVolunteerFavorites();">
                        ★ Remove from Favorites
                    </button>
                    <div class="donate-btn" onclick="toggleDonationModal('${id}')"
                         title="Support me!">
                         <img src="../images/eth-icon.svg" alt="Donate">
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}


function renderAllAnnouncements(filteredIds = null) {
    const container = document.getElementById("all-announcements");
    container.innerHTML = "";

    const allAnimals = JSON.parse(localStorage.getItem("animals") || "{}");
    const allShelters = JSON.parse(localStorage.getItem("shelters") || "{}");

    const idsToRender = filteredIds || Object.keys(allAnimals);

    if (idsToRender.length === 0) {
        container.innerHTML = "<p style='color:white;'>No animals match your filters.</p>";
        return;
    }

    const user = getCurrentUser();
    const isVolunteer = user?.role === "volunteer";
    const favorites = isVolunteer ? user.favorites || [] : [];

    idsToRender.forEach(id => {
        const animal = allAnimals[id];
        if (!animal) return;

        const shelter = allShelters[animal.creatorId];
        const ageDisplay = formatAge(animal.age);
        const isFavorited = isVolunteer && favorites.includes(id);

        const card = document.createElement("div");
        card.className = "announcement-card";

        card.innerHTML = `
            <img class="announcement-photo" src="${animal.photoUrl}" alt="${animal.name}">
            <div class="announcement-info">
                <h3 class="announcement-name">${animal.name}</h3>
                <p class="announcement-species">${animal.species}</p>
                <p class="announcement-age">${ageDisplay}</p>
                <p class="announcement-health">${animal.health}</p>
                <p class="announcement-location">${animal.location || 'Unknown location'}</p>
                <p class="announcement-description">${animal.description}</p>
                <hr style="margin: 1rem 0;">
                <p class="shelter-info">
                    <strong>Shelter:</strong> ${shelter?.name || "Unknown"}<br>
                    <strong>Contact:</strong> ${shelter?.contact || "N/A"}
                </p>
                ${isVolunteer
                            ? `
                        <div class="volunteer-buttons">
                            <button class="favorite-btn" onclick="toggleFavorite('${id}')">
                                ${isFavorited ? '★ Saved' : '☆ Add to Favorites'}
                            </button>
                            <div class="donate-btn" onclick="toggleDonationModal('${id}')"
                                 title="Support me!">
                                <img src="../images/eth-icon.svg" alt="Donate">
                            </div>
                        </div>`
                            : ""
                        }
            </div>
        `;
        container.appendChild(card);
    });
}


function toggleFavorite(animalId) {
    const user = getCurrentUser();
    if (!user || user.role !== "volunteer") return;

    const volunteers = JSON.parse(localStorage.getItem("volunteers") || "{}");
    const email = user.email;

    if (!volunteers[email].favorites) {
        volunteers[email].favorites = [];
    }

    const index = volunteers[email].favorites.indexOf(animalId);
    if (index === -1) {
        volunteers[email].favorites.push(animalId);
    } else {
        volunteers[email].favorites.splice(index, 1);
    }

    localStorage.setItem("volunteers", JSON.stringify(volunteers));

    // Only re-render if the all-announcements container exists
    const allPage = document.getElementById("all-announcements");
    if (allPage) {
        const filteredIds = JSON.parse(sessionStorage.getItem("filteredAnimalIds") || "[]");
        renderAllAnnouncements(filteredIds.length ? filteredIds : undefined);
    } else {
        renderVolunteerFavorites();
    }
}




function toggleFilterPanel() {
    const panel = document.getElementById("filter-panel");
    panel.classList.toggle("hidden");

    // Close on outside click
    if (!panel.classList.contains("hidden")) {
        setTimeout(() => {
            document.addEventListener("click", outsideClickListener);
        }, 0);
    }
}

function outsideClickListener(event) {
    const panel = document.getElementById("filter-panel");
    const icon = document.querySelector(".filter-icon");

    if (!panel.contains(event.target) && !icon.contains(event.target)) {
        panel.classList.add("hidden");
        document.removeEventListener("click", outsideClickListener);
    }
}

