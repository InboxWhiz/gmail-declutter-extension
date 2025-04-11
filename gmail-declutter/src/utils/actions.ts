export function searchEmailSenders(emails: string[]) {
    console.log("Searching for emails: ", emails);
    // // Concatenate emails
    // const email = emails.join(" OR ");
  
    // // Get the search input element
    // const searchInput: HTMLInputElement = document.querySelector("input[name='q']")!;
  
    // // Set the search input value to the email address
    // searchInput.value = `from:(${email})`;
  
    // // Submit the search form
    // (document.querySelector("button[aria-label='Search mail']") as HTMLButtonElement)!.click();
  }

export function trashSenders(emails: string[]) {
    console.log("Trashing senders: ", emails);
    // TODO: Implement delete emails functionality
}
  