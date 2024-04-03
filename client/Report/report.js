const isPremium = localStorage.getItem('premium');

if (isPremium === 'true') {
    const buyButton = document.getElementById('buyButton');
    buyButton.style.display = 'none';
}

if (!isPremium || isPremium !== 'true') {
    document.getElementById('download').disabled = true;
}
function populateExpenses() {
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

        if(parseInt(expense.id, 10) === parseInt(id,10)){
            console.log(expense.id);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td id="amount">${expense.amount}</td>
                <td id="description">${expense.description}</td>
                <td id="category">${expense.category}</td>
            `;
            expenseList.appendChild(tr);
        }
    });
}

window.onload = populateExpenses;