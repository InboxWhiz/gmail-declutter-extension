import { Sender } from "../types/types";

export function searchEmailSenders(emails: string[]): void {
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

export function trashSenders(emails: string[]): void {
  console.log("Trashing senders: ", emails);
  // TODO: Implement delete emails functionality
}

export async function getAllSenders(): Promise<Sender[]> {
  // TODO: Implement real functionality to get all senders

  const generateMockSenders = (n: number): Sender[] => {
    return Array.from({ length: n }, (_, i) => ({
      name: `Sender ${i + 1}`,
      email: `email${i + 1}@email.com`,
      count: Math.floor(Math.random() * 100) + 1,
    }));
  };

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(generateMockSenders(8));
    }, 1000);
  });
}
