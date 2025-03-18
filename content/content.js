var declutterTabOpen = false;

// Functions to build UI

async function insertDeclutterButton() {
    const button = await loadHTMLFragment('content/ui/declutter_icon.html', 'content/ui/declutter_icon.css', 'declutter-button-style');

    // On click, open the Declutter tab
    button.addEventListener("click", () => {
        declutterTabOpen ? closeDeclutterTab() : openDeclutterTab();
    });

    // Append to Gmail
    const supportIcon = Array.from(document.querySelectorAll("*")).find(el => el.getAttribute("data-tooltip") === "Support");
    supportIcon.insertAdjacentElement("beforebegin", button);
}

async function insertDeclutterBody() {
    const decutterBody = await loadHTMLFragment('content/ui/declutter_body.html', 'content/ui/declutter_body.css', 'declutter-body-style');

    // Add FontAwesome link if not already there
    const existingFontAwesome = document.querySelector('#font-awesome-style');
    if (!existingFontAwesome) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css';
        fontAwesome.id = 'font-awesome-style';
        document.head.appendChild(fontAwesome);
    }

    // Add onClick to close button
    const closeButton = decutterBody.querySelector(".close-button");
    closeButton.addEventListener("click", () => {
        closeDeclutterTab();
    });

    // Add no senders modal popup functionality
    loadModalPopup("#noSenderModal");
    const openNoSenderModal = () => {
        const modal = document.querySelector("#noSenderModal");
        modal.style.display = "block";
    }
    const unsubscribeButton = decutterBody.querySelector("#unsubscribe-button");
    const deleteButton = decutterBody.querySelector("#delete-button");
    unsubscribeButton.onclick = openNoSenderModal;
    deleteButton.onclick = openNoSenderModal;

    // Add reload button functionality
    const reloadButton = decutterBody.querySelector("#reload-button");
    reloadButton.addEventListener("click", () => {
        reloadSenders();
    });

    // Append to Gmail
    const tabParent = document.querySelector(".aUx");
    tabParent.prepend(decutterBody);
}

async function createSenderLine(senderName, senderEmail, emailCountNum) {
    const senderLine = await loadHTMLFragment('content/ui/sender_line.html', 'content/ui/sender_line.css', 'sender-line-style');

    // Set sender name, email, and email count
    const senderNameElement = senderLine.querySelector(".sender-name");
    const senderEmailElement = senderLine.querySelector(".sender-email");
    const emailCountElement = senderLine.querySelector(".email-count span");

    senderNameElement.textContent = senderName;
    senderEmailElement.textContent = senderEmail;
    emailCountElement.textContent = emailCountNum;

    // Add onClick to email link button
    senderEmailElement.addEventListener("click", () => {
        searchEmailSender(senderEmail);
    });

    return senderLine;
}

async function insertSenders(sendersList) {

    var senderLines = []
    for (let i in sendersList) {
        var line = await createSenderLine(sendersList[i][1], sendersList[i][0], sendersList[i][2]);
        senderLines.push(line);
    }

    setTimeout(() => {
        const declutterBodyTable = document.querySelector("#senders");

        declutterBodyTable.innerHTML = ""; // Clear existing rows
        declutterBodyTable.parentElement.querySelector(".loading-message").style.display = "none";

        for (line in senderLines) {
            declutterBodyTable.appendChild(senderLines[line]);
        }
    }, 2000);
}

// Helper functions

async function loadHTMLFragment(htmlUrl, cssUrl, styleId) {
    const res = await fetch(chrome.runtime.getURL(htmlUrl));
    const html = await res.text();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    loadCSS(cssUrl, styleId);

    return wrapper.firstElementChild;
}

function loadCSS(cssUrl, styleId) {
    const existing = document.querySelector(styleId);
    if (!existing) {
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = chrome.runtime.getURL(cssUrl);
        style.id = styleId;
        document.head.appendChild(style);
    }
}

function loadModalPopup(modalId) {
    // Loads the modal popup and returns a function to open it.

    setTimeout(() => {
        const modal = document.querySelector(modalId);
        const closeModalButton = modal.querySelector(".close-modal");

        // Add close functionality
        closeModalButton.onclick = function () {
            modal.style.display = "none";
        }
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }, 2000);
}

// Actions

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

function reloadSenders() {
    chrome.runtime.sendMessage({ action: "fetchSenders" });

    // Show loading message
    const loadingMessage = document.querySelector(".loading-message");
    loadingMessage.style.display = "block";

    // Clear existing senders
    const declutterBodyTable = document.querySelector("#senders");
    declutterBodyTable.innerHTML = "";
}

function searchEmailSender(email) {
    // Get the search input element
    const searchInput = document.querySelector("input[name='q']");

    // Set the search input value to the email address
    searchInput.value = `from:${email}`;

    // Submit the search form
    const searchSubmit = document.querySelector("button[aria-label='Search mail']");
    searchSubmit.click();
}


// Update senders if the senders list changes
chrome.storage.onChanged.addListener((changes, namespace) => {

    if (changes.senders) {

        chrome.storage.local.get(["senders"]).then((result) => {
            const senders = result.senders;
            if (senders) {
                insertSenders(senders);
            }
        });
    }
});

const observer = new MutationObserver((mutations, observer) => {
    if (document.querySelector("[data-tooltip='Support']")) {
        observer.disconnect(); // Stop observing once the element is found

        insertDeclutterButton();
        insertDeclutterBody();

        chrome.storage.local.get(["senders"]).then((result) => {
            const senders = result.senders;
            if (senders) {
                insertSenders(senders);
            }
        });

    }
});

observer.observe(document.body, { childList: true, subtree: true });
