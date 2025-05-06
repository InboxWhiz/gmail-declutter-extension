function searchEmailSenders(emails) {
  // Concatenate emails
  const email = emails.join(" OR ");

  // Get the search input element
  const searchInput = document.querySelector("input[name='q']");

  // Set the search input value to the email address
  searchInput.value = `from:(${email})`;

  // Submit the search form
  document.querySelector("button[aria-label='Search mail']").click();
}

function displayTutorial() {
  // Create an iframe element
  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("tutorial/index.html");

  // Style the iframe as a modal
  iframe.allowtransparency = "true";
  iframe.style.backgroundColor = "transparent";
  iframe.style.position = "fixed";
  iframe.style.top = "50%";
  iframe.style.left = "50%";
  iframe.style.transform = "translate(-50%, -50%)";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.style.zIndex = "10000";

  // Append the iframe to the document body
  document.body.appendChild(iframe);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SEARCH_EMAIL_SENDERS") {
    console.log("Received message to search email senders:", message.emails);
    searchEmailSenders(message.emails);
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "SHOW_TUTORIAL") {
    console.log("Received message to show tutorial");
    displayTutorial();
  }
});
