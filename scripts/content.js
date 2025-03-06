var declutterTabOpen = false;

function createDeclutterIcon() {
    const declutterIcon = document.createElement("div");
    declutterIcon.setAttribute("data-tooltip", "Declutter");
    declutterIcon.innerHTML = `
    <a class="FH" role="button" tabindex="0" aria-label="Declutter" aria-expanded="false"
        aria-haspopup="true">
        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="#000000" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path
                    d="M17 16L22 21M22 16L17 21M13 19H6.2C5.0799 19 4.51984 19 4.09202 18.782C3.71569 18.5903 3.40973 18.2843 3.21799 17.908C3 17.4802 3 16.9201 3 15.8V8.2C3 7.0799 3 6.51984 3.21799 6.09202C3.40973 5.71569 3.71569 5.40973 4.09202 5.21799C4.51984 5 5.0799 5 6.2 5H17.8C18.9201 5 19.4802 5 19.908 5.21799C20.2843 5.40973 20.5903 5.71569 20.782 6.09202C21 6.51984 21 7.0799 21 8.2V12M20.6067 8.26229L15.5499 11.6335C14.2669 12.4888 13.6254 12.9165 12.932 13.0827C12.3192 13.2295 11.6804 13.2295 11.0677 13.0827C10.3743 12.9165 9.73279 12.4888 8.44975 11.6335L3.14746 8.09863"
                    stroke="#000000" stroke-width="1.6799999999999997" stroke-linecap="round" stroke-linejoin="round">
                </path>
            </g>
        </svg>
    </a>
    `;

    // On click, open the Declutter tab
    declutterIcon.addEventListener("click", () => {
        declutterTabOpen ? closeDeclutterTab() : openDeclutterTab();
    });

    // // On click of other tabs, close the Declutter tab
    // tabs = document.querySelectorAll(".aKk tbody td");
    // tabs.forEach((tab) => {
    //     if (tab !== declutterTab) {
    //         tab.addEventListener("click", closeDeclutterTab);
    //     }
    // });

    return declutterIcon;
};

function createDeclutterBody() {
    const declutterBody = document.createElement("div");
    declutterBody.id = "declutter-body";
    declutterBody.style = `
        display: none;
        background-color: white;
        border-radius: 16px;
        margin-left: 16px;
    `;

    // Title
    const declutterBodyTitle = document.createElement("p");
    declutterBodyTitle.textContent = "Declutter";
    declutterBodyTitle.style = "font-size: 1rem; padding-left: 20px;";

    // Close button
    const declutterBodyClose = document.createElement("button");
    declutterBodyClose.class = "OB";
    declutterBodyClose.setAttribute("aria-label", "Close");
    declutterBodyClose.onclick = closeDeclutterTab;

    // Header with title and close button
    const declutterBodyHeader = document.createElement("div");
    declutterBodyHeader.style = `
        display: flex;
        justify-content: space-between;
    `;
    declutterBodyHeader.appendChild(declutterBodyTitle);
    declutterBodyHeader.appendChild(declutterBodyClose);
    declutterBody.appendChild(declutterBodyHeader);

    // Table
    const declutterBodyTable = createDeclutterBodyTable();
    declutterBody.appendChild(declutterBodyTable);

    return declutterBody;
};

function createDeclutterBodyTable() {
    const declutterBodyTable = document.createElement("table");
    declutterBodyTable.appendChild(createDeclutterBodyLine("https://www.gstatic.com/images/icons/material/system/1x/email_24dp.png"));
    declutterBodyTable.appendChild(createDeclutterBodyLine("https://www.gstatic.com/images/icons/material/system/1x/email_24dp.png"));

    return declutterBodyTable;
}

function createDeclutterBodyLine(imgSrc, emailCountNum) {
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
    emailCount.innerHTML = `<span style='font-weight: bold;'>${emailCountNum}</span>`;

    line.appendChild(image);
    line.appendChild(senderDetails);
    line.appendChild(emailCount);
    return line;

};

function openDeclutterTab() {
    declutterTabOpen = true;

    // // Hide original tab content
    // const originalTabContent = document.querySelector(".UI");
    // originalTabContent.style.display = "none";

    // Show Declutter tab content
    const declutterBody = document.querySelector("#declutter-body");
    declutterBody.style.display = "block";
}

function closeDeclutterTab() {
    declutterTabOpen = false;
    const declutterBody = document.querySelector("#declutter-body");
    declutterBody.style.display = "none";
}

const observer = new MutationObserver((mutations, observer) => {
    if (document.querySelector("[data-tooltip='Support']")) {
        observer.disconnect(); // Stop observing once the element is found

        // Find the Support icon and insert the Declutter icon after it
        const supportIcon = Array.from(document.querySelectorAll("*")).find(el => el.getAttribute("data-tooltip") === "Support");
        const declutterIcon = createDeclutterIcon();
        supportIcon.insertAdjacentElement("beforebegin", declutterIcon);

        // Add the Declutter tab body
        const tabParent = document.querySelector(".aUx");
        const declutterBody = createDeclutterBody();
        tabParent.prepend(declutterBody);


    }
});

observer.observe(document.body, { childList: true, subtree: true });