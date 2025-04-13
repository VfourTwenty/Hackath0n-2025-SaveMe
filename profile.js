function toggleEditPaymentInfo() {
    const section = document.getElementById("edit-profile-form-section");
    section.classList.toggle("hidden");

    // Pre-fill fields if data already exists
    const user = getCurrentUser();
    if (user && user.role === "shelter") {
        document.getElementById("edit-eth-wallet").value = user.ethWallet || "";
        document.getElementById("edit-payment-info").value = user.paymentInfo || "";
    }
}

function savePaymentInfo() {
    const ethWallet = document.getElementById("edit-eth-wallet").value.trim();
    const otherPayment = document.getElementById("edit-payment-info").value.trim();
    const email = sessionStorage.getItem("userEmail");

    const shelters = JSON.parse(localStorage.getItem("shelters") || "{}");
    const shelter = shelters[email];

    shelter.ethWallet = ethWallet;
    shelter.otherPayment = otherPayment;

    localStorage.setItem("shelters", JSON.stringify(shelters));

    document.getElementById("edit-profile-form-section").classList.add("hidden");

    // Update view
    document.getElementById("shelter-wallet").textContent = ethWallet || "Add a wallet address";
    document.getElementById("shelter-other-payment").textContent = otherPayment || "Add a payment method";
}

