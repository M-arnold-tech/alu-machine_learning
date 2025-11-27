// Base URL for the backend API - loaded from config.js
// Make sure config.js is loaded before this script in your HTML

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  loadParkingCards();
  loadSpots();

  const signinForm = document.getElementById("signin-form");
  if (signinForm) {
    signinForm.addEventListener("submit", handleSignIn);
  }
});

// Handle sign in
function handleSignIn(e) {
  e.preventDefault();

  const email = document.querySelector('input[type="email"]').value;
  const password = document.querySelector('input[type="password"]').value;

  if (email && password) {
    window.location.href = "find-parking.html";
  }
}

// Load parking cards
function loadParkingCards() {
  const container = document.getElementById("parking-cards");
  if (!container) return;

  container.innerHTML = parkingSpaces
    .map(
      (space, index) => `
        <div class="parking-card">
            <div class="parking-image">
                <img src="images/car.jpg" alt="${
                  space.name
                }" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
            </div>
            <div class="parking-info">
                <div class="parking-name">${space.name}</div>
                <div class="parking-available">${space.available}</div>
                <div class="parking-rating">
                    Rating: ${space.rating}
                </div>
            </div>
            <div class="parking-actions">
                <div class="parking-price">${space.price}</div>
                <button class="btn btn-primary" onclick="goToBooking(${
                  index + 1
                })">Book Now</button>
            </div>
        </div>
    `
    )
    .join("");
}

// Load available spots
function loadSpots() {
  const container = document.getElementById("spots-grid");
  if (!container) return;

  container.innerHTML = availableSpots
    .map(
      (spot) => `
        <div class="spot-card">
            <div class="spot-image">
                <img src="images/car.jpg" alt="${
                  spot.name
                }" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="spot-info">
                <div class="spot-name">${spot.name}</div>
                <div class="spot-footer">
                    <span class="spot-status">${
                      spot.available ? "Available" : "Booked"
                    }</span>
                    <button class="spot-btn" onclick="goToBooking()">Book Now</button>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// Select duration
function selectDuration(element, duration) {
  document.querySelectorAll(".duration-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  element.classList.add("active");
}

// Select vehicle
function selectVehicle(element, vehicle) {
  document.querySelectorAll(".vehicle-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  element.classList.add("active");
}

// Select payment method
function selectPaymentMethod(element, method) {
  document.querySelectorAll(".payment-method-card").forEach((card) => {
    card.classList.remove("active");
  });

  element.classList.add("active");

  document.getElementById("card-form").style.display = "none";
  document.getElementById("mobile-form").style.display = "none";

  if (method === "card") {
    document.getElementById("card-form").style.display = "block";
  } else if (method === "mobile") {
    document.getElementById("mobile-form").style.display = "block";
  }
}

// Process payment
function processPayment() {
  window.location.href = "payment-success.html";
}

// Go to booking
function goToBooking(parkingId) {
  window.location.href = "my-booking.html?id=" + (parkingId || 1);
}

// Go back
function goBack() {
  window.history.back();
}

// Logout
function logout() {
  window.location.href = "login.html";
}

// Select provider
function selectProvider(element, provider) {
  document.querySelectorAll(".provider-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  element.classList.add("active");
}

// Set booking date
window.addEventListener("load", function () {
  const bookingDate = document.getElementById("booking-date");
  if (bookingDate) {
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    bookingDate.textContent = dateStr;
  }
});
