Fix #2: Restoring the "Quick Amount" Button Functionality
Goal: Re-add the event listeners for the "Quick Amount" buttons on the fund-account.html page. This logic was present in your original main.js but was lost during my flawed consolidation.
Block to Add: app.js - runAllPageLogic function
Open js/app.js.
Find the runAllPageLogic(userData, uid) function.
Find the block for the Fund Account page: if (currentPage === 'fund-account.html') { ... }.
Replace that entire if (currentPage === 'fund-account.html') block with this corrected version, which now includes the Quick Amount logic.
Generated javascript
// ... inside runAllPageLogic function ...

    // =============================================================================
    // --- Fund Account Page Logic (WITH Quick Amount Fix) ---
    // =============================================================================
    if (currentPage === 'fund-account.html') {
        const fundForm = document.getElementById('deposit-form');
        const amountInput = document.getElementById('amount'); // Get the amount input field
        const quickAmountButtons = document.querySelectorAll('.btn-quick-amount'); // Get all quick amount buttons

        // Attach listeners to the quick amount buttons
        if (amountInput && quickAmountButtons.length > 0) {
            quickAmountButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Get the text content (e.g., "$100") and remove the "$"
                    const amountValue = button.textContent.replace('$', '');
                    amountInput.value = amountValue;
                });
            });
        }
        
        // Attach the main form submission listener
        if (fundForm) {
            fundForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitButton = fundForm.querySelector('button[type="submit"]');
                submitButton.disabled = true; submitButton.textContent = 'Processing...';
                const amount = parseFloat(document.getElementById('amount').value);
                const paymentMethod = document.getElementById('payment-method').value;

                if (isNaN(amount) || amount <= 0) {
                    alert('Please enter a valid amount.');
                    submitButton.disabled = false; submitButton.textContent = 'Proceed to Payment';
                    return;
                }

                try {
                    await addDoc(collection(db, "transactions"), {
                        userId: uid, // Use the uid passed into the function
                        type: 'deposit',
                        amount: amount,
                        method: paymentMethod,
                        status: 'pending',
                        date: new Date()
                    });
                    alert("Deposit request submitted!");
                    window.location.href = 'deposit-log.html';
                } catch (error) {
                    console.error("Error submitting deposit: ", error);
                    alert("An error occurred.");
                } finally {
                    submitButton.disabled = false; submitButton.textContent = 'Proceed to Payment';
                }
            });
        }
    }

    // ... rest of the page logic blocks ...