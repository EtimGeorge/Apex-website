# Product Requirements Document: "Project Apex" (Investment Platform)

## 1. Introduction & Vision

Project "Apex" aims to create a modern, user-friendly digital investment platform inspired by the functionality of "Paragon Assets Group". The core vision is to provide users with a seamless experience for depositing funds, selecting investment plans, and tracking their portfolio's performance. The platform will be built with a modern, clean UI/UX and will leverage a robust Backend-as-a-Service (BaaS) like Firebase for authentication and database management, ensuring security and scalability.

## 2. Target Audience

- **Investors (Primary Users):** Individuals looking for a simple interface to invest cryptocurrency into pre-defined plans with the goal of generating returns. They value clarity, security, and ease of use.
- **Platform Administrators (Secondary Users):** The internal team responsible for managing the platform, including user accounts, KYC verification, investment plans, and processing withdrawals.

## 3. Goals & Success Metrics

### Goal 1: Flawless User Onboarding.
- **Metric:** High user registration completion rate (>95%).
- **Metric:** Low number of support tickets related to sign-up or login issues.

### Goal 2: Drive Investment Activity.
- **Metric:** High percentage of registered users who make their first deposit within 7 days.
- **Metric:** High conversion rate from deposit to investment plan activation.

### Goal 3: Ensure Operational Efficiency.
- **Metric:** Admins can review and approve/reject KYC submissions in under 5 minutes.
- **Metric:** Admins can process withdrawal requests efficiently through a dedicated dashboard.

## ⚠️ 4. CRITICAL DISCLAIMERS & CONSIDERATIONS ⚠️

- **Business Model Feasibility:** The investment returns displayed in the reference video (e.g., "15% daily for 2 days", "20% daily for 1 day") are exceptionally high and not sustainable in any legitimate financial market. This model is characteristic of High-Yield Investment Programs (HYIPs), which carry an extremely high risk of being fraudulent or Ponzi schemes. This PRD outlines the technical implementation of such a platform, not an endorsement of its financial viability. Legal and financial compliance must be thoroughly investigated.
- **Payment Processing:** The reference video shows a manual deposit system where users send crypto and upload a "proof of payment" screenshot. This is highly insecure, not scalable, and prone to fraud. For a modern and legitimate platform, this PRD specifies the use of an automated cryptocurrency payment gateway (e.g., Coinbase Commerce, BitPay, NowPayments). This is a non-negotiable requirement for a secure V1.

## 5. Core Features (Functional Requirements)

### 5.1. User Authentication & Onboarding (Firebase Auth)
- **User Registration:** Users can sign up using an email and password. The system should also capture their full name, country, and phone number.
- **User Login:** Registered users can log in securely.
- **Password Reset:** Users can request a password reset link to be sent to their registered email.

### 5.2. User Dashboard
- **At-a-Glance Summary:** The main dashboard will display four key metrics in clear, modern cards:
    - Account Balance: Total funds available for investing or withdrawal.
    - Total Deposits: A lifetime sum of all successful deposits.
    - Active Profits: The total profit generated from currently active investment plans.
    - Total Withdrawn: A lifetime sum of all completed withdrawals.
- **Referral Link:** A unique referral link is prominently displayed with a "Copy" button.
- **Market Data Ticker:** A scrolling ticker tape at the top of the page will show real-time prices for major assets (e.g., BTC, ETH, S&P 500) via a TradingView widget API.
- **Interactive Chart:** A clean, large TradingView chart will be embedded at the bottom, defaulting to a major pair like EUR/USD or BTC/USD.

### 5.3. Funding & Wallet Management (The Modern Approach)
- **Deposit Funds:**
    - User navigates to "Fund Account" or "Deposit".
    - User selects a cryptocurrency (e.g., BTC, ETH, USDT-ERC20).
    - User enters the deposit amount in USD.
    - The system, via a payment gateway API, generates a unique, time-limited payment address and QR code for that specific transaction.
    - The system will automatically monitor the blockchain for the incoming transaction. Once confirmed, the user's account balance is updated automatically. No manual proof upload is required.
- **Deposit Log:** A page showing a history of all deposit transactions, including amount, currency, date, and status (Pending, Completed, Failed).

### 5.4. Investment Plans
- **View Plans:** A dedicated page lists all available investment plans in a visually appealing grid or card layout. Each card will clearly state:
    - Plan Name (e.g., Trade Plan)
    - Investment Range (e.g., $500 - $999)
    - Return on Investment (ROI) & Duration (e.g., 15% Daily for 2 Days)
    - "Invest Now" button.
