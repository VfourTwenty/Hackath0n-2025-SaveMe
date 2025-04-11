// Setup in-memory users (can be restored from localStorage later)
let volunteers = [];
let shelters = [];


function loadPage(page, skipPush = false) {
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
};

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
    // loadPage("volunteer-dashboard.html");
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
    // loadPage("volunteer-dashboard.html");
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
    // loadPage("shelter-dashboard.html");
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
}
