async function deleteExpense(e){
    try{
        e.preventDefault();
        console.log(e.target.parentElement.parentElement);
        const expense_id = e.target.parentElement.querySelector("#expenseId").value;
        const currentPage = localStorage.getItem('currentPage');
        console.log(expense_id);
        const expenseDetails = {
            expense_id: expense_id,
            token: token,
            currentPage: currentPage
        };
        const response = await axios.post("http://localhost:3000/delete-expense/"+token, expenseDetails);
        if(response.status===200){
            const expenses = response.data.expenses;
            const pageExpenses = response.data.pageExpenses;
            localStorage.setItem('expenses',JSON.stringify(expenses));
            localStorage.setItem('pageExpenses',JSON.stringify(pageExpenses));
            e.target.closest("tr").remove();
            window.location.href = 'index.html';
        }
        else{
            console.log("Something went wrong");
        }
    }
    catch{
        console.log("Error");
    }
}