- **Invest in a Plan:**
    - When a user clicks "Invest Now", a modal appears confirming the plan details.
    - The user enters the specific amount they wish to invest from their account balance.
    - Upon confirmation, the amount is deducted from their balance and the investment becomes active.
- **My Plans:** A page showing a table of the user's active and completed investments, with columns for Plan, Amount, Start Date, End Date, and Status.

### 5.5. Withdrawal System
- **Request Withdrawal:**
    - User navigates to "Withdraw Fund".
    - User enters the amount to withdraw (cannot exceed available balance).
    - User selects the cryptocurrency for withdrawal.
    - User provides their personal destination wallet address.
    - The request is submitted and enters a "Pending" state for admin approval.
- **Withdrawal Log:** A history of all withdrawal requests, including amount, address, date, and status (Pending, Approved/Sent, Rejected).

### 5.6. User Profile & KYC (Know Your Customer)
- **Profile Page:** Users can view their registered information (name, email, phone).
- **Edit Profile:** Users can update their name and phone number. Email is non-editable.
- **Security:** Users can change their password.
- **KYC Verification:**
    - A dedicated "Verify Account" page.
    - Users must upload documents in four categories:
        - Selfie Holding ID
        - Front of Government-Issued ID (e.g., Passport, Driver's License)
        - Back of ID
        - Proof of Address (e.g., Utility Bill, Bank Statement)
    - The user's verification status (Unverified, Pending, Verified) should be clearly visible on their profile.

### 5.7. Affiliate System
- **Referral Page:** Displays the user's unique referral link and a list of users who have signed up using their link. The list should show the username and sign-up date of each referral.

### 5.8. Admin Panel (Essential for Operation)
- **Secure Login:** Separate, secure login for administrators.
- **Dashboard:** Overview of platform stats (total users, total deposited, pending withdrawals, pending KYCs).
- **User Management:** View a list of all users, see their balances, and be able to suspend accounts.
- **KYC Management:** A queue of pending KYC submissions. Admins can view uploaded documents and either "Approve" or "Reject" the submission with an optional reason.
- **Withdrawal Management:** A queue of pending withdrawal requests. Admins can approve a request, which signals them to manually process the crypto transfer, and then mark it as "Completed".
- **Investment Plan Management:** Admins can create, edit, or deactivate investment plans (change names, amounts, ROI, duration).

## 6. Non-Functional Requirements

- **UI/UX Design:** Clean, minimalist, and professional. Use a modern color palette (e.g., blues, dark grays, white). The interface must be fully responsive, providing an excellent experience on desktop, tablet, and mobile browsers.
- **Technology Stack:**
    - **Backend:** Firebase (Authentication, Cloud Functions for logic).
    - **Database:** Firebase Firestore (for structured, real-time data).
    - **Frontend:** A modern JavaScript framework like React (with Next.js) or Vue (with Nuxt.js) for performance and SEO benefits.
    - **Payment Gateway:** Integration with a service like Coinbase Commerce or NOWPayments.
    - **Charting/Data:** TradingView Lightweight Charts™ or Advanced Charts library.
- **Security:**
    - All data transmission will use HTTPS.
    - Firebase Security Rules will be strictly configured to prevent unauthorized data access.
    - Sensitive data (like KYC documents) should be stored securely in a private Cloud Storage bucket with restricted access.
    - Implement standard protections against XSS and CSRF.

## 7. Data Models (Firebase Firestore Schema)

### `users` collection:
- `uid` (Firebase Auth ID)
- `email`
- `fullName`
- `country`
- `phone`
- `accountBalance` (Number)
- `totalDeposited` (Number)
- `totalWithdrawn` (Number)
- `kycStatus` ('unverified', 'pending', 'verified', 'rejected')
- `referralCode`
- `referredBy` (User ID of the referrer)
- `createdAt`

### `transactions` collection:
- `transactionId`
- `userId`
- `type` ('deposit' or 'withdrawal')
- `amountUSD` (Number)
- `currency` ('BTC', 'ETH', etc.)
- `status` ('pending', 'completed', 'failed', 'rejected')
- `createdAt`
- `completedAt` (optional)
- `withdrawalAddress` (for withdrawals)

### `investments` collection:
- `investmentId`
- `userId`
- `planId` (links to the plans collection)
- `investedAmount` (Number)
- `status` ('active', 'completed')
- `startDate`
- `endDate`

### `plans` collection (Admin-managed):
- `planId`
- `planName`
- `minAmount`
- `maxAmount`
- `roiPercent` (e.g., 15)
- `roiFrequency` ('daily')
- `durationDays`
- `isActive` (Boolean)
- `isFeatured` (Boolean, optional)
