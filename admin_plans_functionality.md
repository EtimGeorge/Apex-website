# Adding Stop/Continue Functionality to Admin Plans Page

This guide will walk you through adding "Activate" and "Deactivate" buttons to your admin plans page (`admin/plans.html`) and implementing the JavaScript logic (`js/admin.js`) to control the `isActive` status of investment plans in Firestore.

## Step 1: Update `admin/plans.html`

We need to add a new column to the table for actions and include the buttons.

1.  **Open `admin/plans.html`** in your code editor.
2.  **Locate the `<thead>` section** for the plans table. It should look something like this:

    ```html
    <thead>
        <tr>
            <th>Plan Name</th>
            <th>Amount Range</th>
            <th>Daily ROI</th>
            <th>Duration</th>
        </tr>
    </thead>
    ```

3.  **Add a new `<th>` for "Actions"** at the end of the `<thead>` row:

    ```html
    <thead>
        <tr>
            <th>Plan Name</th>
            <th>Amount Range</th>
            <th>Daily ROI</th>
            <th>Duration</th>
            <th>Actions</th> <!-- ADD THIS LINE -->
        </tr>
    </thead>
    ```

4.  **Locate the `<tbody>` section** within the same table. Find the `rowsHTML` generation loop. It should look like this:

    ```html
    rowsHTML += `
        <tr>
            <td>${plan.planName}</td>
            <td>$${plan.minAmount} - $${plan.maxAmount}</td>
            <td>${plan.roiPercent}% Daily</td>
            <td>${plan.durationDays} Days</td>
        </tr>
    `;
    ```

5.  **Add a new `<td>` for the action buttons** at the end of each row. We'll also add a `data-planid` attribute to the `<tr>` to easily get the document ID in JavaScript, and a `data-isactive` attribute to reflect the current status.

    ```html
    rowsHTML += `
        <tr data-planid="${doc.id}" data-isactive="${plan.isActive}">
            <td>${plan.planName}</td>
            <td>$${plan.minAmount} - $${plan.maxAmount}</td>
            <td>${plan.roiPercent}% Daily</td>
            <td>${plan.durationDays} Days</td>
            <td class="actions-cell">
                ${plan.isActive
                    ? '<button class="btn-action deactivate-plan">Deactivate</button>'
                    : '<button class="btn-action activate-plan">Activate</button>'
                }
            </td>
        </tr>
    `;
    ```

6.  **Save `admin/plans.html`**.

## Step 2: Update `js/admin.js`

Now we need to add the JavaScript logic to handle these new buttons.

1.  **Open `js/admin.js`** in your code editor.
2.  **Locate the `handlePlansPage` function**. This is where the plans table is populated.
3.  **Modify the `loadPlans` function** to include the `isActive` status in the table row and add the buttons. (You should have already done this in Step 1, but ensure the `data-planid` and `data-isactive` attributes are present on the `<tr>` and the conditional buttons are in the `<td>`).

4.  **Add a new function `handlePlanActions`** within the `handlePlansPage` block, just below `loadPlans` (or anywhere within `handlePlansPage` but outside `loadPlans`). This function will listen for clicks on the new buttons.

    ```javascript
    // Add this new function within handlePlansPage
    const handlePlanActions = () => {
        if (!tableBody) return;

        tableBody.addEventListener('click', async (e) => {
            const target = e.target;
            const row = target.closest('tr');
            if (!row || !row.dataset.planid) return;

            const planId = row.dataset.planid;
            const planDocRef = doc(db, 'plans', planId);

            // Disable buttons to prevent double clicks
            row.querySelectorAll('.btn-action').forEach(btn => btn.disabled = true);

            try {
                if (target.classList.contains('deactivate-plan')) {
                    await updateDoc(planDocRef, { isActive: false });
                    alert('Plan deactivated successfully!');
                } else if (target.classList.contains('activate-plan')) {
                    await updateDoc(planDocRef, { isActive: true });
                    alert('Plan activated successfully!');
                }
                // Reload plans to update the UI
                loadPlans();
            } catch (error) {
                console.error('Error updating plan status:', error);
                alert('Failed to update plan status. See console for details.');
                // Re-enable buttons on error
                row.querySelectorAll('.btn-action').forEach(btn => btn.disabled = false);
            }
        });
    };
    ```

5.  **Call `handlePlanActions()`** at the end of the `handlePlansPage` function, after `loadPlans()` is called. This ensures the event listeners are attached when the page loads.

    ```javascript
    // --- Initial page load ---
    loadPlans();
    handlePlanActions(); // ADD THIS LINE
    ```

6.  **Save `js/admin.js`**.

## Verification

After making these changes, clear your browser cache and navigate to `admin/plans.html`. You should now see "Activate" or "Deactivate" buttons next to each plan. Clicking them should update the plan's status in Firestore and refresh the table to reflect the change. Plans marked `isActive: false` will no longer appear on the user-facing `plans.html` page.