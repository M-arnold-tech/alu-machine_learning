let countdownInterval, bookingEndTime, selectedSpot = "A3";

document.addEventListener("DOMContentLoaded", () => {
    // Check if user has paid before showing active booking
    const paymentCompleted = localStorage.getItem("paymentCompleted");
    const currentBooking = localStorage.getItem("currentBooking");
    
    if (!paymentCompleted || paymentCompleted !== "true" || !currentBooking) {
        // Redirect to my-booking page if no active booking
        alert("You don't have any active booking. Please book a parking spot first.");
        location.href = "my-booking.html";
        return;
    }
    
    initCountdown();
    loadBookingData();
});

function generateSpots() {
    const grid = document.getElementById("spotsGrid");
    const rows = ["A","B","C","D"];
    let html = "";
    rows.forEach(r => {
        for(let i=1; i<=8; i++){
            const id = r+i;
            const occupied = Math.random() > 0.75;
            const selected = id === selectedSpot;
            const cls = selected ? "selected" : occupied ? "occupied" : "available";
            html += `<div class="spot-item ${cls}" onclick="selectSpot('${id}', ${occupied})">${id}</div>`;
        }
    });
    grid.innerHTML = html;
}

function selectSpot(id, occupied) {
    if(occupied) return alert("Spot occupied");
    document.querySelectorAll(".spot-item").forEach(s => {
        s.classList.remove("selected");
        if(!s.classList.contains("occupied")) s.classList.add("available");
    });
    event.target.classList.remove("available"); 
    event.target.classList.add("selected");
    selectedSpot = id;
    document.getElementById("spotNumber").textContent = id;
}

function initCountdown() {
    const now = new Date();
    bookingEndTime = new Date(now.getTime() + 3*60*60*1000);
    updateTimes();
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function updateTimes() {
    const start = new Date(bookingEndTime.getTime() - 3*60*60*1000);
    document.getElementById("startTime").textContent = formatTime(start);
    document.getElementById("endTime").textContent = formatTime(bookingEndTime);
}

function formatTime(d) { return d.toLocaleTimeString("en-US", {hour:"numeric", minute:"2-digit"}); }

function updateCountdown() {
    const diff = bookingEndTime - new Date();
    if(diff <= 0) {
        clearInterval(countdownInterval);
        document.getElementById("countdown").textContent = "00:00:00";
        return;
    }
    const h = Math.floor(diff/3600000).toString().padStart(2,"0");
    const m = Math.floor((diff%3600000)/60000).toString().padStart(2,"0");
    const s = Math.floor((diff%60000)/1000).toString().padStart(2,"0");
    document.getElementById("countdown").textContent = `${h}:${m}:${s}`;
}

function renewBooking() {
    bookingEndTime = new Date(bookingEndTime.getTime() + 60*60*1000);
    updateTimes();
    alert("Session extended +1 hour");
}

function markArrived() { alert("Marked as arrived"); event.target.disabled = true; }
function cancelBooking() { if(confirm("Cancel booking?")) location.href = "my-booking.html"; }
function copyReference() {
    navigator.clipboard.writeText(document.getElementById("referenceNumber").textContent);
    alert("Reference copied!");
}

function loadBookingData() {
    const data = localStorage.getItem("currentBooking");
    const selectedParking = localStorage.getItem("selectedParking");
    
    if(data) {
        const b = JSON.parse(data);
        document.querySelector(".session-header h2").textContent = b.location || "Kigali City Center";
        document.querySelector(".summary-card .summary-item strong").textContent = b.location || "Kigali City Center";
        
        // Update spot number
        const spotElement = document.getElementById("spotNumber");
        if (spotElement) {
            spotElement.textContent = b.spotNumber || "A3";
        }
        
        // Update total amount
        const totalElement = document.querySelector(".summary-item.total strong");
        if (totalElement) {
            totalElement.textContent = b.total || "RWF 450";
        }
        
        // Update reference number
        const refElement = document.getElementById("referenceNumber");
        if (refElement) {
            refElement.textContent = b.id || "BK-1234";
        }
    }
    
    // Load parking images from selected parking or use defaults
    loadParkingImages(selectedParking);
}

function loadParkingImages(selectedParkingData) {
    const parkingImagesGrid = document.getElementById("parkingImagesGrid");
    
    // Default parking images for different locations
    const locationImages = {
        "Kigali City Center": [
            "https://source.unsplash.com/random/400x300/?parking,kigali,city",
            "https://source.unsplash.com/random/400x300/?parking,downtown,garage",
            "https://source.unsplash.com/random/400x300/?underground,parking,kigali"
        ],
        "Kigali Heights Mall": [
            "https://source.unsplash.com/random/400x300/?mall,parking,shopping",
            "https://source.unsplash.com/random/400x300/?parking,garage,modern",
            "https://source.unsplash.com/random/400x300/?multi,level,parking"
        ],
        "Convention Centre": [
            "https://source.unsplash.com/random/400x300/?convention,parking,center",
            "https://source.unsplash.com/random/400x300/?event,parking,venue",
            "https://source.unsplash.com/random/400x300/?premium,parking,space"
        ],
        "Kimironko Market": [
            "https://source.unsplash.com/random/400x300/?market,parking,local",
            "https://source.unsplash.com/random/400x300/?street,parking,market",
            "https://source.unsplash.com/random/400x300/?open,air,parking"
        ]
    };
    
    let images = locationImages["Kigali City Center"]; // default
    
    if(selectedParkingData) {
        const selected = JSON.parse(selectedParkingData);
        images = locationImages[selected.location] || images;
    } else if(data) {
        const booking = JSON.parse(data);
        images = locationImages[booking.location] || images;
    }
    
    parkingImagesGrid.innerHTML = images.map(img => `
        <div class="parking-image-card">
            <img src="${img}" alt="Parking Location" style="width:100%; height:200px; object-fit:cover; border-radius:8px;">
        </div>
    `).join("");
}