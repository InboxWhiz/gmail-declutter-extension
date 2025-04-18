# User Stories & Epics

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

- **User Story 2.4:**  
  **As a user**, I want a confirmation message after deleting the emails to ensure the deletion was successful.

  - **Acceptance Criteria:**
    - After deleting the emails, a confirmation message is displayed notifying the user that the emails were successfully deleted.
    - The confirmation message includes the number of emails deleted and a button to close the message.

---

### **Epic 3: Unsubscribe Functionality**

As a user, I want to unsubscribe from emails in a single click, so that I can reduce unwanted messages without manually searching for unsubscribe links.

- **User Story 3.1:**  
  **As a user**, I want a confirmation popup to show when I click unsubscribe with selected senders, displaying the number of senders and emails, so that I can confirm the action before it happens.

  - **Acceptance Criteria:**
    - Popup shows the number of senders & emails.
    - Popup includes two buttons: "Show all senders" and "Confirm."

- **User Story 3.2:**  
  **As a user**, I want to click "Show all senders" in the unsubscribe confirmation popup to view a Gmail interface showing all emails from the selected senders combined, so that I can review them before unsubscribing.

  - **Acceptance Criteria:**
    - Clicking "Show all senders" opens the Gmail interface with all emails from the selected senders.
    - Have the modal persist after emails are shown.

- **User Story 3.3a:**  
  **As a user**, when I click "Confirm", I want the extension to automatically search for an unsubscribe link in the selected sender’s emails, so that I can unsubscribe in one click.

  - **Acceptance Criteria:**
    - The extension scans emails for unsubscribe links.
    - If a link is found, it opens the link for the user to complete the unsubscribe.

- **User Story 3.3b:**  
  **As a user**, when I unsubscribe from multiple senders at once, I want the extension to guide me through each unsubscribe link one by one - opening each link, letting me complete the unsubscribe in its own tab, and then returning me to a prompt before moving on - so that I can be sure I’ve finished each unsubscribe before proceeding to the next.

  - **Acceptance Criteria:**
    - First link opens automatically.
    - "Link found" modal appears
    - Sequential processing
    - Ability to reopen link
    - Final success modal

- **User Story 3.4:**
  **As a user**, I want the extension to notify me if it couldn't find an unsubscribe link and ask if I want to block the sender, so that I can still stop receiving emails from them.

  - **Acceptance Criteria:**
    - If no unsubscribe link is found, the extension prompts the user to block the sender.
    - When the user accepts to block, send a call to the "block" function.

- **User Story 3.5:**  
  **As a user**, I want a toggle button to delete all the emails from the senders I unsubscribe from, so that I can clean my inbox as I unsubscribe.
  - **Acceptance Criteria:**
    - The toggle is on by default.
    - The toggle can be turned off by the user.
    - When the toggle is on, all emails from unsubscribed senders are deleted.
    - When toggle is off, emails are left in the inbox as is.
