```javascript
async function handleInvestmentSubmission(event, currentUserData) {
  event.preventDefault();
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Processing...';

  const amount = parseFloat(
    document.getElementById('investment-amount').value
  );
  const user = auth.currentUser;
  const planName = document
    .getElementById('modal-plan-name')
    .textContent.replace('Invest in ', ''); // Get plan name from modal

  // --- Validation ---
  if (!user || isNaN(amount) || amount <= 0) {
    alert('Please enter a valid investment amount.');
    submitButton.disabled = false;
    submitButton.textContent = 'Confirm Investment';
    return;
  }

  if (amount > currentUserData.accountBalance) {
    alert('Insufficient balance for this investment.');
    submitButton.disabled = false;
    submitButton.textContent = 'Confirm Investment';
    return;
  }

  // --- Firestore Transaction ---
  try {
    console.log('DEBUG: Starting investment transaction...');

    await runTransaction(db, async (transaction) => {
      console.log('DEBUG: 1. Inside runTransaction callback.');
      const userDocRef = doc(db, 'users', user.uid);

      console.log(
        'DEBUG: 2. Getting fresh user document inside transaction...'
      );
      const userDoc = await transaction.get(userDocRef);

      if (!userDoc.exists()) {
        throw 'FATAL: User document could not be found inside transaction.';
      }
      console.log('DEBUG: 3. Fresh user document found.');

      const currentBalance = userDoc.data().accountBalance;
      console.log(
        `DEBUG: 4. Balance inside transaction is: $${currentBalance}`
      );

      if (amount > currentBalance) {
        throw `Your current balance ($${currentBalance}) is no longer sufficient.`;
      }

      // --- Step A: Update User's Balance ---
      const newBalance = currentBalance - amount;
      console.log(`DEBUG: 5. Updating user balance to: $${newBalance}`);
      transaction.update(userDocRef, { accountBalance: newBalance });

      // --- Step B: Get Plan Details to Calculate End Date ---
      // First, find the plan document based on its name
      const plansQuery = query(collection(db, 'plans'), where('planName', '==', planName));
      const plansSnapshot = await transaction.get(plansQuery);

      if (plansSnapshot.empty) {
        throw `Plan '${planName}' not found. Cannot create investment.`;
      }
      const plan = plansSnapshot.docs[0].data(); // Get the first (and should be only) matching plan

      // Calculate end date
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + plan.durationDays);

      // --- Step C: Create New Investment Document ---
      const newInvestmentRef = doc(collection(db, 'investments')); // Auto-generates an ID
      const newInvestmentData = {
        userId: user.uid,
        planName: planName,
        investedAmount: amount,
        status: 'active',
        startDate: startDate,
        endDate: endDate, // Store the calculated end date
      };
      console.log(
        'DEBUG: 6. Creating new investment document with data:',
        newInvestmentData
      );
      transaction.set(newInvestmentRef, newInvestmentData);

      console.log('DEBUG: 7. Transaction operations queued successfully.');
    });

    console.log('DEBUG: 8. Transaction completed successfully!');
    alert('Investment successful! Your plan is now active.');
    window.location.href = 'my-plans.html';
  } catch (error) {
    console.error('--- INVESTMENT FAILED ---');
    console.error('Error message:', error);
    alert('Investment failed: ' + error);
    submitButton.disabled = false;
    submitButton.textContent = 'Confirm Investment';
  }
}
```

**How to implement this code:**

1.  **Open `js/app.js`:** Navigate to `C:\Users\user\Desktop\Apex-website\js\app.js` in your code editor.
2.  **Locate `handleInvestmentSubmission`:** Find the existing `handleInvestmentSubmission` function within `app.js`. It should look very similar to the code I provided in the previous turn.
3.  **Replace the function:** Select the *entire* existing `handleInvestmentSubmission` function (from `async function handleInvestmentSubmission(...) {` to its closing `}` bracket) and replace it with the new code provided above.
4.  **Save the file:** Save `app.js`.

After making this change, when a user invests in a plan, the `endDate` will be calculated and stored in the `investments` collection in Firestore. The `my-plans.html` page should then correctly display this `endDate` because the `js/app.js` code already has the logic to read and display it:

```javascript
            const endDate = investment.endDate
              ? investment.endDate.toDate().toLocaleDateString('en-US')
              : 'Processing...';
```

Once you've made this change, please let me know, and we can then move on to adding the "stop/continue" functionality in `admin/plans.html`.