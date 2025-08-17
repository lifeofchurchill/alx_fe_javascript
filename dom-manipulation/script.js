let quotes = JSON.parse(localStorage.getItem("quotes")) || [];

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display quotes
function displayQuotes(filtered = quotes) {
  const display = document.getElementById("quoteDisplay");
  display.innerHTML = "";
  filtered.forEach(q => {
    const div = document.createElement("div");
    div.textContent = `"${q.text}" - ${q.author} [${q.category}]`;
    display.appendChild(div);
  });
}

// Add new quote
function addQuote(event) {
  event.preventDefault();
  const text = document.getElementById("quoteText").value;
  const author = document.getElementById("quoteAuthor").value;
  const category = document.getElementById("quoteCategory").value;

  const newQuote = { id: Date.now(), text, author, category };

  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  displayQuotes();
  event.target.reset();
}

// Populate categories dynamically
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];
  filter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filter.appendChild(option);
  });

  // Restore last filter
  const lastFilter = localStorage.getItem("lastFilter");
  if (lastFilter) {
    filter.value = lastFilter;
    filterQuotes();
  }
}

// Filter quotes
function filterQuotes() {
  const filter = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastFilter", filter);
  if (filter === "all") {
    displayQuotes();
  } else {
    const filtered = quotes.filter(q => q.category === filter);
    displayQuotes(filtered);
  }
}

// JSON Export
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// JSON Import
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    displayQuotes();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// ========== Server Sync Section ==========

// Fetch quotes from mock server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const serverData = await response.json();

    // Convert server data to quotes format
    const serverQuotes = serverData.map(item => ({
      id: item.id,
      text: item.title,
      author: "Server",
      category: "General"
    }));

    // Conflict resolution: server wins
    quotes = [...serverQuotes, ...quotes.filter(q => !serverQuotes.find(sq => sq.id === q.id))];
    saveQuotes();
    populateCategories();
    displayQuotes();
    notify("Quotes synced with server (server data takes precedence).");

  } catch (error) {
    notify("Failed to fetch from server.");
    console.error(error);
  }
}

// Sync local quotes to server
async function syncQuotes() {
  try {
    for (const q of quotes) {
      await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q)
      });
    }
    notify("Local quotes synced to server successfully!");
  } catch (error) {
    notify("Failed to sync local quotes to server.");
    console.error(error);
  }
}

// Notification system
function notify(message) {
  const note = document.getElementById("notification");
  note.textContent = message;
  setTimeout(() => note.textContent = "", 3000);
}

// Initial load
window.onload = () => {
  populateCategories();
  displayQuotes();
  fetchQuotesFromServer(); // Initial sync
  setInterval(fetchQuotesFromServer, 30000); // periodic sync every 30s
};
