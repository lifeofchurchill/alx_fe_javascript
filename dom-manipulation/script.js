// script.js

let quotes = [];
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");
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
  updateCategoryOptions();
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show random quote
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  let filteredQuotes = selectedCategory === "all" 
    ? quotes 
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerText = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.innerText = `"${filteredQuotes[randomIndex].text}" - [${filteredQuotes[randomIndex].category}]`;

  // Save last viewed quote to sessionStorage
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
  updateCategoryOptions();
  textInput.value = "";
  categoryInput.value = "";

  // Also sync to server (simulated POST)
  postQuoteToServer(newQuote);
}

// Update category dropdown
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

// Export quotes as JSON
exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    updateCategoryOptions();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}
importFile.addEventListener("change", importFromJsonFile);

// --- Server Simulation ---

// Fetch quotes from mock server (GET)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();

    // Simulate mapping server posts -> quotes
    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Conflict resolution: server data takes precedence
    quotes = [...quotes, ...serverQuotes];
    saveQuotes();
    updateCategoryOptions();
    console.log("Quotes synced from server.");
  } catch (error) {
    console.error("Error fetching from server:", error);
  }
}

// Post new quote to mock server (POST)
async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quote)
    });
    console.log("Quote posted to server:", quote);
  } catch (error) {
    console.error("Error posting to server:", error);
  }
}

// Periodic server sync
setInterval(fetchQuotesFromServer, 15000);

// --- Initialization ---
loadQuotes();
createAddQuoteForm();
newQuoteBtn.addEventListener("click", showRandomQuote);

// Load last viewed quote from sessionStorage
const lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) {
  quoteDisplay.innerText = lastQuote;
}
