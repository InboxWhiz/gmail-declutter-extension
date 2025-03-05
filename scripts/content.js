var declutterTabOpen = false;

function createDeclutterTab() {
    const declutterTab = document.createElement("td");
    declutterTab.className = "aRz J-KU";
    declutterTab.id = "declutter-tab";
    declutterTab.setAttribute("role", "heading");
    declutterTab.setAttribute("aria-level", "3");
    declutterTab.style = `
        cursor: pointer;
    `;

    const declutterContainer = document.createElement("div");
    declutterContainer.style = `
        user-select: none;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        -webkit-font-smoothing: antialiased;
        font-family: "Google Sans", Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
        font-size: .875rem;
        color: #444746;
        font-weight: 500;
        letter-spacing: 0;
        line-height: 16px;
        -webkit-box-ordinal-group: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    `;

    const declutterTabIcon = document.createElement("img");
    declutterTabIcon.src = chrome.runtime.getURL("assets/declutter-icon.png");
    declutterTabIcon.style = `
        width: 30px;
        height: 30px;
        margin-left: 15px;
    `;

    const declutterTabText = document.createElement("span");
    declutterTabText.textContent = "Declutter";
    declutterTabText.style = `
        margin-left: 10px;
        margin-right: 100px;
    `;

    declutterContainer.appendChild(declutterTabIcon);
    declutterContainer.appendChild(declutterTabText);

    declutterTab.appendChild(declutterContainer);

    // On click, open the Declutter tab
    declutterTab.addEventListener("click", () => openDeclutterTab(declutterContainer));

    // On click of other tabs, close the Declutter tab
    tabs = document.querySelectorAll(".aKk tbody td");
    tabs.forEach((tab) => {
        if (tab !== declutterTab) {
            tab.addEventListener("click", closeDeclutterTab);
        }
    });

    return declutterTab;
};

function createDeclutterBody() {
    const declutterBody = document.createElement("table");
    declutterBody.id = "declutter-body";
    declutterBody.style = `
        display: none;
    `;

    const sampleImg = chrome.runtime.getURL("assets/logo.png");
    declutterBody.appendChild(createDeclutterBodyLine(chrome.runtime.getURL(sampleImg)));
    declutterBody.appendChild(createDeclutterBodyLine(chrome.runtime.getURL(sampleImg)));

    return declutterBody;
};

function createDeclutterBodyLine(imgSrc) {
    const line = document.createElement("tr");
    line.style = `
        color: rgb(32, 33, 36);
        border: 3px solid red;
        font-family: "Google Sans", Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
        font-size: .875rem;
        padding: 10px;
    `;

    // Image
    const image = document.createElement("td");
    image.innerHTML = `<img src="${imgSrc}" style="height: 30px; padding: 6px;">`;

    // Sender details
    const senderDetails = document.createElement("td");
    senderDetails.style = `
        display: inline-flex; 
        flex-direction: column;
        margin: 20px;
    `;
    const senderName = document.createElement("span");
    senderName.textContent = "Sender Name";
    const senderEmail = document.createElement("span");
    senderEmail.textContent = "email.address@no-reply.com";
    senderEmail.style = `
        color: #5F6368;
        font-size: 0.75rem;
        margin-top: 3px
    `;
    senderDetails.appendChild(senderName);
    senderDetails.appendChild(senderEmail);

    // Email count
    const emailCount = document.createElement("td");
    emailCount.innerHTML = `<span style='font-weight: bold;'>504</span>`;

    line.appendChild(image);
    line.appendChild(senderDetails);
    line.appendChild(emailCount);
    return line;

};

function openDeclutterTab() {
    // Select the Declutter tab
    declutterTabOpen = true;
    const declutterContainer = document.querySelector("#declutter-tab div");
    declutterContainer.setAttribute("aria-selected", declutterTabOpen);
    declutterContainer.style.color = "#0b57d0";

    // Unselect all other tabs
    tabsParent = declutterContainer.parentElement.parentElement;
    tabs = tabsParent.querySelectorAll("td");
    tabs.forEach((tab) => {
        if (tab !== declutterContainer.parentElement) {
            tabContainer = tab.querySelector("div");
            tabContainer.setAttribute("aria-selected", false);
        }
    });

    // Hide original tab content
    const originalTabContent = document.querySelector(".UI");
    originalTabContent.style.display = "none";

    // Show Declutter tab content
    const declutterBody = document.querySelector("#declutter-body");
    declutterBody.style.display = "block";
}

function closeDeclutterTab() {
    declutterTabOpen = false;
    const declutterContainer = document.querySelector("#declutter-tab div");
    declutterContainer.setAttribute("aria-selected", declutterTabOpen);
    declutterContainer.style.color = "#444746";

    // Remove Declutter tab content
    const declutterBody = document.querySelector("#declutter-body");
    declutterBody.style.display = "none";

    // Show original tab content
    const originalTabContent = document.querySelector(".UI");
    originalTabContent.style.display = "block";
}

const observer = new MutationObserver((mutations, observer) => {
    if (document.querySelector("[aria-label='Updates']")) {
        observer.disconnect(); // Stop observing once the element is found

        // Find the Updates tab and insert the Declutter tab after it
        const updatesTab = Array.from(document.querySelectorAll("*")).find(el => el.textContent.trim() === "Updates");
        const declutterTab = createDeclutterTab();
        updatesTab.insertAdjacentElement("afterend", declutterTab);

        // Add the Declutter tab body
        const originalTabContent = document.querySelector(".UI");
        const declutterBody = createDeclutterBody();
        originalTabContent.parentElement.appendChild(declutterBody);


    }
});

observer.observe(document.body, { childList: true, subtree: true });