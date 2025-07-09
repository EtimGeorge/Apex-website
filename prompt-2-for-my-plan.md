Step 2: Add the "My Plans" Logic to app.js
Now we will add the new logic block to our master function.
Block to Add: my-plans.html Logic
Open js/app.js.
Find the runAllPageLogic(userData, uid) function.
Inside this function, after the last if (currentPage === ...) block, add this new block for the my-plans.html page.
Generated javascript
// ... inside runAllPageLogic function ...

// ... (all existing page logic blocks for dashboard, deposit-log, etc.)

// =============================================================================
// --- My Plans Page Logic (NEW BLOCK) ---
// =============================================================================
if (currentPage === 'my-plans.html') {
    const tableBody = document.querySelector('.data-table tbody');
    
    if (tableBody) {
        // We already have the user's uid from the function parameters
        const q = query(
            collection(db, "investments"),
            where("userId", "==", uid),
            orderBy("startDate", "desc") // Show newest investments first
        );

        getDocs(q).then(querySnapshot => {
            if (querySnapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="5">You have no active or past investments.</td></tr>';
                return;
            }

            let tableRowsHTML = '';
            querySnapshot.forEach(doc => {
                const investment = doc.data();
                
                // Format the date nicely
                const startDate = investment.startDate.toDate().toLocaleDateString();
                // We will leave End Date blank since we don't calculate it yet
                const endDate = 'N/A'; 

                tableRowsHTML += `
                    <tr>
                        <td>${investment.planName}</td>
                        <td>$${investment.investedAmount.toFixed(2)}</td>
                        <td>${startDate}</td>
                        <td>${endDate}</td>
                        <td><span class="status status-${investment.status}">${investment.status}</span></td>
                    </tr>
                `;
            });

            tableBody.innerHTML = tableRowsHTML; // Populate the table with the new rows
        }).catch(error => {
            console.error("Error fetching investment plans: ", error);
            tableBody.innerHTML = '<tr><td colspan="5">Could not load your investment plans. Please try again.</td></tr>';
        });
    }
}

// ... (rest of the runAllPageLogic function)
Use code with caution.
JavaScript
Explanation of the New Code
Identical Pattern: This code follows the exact same successful pattern as our deposit-log logic. This consistency is a hallmark of good code.
The Query: It queries the investments collection, filters for documents where the userId matches the currently logged-in user, and sorts them by start date.
Table Generation: It loops through the results, builds an HTML table row (<tr>) for each investment, and then injects the complete set of rows into the <tbody> of our table, replacing the "Loading..." message.