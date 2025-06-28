const serverURL = "https://jsonplaceholder.typicode.com/posts";

let quotes = [
  { text: "Believe you can and you're halfway there.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The purpose of our lives is to be happy.", category: "Happiness" }
];

// -------- Local Storage Handling --------
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  }
}

// -------- UI Notifications --------
function notify(message, isError = false) {
  const div = document.getElementById("syncStatus");
  div.style.color = isError ? "red" : "green";
  div.textContent = message;
  setTimeout(() => {
    div.textContent = "";
  }, 4000);
}

// -------- Display Random Quote --------
function showRandomQuote() {
  filterQuotes();
}

// -------- Filter Quotes by Category --------
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);

  const filtered = selected === "all" ? quotes : quotes.filter(q => q.category === selected);

  const quoteDiv = document.getElementById("quoteDisplay");
  if (filtered.length === 0) {
    quoteDiv.innerHTML = "<p>No quotes found for this category.</p>";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDiv.innerHTML = `
    <p>"${random.text}"</p>
    <p><strong>Category:</strong> ${random.category}</p>
  `;
  sessionStorage.setItem("lastQuote", random.text);
}

// -------- Populate Categories --------
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  select.innerHTML = '<option value="all">All Categories</option>';

  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  const saved = localStorage.getItem("selectedCategory");
  if (saved && categories.includes(saved)) {
    select.value = saved;
  }
}

// -------- Add New Quote --------
async function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Both fields are required.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  document.getElementById("categoryFilter").value = category;
  filterQuotes();

  // Post to server
  await postQuoteToServer(newQuote);

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  notify("New quote added and synced.");
}

// -------- Create Add Quote Form --------
function createAddQuoteForm() {
  const container = document.getElementById("formContainer");
  container.innerHTML = "";

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter category";

  const button = document.createElement("button");
  button.innerText = "Add Quote";
  button.onclick = addQuote;

  container.appendChild(quoteInput);
  container.appendChild(categoryInput);
  container.appendChild(button);
}

// -------- Export Quotes to JSON --------
function exportQuotes() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// -------- Import Quotes from JSON --------
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      imported.forEach(q => {
        if (q.text && q.category) {
          quotes.push(q);
        }
      });
      saveQuotes();
      populateCategories();
      filterQuotes();
      notify("Quotes imported successfully.");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

// ✅ -------- Server Interaction with async/await --------

// Fetch quotes from server (simulate GET)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(serverURL);
    await response.json(); // Simulate real fetch

    const serverQuotes = [
      { text: "Server Quote 1", category: "Server" },
      { text: "Server Quote 2", category: "Server" }
    ];

    serverQuotes.forEach(sq => {
      const exists = quotes.find(lq => lq.text === sq.text);
      if (!exists) {
        quotes.push(sq);
      }
    });

    saveQuotes();
    populateCategories();
    filterQuotes();
    notify("Fetched and synced with server.");
  } catch {
    notify("Failed to fetch from server.", true);
  }
}

// Post new quote to server (simulate POST)
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(serverURL, {
      method: "POST",
      body: JSON.stringify(quote),
      headers: { "Content-type": "application/json; charset=UTF-8" }
    });
    await response.json();
    notify("Quote synced to server.");
  } catch {
    notify("Failed to sync to server.", true);
  }
}

// Sync function (calls fetch from server)
async function syncQuotes() {
  await fetchQuotesFromServer();
}

// Periodic sync every 1 minute
setInterval(syncQuotes, 60000);

// ✅ -------- Initialize --------
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("exportBtn").addEventListener("click", exportQuotes);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);

loadQuotes();
createAddQuoteForm();
populateCategories();
const saved = localStorage.getItem("selectedCategory") || "all";
document.getElementById("categoryFilter").value = saved;
filterQuotes();
