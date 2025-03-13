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

async function createSenderLine(senderName, senderEmail, emailCountNum) {
    // Load HTML fragment
    const res = await fetch(chrome.runtime.getURL('content/ui/sender_line.html'));
    const html = await res.text();

    // Parse HTML into DOM element
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const senderLine = wrapper.firstElementChild;

    // Inject CSS if not already there
    const existing = document.querySelector('#sender-line-style');
    if (!existing) {
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = chrome.runtime.getURL('content/ui/sender_line.css');
        style.id = 'sender-line-style';
        document.head.appendChild(style);
    }

    // Set sender name, email, and email count
    const senderNameElement = senderLine.querySelector(".sender-name");
    const senderEmailElement = senderLine.querySelector(".sender-email");
    const emailCountElement = senderLine.querySelector(".email-count span");

    senderNameElement.textContent = senderName;
    senderEmailElement.textContent = senderEmail;
    emailCountElement.textContent = emailCountNum;

    return senderLine;

};

async function insertSampleSenders() {

    const line1 = await createSenderLine("Sample name", "sampleemail@gmail.com", 0);
    const line2 = await createSenderLine("Sample hi", "sampmail@gmail.com", 670);

    setTimeout(() => {
        const declutterBodyTable = document.querySelector("#senders");
        declutterBodyTable.parentElement.querySelector(".loading-message").style.display = "none";
        declutterBodyTable.appendChild(line1);
        declutterBodyTable.appendChild(line2);
    }, 2000);
}

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

        insertSampleSenders();

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
            const line = createSenderLine(senderName, senderEmail, count);
            declutterBodyTable.appendChild(line);
        });
    }
});