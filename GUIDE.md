# Project Apex: Complete Setup & Implementation Guide

This document provides a detailed, step-by-step guide to set up the Project Apex front-end and connect it to a new Firebase backend. Following these steps in order is crucial for a successful setup.

## Section 1: Firebase Project Creation & Configuration

This section covers the creation of the backend on Google's Firebase platform.

### Step 1.1: Create the Firebase Project

1.  Navigate to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"**.
3.  Enter a new project name (e.g., `apex-invest-live`) and click **Continue**.
4.  **Disable** Google Analytics for this project and click **"Create project"**.

### Step 1.2: Enable Firebase Services (Correct Order)

This order is important to ensure all services are created in a compatible, free-tier region.

1.  **Enable Storage First:**

    - In your new project, go to **Build > Storage**.
    - Click **"Get started"**.
    - In the security rules dialog, select **"Start in production mode"** and click **"Next"**.
    - In the "Cloud Storage location" dropdown, select a main US region. The recommended choice is **`nam5 (us-central)`**. This is the most critical step.
    - Click **"Done"**. The Storage bucket will be created successfully.

2.  **Enable Firestore Database:**

    - Go to **Build > Firestore Database**.
    - Click **"Create database"**.
    - The location will be automatically set to the one you chose for Storage. This is correct.
    - Select **"Start in production mode"** and click **"Enable"**.

3.  **Enable Authentication:**
    - Go to **Build > Authentication**.
    - Click **"Get started"**.
    - From the list of providers, select **"Email/Password"**.
    - Enable the provider and click **"Save"**.

### Step 1.3: Connect the Web App to Firebase

1.  Go to your **Project Overview** (click the 🏠 icon).
2.  Click the **web icon (`</>`)** to add a new web app.
3.  Give it a nickname (e.g., "Apex Web App") and click **"Register app"**.
4.  Firebase will display a `firebaseConfig` object. **Copy this entire object.** We will need it in the next section.

### Step 1.4: Set Up All Security Rules

This is a one-time setup for all database and storage rules.

1.  **Firestore Rules:**

    - Go to **Build > Firestore Database > Rules**.
    - Replace the entire content with the following:

    ```
    rules_version = '2';
    ```

service cloud.firestore {
match /databases/{database}/documents {

    // Helper function to check if the requester is an admin
    // This is fast, secure, and non-recursive.
    function isAdmin() {
      return exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // =====================================================================
    //  USERS COLLECTION
    // =====================================================================
    match /users/{userId} {
      // A user can create, read, and update THEIR OWN document.
      allow create, read, update: if request.auth.uid == userId;

      // An ADMIN can READ any user's document or LIST all users.
      // This rule enables the "Manage Users" and "KYC Requests" pages for admins.
      allow list, get: if isAdmin();
    }

    // =====================================================================
    //  INVESTMENTS COLLECTION
    // =====================================================================
    match /investments/{investmentId} {
      // A user can create their own investment records.
      allow create: if request.auth.uid == request.resource.data.userId;

      // A user can read their own investments.
      // An ADMIN can also read any investment record.
      // This enables the "My Plans" page for users and any future admin view.
      allow read: if request.auth.uid == resource.data.userId || isAdmin();
    }

    // =====================================================================
    //  TRANSACTIONS COLLECTION (Deposits & Withdrawals)
    // =====================================================================
    match /transactions/{transactionId} {
      // A user can create their own transaction records.
      allow create: if request.auth.uid == request.resource.data.userId;

      // A user can read their own transactions.
      // An ADMIN can also read any transaction record.
      // This enables the log pages for users and the request pages for admins.
      allow read: if request.auth.uid == resource.data.userId || isAdmin();

      // An ADMIN can UPDATE a transaction (e.g., to change status from "pending" to "approved").
      allow update: if isAdmin();
    }

}
}

````

    - Click **"Publish"**.

2.  **Storage Rules:**
    - Go to **Build > Storage > Rules**.
    - Replace the entire content with the following:
    ```
    rules_version = '2';
    service firebase.storage {
      match /b/{bucket}/o {
        match /kyc-documents/{userId}/{allPaths=**} {
          allow write: if request.auth.uid == userId;
        }
      }
    }
    ```
    - Click **"Publish"**.

## Section 2: Front-End Code Configuration

This section covers linking your local code to the new Firebase project.

### Step 2.1: Update the Firebase Configuration File

1.  In your project code, open the `js/firebase-config.js` file.
2.  **Replace the existing `firebaseConfig` object** with the new one you copied from the Firebase console in Step 1.3.
3.  Ensure your final `firebase-config.js` file looks exactly like this (with your new keys):

    ```javascript
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
    import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
    import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
    import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

    // PASTE YOUR NEW CONFIG OBJECT HERE
    const firebaseConfig = {
      apiKey: '...',
      authDomain: '...',
      projectId: '...',
      storageBucket: '...',
      messagingSenderId: '...',
      appId: '...',
    };

    const app = initializeApp(firebaseConfig);

    export const auth = getAuth(app);
    export const db = getFirestore(app);
    export const storage = getStorage(app);
    ```

### Step 2.2: Configure CORS for Local Development

This is a mandatory step to allow file uploads from your local machine.

1.  **Install Google Cloud CLI:** If you haven't already, [install `gcloud`](https://cloud.google.com/sdk/docs/install).
2.  **Authenticate `gcloud`:** Open a **new system terminal** (not VS Code's) and run `gcloud init`. Follow the prompts to log in with the same Google account as your Firebase project and select your new Firebase project when asked.
3.  **Create `cors.json`:** In the root of your project folder, create a file named `cors.json` with the following content. The port `5501` should match the port used by your VS Code Live Server.
    ```json
    [
      {
        "origin": ["http://127.0.0.1:5501"],
        "method": ["GET", "POST", "PUT", "HEAD"],
        "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
        "maxAgeSeconds": 3600
      }
    ]
    ```
4.  **Apply the CORS settings:**
    - Find your bucket URL in **Firebase Console > Storage**. It will look like `gs://your-new-project-id.appspot.com`.
    - In your system terminal (at the project root), run the following command, replacing `YOUR_BUCKET_URL` with your actual bucket URL:
    ```bash
    gcloud storage buckets update YOUR_BUCKET_URL --cors-file=cors.json
    ```

## Section 3: Running the Application

After completing all the setup steps, you are ready to run the application.

1.  **Open your project** in Visual Studio Code.
2.  Make sure you have the **Live Server** extension installed.
3.  Right-click on the `index.html` file and select **"Open with Live Server"**.
4.  Your application will open in a browser. You can now navigate to `register.html` to create your first user and test all functionalities. All features should work as intended.
````
