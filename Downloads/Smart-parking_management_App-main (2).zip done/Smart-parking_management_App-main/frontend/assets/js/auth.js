function checkAuth(requiredRole = null) {
  const driverId = localStorage.getItem("driver_id");
  const operatorId = localStorage.getItem("operator_id");
  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");

  if (
    !driverId &&
    !operatorId &&
    !userProfile.operator_id &&
    !userData.operator_id
  ) {
    window.location.href = "./sign_up.html";
    return false;
  }

  if (requiredRole === "driver" && !driverId) {
    window.location.href = "./sign_up.html";
    return false;
  }

  if (
    requiredRole === "operator" &&
    !operatorId &&
    !userProfile.operator_id &&
    !userData.operator_id
  ) {
    window.location.href = "./sign_up.html";
    return false;
  }

  return true;
}

function isAuthenticated() {
  const driverId = localStorage.getItem("driver_id");
  const operatorId = localStorage.getItem("operator_id");
  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");

  return !!(
    driverId ||
    operatorId ||
    userProfile.operator_id ||
    userData.operator_id
  );
}

function getCurrentUser() {
  const driverId = localStorage.getItem("driver_id");
  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");

  if (driverId) {
    return {
      id: driverId,
      role: "driver",
      ...userProfile,
      ...userData,
    };
  }

  if (userProfile.operator_id || userData.operator_id) {
    return {
      id: userProfile.operator_id || userData.operator_id,
      role: "operator",
      ...userProfile,
      ...userData,
    };
  }

  return null;
}

function logout() {
  localStorage.removeItem("driver_id");
  localStorage.removeItem("operator_id");
  localStorage.removeItem("userProfile");
  sessionStorage.removeItem("userData");
  window.location.href = "./sign_up.html";
}

async function updateNotificationBadge() {
  const driverId = localStorage.getItem("driver_id");
  if (!driverId) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/notification/unread-count/${driverId}`
    );
    const data = await response.json();

    if (data.success) {
      const badges = document.querySelectorAll(".notification-badge");
      badges.forEach((badge) => {
        if (data.count > 0) {
          badge.textContent = data.count > 99 ? "99+" : data.count;
          badge.style.display = "block";
        } else {
          badge.style.display = "none";
        }
      });
    }
  } catch (error) {
    console.error("Error updating notification badge:", error);
  }
}
