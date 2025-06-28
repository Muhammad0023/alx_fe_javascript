const serverURL = "https://jsonplaceholder.typicode.com/posts";

let quotes = [
  { text: "Believe in yourself.", category: "Motivation" },
  { text: "Life is beautiful.", category: "Life" },
  { text: "Happiness is a choice.", category: "Happiness" }
];

// -------- Local Storage --------
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  }
}

// -------- Notification --------
function notify(message, isError = false) {
  const div = document.getElementById("syncStatus");
  div.style.color = isError ? "red" : "green";
  div.textContent = message;
  setTimeout(() => {
    div.textContent = "";
  }, 4000);
}

// -------- Random Quote --------
function showRandomQuote() {
  filterQuotes();
}

// -------- Filter Quotes --------
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);

  const filtered = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  const quoteDiv = document.getElementById("quoteDisplay");
  if (filtered.length === 0) {
    quoteDiv.innerHTML = "<p>No quotes for this category.</p>";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDiv.innerHTML = `
    <p>"${random.text}"</p>
    <p><strong>Category:</strong> ${random.category}</p>
  `;
  sessionStorage.setItem("lastQuote", random.text);
}

// -------- Categories --------
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

// -------- Add Quote --------
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

  await postQuoteToServer(newQuote);

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  notify("Quotes synced with server!");
}

// -------- Create Add Form --------
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

// -------- Export --------
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

// -------- Import --------
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
      notify("Quotes imported.");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

// ✅ -------- Server Interaction --------

// ✔️ GET - Fetch Quotes from Server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(serverURL);
    await response.json(); // Simulate

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
    notify("Quotes synced with server!");
  } catch {
    notify("Failed to fetch from server.", true);
  }
}

// ✔️ POST - Send Quote to Server (with Content-Type header)
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(serverURL, {
      method: "POST",
      body: JSON.stringify(quote),
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      }
    });
    await response.json();
    notify("Quotes synced with server!");
  } catch {
    notify("Failed to sync to server.", true);
  }
}

// ✔️ Sync Function
async function syncQuotes() {
  await fetchQuotesFromServer();
}

// ✔️ Periodic Sync (every 60 seconds)
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
