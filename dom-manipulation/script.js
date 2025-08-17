// ======================
// Quotes Data Handling
// ======================

// Load quotes from localStorage or default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do not watch the clock. Do what it does. Keep going.", category: "Productivity" },
  { text: "Happiness depends upon ourselves.", category: "Philosophy" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ======================
// DOM Elements
// ======================
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");
const formPlaceholder = document.getElementById("formPlaceholder");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");

// ======================
// Functions
// ======================

// Populate category dropdown dynamically
function updateCategoryOptions() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// Show a random quote (filtered by category)
function showRandomQuote() {
  let filteredQuotes = quotes;
  if (categorySelect.value !== "all") {
    filteredQuotes = quotes.filter(q => q.category === categorySelect.value);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const selected = filteredQuotes[randomIndex];

  quoteDisplay.textContent = `"${selected.text}" — ${selected.category}`;

  // Save last viewed quote in sessionStorage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(selected));
}

// Add a new quote
function addQuote(text, category) {
  if (!text || !category) {
    alert("Please enter both a quote and a category!");
    return;
  }
  quotes.push({ text, category });
  saveQuotes();
  updateCategoryOptions();
  alert("Quote added successfully!");
}

// Dynamically create Add Quote Form
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.className = "form-container";

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";
  textInput.id = "newQuoteText";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.id = "newQuoteCategory";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", () => {
    const text = textInput.value.trim();
    const category = categoryInput.value.trim();
    addQuote(text, category);
    textInput.value = "";
    categoryInput.value = "";
  });

  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  formPlaceholder.appendChild(formContainer);
}

// Export quotes as JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2); // pretty JSON
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      if (!Array.isArray(importedQuotes)) {
        throw new Error("Invalid JSON format: must be an array");
      }

      quotes.push(...importedQuotes);
      saveQuotes();
      updateCategoryOptions();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Failed to import quotes: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ======================
// Event Listeners
// ======================
newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", exportToJsonFile);
importFile.addEventListener("change", importFromJsonFile);

// ======================
// Initialization
// ======================
updateCategoryOptions();
createAddQuoteForm();

// Restore last viewed quote (if session exists)
const lastViewed = sessionStorage.getItem("lastViewedQuote");
if (lastViewed) {
  const q = JSON.parse(lastViewed);
  quoteDisplay.textContent = `"${q.text}" — ${q.category}`;
}
