// =================================================================================
// PROJECT APEX: CLOUD FUNCTIONS - index.js
// This file contains the backend logic that runs on Google's servers.
// =================================================================================

// 1. Import the necessary Firebase Admin SDK modules
const {
  onCall,
  HttpsError,
} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, Timestamp} = require("firebase-admin/firestore");

// 2. Initialize the Firebase Admin App
initializeApp();

// =================================================================================
//  PROFIT CALCULATION & INVESTMENT COMPLETION FUNCTION
//  This is a "callable" function, meaning our admin panel can trigger it.
// =================================================================================
exports.processInvestments = onCall(async (request) => {
  // --- Security Check: Ensure the caller is an authenticated admin ---
  // (We will add a more robust check later, for now we trust the call)
  console.log("Starting investment processing job...");

  const db = getFirestore();
  const now = Timestamp.now();

  // --- Step 1: Find all active investments ---
  const activeInvestmentsQuery = db.collection("investments")
      .where("status", "==", "active");

  const querySnapshot = await activeInvestmentsQuery.get();

  if (querySnapshot.empty) {
    console.log("No active investments found. Job finished.");
    return {
      status: "success",
      message: "No active investments to process.",
    };
  }

  console.log(`Found ${querySnapshot.size} active investments to process.`);
  let processedCount = 0;

  // --- Step 2: Process each investment ---
  const promises = querySnapshot.docs.map(async (investmentDoc) => {
    const investment = investmentDoc.data();
    const investmentId = investmentDoc.id;
    const userId = investment.userId;

    // --- A. Find the corresponding plan using its ID (MUCH BETTER!) ---
    const planRef = db.collection("plans").doc(investment.planId);
    const planDoc = await planRef.get();

    if (!planDoc.exists()) {
      console.error(`Plan with ID '${investment.planId}' not found for investment ID: ${investmentId}. Skipping.`);
      return; // Skip this investment if the plan doesn't exist
    }
    const plan = planDoc.data();

    // --- B. Find the user to update their balances ---
    const userRef = db.collection("users").doc(userId);

    // --- C. Calculate daily profit ---
    const dailyProfit = (investment.investedAmount * plan.roiPercent) / 100;

    // --- D. Check if the investment period is over ---
    // We can now directly compare the stored endDate with the current time
    const isCompleted = now.toDate() >= investment.endDate.toDate();

    // --- E. Run a transaction to update everything safely ---
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        console.error(`User ${userId} not found. Skipping investment ${investmentId}.`);
        return;
      }

      const userData = userDoc.data();
      let newBalance = userData.accountBalance || 0;
      let newTotalProfits = userData.totalProfits || 0;

      // Add the daily profit to the user's balance and total profits
      newBalance += dailyProfit;
      newTotalProfits += dailyProfit;

      const investmentRef = db.collection("investments").doc(investmentId);

      if (isCompleted) {
        console.log(`Investment ${investmentId} for user ${userId} has completed.`);
        // Return the user's initial capital to their balance
        newBalance += investment.investedAmount;
        // Update the investment status to 'completed'
        transaction.update(investmentRef, {status: "completed"});
      }

      // Update the user's document with new totals
      transaction.update(userRef, {
        accountBalance: newBalance,
        totalProfits: newTotalProfits,
      });
    });

    processedCount++;
    console.log(`Successfully processed investment ${investmentId} for user ${userId}.`);
  });

  // --- Step 3: Wait for all transactions to complete ---
  await Promise.all(promises);

  console.log(`Job finished. Processed ${processedCount} investments.`);
  return {
    status: "success",
    message: `Processed ${processedCount} investments successfully.`,
  };
});

// =================================================================================
//  CREATE BLOG POST FUNCTION
//  Callable function for admins to create a new blog post.
// =================================================================================
exports.createBlogPost = onCall(async (request) => {
  // --- 1. Security Check: Ensure the caller is an authenticated admin ---
  if (!request.auth) {
    // Throw an HttpsError to send a specific error back to the client.
    throw new HttpsError(
        "unauthenticated",
        "You must be logged in to create a post.",
    );
  }

  const db = getFirestore();
  const uid = request.auth.uid;
  const userRef = db.collection("users").doc(uid);

  try {
    const userDoc = await userRef.get();
    // Check if the user document exists and if they have the isAdmin flag.
    if (!userDoc.exists() || userDoc.data().isAdmin !== true) {
      throw new HttpsError(
          "permission-denied",
          "You must be an admin to perform this action.",
      );
    }

    // --- 2. Validate Input Data from the client ---
    const data = request.data;
    if (!data.title || !data.snippet || !data.content || !data.status) {
      throw new HttpsError(
          "invalid-argument",
          "Missing required fields: title, snippet, content, or status.",
      );
    }

    // --- 3. Prepare and add the new blog post document ---
    const newPostRef = await db.collection("blogPosts").add({
      title: data.title,
      snippet: data.snippet,
      content: data.content,
      status: data.status,
      imageUrl: data.imageUrl || null, // Use provided URL or null
      likeCount: 0,
      authorId: uid, // Track which admin created the post
      createdAt: Timestamp.now(),
    });

    console.log(`Admin ${uid} created new blog post ${newPostRef.id}`);
    return {status: "success", postId: newPostRef.id};
  } catch (error) {
    console.error("Error in createBlogPost function:", error);
    // If it's not already an HttpsError, re-throw it as a generic internal error.
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError(
        "internal",
        "An internal error occurred while creating the post.",
    );
  }
});