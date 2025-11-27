document.addEventListener("DOMContentLoaded", () => {
    const data = JSON.parse(localStorage.getItem("bookingData") || "{}");
    
    if (!data.location) {
        setTimeout(() => location.href = "find-parking.html", 2000);
        return;
    }

    document.getElementById("bookingId").textContent = "BK-" + Math.floor(Math.random()*9999 + 1000);
    document.getElementById("location").textContent = data.location || "Kigali City Center";
    document.getElementById("duration").textContent = (data.duration || 3) + " hours";
    document.getElementById("vehicle").textContent = data.vehicle ? data.vehicle.charAt(0).toUpperCase() + data.vehicle.slice(1) : "Sedan";
    document.getElementById("amount").textContent = data.total || "RWF 15,000";
    document.getElementById("method").textContent = data.paymentMethod === "momo" ? "Mobile Money" : "Card";
    document.getElementById("refCode").textContent = "PK-" + Math.floor(Math.random()*9999 + 1000);

    const now = new Date();
    const end = new Date(now.getTime() + (data.duration || 3)*60*60*1000);
    document.getElementById("date").textContent = now.toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"});
    document.getElementById("start").textContent = now.toLocaleTimeString("en-US", {hour:"numeric", minute:"2-digit"});
    document.getElementById("end").textContent = end.toLocaleTimeString("en-US", {hour:"numeric", minute:"2-digit"});
    
    // Set payment flag and create current booking
    localStorage.setItem("paymentCompleted", "true");
    
    const currentBooking = {
        id: document.getElementById("bookingId").textContent,
        location: data.location || "Kigali City Center",
        duration: data.duration || 3,
        vehicle: data.vehicle || "sedan",
        startTime: now.toISOString(),
        endTime: end.toISOString(),
        total: data.total || "RWF 15,000",
        status: "active",
        spotNumber: "A" + Math.floor(Math.random() * 20 + 1)
    };
    
    localStorage.setItem("currentBooking", JSON.stringify(currentBooking));
});