var declutterTabOpen = false;
chrome.runtime.sendMessage({ action: "fetchTopSenders" });

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
    const modal = decutterBody.querySelector("#noSenderModal");
    const closeModalButton = decutterBody.querySelector(".close-modal");
    const unsubscribeButton = decutterBody.querySelector("#unsubscribe-button");
    const deleteButton = decutterBody.querySelector("#delete-button");

    function openModal() {
        modal.style.display = "block";
    }
    unsubscribeButton.onclick = openModal;
    deleteButton.onclick = openModal;

    closeModalButton.onclick = function () {
        modal.style.display = "none";
    }
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

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

    // Add onClick to email link button
    senderEmailElement.addEventListener("click", () => {
        searchEmailSender(senderEmail);
    });


    return senderLine;

};

function searchEmailSender(email) {
    // Get the search input element
    const searchInput = document.querySelector("input[name='q']");

    // Set the search input value to the email address
    searchInput.value = `from:${email}`;

    // Submit the search form
    const searchSubmit = document.querySelector("button[aria-label='Search mail']");
    searchSubmit.click();
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

        chrome.storage.local.get(["senders"]).then((result) => {
            const senders = result.senders;
            if (senders) {
                insertSenders(senders);
            }
        });

    }
});

observer.observe(document.body, { childList: true, subtree: true });
