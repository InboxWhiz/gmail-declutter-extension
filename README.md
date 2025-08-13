# InboxWhiz - Chrome Extension

A live Chrome extension that helps declutter Gmail inboxes through intelligent sender analysis and bulk email management.

**🔗 [Available on Chrome Web Store](https://chromewebstore.google.com/detail/inboxwhiz-bulk-unsubscrib/bjcegpgebdbhkkhngbahpfjfolcmkpma)**

**🌐 [Visit InboxWhiz Website](https://www.inboxwhiz.net/)**

## 🎯 Project Overview

InboxWhiz addresses the common problem of email overload by providing users with actionable insights about their email patterns and efficient tools to manage unwanted messages. The extension integrates seamlessly with Gmail's interface and processes thousands of emails locally for optimal performance.

## ⚡ Key Features

- **Smart Sender Analytics**: Analyzes email patterns to identify top senders by frequency and volume
- **Bulk Email Management**: Select multiple senders and perform actions on all their emails simultaneously
- **Automated Unsubscribe**: Intelligent detection and execution of unsubscribe processes
- **Gmail API Integration**: Secure read/write access to Gmail data with OAuth authentication
- **Chrome Side Panel UI**: Modern, responsive interface built with React and TypeScript
- **Interactive Tutorial System**: Guided onboarding with contextual help

## 🛠️ Technical Architecture

### Frontend Stack

- **React 19** with **TypeScript** for type-safe component development
- **Vite** for fast development builds and hot module replacement
- **Chrome Extensions Manifest V3** for modern extension capabilities

### APIs & Integration

- **Gmail API** for email data access and manipulation
- **Google OAuth 2.0** for secure user authentication
- **Chrome Extensions API** for side panel, content scripts, and background processes
- **Chrome Storage API** for efficient local data caching

### Testing & Quality Assurance

- **Comprehensive Test Suite**: Unit tests with Jest covering Gmail API utilities and core business logic
- **End-to-End Testing**: Playwright tests for critical user workflows including sender management, deletion, and unsubscribe flows
- **Automated CI/CD Pipeline**: GitHub Actions workflows for automated testing, linting, and release management
- **Code Quality Tools**: ESLint, Prettier, and Stylelint for consistent code standards

## 🔒 Security & Privacy

- **OAuth 2.0 authentication** with minimal required Gmail scopes
- **Zero external data storage** - all processing happens client-side for privacy
