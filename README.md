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

## 🐛 Known Issues & Fixes

### OAuth2 Authentication Error

**Issue**: Users may encounter this error when trying to authenticate:
```
Access blocked: InboxWhiz's request is invalid
Error 400: invalid_request
Custom URI scheme is not supported on Chrome apps.
```

**Root Cause**: The OAuth2 client in Google Cloud Console is configured as a "Web application" instead of a "Chrome extension".

**Fix Required**: The OAuth2 client configuration needs to be updated in Google Cloud Console:
1. Navigate to APIs & Services > Credentials
2. Edit the OAuth2 client ID: `396720193118-fggljh2amq0jlgq4v861vqn6rb88q9dt`
3. Change Application type to "Chrome extension"
4. Set Application ID to: `bjcegpgebdbhkkhngbahpfjfolcmkpma`

See `OAUTH_FIX.md` for detailed instructions.

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
- **Secure content script injection** with proper CSP compliance
- **Permission-based access** following Chrome extension security best practices
