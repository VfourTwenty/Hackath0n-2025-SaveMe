let currentDonationAnimalId = null;

function toggleDonationModal(animalId = null) {
    const modal = document.getElementById("donation-modal");
    const nameSpan = document.getElementById("donation-animal-name");
    const walletSpan = document.getElementById("donation-animal-wallet");

    if (animalId) {
        currentDonationAnimalId = animalId;

        // Get animal name
        const animals = JSON.parse(localStorage.getItem("animals") || "{}");
        nameSpan.textContent = animals[animalId]?.name || "an animal";
        walletSpan.textContent = getWalletFromAnimalId(animalId) || "no wallet is connected";

        modal.classList.remove("hidden");
    }
    else    {
        modal.classList.add("hidden");
    }
}

async function submitDonation() {
    const amount = parseFloat(document.getElementById("donation-amount").value);
    if (!amount || amount <= 0) {
        alert("Please enter a valid ETH amount.");
        return;
    }

    toggleDonationModal(); // Close modal
    await handleDonation(currentDonationAnimalId); // Calls the MetaMask transfer
}

function getWalletFromAnimalId(animalId)
{
    const shelters = JSON.parse(localStorage.getItem("shelters") || "{}");
    const animals = JSON.parse(localStorage.getItem("animals") || "{}");

    const animal = animals[animalId];
    if (!animal) {
        alert("Animal not found.");
        return;
    }

    const creator = animal.creatorId;
    return shelters[creator].ethWallet;
}

async function handleDonation(animalId)
{
    const animals = JSON.parse(localStorage.getItem("animals") || "{}");

    const animal = animals[animalId];
    if (!animal) {
        console.log(animalId);
        alert("Animal not found.");
        return;
    }

    const shelterWallet = getWalletFromAnimalId(animalId);
    console.log("shelter wallet:", shelterWallet);
    const animalName = animal.name;

    if (!window.ethereum) {
        alert("MetaMask not found. Please install it.");
        return;
    }

    let accounts = await ethereum.request({ method: 'eth_requestAccounts' }).catch(err => {
        console.error("Connection failed:", err);
        return null;
    });

    if (!accounts || !accounts.length) return;

    const from = accounts[0];
    const amountEth = document.getElementById("donation-amount").value.trim();
    console.log("sending", amountEth, "Eth");

    if (!amountEth || isNaN(amountEth) || parseFloat(amountEth) <= 0) {
        alert("Invalid amount.");
        return;
    }

    const amountWei = BigInt(Math.floor(parseFloat(amountEth) * 1e18)).toString();
    console.log("sending", amountWei);
    try {
        const txHash = await ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
                from,
                to: shelterWallet,
                value: '0x' + BigInt(amountWei).toString(16)
            }]
        });

        console.log("Transaction hash:", txHash);
        alert("Thank you for your donation!");
    } catch (err) {
        console.error("Donation failed:", err);
        alert("Transaction was cancelled or failed.");
    }
}
