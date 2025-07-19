## Summary of Network Selection Feature Implementation

This document outlines the changes made to integrate blockchain network selection into the deposit and withdrawal pages of the application.

### Introduction
The primary goal of these modifications is to allow users to specify the blockchain network (e.g., ERC20, TRC20, BEP20) when making deposits or withdrawals. This is crucial for ensuring funds are sent to the correct address on the intended network, preventing potential loss of assets due to network mismatches.

### Files Modified
- `fund-account.html`
- `withdraw.html`
- `js/app.js`

### Detailed Changes

#### `fund-account.html`
- A new `<div class="form-group" id="fund-network-group">` containing a `<label>` and a `<select id="fund-network">` element was added. This provides the user interface for selecting the desired network during the deposit process.

#### `withdraw.html`
- The existing `<div class="form-group" id="network-group">` and `<select id="withdraw-network">` elements were confirmed to be in place. These elements serve as the UI for network selection on the withdrawal page.

#### `js/app.js`
- **`companyWallets` Object Update:**
    - The `companyWallets` object was updated to include a `value` property for each network within the `networks` array. This `value` property will be used as the actual value submitted by the dropdown, while the `name` property will be displayed to the user.
    - Example for USDT:
      ```javascript
      usdt: {
        name: 'Tether (USDT)',
        symbol: 'USDT',
        networks: [
          { name: 'ERC20', value: 'erc20', address: '...', default: true },
          { name: 'TRC20', value: 'trc20', address: '...', default: false },
          { name: 'BEP20 (BSC)', value: 'bep20', address: '...', default: false },
        ],
      },
      ```
    - A sample `tag` was added to the XRP network for demonstration purposes.

- **`handleFundAccountPage` Function Modifications:**
    - New constants `fundNetworkDropdown` and `fundNetworkGroup` were introduced to reference the newly added network selection elements.
    - The `updateWalletDisplay` helper function was significantly refactored:
        - It now dynamically populates the `fundNetworkDropdown` with options based on the `networks` array of the selected cryptocurrency.
        - It correctly determines which network's address and tag to display (either the user-selected network or the default network if none is explicitly chosen).
        - It ensures the `fundNetworkGroup` (the network dropdown container) is shown or hidden based on whether the selected coin has multiple networks.
    - Event listeners were added to both `paymentMethodDropdown` and `fundNetworkDropdown` to trigger `updateWalletDisplay` whenever the selected coin or network changes.
    - The form submission logic was updated to capture the `selectedNetwork` from `fundNetworkDropdown.value` and store it in the Firestore `transactions` collection along with other deposit details.

- **`handleWithdrawPage` Function Modifications:**
    - The `networkGroup` constant was explicitly defined within the function scope to ensure it correctly references the network dropdown container.
    - The `populateNetworkOptions` function was updated to use `network.value` for the option's value attribute and `network.name` for its display text, aligning with the `companyWallets` structure.
    - The form submission logic was updated to ensure the `network` field stored in Firestore correctly uses the `value` from the `withdrawNetworkDropdown`.

### Expected Outcome
- Users will now have a clear option to select the desired blockchain network for both deposits and withdrawals.
- The displayed wallet address and QR code on the deposit page will accurately reflect the chosen cryptocurrency and network.
- All deposit and withdrawal requests submitted will include the selected network information, which is critical for backend processing and reconciliation.
- This feature enhances user experience by providing necessary control over their transactions and significantly reduces the risk of funds being lost due to incorrect network transfers.