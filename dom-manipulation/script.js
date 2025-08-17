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

  const randomIndex = Math.floor(Math.random() * filteredQuot*
