### **Epic 1: Sender Management**

As a user, I want to easily manage and view all email senders in my inbox so that I can identify senders I want to take action on (unsubscribe, delete, block).

- **User Story 1.1:**  
  **As a user**, I want to see a list of all senders in my inbox, sorted by the number of emails from each sender, so that I can easily identify the most frequent senders.

  - **Acceptance Criteria:**
    - The extension fetches the senders and counts the number of emails.
    - Display the sender's name and the email count in the list.

- **User Story 1.2:**  
  **As a user**, I want to click on a sender to view all the emails from that sender in the Gmail interface, so that I can take action on those emails.

  - **Acceptance Criteria:**
    - Clicking on a sender opens a Gmail view of all emails from that sender.

- **User Story 1.3:**  
  **As a user**, I want to see a “No senders” modal if I click Unsubscribe or Delete with no senders selected, so that I’m reminded to pick at least one sender before proceeding.

  - **Acceptance Criteria:**
    - Clicking “Unsubscribe” with zero senders selected displays a modal reading “No senders selected.”
    - Clicking “Delete” with zero senders selected displays the same modal.

---

### **Epic 2: Delete Functionality**

As a user, I want to be able to delete emails from multiple senders at once and confirm the action before proceeding, so that I avoid accidental deletions.

- **User Story 2.1:**  
  **As a user**, I want a popup to show when I click delete with selected senders, displaying the number of senders and emails to be deleted, so that I can confirm the action before it happens.

  - **Acceptance Criteria:**
    - Popup displays the number of senders and emails.
    - Popup includes two buttons: "Show all emails" and "Confirm."

- **User Story 2.2:**  
  **As a user**, I want to click "Show all emails" in the delete confirmation popup to view a Gmail interface showing all the emails from the selected senders combined, so that I can review them before deleting.

  - **Acceptance Criteria:**
    - Clicking "Show all emails" opens the Gmail interface with all emails from the selected senders.
    - Have the modal persist after emails are shown.

- **User Story 2.3:**  
  **As a user**, I want to click "Confirm" in the delete confirmation popup to delete all emails from the selected senders, so that I can quickly declutter my inbox.

  - **Acceptance Criteria:**
    - Clicking "Confirm" deletes all the emails from the selected senders.
    - After deleting the emails, a confirmation message is displayed notifying the user that the emails were successfully deleted.

---

### **Epic 3: Unsubscribe Functionality**

As a user, I want to unsubscribe from emails in a single click, so that I can reduce unwanted messages without manually searching for unsubscribe links.

- **User Story 3.1: Popup**  
  **As a user**, I want a confirmation popup to show when I click unsubscribe with selected senders, displaying the number of senders and emails, so that I can confirm the action before it happens.

  - **Acceptance Criteria:**
    - Popup shows the number of senders & emails.
    - Popup includes two buttons: "Show all senders" and "Confirm."

- **User Story 3.2: Show All Emails**  
  **As a user**, I want to click "Show all senders" in the unsubscribe confirmation popup to view a Gmail interface showing all emails from the selected senders combined, so that I can review them before unsubscribing.

  - **Acceptance Criteria:**
    - Clicking "Show all senders" opens the Gmail interface with all emails from the selected senders.
    - Have the modal persist after emails are shown.

- **User Story 3.3: Automatic Unsubscribe Attempt**  
  **As a user**, when I confirm “Unsubscribe,” I want the extension to first try to unsubscribe me automatically from all selected senders, so that I don’t have to click through links for services that support a direct “POST” or “mailto” method.

  - **Acceptance Criteria:**
    - After clicking Confirm, a “working” modal appears saying “Unsubscribing…”
    - The extension calls `unsubscribeSendersAuto` with all selected addresses
    - For addresses with post or mailto links, manual popups do not show up

- **User Story 3.4: Manual Unsubscribe Link Wizard**

  **As a user**, for each sender that couldn’t be auto‑unsubscribed but did have a link, I want to be shown each unsubscribe link one at a time so that I can complete any extra steps before moving on.

  - **Acceptance Criteria:**
    - After the “working” phase, for the first link‑only sender, a modal appears with the option to go to the website.
    - Clicking Go to Website opens the unsubscribe URL in a new tab.
    - Clicking Continue closes the modal and advances to the next link‑only sender’s modal (if any).
    - Once all senders have been handled, the success modal is shown.

- **User Story 3.5: Block Prompt**

  **As a user**, for any sender that has no unsubscribe option, I want the extension to prompt me whether to block them, so that I can still stop receiving emails.

  - **Acceptance Criteria:**
    - If there are any senders with no unsubscribe links whatsoever, a modal appears per sender with options to "Block" or "No Block"
    - Clicking Block invokes blockSender then proceeds to the next.
    - Don’t Block simply proceeds.

- **User Story 3.6: Combination Unsubscribe Wizard**

  **As a user**, when I unsubscribe from a batch of senders that includes some that can be auto‑unsubscribed, some that require manual link clicks, and some with no unsubscribe option, I want the extension to process each category correctly, so that I can handle a mixed set of senders in one smooth flow.

  - **Acceptance Criteria:**
    - Senders that support automatic unsubscribe are processed immediately with no modals.
    - For each link‑only sender, a modal appears and is able to open links.
    - After all link‑only senders, for each no‑unsubscribe sender, a modal appears and is able to block senders.
    - After all processing, a success modal appears

- **User Story 3.7: Optional Delete‑Emails Step**  
  **As a user**, I want a toggle button to delete all the emails from the senders I unsubscribe from, so that I can clean my inbox as I unsubscribe.
  - **Acceptance Criteria:**
    - The toggle is on by default.
    - The toggle can be turned off by the user.
    - When the toggle is on, all emails from unsubscribed senders are deleted.
    - When toggle is off, emails are left in the inbox as is.
