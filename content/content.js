var declutterTabOpen = false;
var selectedSenders = [];

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
    decutterBody.querySelector(".close-button").addEventListener("click", () => {
        closeDeclutterTab();
    });

    // Add modal popups
    const noSendersModal = await loadModalPopup('content/ui/modal_popups/no_sender.html');
    decutterBody.appendChild(noSendersModal);

    const deleteModal = await loadModalPopup('content/ui/modal_popups/confirm_delete.html');
    decutterBody.appendChild(deleteModal);

    // Add unsubscribe and delete button functionality
    decutterBody.querySelector("#unsubscribe-button").onclick = () => openModal(noSendersModal, noSendersModal);
    decutterBody.querySelector("#delete-button").onclick = () => openModal(deleteModal, noSendersModal);

    // Add reload button functionality
    decutterBody.querySelector("#reload-button").addEventListener("click", () => {
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

    // Add functionality to checkbox
    senderLine.querySelector("input[type='checkbox']").addEventListener("change", updateCheckbox);

    function updateCheckbox() {
        senderLine.classList.toggle("selected");

        if (this.checked) {
            selectedSenders.push(senderEmail);
        } else {
            selectedSenders.pop(senderEmail);
        }
    }

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

async function loadModalPopup(htmlUrl) {
    const modal = await loadHTMLFragment(htmlUrl, 'content/ui/modal_popups/modal_popup.css', 'modal-style');
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

    return modal
}

// Actions

function openDeclutterTab() {
    declutterTabOpen = true;

    // Select the declutter button
    document.querySelector("#declutter-button").classList.toggle("active");

    // Show Declutter tab content
    document.querySelector("#declutter-body").style.display = "block";
}

function closeDeclutterTab() {
    declutterTabOpen = false;

    // Deselect the declutter button
    document.querySelector("#declutter-button").classList.toggle("active");

    // Hide Declutter tab content
    document.querySelector("#declutter-body").style.display = "none";
}

function openModal(confirmModal, warningModal) {
    if (selectedSenders.length > 0) {
        console.log("Showing confirm modal");
        confirmModal.style.display = "block";
    } else {
        console.log("Showing warning modal");
        warningModal.style.display = "block";
    }
}

function reloadSenders() {
    chrome.runtime.sendMessage({ action: "fetchSenders" });

    // Show loading message
    document.querySelector(".loading-message").style.display = "block";

    // Clear existing senders
    document.querySelector("#senders").innerHTML = "";
}

function searchEmailSender(email) {
    // Get the search input element
    const searchInput = document.querySelector("input[name='q']");

    // Set the search input value to the email address
    searchInput.value = `from:${email}`;

    // Submit the search form
    document.querySelector("button[aria-label='Search mail']").click();
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
