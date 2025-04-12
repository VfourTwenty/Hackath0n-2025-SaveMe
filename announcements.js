function toggleAnnouncementForm() {
    const section = document.getElementById("announcement-form-section");
    section.classList.toggle("hidden");
}

function createAnnouncement() {
    const name = document.getElementById("animal-name").value.trim();
    const age = document.getElementById("animal-age").value.trim();
    const species = document.getElementById("animal-species").value;
    const health = document.getElementById("animal-health").value.trim();
    const location = document.getElementById("animal-location").value.trim();
    const description = document.getElementById("animal-description").value.trim();
    const photoInput = document.getElementById("animal-photo");
    const photoFile = photoInput.files[0];

    if (!name || !age || !health || !description || !location || !photoFile) {
        alert("Please fill out all fields.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function () {
        const photoUrl = reader.result;
        const id = crypto.randomUUID();
        const shelterEmail = sessionStorage.getItem("userEmail");

        // Animal object
        const animal = {
            id,
            name,
            species,
            age,
            health,
            description,
            location,
            photoUrl,
            creatorId: shelterEmail,
            createdAt: Date.now()
        };

        const currentUser = getCurrentUser();
        const isOwner = currentUser && currentUser.email === animal.ownerId;

        // Save to global animals
        const animals = JSON.parse(localStorage.getItem("animals") || "{}");
        animals[id] = animal;
        localStorage.setItem("animals", JSON.stringify(animals));

        // Update shelter's animal list
        const shelters = JSON.parse(localStorage.getItem("shelters") || "{}");
        const shelter = shelters[shelterEmail];

        if (!shelter.animals) shelter.animals = [];
        shelter.animals.push(id);

        localStorage.setItem("shelters", JSON.stringify(shelters));

        alert("Announcement created!");
        // Optionally: refresh list or close form
    };

    reader.readAsDataURL(photoFile);
    renderShelterAnnouncements();
}


let editingAnimalId = null;

function editAnnouncement(id) {
    const animals = JSON.parse(localStorage.getItem("animals") || "{}");
    const animal = animals[id];
    if (!animal) return alert("Animal not found.");

    editingAnimalId = id;

    // Fill form
    document.getElementById("edit-animal-name").value = animal.name;
    document.getElementById("edit-animal-species").value = animal.species || "";
    document.getElementById("edit-animal-age").value = animal.age;
    document.getElementById("edit-animal-health").value = animal.health;
    document.getElementById("edit-animal-location").value = animal.location || "";
    document.getElementById("edit-animal-description").value = animal.description;

    // Show edit form
    document.getElementById("edit-form-section").classList.remove("hidden");

    // Optionally scroll to it
    document.getElementById("edit-form-section").scrollIntoView({ behavior: "smooth" });
}

function updateAnnouncement() {
    if (!editingAnimalId) return;

    const animals = JSON.parse(localStorage.getItem("animals") || "{}");
    const animal = animals[editingAnimalId];
    if (!animal) return;

    // Update fields
    animal.name = document.getElementById("edit-animal-name").value.trim();
    animal.species = document.getElementById("edit-animal-species").value.trim();
    animal.age = document.getElementById("edit-animal-age").value.trim();
    animal.health = document.getElementById("edit-animal-health").value.trim();
    animal.location = document.getElementById("edit-animal-location").value.trim();
    animal.description = document.getElementById("edit-animal-description").value.trim();

    // Save
    animals[editingAnimalId] = animal;
    localStorage.setItem("animals", JSON.stringify(animals));

    // Hide form and refresh
    document.getElementById("edit-form-section").classList.add("hidden");
    renderShelterAnnouncements();
    alert("Announcement updated!");
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


function renderShelterAnnouncements() {
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
        console.log("the user is owner", isOwner);

        const card = document.createElement("div");
        card.className = "announcement-card";

        card.innerHTML = `
        <img class="announcement-photo" src="${animal.photoUrl}" alt="${animal.name}">
        <div class="announcement-info">
            <h3 class="announcement-name">${animal.name}</h3>
            <p class="announcement-species">${animal.species}</p> <!-- 👈 Added -->
            <p class="announcement-age">${animal.age}</p>
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

        const card = document.createElement("div");
        card.className = "announcement-card";

        card.innerHTML = `
            <img class="announcement-photo" src="${animal.photoUrl}" alt="${animal.name}">
            <div class="announcement-info">
                <h3 class="announcement-name">${animal.name}</h3>
                <p class="announcement-species">${animal.species}</p>
                <p class="announcement-age">${animal.age}</p>
                <p class="announcement-health">${animal.health}</p>
                <p class="announcement-location">${animal.location || 'Unknown location'}</p>
                <p class="announcement-description">${animal.description}</p>
                <hr style="margin: 1rem 0;">
                <p class="shelter-info">
                    <strong>Shelter:</strong> ${shelter?.name || "Unknown"}<br>
                    <strong>Contact:</strong> ${shelter?.contact || "N/A"}
                </p>
                <button class="favorite-btn" onclick="toggleFavorite('${id}'); renderVolunteerFavorites();">
                    ★ Remove from Favorites
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}



function renderAllAnnouncements() {
    const container = document.getElementById("all-announcements");
    container.innerHTML = "";

    const allAnimals = JSON.parse(localStorage.getItem("animals") || "{}");
    const allShelters = JSON.parse(localStorage.getItem("shelters") || "{}");

    const animalIds = Object.keys(allAnimals);
    if (animalIds.length === 0) {
        container.innerHTML = "<p style='color:white;'>No animals available at the moment.</p>";
        return;
    }

    const user = getCurrentUser();
    const isVolunteer = user?.role === "volunteer";
    const favorites = isVolunteer ? user.favorites || [] : [];

    animalIds.forEach(id => {
        const animal = allAnimals[id];
        const shelter = allShelters[animal.creatorId];
        const isFavorited = isVolunteer && favorites.includes(id);

        const card = document.createElement("div");
        card.className = "announcement-card";

        card.innerHTML = `
            <img class="announcement-photo" src="${animal.photoUrl}" alt="${animal.name}">
            <div class="announcement-info">
                <h3 class="announcement-name">${animal.name}</h3>
                <p class="announcement-species">${animal.species}</p>
                <p class="announcement-age">${animal.age}</p>
                <p class="announcement-health">${animal.health}</p>
                <p class="announcement-location">${animal.location || 'Unknown location'}</p>
                <p class="announcement-description">${animal.description}</p>
                <hr style="margin: 1rem 0;">
                <p class="shelter-info">
                    <strong>Shelter:</strong> ${shelter?.name || "Unknown"}<br>
                    <strong>Contact:</strong> ${shelter?.contact || "N/A"}
                </p>
                ${
            isVolunteer
                ? `<button class="favorite-btn" onclick="toggleFavorite('${id}')">
                            ${isFavorited ? '★ Saved' : '☆ Add to Favorites'}
                           </button>`
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
        renderAllAnnouncements();
    }

    // Also re-render favorites if on the volunteer dashboard
    else
    {
        renderVolunteerFavorites();
    }
}

