rules_version = '2';

service cloud.firestore {
match /databases/{database}/documents {

    // Helper function to check if the requester is an admin
    // This is the standard, secure, and non-recursive way to check for admin roles.
    function isAdmin() {
      return exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // =====================================================================
    //  USERS COLLECTION
    // =====================================================================
    match /users/{userId} {
      // A user can create their own document, and read/update it.
      // 'read' here is equivalent to 'get' since it's a specific document path.
      allow create, read, update: if request.auth.uid == userId;

      // An ADMIN can READ any user's document (get), LIST all users,
      // and UPDATE any user's document (for profit calculation).
      // This restores the explicit rule and fixes the profit calculation error.
      allow list, get, update: if isAdmin();
    }

    // =====================================================================
    //  INVESTMENTS COLLECTION
    // =====================================================================
    match /investments/{investmentId} {
      // A user can create their own investment records.
      allow create: if request.auth.uid == request.resource.data.userId;

      // A user can read their own investments. An admin can read any investment.
      allow read: if request.auth.uid == resource.data.userId || isAdmin();

      // An admin can update an investment (e.g., to mark as 'completed').
      // This is the second key fix for the profit calculation error.
      allow update: if isAdmin();
    }

    // =====================================================================
    //  TRANSACTIONS COLLECTION (Deposits & Withdrawals)
    // =====================================================================
    match /transactions/{transactionId} {
      allow create: if request.auth.uid == request.resource.data.userId;
      allow read: if request.auth.uid == resource.data.userId || isAdmin();
      allow update: if isAdmin();
    }

    // =============================================================
    //  PLANS COLLECTION
    // =============================================================
    match /plans/{planId} {
      // ANYONE (logged in or not) can read plans for public pages.
      allow read: if true;

      // ONLY an admin can create, update, or delete plans.
      // Standardized to use the efficient isAdmin() function.
      allow create, update, delete: if isAdmin();
    }

    // =====================================================================
    //  BLOGPOSTS COLLECTION
    // =====================================================================
    match /blogPosts/{postId} {
      // Anyone can read posts for the public blog pages.
      allow read: if true;

      // A user can ONLY update a post if they are incrementing the likeCount by 1.
      allow update: if request.resource.data.likeCount == resource.data.likeCount + 1;

      // Allow an admin to create a post directly from the client.
      allow create: if isAdmin() && request.resource.data.title is string && request.resource.data.snippet is string && request.resource.data.content is string && request.resource.data.status in ['published', 'draft'] && request.resource.data.likeCount == 0 && request.resource.data.authorId == request.auth.uid && request.resource.data.createdAt == request.time;

      // Rules for the Comments subcollection
      match /comments/{commentId} {
        // Anyone can read comments.
        allow read: if true;

        // Anyone can create a comment, but we validate the data to prevent spam/abuse.
        allow create: if request.resource.data.name is string && request.resource.data.name.size() > 1 && request.resource.data.name.size() < 50 && request.resource.data.text is string && request.resource.data.text.size() > 1 && request.resource.data.text.size() < 1500 && request.resource.data.createdAt == request.time;

        // Nobody can update or delete comments from the client.
        allow update, delete: if false;
      }
    }

    // =============================================================
    //  NEWSLETTER COLLECTION
    // =============================================================
    match /newsletter-subscribers/{email} {
      // Allow anyone to create (subscribe) a new document.
      // We don't require authentication for this action.
      allow create: if true;
    }
  }
}
