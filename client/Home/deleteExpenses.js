async function deleteExpense(e){
    try{
        e.preventDefault();
        console.log(e.target.parentElement.parentElement);
        const expense_id = e.target.parentElement.querySelector("#expenseId").value;
        const currentPage = localStorage.getItem('currentPage');
        const selectedValue = localStorage.getItem('selectedValue');
        console.log(expense_id);
        const expenseDetails = {
            expense_id: expense_id,
            token: token,
            currentPage: currentPage,
            selectedValue: parseInt(selectedValue,10)
        };
        const response = await axios.post("http://localhost:3000/delete-expense/"+token, expenseDetails);
        if(response.status===200){
            const expenses= response.data.expenses;
            const pageExpenses = response.data.pageExpenses;
            const nextPage = response.data.nextPage;
            const currentPage = response.data.currentPage;
            const hasNextPage = response.data.hasNextPage;
            const previousPage = response.data.previousPage;
            const hasPreviousPage = response.data.hasPreviousPage;
            const lastPage = response.data.lastPage;

            console.log("Expenses", expenses);
            localStorage.setItem('expenses',JSON.stringify(expenses));
            localStorage.setItem('pageExpenses', JSON.stringify(pageExpenses));
            localStorage.setItem('nextPage', JSON.stringify(nextPage));
            localStorage.setItem('currentPage', JSON.stringify(currentPage));
            localStorage.setItem('hasNextPage', JSON.stringify(hasNextPage));
            localStorage.setItem('hasPreviousPage', JSON.stringify(hasPreviousPage));
            localStorage.setItem('lastPage', JSON.stringify(lastPage));
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
