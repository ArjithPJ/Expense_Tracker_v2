async function addExpense(e) {
    try{
        e.preventDefault();
        console.log(e.target.amount.value);
        const token =localStorage.getItem('token');
        
        const expenseDetails = {
            amount: e.target.amount.value,
            description: e.target.description.value,
            category: e.target.category.value,
            token: token
        }

        console.log(expenseDetails);
        const response = await axios.post('http://localhost:3000/add-expense/'+token, expenseDetails);
        if(response.status === 200) {   
            const expenses= response.data.expenses;
            console.log("Expenses", expenses);
            localStorage.setItem('expenses',JSON.stringify(expenses));
            console.log("Expense Added in the database");
            populateExpenses();
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
function populateExpenses() {
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
                    console.log(response.data.leaderboard[0]);
                    const leaderboard = response.data.leaderboard[0];
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
    const expensesString = localStorage.getItem('expenses');
    const expenses = JSON.parse(expensesString);
    const expenseList = document.getElementById('expense-table').getElementsByTagName('tbody')[0];
    expenseList.innerHTML = ''; // Clear previous entries
    const token = localStorage.getItem('token');
    const id =localStorage.getItem('id');
    console.log("Id", id);
    // Loop through expenses and create table rows
    expenses.forEach(expense => {
        console.log(expense);
        console.log(expense.id);
        if(typeof id === typeof expense.id){
            console.log("Same type");
        }
        if(parseInt(expense.id, 10) === parseInt(id,10)){
            console.log(expense.id);
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
        }
    });
}

// Populate expenses when the page loads
window.onload = populateExpenses;

async function deleteExpense(e){
    try{
        e.preventDefault();
        console.log(e.target.parentElement.parentElement);
        const expense_id = e.target.parentElement.querySelector("#expenseId").value;
        console.log(expense_id);
        const expenseDetails = {
            expense_id: expense_id,
            token: token
        };
        const response = await axios.post("http://localhost:3000/delete-expense/"+token, expenseDetails);
        if(response.status===200){
            const expenses = response.data.expenses;
            localStorage.setItem('expenses',JSON.stringify(expenses));
            e.target.closest("tr").remove();
        }
        else{
            console.log("Something went wrong");
        }
    }
    catch{
        console.log("Error");
    }
}

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
        leaderboard.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.name}</td>
                <td>${entry.totalAmount}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}
