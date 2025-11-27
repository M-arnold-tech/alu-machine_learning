// assets/js/payment.js
let method = 'momo'; // Default to Mobile Money

document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("bookingData") || "{}");
  if (!data.location) return location.href = "my-booking.html";

  document.getElementById("loc").textContent = data.location;
  document.getElementById("dur").textContent = data.duration + " hours";
  document.getElementById("veh").textContent = data.vehicle.charAt(0).toUpperCase() + data.vehicle.slice(1);
  document.getElementById("total").textContent = "RWF " + (data.rate * data.duration).toLocaleString();
});

function selectMethod(m) {
  method = m;
  document.querySelectorAll(".method-card").forEach(c => c.classList.remove("active"));
  document.querySelector(`[data-method="${m}"]`).classList.add("active");

  document.getElementById("momo-form").style.display = m === "momo" ? "block" : "none";
  document.getElementById("card-form").style.display = m === "card" ? "block" : "none";
}

function processPayment() {
  const phone = document.getElementById("phone")?.value;
  if (method === "momo" && !phone?.match(/^\+250/)) {
    alert("Please enter a valid Rwanda phone number");
    return;
  }

  const data = JSON.parse(localStorage.getItem("bookingData"));
  localStorage.setItem("paymentData", JSON.stringify({ ...data, method, phone }));
  location.href = "payment-success.html";
}