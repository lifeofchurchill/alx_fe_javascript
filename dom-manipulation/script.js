// script.js

let quotes = [];
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect"); // old dropdown for generating
const categoryFilter = document.getElementById("categoryFilter"); // new filter dropdown
const formPlaceholder = document.getElementById("formPlaceholder");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");

// Load from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" },
    { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Resilience" }
  ];
  saveQuotes();
  populateCategories();
  updateCategoryOptions();
  restoreFilter();
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show random quote (respects filter)
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  let filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerText = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.innerText = `"${filteredQuotes[randomIndex].text}" - [${filteredQuotes[randomIndex].category}]`;

  sessionStorage.setItem("lastQuote", quoteDisplay.innerText);
}

// Add quote form
function createAddQuoteForm() {
  formPlaceholder.innerHTML = `
    <div class="form-container">
      <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
      <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
      <button onclick="addQuote()">Add Quote</button>
    </div>
  `;
}

// Add new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newQuote = {
    text: textInput.value.trim(),
    category: categoryInput.value.trim()
  };

  if (!newQuote.text || !newQuote.category) {
    alert("Please enter both a quote and category!");
    return;
  }

  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  updateCategoryOptions();
  textInput.value = "";
  categoryInput.value = "";
}

// --- Category Handling ---

// Fill both filter and generator dropdowns dynamically
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];

  // reset filter
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

// Old dropdown for generating (keep it too)
function updateCategoryOptions() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Filter logic
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote();
}

// Restore filter selection from storage
function restoreFilter() {
  const saved = localStorage.getItem("selectedCategory");
  if (saved) {
    categoryFilter.value = saved;
  }
}

// --- Import/Export ---

exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
});

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    updateCategoryOptions();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}
importFile.addEventListener("change", importFromJsonFile);

// --- Initialization ---
loadQuotes();
createAddQuoteForm();
newQuoteBtn.addEventListener("click", showRandomQuote);

const lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) {
  quoteDisplay.innerText = lastQuote;
}
