# Production Deployment Guide: Securing the Admin Panel

This guide outlines the necessary steps to secure the admin panel of this project before deploying to a live production environment. Following these steps is critical to protect sensitive user data and administrative functions.

## Security Principle

The primary security strategy is to prevent direct public access to the `/admin` directory. Instead of letting Firebase Hosting serve admin files directly, we will use a **server-side guard**. Every request for a page within the admin panel will first be intercepted by a Firebase Function. This function will act as a bouncer, checking the identity and role of the user making the request before deciding whether to serve the requested page or deny access.

---

## Step 1: Configure Firebase Hosting to Use a Function Guard

The first step is to edit the `firebase.json` file. This configuration tells Firebase Hosting to use a function as a gatekeeper for the `/admin` directory.

**File:** `firebase.json`

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/admin/**",
        "function": "adminOnly"
      }
    ]
  },
  "functions": {
    "source": "functions"
  }
}
```

### Key Configuration:

*   `"rewrites"`: This is the most important part.
    *   `"source": "/admin/**"`: This pattern matches any URL request that begins with `/admin/` (e.g., `/admin/dashboard.html`, `/admin/users.html`).
    *   `"function": "adminOnly"`: This instructs Firebase Hosting to **not** serve the file directly. Instead, it will execute the Firebase Function named `adminOnly` and pass the request to it.

---

## Step 2: Implement the `adminOnly` Firebase Function

The second step is to create the logic for our `adminOnly` function. This function will verify the user's role and decide what content to show them.

**File:** `functions/index.js`

```javascript
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

admin.initializeApp();

exports.adminOnly = functions.https.onRequest(async (req, res) => {
  // Extract the session cookie.
  const sessionCookie = req.cookies.session || "";

  try {
    // Verify the session cookie. In this case an ID token is used as the cookie.
    const decodedIdToken = await admin.auth().verifySessionCookie(sessionCookie, true /** checkRevoked */);
    const userDoc = await admin.firestore().collection('users').doc(decodedIdToken.uid).get();

    // Check if the user has the 'admin' role.
    if (userDoc.exists && userDoc.data().role === 'admin') {
      // User is an admin. Serve the requested file from the /admin directory.
      const filePath = path.join(__dirname, '../admin', req.path);
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.status(404).send("Admin file not found.");
        } else {
          // Determine content type based on file extension
          let contentType = 'text/html';
          if (filePath.endsWith('.css')) {
            contentType = 'text/css';
          } else if (filePath.endsWith('.js')) {
            contentType = 'application/javascript';
          }
          res.set('Content-Type', contentType);
          res.status(200).send(content);
        }
      });
    } else {
      // User is not an admin.
      res.status(403).send("Forbidden: You do not have permission to access this page.");
    }
  } catch (error) {
    // Session cookie is invalid or expired.
    // Redirect to the main login page.
    res.redirect('/login.html');
  }
});
```

### How the Function Works:

1.  **Verify Cookie:** It first checks for a session cookie to see if the user is logged in.
2.  **Check Admin Role:** If the user is logged in, it verifies their ID token and then checks their user document in Firestore for `role: 'admin'`.
3.  **Grant Access:** If the user is an admin, the function reads the requested file from the actual `/admin` directory on the server and sends it to the user's browser.
4.  **Deny Access:** If the user is logged in but is **not** an admin, it sends a `403 Forbidden` error, preventing them from seeing any admin content.
5.  **Redirect to Login:** If the user is not logged in at all, it redirects them to the standard `login.html` page.

---

By implementing these two steps, you create a robust, server-side security barrier that ensures only authorized administrators can ever access the admin panel.