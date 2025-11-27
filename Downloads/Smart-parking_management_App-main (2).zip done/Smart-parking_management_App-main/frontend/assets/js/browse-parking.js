const parkingLocations = [
  { name: "Kigali City Center", area: "Downtown", price: 150, spots: 28, rating: 4.8, img: "https://source.unsplash.com/random/400x300/?parking,kigali" },
  { name: "Kigali Heights Mall", area: "Nyarutarama", price: 200, spots: 42, rating: 4.7, img: "https://source.unsplash.com/random/400x300/?mall,parking" },
  { name: "Convention Centre", area: "Gishushu", price: 300, spots: 15, rating: 4.9, img: "https://source.unsplash.com/random/400x300/?convention,parking" },
  { name: "Kimironko Market", area: "Kimironko", price: 100, spots: 35, rating: 4.3, img: "https://source.unsplash.com/random/400x300/?market,rwanda" },
  { name: "Remera Business District", area: "Remera", price: 250, spots: 22, rating: 4.6, img: "https://source.unsplash.com/random/400x300/?office,parking" },
  { name: "Nyabugogo Terminal", area: "Nyabugogo", price: 120, spots: 50, rating: 4.1, img: "https://source.unsplash.com/random/400x300/?bus,station" }
];

document.addEventListener("DOMContentLoaded", () => {
  renderParkingCards(parkingLocations);
});

function renderParkingCards(locations) {
  const grid = document.getElementById("parkingGrid");
  grid.innerHTML = locations.map(loc => `
    <div class="parking-card" onclick="selectParking('${loc.name}', ${loc.price})">
      <div class="parking-img" style="background-image:url('${loc.img}')"></div>
      <div class="parking-info">
        <h3>${loc.name}</h3>
        <div class="location">Location: ${loc.area}</div>
        <div class="rating">★★★★★ ${loc.rating}</div>
        <div class="price-info">
          <div class="price">RWF ${loc.price.toLocaleString()}/hr</div>
          <div class="spots">${loc.spots} spots left</div>
        </div>
      </div>
    </div>
  `).join("");
}

function selectParking(name, rate) {
  const selected = { location: name, rate };
  localStorage.setItem("selectedParking", JSON.stringify(selected));
  location.href = "my-booking.html";
}