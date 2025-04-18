// Setup in-memory users (can be restored from localStorage later)
let volunteers = [];
let shelters = [];


function loadPage(page, skipPush = false, ...callbacks) {
    let fullUrl = page;

    if (!fullUrl.startsWith("pages/")) {
        fullUrl = "pages/" + fullUrl;
    }

    if (!fullUrl.endsWith(".html")) {
        fullUrl += ".html";
    }

    fetch(fullUrl)
        .then(res => res.text())
        .then(html => {
            document.getElementById("main-content").innerHTML = html;

            if (!skipPush) {
                history.pushState({ page }, "", `#${page}`);
            }

            // Run all provided callbacks in order
            callbacks.forEach(cb => {
                if (typeof cb === "function") cb();
            });
        })
        .catch(err => console.error(`Failed to load ${fullUrl}:`, err));
}



function loadHomePage() {
    loadPage("home", true); // don't push again
    history.replaceState({ page: "home" }, "", "#home");
}

window.addEventListener("DOMContentLoaded", () => {
    const hash = window.location.hash;

    if (hash) {
        const page = hash.replace(/^#/, "");
        loadPage(page, true);
    } else {
        loadHomePage();
    }
});


window.onpopstate = function (event) {
    const page = event.state?.page || "home";
    loadPage(page, true);
    handleDashboardRouting();
};


function handleDashboardRouting() {
    const hash = location.hash.slice(1);

    if (["volunteer-dashboard.html", "shelter-dashboard.html"].includes(hash)) {
        const observer = new MutationObserver(() => {
            const el = document.getElementById("volunteer-name") || document.getElementById("shelter-name");
            if (el) {
                observer.disconnect();

                if (hash === "volunteer-dashboard.html") {
                    populateVolunteerDashboard();
                } else {
                    populateShelterDashboard();
                }
            }
        });

        observer.observe(document.getElementById("main-content"), {
            childList: true,
            subtree: true,
        });
    }
}


window.addEventListener("load", () => {
    console.log("page loaded");
    handleDashboardRouting();
    updateHeaderUI();
});


function volunteer_login() {
    console.log("volunteer logging")
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const volunteers = JSON.parse(localStorage.getItem("volunteers") || "{}");
    const user = volunteers[email];

    if (!user || user.password !== password) {
        alert("Invalid volunteer login.");
        return;
    }

    sessionStorage.setItem("userRole", "volunteer");
    sessionStorage.setItem("userEmail", email);

    console.log("volunteer login");
    loadPage("volunteer-dashboard.html", false, populateVolunteerDashboard);
    updateHeaderUI();
}


function volunteer_register() {
    console.log("volunteer register");
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirm = document.getElementById("confirm").value.trim();

    if (!name || !email || !password || !confirm) {
        alert("Please fill all fields.");
        return;
    }

    if (password !== confirm) {
        alert("Passwords do not match.");
        return;
    }

    const volunteers = JSON.parse(localStorage.getItem("volunteers") || "{}");
    if (volunteers[email]) {
        alert("Volunteer already exists.");
        return;
    }

    volunteers[email] = { name, email, password, favorites: [] };
    localStorage.setItem("volunteers", JSON.stringify(volunteers));
    sessionStorage.setItem("userRole", "volunteer");
    sessionStorage.setItem("userEmail", email);

    console.log("volunteer registered");
    loadPage("volunteer-dashboard.html", false, populateVolunteerDashboard);
    updateHeaderUI();
}


function shelter_login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const shelters = JSON.parse(localStorage.getItem("shelters") || "{}");
    const user = shelters[email];

    if (!user || user.password !== password) {
        alert("Invalid shelter login.");
        return;
    }

    sessionStorage.setItem("userRole", "shelter");
    sessionStorage.setItem("userEmail", email);

    console.log("shelter logged in")
    loadPage("shelter-dashboard.html", false, populateShelterDashboard);
    updateHeaderUI();
}


