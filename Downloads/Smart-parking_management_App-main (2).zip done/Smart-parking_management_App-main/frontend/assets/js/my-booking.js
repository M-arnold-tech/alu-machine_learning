let duration = 3, vehicle = 'sedan', rate = 150;
const locations = ["Kigali City Center", "Kimironko Market", "Downtown", "Airport", "Kigali Heights", "Convention Centre"];

document.addEventListener("DOMContentLoaded", () => {
    setDefaults();
    setupLocationSearch();
    loadSelectedParking();
    updateSummary();
    updateBookingPreview();
});

function setDefaults() {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById("bookingDate").value = tomorrow.toISOString().split("T")[0];
    document.getElementById("bookingTime").value = "09:00";
    
    // Add event listeners for date and time changes
    document.getElementById("bookingDate").addEventListener("change", updateBookingPreview);
    document.getElementById("bookingTime").addEventListener("change", updateBookingPreview);
}

function setupLocationSearch() {
    const input = document.getElementById("locationInput");
    const list = document.getElementById("suggestions");
    input.addEventListener("input", () => {
        const val = input.value.toLowerCase();
        if (!val) { list.style.display = "none"; return; }
        const matches = locations.filter(l => l.toLowerCase().includes(val));
        list.innerHTML = matches.map(l => `<div onclick="selectLocation('${l}')">${l}</div>`).join("");
        list.style.display = matches.length ? "block" : "none";
    });
    document.addEventListener("click", e => { if (!input.contains(e.target)) list.style.display = "none"; });
}

function loadSelectedParking() {
    const selected = JSON.parse(localStorage.getItem("selectedParking") || "{}");
    if (selected.location) {
        document.getElementById("locationInput").value = selected.location;
        if (selected.rate) rate = selected.rate;
    }
}

function updateBookingPreview() {
    const location = document.getElementById("locationInput").value || "Select a parking location";
    const date = document.getElementById("bookingDate").value;
    const time = document.getElementById("bookingTime").value;
    const durationText = duration + " hour" + (duration > 1 ? "s" : "");
    const vehicleText = vehicle.charAt(0).toUpperCase() + vehicle.slice(1);
    
    document.getElementById("selectedLocation").textContent = location;
    document.getElementById("selectedDate").textContent = date ? `Date: ${new Date(date).toLocaleDateString()}` : "Date: Not selected";
    document.getElementById("selectedTime").textContent = time ? `Time: ${time}` : "Time: Not selected";
    document.getElementById("selectedDuration").textContent = `Duration: ${durationText}`;
    document.getElementById("selectedVehicle").textContent = `Vehicle: ${vehicleText}`;
}

function selectLocation(loc) {
    document.getElementById("locationInput").value = loc;
    document.getElementById("suggestions").style.display = "none";
    updateBookingPreview();
}

document.querySelectorAll(".duration-btn").forEach(b => b.onclick = () => {
    document.querySelectorAll(".duration-btn").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    duration = parseInt(b.dataset.hours);
    updateSummary();
    updateBookingPreview();
});

document.querySelectorAll(".vehicle-btn").forEach(b => b.onclick = () => {
    document.querySelectorAll(".vehicle-btn").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    vehicle = b.dataset.type;
    const rates = {sedan:150, suv:200, truck:300, motorcycle:100};
    rate = rates[vehicle];
    document.getElementById("rateDisplay").textContent = `RWF ${rate.toLocaleString()}/hr`;
    updateSummary();
    updateBookingPreview();
});

function updateSummary() {
    const subtotal = rate * duration;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;
    document.getElementById("durDisplay").textContent = duration + " hour" + (duration>1?"s":"");
    document.getElementById("vehDisplay").textContent = vehicle.charAt(0).toUpperCase() + vehicle.slice(1);
    document.getElementById("subtotal").textContent = "RWF " + subtotal.toLocaleString();
    document.getElementById("tax").textContent = "RWF " + tax.toLocaleString();
    document.getElementById("total").textContent = "RWF " + total.toLocaleString();
}

function applyPromo() {
    const code = document.getElementById("promoCode").value.trim();
    if (code === "PARK10") {
        const totalEl = document.getElementById("total");
        const current = parseInt(totalEl.textContent.replace(/\D/g,""));
        totalEl.textContent = "RWF " + Math.round(current * 0.9).toLocaleString();
        alert("10% discount applied!");
    }
}

function proceedToPayment() {
    const loc = document.getElementById("locationInput").value.trim();
    if (!loc || !document.getElementById("plateNumber").value) return alert("Complete all fields");
    
    const data = {
        location: loc,
        duration,
        vehicle,
        rate,
        total: document.getElementById("total").textContent
    };
    localStorage.setItem("bookingData", JSON.stringify(data));
    location.href = "payment.html";
}