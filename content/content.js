var declutterTabOpen = false;

async function insertDeclutterButton() {
    // Get location of insertion point
    const supportIcon = Array.from(document.querySelectorAll("*")).find(el => el.getAttribute("data-tooltip") === "Support");

    // Load HTML fragment
    const res = await fetch(chrome.runtime.getURL('content/ui/declutter_icon.html'));
    const html = await res.text();

    // Parse HTML into DOM element
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const button = wrapper.firstElementChild;

    // Inject CSS if not already there
    const existing = document.querySelector('#declutter-button-style');
    if (!existing) {
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = chrome.runtime.getURL('content/ui/declutter_icon.css');
        style.id = 'declutter-button-style';
        document.head.appendChild(style);
    }

    // On click, open the Declutter tab
    button.addEventListener("click", () => {
        declutterTabOpen ? closeDeclutterTab() : openDeclutterTab();
    });

    // Append to Gmail
    supportIcon.insertAdjacentElement("beforebegin", button);
    console.log("Declutter button inserted");
}

async function insertDeclutterBody() {
    // Load HTML fragment
    const res = await fetch(chrome.runtime.getURL('content/ui/declutter_body.html'));
    const html = await res.text();

    // Parse HTML into DOM element
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const decutterBody = wrapper.firstElementChild;

    // Inject CSS if not already there
    const existing = document.querySelector('#declutter-body-style');
    if (!existing) {
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = chrome.runtime.getURL('content/ui/declutter_body.css');
        style.id = 'declutter-body-style';
        document.head.appendChild(style);
    }

    // Add onClick to close button
    const closeButton = decutterBody.querySelector(".close-button");
    closeButton.addEventListener("click", () => {
        closeDeclutterTab();
    });

    // Append to Gmail
    const tabParent = document.querySelector(".aUx");
    tabParent.prepend(decutterBody);
};

function createDeclutterBodyLine(senderName, senderEmail, emailCountNum) {
    const line = document.createElement("tr");
    line.style = `
        color: rgb(32, 33, 36);
        border: 3px solid red;
        font-family: "Google Sans", Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
        font-size: .875rem;
        padding: 5px;
    `;

    // Sender details
    const senderDetails = document.createElement("td");
    senderDetails.style = `
        display: inline-flex; 
        flex-direction: column;
        margin: 20px;
    `;
    const senderNameElement = document.createElement("span");
    senderNameElement.textContent = senderName;
    const senderEmailElement = document.createElement("span");
    senderEmailElement.textContent = senderEmail;
    senderEmailElement.style = `
        color: #5F6368;
        font-size: 0.75rem;
        margin-top: 3px
    `;
    senderDetails.appendChild(senderNameElement);
    senderDetails.appendChild(senderEmailElement);

    // Email count
    const emailCount = document.createElement("td");
    emailCount.innerHTML = `<span style='font-weight: bold;'>${emailCountNum}</span>`;

    line.appendChild(senderDetails);
    line.appendChild(emailCount);
    return line;

};

function openDeclutterTab() {
    declutterTabOpen = true;

    // Select the declutter button
    const declutterButton = document.querySelector("#declutter-button");
    declutterButton.classList.toggle("active");

    // Show Declutter tab content
    const declutterBody = document.querySelector("#declutter-body");
    declutterBody.style.display = "block";
}

function closeDeclutterTab() {
    declutterTabOpen = false;

    // Deselect the declutter button
    const declutterButton = document.querySelector("#declutter-button");
    declutterButton.classList.toggle("active");

    // Hide Declutter tab content
    const declutterBody = document.querySelector("#declutter-body");
    declutterBody.style.display = "none";
}

const observer = new MutationObserver((mutations, observer) => {
    if (document.querySelector("[data-tooltip='Support']")) {
        observer.disconnect(); // Stop observing once the element is found

        insertDeclutterButton();
        insertDeclutterBody();

    }
});

observer.observe(document.body, { childList: true, subtree: true });

// Listen for updated sender counts from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateSenderCounts") {
        const topSenders = request.senders;
        console.log("Top senders received:", topSenders);

        // Update the Declutter tab with the top senders
        const declutterBodyTable = document.querySelector("#declutter-body-table");
        declutterBodyTable.innerHTML = ""; // Clear existing rows

        topSenders.forEach(([sender, count]) => {
            const senderName = sender.split("<")[0].trim();
            const senderEmail = sender.split("<")[1].replace(">", "").trim();
            const line = createDeclutterBodyLine(senderName, senderEmail, count);
            declutterBodyTable.appendChild(line);
        });
    }
});