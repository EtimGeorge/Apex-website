Part 31: Populating the "My Plans" Page
We will add a new block of logic to the runAllPageLogic function in app.js to handle this new page, i will give you the js code block after you confirm that the my plan's HTML is ready.

Step 1: Confirm the HTML Structure (my-plans.html)
First, let's ensure the table on my-plans.html is ready to receive the data. The important part is that the <tbody> is present and empty.
Open my-plans.html.
Make sure the <table> has the class data-table and that the <tbody> exists.
Generated html
<!-- In my-plans.html, inside the .content-body -->
<h1>My Active Plans</h1>
<p class="page-description">Track the progress of your ongoing and completed investment plans.</p>
<div class="card">
    <table class="data-table">
        <thead>
            <tr>
                <th>Plan Name</th>
                <th>Invested Amount</th>
                <th>Start Date</th>
                <th>End Date</th> <!-- We will leave this blank for now -->
                <th>Status</th>
            </tr>
        </thead>
        <!-- This tbody will be populated by our JavaScript -->
        <tbody>
            <tr>
                <td colspan="5">Loading your investment plans...</td>
            </tr>
        </tbody>
    </table>
</div>
Use code with caution.
Html
Action: Ensure your my-plans.html file has this structure.
