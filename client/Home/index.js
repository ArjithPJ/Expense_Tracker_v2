async function addExpense(e) {
    try{
        e.preventDefault();
        console.log(e.target.amount.value);
        const token =localStorage.getItem('token');
        const currentPage = localStorage.getItem('currentpage');
        const expenseDetails = {
            amount: e.target.amount.value,
            description: e.target.description.value,
            category: e.target.category.value,
            token: token,
            currentPage: currentPage
        }

        console.log(expenseDetails);
        const response = await axios.post('http://localhost:3000/add-expense/'+token, expenseDetails);
        if(response.status === 200) {   
            const expenses= response.data.expenses;
            const pageExpenses = response.data.pageExpenses;
            console.log("Expenses", expenses);
            localStorage.setItem('expenses',JSON.stringify(expenses));
            localStorage.setItem('pageExpenses', JSON.stringify(pageExpenses));
            console.log(pageExpenses);
            console.log("Expense Added in the database");
            await populateExpenses();
        }
        else{
            console.log("Something went wrong");
        }
    }
    catch{
        console.log("Error");
    }
}


// Function to populate expenses in the table
async function populateExpenses() {
    const buyPremium = localStorage.getItem("premium");
    if(buyPremium === "true"){
        const buyPremiumElement = document.querySelector(".buy-premium");
        while (buyPremiumElement.firstChild) {
            buyPremiumElement.removeChild(buyPremiumElement.firstChild);
        }
        const leaderboard = document.createElement('button');
        leaderboard.className='leaderboard';
        leaderboard.textContent="Leaderboard";
        buyPremiumElement.appendChild(leaderboard);
        const token = localStorage.getItem('token');
        const leaderboardDetails = {token:token};
        leaderboard.addEventListener("click", async function() {
            // Add event listener to the leaderboard button
            try{
                const response = await axios.post("http://localhost:3000/premium/leaderboard", leaderboardDetails);
                if(response.status ===200){
                    console.log(response.data.leaderboard);
                    const leaderboard = response.data.leaderboard;
                    populateLeaderboard(leaderboard);
                }
                else{
                    console.error("Failed to fetch leaderboard data");
                }
            }
            catch(error){
                console.error("Error:", error);
            }
        });
        
    }
    const expensesString = localStorage.getItem('pageExpenses');
    const expenses = JSON.parse(expensesString);
    const expenseList = document.getElementById('expense-table').getElementsByTagName('tbody')[0];
    expenseList.innerHTML = ''; // Clear previous entries
    // Loop through expenses and create table rows
    expenses.forEach(expense => {
        console.log(expense);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td id="amount">${expense.amount}</td>
            <td id="description">${expense.description}</td>
            <td id="category">${expense.category}</td>
            <td>
                <form class="delete-expense" onsubmit="deleteExpense(event)">
                    <input type="hidden" id ="expenseId" name="expenseId" value="${expense.expense_id}">
                    <button type="submit" class="btn btn-danger">Delete</button>
                </form>
            </td>
        `;
        expenseList.appendChild(tr);
    });
    const lastPage = localStorage.getItem('lastPage');
    const paginationContainer = document.querySelector("#pagination");
    paginationContainer.innerHTML = ""; // Clear previous buttons

    for (let i = 1; i <= lastPage; i++) {
        const button = document.createElement("button");
        button.textContent = i;
        button.classList.add("btn", "btn-secondary", "mx-1");
        button.addEventListener("click", () => {
            const response = axios.get(`http://localhost:3000/home/?page=${i}`);
        });
        paginationContainer.appendChild(button);
    }
}


// Populate expenses when the page loads
window.onload = populateExpenses;


async function populateLeaderboard(leaderboard) {
    // Check if leaderboard table already exists in the DOM
    let leaderboardTable = document.querySelector('.leaderboard-table');

    // If leaderboard table doesn't exist, create a new one
    if (!leaderboardTable) {
        leaderboardTable = document.createElement('table');
        leaderboardTable.className = 'leaderboard-table';

        // Create table header
        const tableHeader = document.createElement('thead');
        tableHeader.innerHTML = `
            <tr>
                <th>Name</th>
                <th>Total Amount</th>
            </tr>
        `;
        leaderboardTable.appendChild(tableHeader);

        // Create table body
        const tableBody = document.createElement('tbody');
        leaderboardTable.appendChild(tableBody);

        // Append the table to the container element in the DOM
        const container = document.querySelector('.container');
        container.appendChild(leaderboardTable);
    }

    // Update table body with new leaderboard data
    const tableBody = leaderboardTable.querySelector('tbody');
    if (tableBody) {
        // Clear existing table body
        tableBody.innerHTML = '';

        // Create table rows with updated leaderboard data
        console.log(leaderboard);
        leaderboard.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.name}</td>
                <td>${entry.totalExpense}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}
