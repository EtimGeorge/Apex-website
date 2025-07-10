# Project Apex - Modern Investment Platform Front-End

Project Apex is the complete front-end implementation for a modern, user-friendly digital investment platform. It features a secure user authentication system, a multi-page user dashboard, dynamic data display from a cloud database, and a clean, responsive UI with light and dark modes.

This project was built from the ground up using foundational web technologies and integrates with Google's Firebase suite for all backend services, providing a robust and scalable architecture.

## Live Demo

_(You can add a link to your live, deployed website here later)_

## Features Implemented

- **Secure User Authentication:** Full user registration, login, and logout workflow.
- **Route Protection:** Protected dashboard pages that are only accessible to logged-in users.
- **Dynamic User Dashboard:** Displays live user data including name, avatar, account balances, and transaction history.
- **Multi-Page Interface:** A complete suite of user-facing pages including:
  - Dashboard
  - Investment Plans
  - Fund Account
  - Withdraw Funds
  - Deposit & Withdrawal Logs
  - My Active Plans
  - Account Management (Profile & Security)
  - KYC Verification
- **Core Financial Logic:**
  - Functional investment workflow that updates user balances and creates investment records.
  - Functional deposit and withdrawal request system.
- **Polished UI/UX:**
  - Modern, clean, and fully responsive design.
  - Collapsible sidebar with hover-to-expand functionality.
  - Persistent Light/Dark theme switcher.
  - Interactive TradingView widgets for market data.

## Technology Stack

- **Front-End:** HTML5, CSS3 (with CSS Variables), Vanilla JavaScript (ES6+ Modules)
- **Backend Services:** Google Firebase
  - **Authentication:** Firebase Authentication for email/password sign-in.
  - **Database:** Firestore for real-time data storage (user info, transactions, investments).
  - **File Storage:** Firebase Storage for KYC document uploads.
- **Development Environment:**
  - [VS Code](https://code.visualstudio.com/)
  - [Live Server Extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for local development.
  - [Google Cloud CLI (`gcloud`)](https://cloud.google.com/sdk/docs/install) for CORS configuration.

## Getting Started

To set up and run this project locally, you will need to create your own Firebase project to act as the backend.

### Prerequisites

- Node.js and npm (for development tools)
- A Google Account for Firebase

### Setup Instructions

A comprehensive, step-by-step setup guide is available in the `GUIDE.md` file. The guide covers:

1.  Creating and configuring a new Firebase project from scratch.
2.  Setting up Authentication, Firestore, and Storage services.
3.  Configuring all necessary security rules.
4.  Connecting the front-end code to your new Firebase backend.
5.  Configuring CORS for local development.
6.  Running the project locally.

---

_This document provides a high-level overview. For detailed technical instructions on setup and deployment, please refer to GUIDE.md._
