function displayTutorial() {
  // Create an iframe element
  const iframe = document.createElement("iframe");
  iframe.id = "inboxwhiz-tutorial";
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

function closeTutorial() {
  const iframe = document.getElementById("inboxwhiz-tutorial");
  iframe?.remove();
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "SHOW_TUTORIAL") {
    console.log("Received message to show tutorial");
    displayTutorial();
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "CLOSE_TUTORIAL") {
    console.log("Received message to close tutorial");
    closeTutorial();
  }
});
