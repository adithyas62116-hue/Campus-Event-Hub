// Campus Event Hub - Main JavaScript

const events = [
  {
    id: 1,
    name: "Code Sprint",
    category: "Technology",
    date: "2026-10-30",
    time: "9:00 AM - 12:00 PM",
    venue: "Computer Lab",
    description: "Solve coding challenges and showcase your programming skills.",
    seats: 30,
    symbol: "💻",
    color: "#d9ff70",
    colorTwo: "#b4f0a0"
  },
  {
    id: 2,
    name: "Robo Rush",
    category: "Technology",
    date: "2026-10-30",
    time: "1:00 PM - 3:00 PM",
    venue: "Innovation Lab",
    description: "Explore robotics, creativity and exciting technical challenges.",
    seats: 20,
    symbol: "🤖",
    color: "#8ce8ff",
    colorTwo: "#b4c8ff"
  },
  {
    id: 3,
    name: "Battle of Bands",
    category: "Music",
    date: "2026-10-31",
    time: "4:00 PM - 6:00 PM",
    venue: "Main Auditorium",
    description: "Feel the rhythm as talented campus bands take the stage.",
    seats: 40,
    symbol: "🎸",
    color: "#ffb1d9",
    colorTwo: "#ffccab"
  },
  {
    id: 4,
    name: "Canvas Carnival",
    category: "Arts",
    date: "2026-10-31",
    time: "10:00 AM - 1:00 PM",
    venue: "Art Studio",
    description: "Turn your imagination into art and celebrate creativity.",
    seats: 25,
    symbol: "🎨",
    color: "#ffc77d",
    colorTwo: "#fff0a1"
  },
  {
    id: 5,
    name: "Campus Cup",
    category: "Sports",
    date: "2026-11-01",
    time: "8:00 AM - 11:00 AM",
    venue: "College Ground",
    description: "Bring your team spirit and enjoy friendly sports competition.",
    seats: 35,
    symbol: "🏆",
    color: "#b9f6cf",
    colorTwo: "#8ce8ff"
  },
  {
    id: 6,
    name: "Word Warriors",
    category: "Literature",
    date: "2026-11-01",
    time: "2:00 PM - 4:00 PM",
    venue: "Seminar Hall",
    description: "Share ideas, express opinions and celebrate the power of words.",
    seats: 0,
    symbol: "📚",
    color: "#d7b7ff",
    colorTwo: "#ffb1d9"
  }
];

const initialSeats = Object.fromEntries(
  events.map(event => [event.id, event.seats])
);

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

const savedSeats = readStorage("campusHubSeats", initialSeats);
const seatsLeft = { ...initialSeats };

events.forEach(event => {
  const saved = Number(savedSeats[event.id]);
  if (Number.isFinite(saved)) {
    seatsLeft[event.id] = Math.max(
      0,
      Math.min(event.seats, saved)
    );
  }
});

let registrations = readStorage("campusHubRegistrations", []);
if (!Array.isArray(registrations)) registrations = [];

let selectedEventId = null;
let showingMyEvents = false;
let toastTimer;

const eventGrid = document.getElementById("eventGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const resultsText = document.getElementById("resultsText");
const emptyState = document.getElementById("emptyState");

const registrationModal = document.getElementById("registrationModal");
const successModal = document.getElementById("successModal");
const registrationForm = document.getElementById("registrationForm");

// Save data in the browser.
function saveData() {
  try {
    localStorage.setItem("campusHubSeats", JSON.stringify(seatsLeft));
    localStorage.setItem(
      "campusHubRegistrations",
      JSON.stringify(registrations)
    );
  } catch {
    showToast("Could not save data in this browser.");
  }
}

function formatDate(dateString) {
  return new Date(dateString + "T12:00:00").toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "short", year: "numeric" }
  );
}

function renderEvents() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm);
    const matchesCategory =
      category === "All" || event.category === category;

    const matchesMyEvents =
      !showingMyEvents ||
      registrations.some(item => item.eventId === event.id);

    return matchesSearch && matchesCategory && matchesMyEvents;
  });

  eventGrid.innerHTML = "";

  filteredEvents.forEach((event, index) => {
    const seats = seatsLeft[event.id];
    const isFull = seats <= 0;
    const isRegistered = registrations.some(
      item => item.eventId === event.id
    );

    const card = document.createElement("article");
    card.className = "event-card";
    card.style.animationDelay = `${Math.min(index * 70, 350)}ms`;

    const art = document.createElement("div");
    art.className = "card-art";
    art.style.setProperty("--card-color", event.color);
    art.style.setProperty("--card-color-two", event.colorTwo);

    const categoryPill = document.createElement("span");
    categoryPill.className = "category-pill";
    categoryPill.textContent = event.category;

    const symbol = document.createElement("span");
    symbol.className = "event-symbol";
    symbol.textContent = event.symbol;

    art.append(categoryPill, symbol);

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("h3");
    title.textContent = event.name;

    const description = document.createElement("p");
    description.className = "card-description";
    description.textContent = event.description;

    const info = document.createElement("div");
    info.className = "event-info";

    [
      `📅 ${formatDate(event.date)}`,
      `🕒 ${event.time}`,
      `📍 ${event.venue}`
    ].forEach(text => {
      const line = document.createElement("div");
      line.textContent = text;
      info.appendChild(line);
    });

    const seatRow = document.createElement("div");
    seatRow.className = "seat-row";

    const seatText = document.createElement("span");
    seatText.textContent = isFull ? "Registration closed" : "Seats left";

    const seatValue = document.createElement("span");
    seatValue.className = isFull ? "full-label" : "seat-count";
    seatValue.textContent = isFull ? "FULL" : seats;

    seatRow.append(seatText, seatValue);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "primary-btn register-btn";

    if (isFull) {
      button.textContent = "Event Full";
      button.disabled = true;
    } else if (isRegistered) {
      button.textContent = "✓ Registered";
      button.disabled = true;
    } else {
      button.textContent = "Register Now ↗";
      button.addEventListener("click", () => openRegistration(event.id));
    }

    body.append(title, description, info, seatRow, button);
    card.append(art, body);
    eventGrid.appendChild(card);
  });

  emptyState.hidden = filteredEvents.length !== 0;

  resultsText.textContent = showingMyEvents
    ? `Showing ${filteredEvents.length} of your registered events`
    : `Showing ${filteredEvents.length} of ${events.length} events`;
}

