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
