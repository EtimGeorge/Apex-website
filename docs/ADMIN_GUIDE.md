# Project Apex: Administrator Setup & Management Guide

This document provides the definitive instructions for creating administrators and understanding the security rules that grant them special permissions within the Project Apex application. Following these steps is critical for securing the admin panel.

## Part 1: The Admin Role-Based Access Control System

To ensure that only authorized individuals can access the admin panel, Project Apex uses a robust and secure role-based system within Firestore. Instead of just flagging a user as an admin within their own profile (which can lead to complex and insecure rules), we use a dedicated `admins` collection.

**How it Works:**

- We create a top-level collection in Firestore named `admins`.
- Each document in this collection has an ID that is the **User ID (UID)** of a user who should have admin privileges.
- Our Firestore Security Rules are configured to check if a user's UID exists as a document within this `admins` collection before granting them permission to perform admin-level actions (like viewing all users or KYC requests).

This method is highly secure because it completely separates the permission check from the data being accessed, preventing the recursive loops and errors experienced during development.

---

## Part 2: How to Make a User an Administrator

Follow these steps to grant admin privileges to any registered user.

### Step 2.1: Find the User's UID

First, you need the unique User ID (UID) of the user you want to make an admin.

1.  Navigate to your [Firebase Console](https://console.firebase.google.com/).
2.  Select your Project Apex project.
3.  On the left menu, go to **Build > Authentication**.
4.  In the **Users** tab, you will see a list of all your registered users. Find the user you want to promote.
5.  The **User UID** is the long string of letters and numbers listed in the `User UID` column. Copy this entire string. (e.g., `jJCEeKDmRchtjiccpmMNTJp5pBJ3`).

### Step 2.2: Add the User's UID to the `admins` Collection

Now, we will add a document to our special `admins` collection to officially grant the role.

1.  In the Firebase Console, go to **Build > Firestore Database**.
2.  In the main data panel, look for the `admins` collection.
    - **If it's your first time:** Click **"+ Start collection"**. For the **Collection ID**, type `admins`.
    - **If the collection already exists:** Click on the `admins` collection to select it.
3.  Click the **"+ Add document"** button.
4.  A panel will appear asking for a **Document ID**. **Delete the auto-generated ID** and **paste the User UID** you copied from the Authentication tab.
5.  Now, you need to add at least one field to the document. This confirms the user's role.
    - **Field:** `role`
    - **Type:** `string`
    - **Value:** `admin`
6.  Click **"Save"**.

The user with that UID is now officially an administrator. The next time they log in to the `/admin/` section of the website, the security rules will recognize them and grant them access.

---

## Part 3: Understanding the Security Rules

For reference, this is the final, correct structure of the Firestore Security Rules (`firestore.rules`) that powers this system.

<!-- ============================== -->
<!-- rules_version = '2';

service cloud.firestore {
match /databases/{database}/documents { -->
  <!-- ==================================== -->

rules_version = '2';

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

    // =============================================================

// PLANS COLLECTION (DEFINITIVE FIX)
// =============================================================
match /plans/{planId} {
// ANY logged-in user can read the plans. This is for the user-facing page.
allow read: if request.auth != null;

// ONLY an admin can CREATE a new plan document.
allow create: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;

// ONLY an admin can UPDATE or DELETE existing plans.
// We add these now for future functionality.
allow update, delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}

// =============================================================
// NEWSLETTER COLLECTION (NEW RULE)
// =============================================================
match /newsletter-subscribers/{email} {
// Allow anyone to create (subscribe) a new document.
// We don't require authentication for this action.
allow create: if true;
}
}
}
