class Animal {
    constructor({
                    name = "Unknown",
                    type,                  // required
                    age,                   // required
                    location,              // required
                    requestType,           // required: 'adoption' | 'treatment' | 'temporary'
                    description = "",
                    health = "Unknown",
                    photoUrl = "default.jpg",
                    ownerId
                }) {
        if (!type || !requestType || age === undefined || !location) {
            throw new Error("Missing required animal fields");
        }

        this.id = crypto.randomUUID();
        this.name = name;
        this.type = type;
        this.age = age;
        this.location = location;
        this.health = health;
        this.photoUrl = photoUrl;
        this.description = description;
        this.requestType = requestType;
        this.ownerId = ownerId;
        this.adopted = false;
    }

    canBeDeletedBy(user) {
        return user.role === "admin" || user.id === this.ownerId;
    }

    delete(fromShelter, allVolunteers, requester) {
        if (!this.canBeDeletedBy(requester)) {
            console.warn("Access denied: cannot delete this animal.");
            return false;
        }

        fromShelter.animals = fromShelter.animals.filter(a => a.id !== this.id);

        allVolunteers.forEach(vol => {
            vol.favorites = vol.favorites.filter(a => a.id !== this.id);
            vol.submittedAnimals = vol.submittedAnimals.filter(a => a.id !== this.id);
        });

        return true;
    }

    getSummary() {
        return `${this.name} (${this.type}, age ${this.age}) in ${this.location}. Request: ${this.requestType}. Status: ${this.health}`;
    }

    markAsAdopted() {
        this.adopted = true;
    }

    isAvailable() {
        return !this.adopted;
    }
}



// // Example usage:
// const rex = new Animal("Rex", "Dog", 4, "Healthy", "Kharkiv", "rex.jpg");
//
// console.log(rex.getSummary());

class Shelter {
    constructor(name, location, contactInfo) {
        this.name = name;
        this.location = location;
        this.contactInfo = contactInfo;
        this.animals = []; // array to hold Animal objects
    }

    addAnimal(animal) {
        this.animals.push(animal);
    }

    listAnimals() {
        return this.animals.map(animal => animal.getSummary()).join('\n');
    }
}

// window.addEventListener("DOMContentLoaded", () => {
//     const url = "index.html"; // or whatever your homepage is
//     loadPage(url);
//     history.replaceState({ url }, "", '#'); // sets current state without adding a new history entry
// });
//


let volunteers = [];
let shelters = [];



function loadPage(url, skipPush = false) {
    const cleanUrl = url.replace(/^pages\//, "");
    const fullUrl = `pages/${cleanUrl}`;

    fetch(fullUrl)
        .then(res => res.text())
        .then(html => {
            document.getElementById("main-content").innerHTML = html;

            if (!skipPush) {
                history.pushState({ url: cleanUrl }, "", cleanUrl); // show clean path
            }
        })
        .catch(err => console.error(`Failed to load ${fullUrl}:`, err));
}


function loadHomePage() {
    loadPage("home.html", true);
    history.replaceState({ url: "home.html" }, "", "home.html");
}


window.onpopstate = function (event) {
    const state = event.state;

    if (state && state.url) {
        loadPage(state.url, true);
    } else {
        loadHomePage();
    }
};
