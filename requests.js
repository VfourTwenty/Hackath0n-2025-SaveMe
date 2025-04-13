function toggleRequestForm() {
    const section = document.getElementById("request-form-section");
    section.classList.toggle("hidden");
}


function createRequest() {
    const type = document.getElementById("request-type").value;
    const description = document.getElementById("request-description").value.trim();
    const photoFile = document.getElementById("request-photo").files[0];
    const volunteerEmail = sessionStorage.getItem("userEmail");

    if (!type || !description || !photoFile) {
        alert("Please fill out all fields.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function () {
        const photoUrl = reader.result;
        const id = crypto.randomUUID();

        const request = {
            id,
            type,
            description,
            photoUrl,
            creatorId: volunteerEmail,
            createdAt: Date.now()
        };

        const requests = JSON.parse(localStorage.getItem("requests") || "{}");
        requests[id] = request;
        localStorage.setItem("requests", JSON.stringify(requests));

        const volunteers = JSON.parse(localStorage.getItem("volunteers") || "{}");
        if (!volunteers[volunteerEmail].requests) volunteers[volunteerEmail].requests = [];
        volunteers[volunteerEmail].requests.push(id);
        localStorage.setItem("volunteers", JSON.stringify(volunteers));

        document.getElementById("request-form-section").classList.add("hidden");
        renderVolunteerRequests();
    };

    reader.readAsDataURL(photoFile);
}

function renderVolunteerRequests() {
    const user = getCurrentUser();
    const container = document.getElementById("volunteer-requests");

    if (!user || !user.requests || user.requests.length === 0) {
        container.innerHTML = "<p style='color:white;'>No requests yet.</p>";
        return;
    }

    const allRequests = JSON.parse(localStorage.getItem("requests") || "{}");
    container.innerHTML = "";

    user.requests.forEach(id => {
        const req = allRequests[id];
        if (!req) return;

        const card = document.createElement("div");
        card.className = "announcement-card";

        const isOwner = user.email === req.creatorId;

        card.innerHTML = `
        <img class="announcement-photo" src="${req.photoUrl}" alt="Request">
            <div class="announcement-info">
                <h3>${req.type === "looking" ? "Looking to Adopt" : "Animal Found"}</h3>
                <p class="announcement-description">${req.description}</p>
                ${isOwner ? `
                    <button class="edit-btn" onclick="editRequest('${id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteRequest('${id}')">Delete</button>
                ` : ''}
            </div>
        `;

        container.appendChild(card);
    });
}


function renderAllRequests(requestIds = null) {
    const container = document.getElementById("request-results");
    const allRequests = JSON.parse(localStorage.getItem("requests") || "{}");
    const allVolunteers = JSON.parse(localStorage.getItem("volunteers") || "{}");

    // Use all request IDs if none provided
    const idsToRender = requestIds || Object.keys(allRequests);

    if (idsToRender.length === 0) {
        container.innerHTML = "<p style='color:white;'>No open requests at the moment.</p>";
        return;
    }

    console.log("Rendering requests:", idsToRender);
    container.innerHTML = "";

    idsToRender.forEach(id => {
        const req = allRequests[id];
        const creator = allVolunteers[req.creatorId];

        if (!req) return;

        const card = document.createElement("div");
        card.className = "request-card";

        card.innerHTML = `
            <img class="announcement-photo" src="${req.photoUrl}" alt="Request Photo">
            <div class="announcement-info">
                <h3>${req.type === "looking" ? "Looking to Adopt" : "Animal Found"}</h3>
                <p class="announcement-description">${req.description}</p>
                <hr style="margin: 1rem 0;">
                <p class="shelter-info">
                    <strong>Submitted by:</strong> ${creator?.name || "Unknown"}<br>
                    <strong>Contact:</strong> ${creator?.email || "N/A"}
                </p>
            </div>
        `;

        container.appendChild(card);
    });
}


let editingRequestId = null;

function editRequest(id) {
    const requests = JSON.parse(localStorage.getItem("requests") || "{}");
    const req = requests[id];
    if (!req) return alert("Request not found.");

    editingRequestId = id;

    document.getElementById("edit-request-description").value = req.description;

    document.getElementById("edit-request-form-section").classList.remove("hidden");
    document.getElementById("edit-request-form-section").scrollIntoView({ behavior: "smooth" });
}

function updateRequest() {
    if (!editingRequestId) return;

    const requests = JSON.parse(localStorage.getItem("requests") || "{}");
    const req = requests[editingRequestId];
    if (!req) return;

    req.description = document.getElementById("edit-request-description").value.trim();

    requests[editingRequestId] = req;
    localStorage.setItem("requests", JSON.stringify(requests));

    document.getElementById("edit-request-form-section").classList.add("hidden");
    renderVolunteerRequests();
}

function deleteRequest(id) {
    const user = getCurrentUser();
    if (!user) return;

    const requests = JSON.parse(localStorage.getItem("requests") || "{}");
    const volunteers = JSON.parse(localStorage.getItem("volunteers") || "{}");

    if (!requests[id] || requests[id].creatorId !== user.email) {
        alert("You can only delete your own requests.");
        return;
    }

    delete requests[id];
    localStorage.setItem("requests", JSON.stringify(requests));

    volunteers[user.email].requests = volunteers[user.email].requests.filter(rid => rid !== id);
    localStorage.setItem("volunteers", JSON.stringify(volunteers));

    renderVolunteerRequests();
}
