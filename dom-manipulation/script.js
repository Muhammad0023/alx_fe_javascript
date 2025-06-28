const quotes = [
  { text: "Believe you can and you're halfway there.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The purpose of our lives is to be happy.", category: "Happiness" }
];

// Function to show random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  const quoteDiv = document.getElementById("quoteDisplay");
  quoteDiv.innerHTML = `
    <p>"${randomQuote.text}"</p>
    <p><strong>Category:</strong> ${randomQuote.category}</p>
  `;
}

// Function to dynamically create the form
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");

  // Input for quote text
  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  // Input for category
  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  // Button to add quote
  const addButton = document.createElement("button");
  addButton.id = "addQuoteBtn";
  addButton.innerText = "Add Quote";

  // Event listener for Add Quote button
  addButton.addEventListener("click", addQuote);

  // Append all to form container
  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
}

// Function to add new quote
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

  // Show the new quote immediately
  showRandomQuote();

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Event listener for Show New Quote button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Create the form dynamically when the page loads
createAddQuoteForm();
