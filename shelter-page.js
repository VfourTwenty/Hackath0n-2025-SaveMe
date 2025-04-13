function viewShelterProfile(email) {
    // sessionStorage.setItem("viewedShelterEmail", email);
    loadPage("shelter-page.html", false, () => {
        renderPublicShelterProfile(email);
    });
}

function renderPublicShelterProfile(email) {
    const shelters = JSON.parse(localStorage.getItem("shelters") || "{}");
    const animals = JSON.parse(localStorage.getItem("animals") || "{}");

    const shelter = shelters[email];
    if (!shelter) return;

    document.getElementById("public-shelter-name").textContent = shelter.name;
    document.getElementById("public-shelter-type").textContent = "Type: " + (shelter.type || "N/A");
    document.getElementById("public-shelter-contact").textContent = "Contact: " + (shelter.contact || "N/A");
    document.getElementById("public-eth-wallet").textContent = shelter.ethWallet || "Not specified";
    document.getElementById("public-other-payments").textContent = shelter.otherPayment || "Not specified";

    const container = document.getElementById("public-shelter-animals");
    container.innerHTML = "";

    const user = getCurrentUser();
    const isVolunteer = user?.role === "volunteer";

    (shelter.animals || []).forEach(id => {
        const animal = animals[id];
        if (!animal) return;

        const ageDisplay = formatAge(animal.age);
        const favorites = isVolunteer ? user.favorites || [] : [];
        const isFavorited = isVolunteer && favorites.includes(id);

        const card = document.createElement("div");
        card.className = "announcement-card";

        const ageText = formatAge(animal.age); // 🐾 if you already use it
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
                    <strong>Shelter:</strong>
                        <span class="shelter-link" onclick="viewShelterProfile('${shelter?.email}')">
                             ${shelter?.name || "Unknown"}
                        </span><br>
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