function shelter_register() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const facilityType = document.getElementById("type").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirm = document.getElementById("confirm").value.trim();

    if (!name || !email || !facilityType || !contact || !password || !confirm) {
        alert("Please fill out all fields.");
        return;
    }

    if (password !== confirm) {
        alert("Passwords do not match.");
        return;
    }

    const shelters = JSON.parse(localStorage.getItem("shelters") || "{}");
    if (shelters[email]) {
        alert("Shelter already registered.");
        return;
    }

    shelters[email] = {
        name,
        email,
        type: facilityType,
        contact,
        password,
        animals: []
    };

    localStorage.setItem("shelters", JSON.stringify(shelters));
    sessionStorage.setItem("userRole", "shelter");
    sessionStorage.setItem("userEmail", email);

    console.log("shelter registered");
    loadPage("shelter-dashboard.html", false, populateShelterDashboard);
    updateHeaderUI();
}


function populateVolunteerDashboard() {
    const email = sessionStorage.getItem("userEmail");
    const role = sessionStorage.getItem("userRole");

    if (!email || role !== "volunteer") return;

    const volunteers = JSON.parse(localStorage.getItem("volunteers") || "{}");
    const user = volunteers[email];

    if (!user) return;

    document.getElementById("volunteer-name").textContent = user.name;
    document.getElementById("volunteer-email").textContent = user.email;

    // Optional: If profile photo URL is stored
    if (user.photoUrl) {
        document.querySelector(".profile-photo img").src = user.photoUrl;
    }

    renderVolunteerFavorites();
    renderVolunteerRequests();
}



function populateShelterDashboard() {
    const email = sessionStorage.getItem("userEmail");
    const role = sessionStorage.getItem("userRole");

    if (!email || role !== "shelter") return;

    const shelters = JSON.parse(localStorage.getItem("shelters") || "{}");
    const user = shelters[email];

    if (!user) return;

    document.getElementById("shelter-name").textContent = user.name;
    document.getElementById("shelter-email").textContent = user.email;
    document.getElementById("shelter-type").textContent = `Facility: ${user.type}`;
    document.getElementById("shelter-contact").textContent = `Contact: ${user.contact}`;
    document.getElementById("shelter-wallet").textContent = user.ethWallet || "Add a wallet address";
    document.getElementById("shelter-other-payment").textContent = user.otherPayment || "Add a payment method";


    if (user.profilePhoto) {
        console.log("profile photo set");
        document.getElementById("profile-photo").src = user.profilePhoto;
    }
    else
    {
        document.getElementById("profile-photo").src = "images/profile-photo.png";
    }

    renderShelterAnnouncements();
}


function uploadPhoto() {
    console.log("profile customization coming soon ;)");
}



function updateHeaderUI() {
    const userRole = sessionStorage.getItem("userRole");
    const loginBtn = document.querySelector(".login-button");

    if (!loginBtn) return;

    if (userRole === "volunteer") {
        loginBtn.src = "images/user.svg";
        loginBtn.alt = "Volunteer Dashboard";
        loginBtn.onclick = () => loadPage("volunteer-dashboard.html", false, populateVolunteerDashboard);
    } else if (userRole === "shelter") {
        loginBtn.src = "images/user.svg";
        loginBtn.alt = "Shelter Dashboard";
        loginBtn.onclick = () => loadPage("shelter-dashboard.html", false, populateShelterDashboard);
    } else {
        // Not logged in
        loginBtn.src = "images/login.svg";
        loginBtn.alt = "Login/Register";
        loginBtn.onclick = () => loadPage("select-role.html");
    }
}


function logout() {
    sessionStorage.clear();
    loadHomePage();
    updateHeaderUI();
}


function getCurrentUser() {
    const role = sessionStorage.getItem("userRole");
    const email = sessionStorage.getItem("userEmail");

    if (!role || !email) return null;

    const storageKey = role === "volunteer" ? "volunteers" : "shelters";
    const allUsers = JSON.parse(localStorage.getItem(storageKey) || "{}");

    const user = allUsers[email];
    if (!user) return null;

    return { ...user, role }; // 👈 Add role to the returned object
}


function isUserLoggedIn() {
    return !!getCurrentUser(); // returns true if user object exists, false otherwise
}

function handleViewRequests() {
    const user = getCurrentUser();

    if (!user) {
        loadPage("pages/select-role.html");
    } else if (user.role === "volunteer") {
        loadPage(
            "all-announcements.html",
            false,
            setupSpeciesFilterCheckboxes,
            setupHealthFilterCheckboxes,
            renderAllAnnouncements
        );
    } else if (user.role === "shelter") {
        loadPage("all-requests.html", false, renderAllRequests);
    }
}

