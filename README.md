# 🔹 SaveMe - Animal Rescue Platform 🐾
###         🐹🐶🐭🐼🐒🐧🦄🦊🐱🐟

SaveMe is a platform designed to help animal shelters and individuals collaborate in helping animals. It's primary goals are animal rehoming and fundraising. The platform is a local demo that simulates a full-featured ecosystem using js, html, css, and browser storage as a data layer. It allows to send donations on Ethereum Sepolia Testnet Blockchain that go to an individual animal or a particular shelter.

## Features

👤 User Roles

    Volunteers

        Register/login

        Browse all available animals

        Save favorites/unfavorite animals

        Submit/edit/delete requests to adopt or report a found animal from dashboard

        View shelter pages

        View individual animal details

        Donate ETH directly to shelters

        Donate ETH directly to individual animals in shelters

    Shelters

        Register/login

        Create/edit/delete animal announcements from dashboard

        View volunteer requests, search by keywords and filter them by type

        Specify Ethereum and/or other payment details for receiving donations

🔍 Search & Filter

    Full-text search by name, species, location and description

    Filters for species, health condition, and age

    Shelters can filter volunteer requests by type as well as use full text search

💸 Donations

    Integrated MetaMask wallet connection (Sepolia testnet demo)

    ETH donation modal (with editable amount)

    Transaction hash displayed on confirmation

🛠️ Tech Stack

    IDE: WebStorm

    Frontend: HTML, CSS, JavaScript 

    Storage: localStorage / sessionStorage

    Wallet Integration: via window.ethereum - MetaMask or Phantom in my case

## Future development ideas

🔐 Authentication, Backend & Architecture 

    Implement secure login and registration with backend verification and password hashing

    Implement a login with wallet feature

    Migrate to a real-time database 

    Add administrator role or automated censorship control

    Clean up the file structure and configure hosting

💸 Crypto Donation Enhancements

    Using BIP-32 subaccounts or smart contract features to allow for real individual animal donations

    Display total donations on volunteer/shelter/animal page 

    Add support for more chains/coins

    Use smart contract for randomized and automated giveaways

🧭 Maps & Location 

    Integrate geolocation APIs for better interaction with location

🐾 Animal Profile Expansion
    
    Extend animal card to an indepentently viewable page

    Add support for additional media (more photos, videos, medical documents)

    Include adoption status updates 

💬 Communication

    Private messaging on the website between volunteers and shelters (maybe?)

    An option to leave reviews for shelters
     
    Live feed / sharing stories of adopted animals/volunteer work being done

📱 Mobile Optimization

    Improve layout for mobile users and/or create a mobile app

📊 Analytics & Reporting

    Dashboard stats for shelters (views, ratings, discussions, adoption rates)


### This project was developed from April 9th to 13th as an entry task for Best::Hackath0n2025.