// Open registration form.
function openRegistration(eventId) {
  const event = events.find(item => item.id === eventId);
  if (!event) return;

  if (seatsLeft[eventId] <= 0) {
    showToast("Sorry, this event is full.");
    renderEvents();
    return;
  }

  if (registrations.some(item => item.eventId === eventId)) {
    showToast("You are already registered for this event in this browser.");
    return;
  }

  selectedEventId = eventId;
  document.getElementById("selectedEventName").textContent =
    `${event.name} · ${formatDate(event.date)}`;

  registrationForm.reset();
  clearErrors();

  registrationModal.hidden = false;
  document.getElementById("studentName").focus();
}

function closeRegistration() {
  registrationModal.hidden = true;
  selectedEventId = null;
}

document.getElementById("closeModal").addEventListener(
  "click",
  closeRegistration
);

registrationModal.addEventListener("click", event => {
  if (event.target === registrationModal) closeRegistration();
});

document.getElementById("successClose").addEventListener("click", () => {
  successModal.hidden = true;
});

successModal.addEventListener("click", event => {
  if (event.target === successModal) successModal.hidden = true;
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeRegistration();
    successModal.hidden = true;
  }
});

function clearErrors() {
  ["nameError", "emailError", "phoneError"].forEach(id => {
    document.getElementById(id).textContent = "";
  });
}

function showError(id, message) {
  document.getElementById(id).textContent = message;
}

// Validate and save registration.
registrationForm.addEventListener("submit", event => {
  event.preventDefault();
  clearErrors();

  const name = document.getElementById("studentName").value.trim();
  const email = document.getElementById("studentEmail").value.trim();
  const phone = document.getElementById("studentPhone").value.trim();

  let valid = true;

  if (name.length < 2 || !/^[\p{L}\p{M} .'-]+$/u.test(name)) {
    showError("nameError", "Enter a valid name (at least 2 characters).");
    valid = false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError("emailError", "Enter a valid email address.");
    valid = false;
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    showError("phoneError", "Enter a valid 10-digit Indian mobile number.");
    valid = false;
  }

  if (!valid) return;

  const eventItem = events.find(item => item.id === selectedEventId);
  if (!eventItem) return;

  if (seatsLeft[eventItem.id] <= 0) {
    showError("phoneError", "Sorry, this event is now full.");
    renderEvents();
    return;
  }

  if (registrations.some(item => item.eventId === eventItem.id)) {
    showError("phoneError", "You are already registered for this event.");
    return;
  }

  registrations.push({
    eventId: eventItem.id,
    studentName: name,
    email,
    phone,
    registeredAt: new Date().toISOString()
  });

  seatsLeft[eventItem.id]--;
  saveData();

  closeRegistration();
  renderEvents();

  document.getElementById("successMessage").textContent =
    `Congratulations, ${name}! You have registered for ${eventItem.name}. We look forward to seeing you there!`;

  successModal.hidden = false;
});

// Search and category filter.
searchInput.addEventListener("input", renderEvents);
categoryFilter.addEventListener("change", renderEvents);

// My Events toggle.
document.getElementById("myEventsBtn").addEventListener("click", event => {
  showingMyEvents = !showingMyEvents;

  event.currentTarget.textContent = showingMyEvents
    ? "← All Events"
    : "♡ My Events";

  renderEvents();
  document.getElementById("events").scrollIntoView({ behavior: "smooth" });
});

// Light / dark theme.
const themeBtn = document.getElementById("themeBtn");

if (localStorage.getItem("campusHubTheme") === "light") {
  document.body.classList.add("light-mode");
  themeBtn.textContent = "☀ Dark Mode";
}

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");

  const isLight = document.body.classList.contains("light-mode");
  themeBtn.textContent = isLight ? "☀ Dark Mode" : "☾ Light Mode";

  try {
    localStorage.setItem("campusHubTheme", isLight ? "light" : "dark");
  } catch {
    // Theme still works for the current page.
  }
});

// Fest countdown: October 30, 2026.
function updateCountdown() {
  const target = new Date("2026-10-30T09:00:00").getTime();
  const difference = target - Date.now();

  if (difference <= 0) {
    ["days", "hours", "minutes", "seconds"].forEach(id => {
      document.getElementById(id).textContent = "00";
    });

    document.querySelector(".countdown-note").textContent =
      "The fest has started! Enjoy the events.";
    return;
  }

  const days = Math.floor(difference / 86400000);
  const hours = Math.floor((difference % 86400000) / 3600000);
  const minutes = Math.floor((difference % 3600000) / 60000);
  const seconds = Math.floor((difference % 60000) / 1000);

  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

// Small notification message.
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

// Start the website.
renderEvents();
updateCountdown();
setInterval(updateCountdown, 1000);