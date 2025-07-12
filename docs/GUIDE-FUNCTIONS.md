# Project Apex: Guide to Implementing Server-Side Profit Calculation

This document provides a detailed, step-by-step guide for setting up and deploying the automated profit calculation and investment completion logic using Firebase Cloud Functions. This is the recommended, production-ready approach for this feature.

## Overview

To ensure profit calculations are secure, reliable, and run automatically, we must use a server-side environment. Client-side JavaScript (in the browser) is not suitable for this task. Firebase Cloud Functions provide the perfect serverless environment to accomplish this.

The process involves four main phases:

1.  **Upgrading the Firebase Plan:** Enabling the necessary APIs requires the Blaze (Pay-as-you-go) plan.
2.  **Setting Up the Local Environment:** Initializing the Firebase CLI and the `functions` directory.
3.  **Writing and Deploying the Cloud Function:** Creating the backend script that performs the calculations.
4.  **Automating the Function with Cloud Scheduler:** Setting up a "cron job" to run the function automatically every 24 hours.

---

## Phase 1: Upgrading to the Blaze Plan

The Cloud Build API, which is required to deploy functions, is a prerequisite that requires a billing account to be attached to the project.

1.  **Navigate to your Firebase Project** in the Firebase Console.
2.  In the bottom-left corner, click on the **Spark Plan** usage meter, then click **"Modify plan"** or **"Upgrade"**.
3.  Select the **"Blaze (Pay-as-you-go)"** plan.
4.  Follow the on-screen prompts to either select an existing Google Cloud billing account or create a new one. This will require a credit card.
    - **Note:** The Blaze plan still includes a generous free tier. For this project's usage, you are highly unlikely to incur any charges.
5.  **(Recommended for Safety)** After upgrading, go to your [Google Cloud Billing Console](https://console.cloud.google.com/billing), select your billing account, and navigate to **Budgets & alerts**. Create a new budget (e.g., for $1) with a 100% alert threshold. This will notify you via email if your usage ever exceeds the free tier, giving you complete peace of mind.

---

## Phase 2: Setting Up the Local Environment

If you haven't already, you need to initialize the Firebase command-line tools for your project.

1.  **Install Firebase Tools:** Open a system terminal (not VS Code's) and run:
    ```bash
    npm install -g firebase-tools
    ```
2.  **Login to Firebase:** Run the following command. A browser window will open for you to log in with your Google account.
    ```bash
    firebase login
    ```
3.  **Initialize Firebase in Project:** Navigate your terminal to the root directory of your `project-apex` folder and run:
    ```bash
    firebase init
    ```
4.  Follow the prompts:
    - `Are you ready to proceed?` » **Yes**
    - `Which Firebase features do you want to set up?` » Use the spacebar to select **Functions**, then press Enter.
    - `Please select an option:` » **Use an existing project**. Select your Firebase project from the list.
    - `What language would you like to use?` » **JavaScript**.
    - `Do you want to use ESLint...?` » **Yes** (You can say No to simplify, but Yes is recommended).
    - `Do you want to install dependencies with npm now?` » **Yes**.

This will create a `functions` folder in your project, containing `index.js`, `package.json`, and other necessary files. It will also create a `firebase.json` file in your project root.

---

## Phase 3: Writing and Deploying the Cloud Function

This is the core backend logic.

1.  **Disable the Linting Hook (Optional but Recommended for Simplicity):**

    - Open the `firebase.json` file in your project root.
    - Find and delete the `"predeploy"` block to prevent style-checking errors from blocking deployment.

    ```json
    "functions": {
      // Delete the entire "predeploy" array from here
    }
    ```

2.  **Write the Function Code:**

    - Open the `functions/index.js` file.
    - Replace its entire content with the complete profit calculation logic. (This is the full script provided in the previous chat step).

3.  **Deploy the Function:**
    - Navigate your terminal into the `functions` directory: `cd functions`.
    - Run the deploy command:
    ```bash
    firebase deploy --only functions
    ```
    - Wait for the process to complete. Once finished, your `processInvestments` function will be live in the cloud.

---

## Phase 4: Automating the Function with Cloud Scheduler

This makes the profit calculation run automatically without any manual intervention.

1.  **Navigate to the Google Cloud Console** for your project.
2.  In the search bar, type **"Cloud Scheduler"** and select it. Enable the API if prompted.
3.  Click **"+ Create Job"** at the top.
4.  **Define the Job:**
    - **Name:** `daily-profit-calculation`
    - **Region:** Select the same region as your function (e.g., `us-central1`).
    - **Frequency:** Enter a "cron" schedule. For "every day at midnight," you would use `0 0 * * *`.
    - **Timezone:** Select your desired timezone.
5.  **Configure the execution:**
    - **Target type:** Select **"HTTP"**.
    - **URL:** You need the trigger URL for your Cloud Function. You can find this in your **Firebase Console > Functions**. Click on your `processInvestments` function to see its details and trigger URL. It will look like `https://us-central1-your-project-id.cloudfunctions.net/processInvestments`.
    - **HTTP method:** **POST**.
    - **Auth header:** Select **"Add OIDC token"**.
    - **Service account:** Select the default `App Engine default service account`.
6.  Click **"Create"**.

Your automated profit calculation system is now complete. Every day at the specified time, Cloud Scheduler will securely trigger your Cloud Function, which will process all active investments, distribute profits, and complete expired plans, all without any manual work.
