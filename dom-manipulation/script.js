// Array to store quotes
let quotes = [];
let serverQuotes = []; // Simulate server-side quotes

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const exportQuotesBtn = document.getElementById("exportQuotes");
const importFileInput = document.getElementById("importFile");
const syncServerBtn = document.getElementById("syncServer");
const notification = document.getElementById("notification");

// Function to create the "Add Quote" form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.id = "addQuoteForm";

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// Function to save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Function to load quotes from localStorage
function loadQuotes() {
  const savedQuotes = localStorage.getItem("quotes");
  if (savedQuotes) {
    quotes = JSON.parse(savedQuotes);
  } else {
    // Default quotes if localStorage is empty
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "In the middle of every difficulty lies opportunity.", category: "Motivation" },
    ];
    saveQuotes();
  }
}

// Function to populate the category filter dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(quote => quote.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Load the last selected category from localStorage
  const lastSelectedCategory = localStorage.getItem("lastSelectedCategory");
  if (lastSelectedCategory) {
    categoryFilter.value = lastSelectedCategory;
  }
}

// Function to filter quotes based on the selected category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("lastSelectedCategory", selectedCategory);
  showRandomQuote();
}

// Display a random quote
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  let filteredQuotes = quotes;

  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available for this category.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  // Save the last viewed quote to sessionStorage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote));

  quoteDisplay.innerHTML = `
    <p class="quote">${randomQuote.text}</p>
    <p class="category">Category: ${randomQuote.category}</p>
  `;
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    saveQuotes();
    populateCategories();
    showRandomQuote();
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Export quotes to a JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  notification.textContent = "Quotes exported successfully!";
}

// Import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      showRandomQuote();
      notification.textContent = "Quotes imported successfully!";
    } catch (error) {
      notification.textContent = "Error importing quotes. Please check the file format.";
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Simulate fetching quotes from a server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    // Mock: Convert posts to quotes format
    serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));
    notification.textContent = "Fetched quotes from server.";
    return serverQuotes;
  } catch (error) {
    notification.textContent = "Failed to fetch quotes from server.";
    return [];
  }
}

// Simulate sending quotes to the server
async function sendQuotesToServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quotes),
    });
    if (response.ok) {
      notification.textContent = "Quotes sent to server successfully!";
    } else {
      notification.textContent = "Failed to send quotes to server.";
    }
  } catch (error) {
    notification.textContent = "Error sending quotes to server.";
  }
}

// Sync local quotes with server quotes
async function syncQuotes() {
  const serverData = await fetchQuotesFromServer();
  if (serverData.length > 0) {
    // Conflict resolution: server data takes precedence
    const serverQuoteTexts = serverData.map(q => q.text);
    quotes = quotes.filter(q => !serverQuoteTexts.includes(q.text)); // Remove duplicates
    quotes = [...serverData, ...quotes]; // Merge server and local data
    saveQuotes();
    populateCategories();
    showRandomQuote();
    notification.textContent = "Quotes synced with server!";
  }
}

// Periodically check for new quotes from the server
setInterval(syncQuotes, 30000); // Sync every 30 seconds

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
exportQuotesBtn.addEventListener("click", exportToJsonFile);
importFileInput.addEventListener("change", importFromJsonFile);
syncServerBtn.addEventListener("click", syncQuotes);

// Initialize
loadQuotes();
createAddQuoteForm();
populateCategories();
showRandomQuote();
