export class ArchiveAutomation {
private readonly SELECTORS = {
    searchBox: 'input[name="q"]',
    searchButton: 'button[aria-label="Search Mail"]',
    selectAllCheckbox: 'div[data-tooltip="Select"]',
    archiveButton: 'div[data-tooltip="Archive"]',
    emailRow: 'tr.zA',
    loadingIndicator: 'div[role="progressbar"]'
};

async archiveEmailsFromSender(senderEmail: string): Promise {
    try {
      // Navigate to All Mail view to ensure we see all emails
    await this.navigateToAllMail();
    
      // Search for emails from sender
    await this.searchBySender(senderEmail);
    
      // Wait for results to load
    await this.waitForSearchResults();
    
      // Count emails found
    const emailCount = this.countEmailsInView();
    
    if (emailCount === 0) {
        return {
        success: true,
        archivedCount: 0,
        error: 'No emails found from this sender'
        };
    }

      // Select all emails
    await this.selectAllEmails();
    
      // Click archive button
    await this.clickArchiveButton();
    
      // Wait for archive to complete
    await this.waitForArchiveComplete();
    
    return {
        success: true,
        archivedCount: emailCount
    };
    } catch (error) {
    console.error('Archive automation error:', error);
    return {
        success: false,
        archivedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
    };
    }
}

private async navigateToAllMail(): Promise {
    const allMailLink = document.querySelector('a[href="#all"]');
    if (allMailLink instanceof HTMLElement) {
    allMailLink.click();
    await this.wait(1000);
    }
}

private async searchBySender(senderEmail: string): Promise {
    const searchBox = document.querySelector(this.SELECTORS.searchBox) as HTMLInputElement;
    if (!searchBox) {
    throw new Error('Search box not found');
    }

    // Clear existing search
    searchBox.value = '';
    searchBox.focus();
    
    // Type search query
    const searchQuery = `from:${senderEmail}`;
    searchBox.value = searchQuery;
    
    // Trigger search
    const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    bubbles: true
    });
    searchBox.dispatchEvent(event);
    
    await this.wait(1500);
}

private async waitForSearchResults(): Promise {
    // Wait for loading indicator to disappear
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
    const loading = document.querySelector(this.SELECTORS.loadingIndicator);
    if (!loading) {
        // Wait a bit more for results to stabilize
        await this.wait(500);
        return;
    }
    await this.wait(500);
    attempts++;
    }
}

private countEmailsInView(): number {
    const emailRows = document.querySelectorAll(this.SELECTORS.emailRow);
    return emailRows.length;
}

private async selectAllEmails(): Promise {
    // Click the select all checkbox
    const selectAllBtn = document.querySelector(this.SELECTORS.selectAllCheckbox) as HTMLElement;
    if (!selectAllBtn) {
    throw new Error('Select all button not found');
    }
    
    selectAllBtn.click();
    await this.wait(300);
    
    // Check if "Select all conversations" banner appears
    const selectAllConversationsLink = Array.from(document.querySelectorAll('span'))
    .find(el => el.textContent?.includes('Select all'));
    
    if (selectAllConversationsLink instanceof HTMLElement) {
    selectAllConversationsLink.click();
    await this.wait(500);
    }
}

private async clickArchiveButton(): Promise {
    const archiveBtn = document.querySelector(this.SELECTORS.archiveButton) as HTMLElement;
    if (!archiveBtn) {
    throw new Error('Archive button not found');
    }
    
    archiveBtn.click();
    await this.wait(500);
}

private async waitForArchiveComplete(): Promise {
    // Wait for the "archived" confirmation banner
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
    const banner = Array.from(document.querySelectorAll('span'))
        .find(el => el.textContent?.toLowerCase().includes('archived'));
    
    if (banner) {
        await this.wait(500);
        return;
    }
    
        await this.wait(500);
        attempts++;
    }
}

private wait(ms: number): Promise {
    return new Promise(resolve => setTimeout(resolve, ms));
    }
}
