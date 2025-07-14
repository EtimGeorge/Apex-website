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
//  PLANS COLLECTION (DEFINITIVE FIX)
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
    //  NEWSLETTER COLLECTION (NEW RULE)
    // =============================================================
    match /newsletter-subscribers/{email} {
      // Allow anyone to create (subscribe) a new document.
      // We don't require authentication for this action.
      allow create: if true;
    }
  }
}