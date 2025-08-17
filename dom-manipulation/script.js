// =============================
// Dynamic Quote Generator
// With Local Storage + Server Sync
// =============================

// Default quotes (if localStorage is empty)
let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
  { text: "Do not watch the clock. Do what it does. Keep going.", category: "Motivation" }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");
const notifications = document.getElementById("notifications");

// =============================
// Storage Helpers
// =============================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  }
}

// =============================
// Quote Display
// =============================
function showRandomQuote() {
  const category = categorySelect.value;
  let filtered = quotes;

  if (category !== "all") {
    filtered = quotes.filter(q => q.category === category);
  }

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;

  // Save last viewed quote to sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// =============================
// Add Quote Form
// =============================
function createAddQuoteForm() {
  const formContainer = document.getElementById("formPlaceholder");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.onclick = addQuote;

  formContainer.classList.add("form-container");
  formContainer.append(textInput, categoryInput, addBtn);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    notify("Quote added successfully!");
  } else {
    notify("Please enter both text and category.", true);
  }
}

// =============================
// Categories
// =============================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// =============================
// Import / Export
// =============================
document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("importFile").addEventListener("change", importFromJsonFile);

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      notify("Quotes imported successfully!");
    } catch (err) {
      notify("Invalid JSON file.", true);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// =============================
// Server Sync Simulation
// =============================
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const data = await response.json();

    // Simulate server quotes using posts titles
    return data.map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (error) {
    notify("Failed to fetch from server.", true);
    return [];
  }
}

async function syncWithServer() {
  const serverQuotes = await fetchQuotesFromServer();

  if (serverQuotes.length > 0) {
    // Conflict resolution: server takes precedence
    quotes = [...quotes, ...serverQuotes];
    saveQuotes();
    populateCategories();
    notify("Quotes synced with server (server data added).");
  }
}

// =============================
// Notifications
// =============================
function notify(message, isError = false) {
  notifications.textContent = message;
  notifications.style.color = isError ? "red" : "green";
  setTimeout(() => {
    notifications.textContent = "";
  }, 3000);
}

// =============================
// Initialize
// =============================
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

loadQuotes();
populateCategories();
createAddQuoteForm();

// Restore last viewed quote from sessionStorage
const last = sessionStorage.getItem("lastQuote");
if (last) {
  const parsed = JSON.parse(last);
  quoteDisplay.textContent = `"${parsed.text}" — ${parsed.category}`;
}

// Periodic sync every 20s
setInterval(syncWithServer, 20000);
