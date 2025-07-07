// --- Dashboard Page: Copy Button Logic (Corrected) ---
const copyButton = document.getElementById('copy-btn');
// Note the corrected ID for the input field
const referralInput = document.getElementById('referral-link-display');

if (copyButton && referralInput) {
  copyButton.addEventListener('click', () => {
    navigator.clipboard
      .writeText(referralInput.value)
      .then(() => {
        // --- SUCCESS FEEDBACK ---
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Copied!';
        copyButton.style.backgroundColor = 'var(--color-accent-success)'; // Use our CSS variable for green
        copyButton.style.borderColor = 'var(--color-accent-success)';

        // Revert back after 2 seconds
        setTimeout(() => {
          copyButton.textContent = originalText;
          copyButton.style.backgroundColor = ''; // Reverts to the class style
          copyButton.style.borderColor = '';
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
        alert('Could not copy text to clipboard.');
      });
  });
}
