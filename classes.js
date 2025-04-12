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


class Shelter {
    constructor(name, location, contactInfo) {
        this.name = name;
        this.location = location;
        this.contactInfo = contactInfo;
        this.animals = []; // array to hold Animal objects
    }

    addAnimal(animalId) {
        this.animals.push(animalId);
    }

    // change since using hashes for access
    listAnimals() {
        return this.animals.map(animal => animal.getSummary()).join('\n');
    }
}

