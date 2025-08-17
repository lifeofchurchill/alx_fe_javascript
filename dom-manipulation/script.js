// Function to sync local quotes with server
function syncQuotes() {
  fetch("https://jsonplaceholder.typicode.com/posts")
    .then(response => response.json())
    .then(serverQuotes => {
      // Conflict resolution: server data takes precedence
      quotes = serverQuotes.map(item => ({
        text: item.title,
        author: "Server",
        category: "General"
      }));

      saveQuotes();
      displayQuotes();
      populateCategories();

      // ✅ Notify user about sync
      alert("Quotes synced with server!");
    })
    .catch(error => console.error("Error syncing quotes:", error));
}
