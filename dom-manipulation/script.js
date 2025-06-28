// Initial quotes array (will be replaced by localStorage data if available)
const quotes = [
  { text: "Believe you can and you're halfway there.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The purpose of our lives is to be happy.", category: "Happiness" }
];

// Save quotes array to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Load quotes from localStorage if present
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    const parsedQuotes = JSON.parse(storedQuotes);
    quotes.length = 0; // Clear current quotes
    quotes.push(...parsedQuotes);
  }
}

// Show last viewed quote from sessionStorage if exists
function showLastQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quoteDiv = document.getElementById("quoteDisplay");
    const quoteObj = quotes.find(q => q.text === last);
    if (quoteObj) {
      quoteDiv.innerHTML = `
        <p>"${quoteObj.text}"</p>
        <p><strong>Category:</strong> ${quoteObj.category}</p>
      `;
    }
  }
}

// Show a random quote from the quotes array
function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  const quoteDiv = document.getElementById("quoteDisplay");
  quoteDiv.innerHTML = `
    <p>"${randomQuote.text}"</p>
    <p><strong>Category:</strong> ${randomQuote.category}</p>
  `;

  // Save last quote text in sessionStorage
  sessionStorage.setItem("lastQuote", randomQuote.text);
}

// Create the quote addition form dynamically
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");

  // Clear any existing form
  formContainer.innerHTML = "";

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.id = "addQuoteBtn";
  addButton.innerText = "Add Quote";

  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
}

// Add a new quote from form inputs
function addQuote() {
  const textInput = document.getElementById("newQuoteText").value.trim();
  const categoryInput = document.getElementById("newQuoteCategory").value.trim();

  if (textInput === "" || categoryInput === "") {
    alert("Please fill in both the quote and category!");
    return;
  }

  const newQuote = {
    text: textInput,
    category: categoryInput
  };

  quotes.push(newQuote);
  saveQuotes();

  // Update categories and filter to new category
  populateCategories();
  document.getElementById("categoryFilter").value = newQuote.category;
  localStorage.setItem("selectedCategory", newQuote.category);

  filterQuotes();

  // Clear inputs
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Export quotes as a JSON file
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// Import quotes from a JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      if (!Array.isArray(importedQuotes)) {
        alert("Invalid file format: JSON must be an array of quotes.");
        return;
      }

      importedQuotes.forEach(quote => {
        if (quote.text && quote.category) {
          quotes.push(quote);
        }
      });

      saveQuotes();
      alert("Quotes imported successfully!");

      populateCategories();

      // Apply saved filter or show random
      const savedCategory = localStorage.getItem("selectedCategory") || "all";
      document.getElementById("categoryFilter").value = savedCategory;
      filterQuotes();
    } catch (err) {
      alert("Error parsing JSON file: " + err.message);
    }
  };
  reader.readAsText(file);
}

// Populate categories dropdown dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");

  // Clear existing except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore saved category filter
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory && categories.includes(savedCategory)) {
    categoryFilter.value = savedCategory;
  }
}

// Filter quotes by selected category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  const quoteDiv = document.getElementById("quoteDisplay");

  let filteredQuotes = [];
  if (selectedCategory === "all") {
    filteredQuotes = quotes;
  } else {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDiv.innerHTML = "<p>No quotes found for this category.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  quoteDiv.innerHTML = `
    <p>"${randomQuote.text}"</p>
    <p><strong>Category:</strong> ${randomQuote.category}</p>
  `;

  sessionStorage.setItem("lastQuote", randomQuote.text);
}

// Event Listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("exportBtn").addEventListener("click", exportQuotes);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);

// Initialize app on load
loadQuotes();
createAddQuoteForm();
populateCategories();

const savedCategory = localStorage.getItem("selectedCategory") || "all";
document.getElementById("categoryFilter").value = savedCategory;

filterQuotes();
