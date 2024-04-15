document.getElementById('entries').addEventListener('change', function() {
    var selectedValue = this.value;
    showEntries(selectedValue);
});

async function showEntries(selectedValue){
    const currentPage = localStorage.getItem('currentPage');
    const token = localStorage.getItem('token');
    localStorage.setItem('selectedValue', selectedValue);
    const response = await axios.get(`http://localhost:3000/home/?page=${1}&selectedValue=${selectedValue}`,{
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if(response.status === 200){
        console.log(`Showing ${selectedValue} Entries`);
        const pageExpenses = response.data.pageExpenses;
        const currentPage = response.data.currentPage;
        const hasNextPage = response.data.hasNextPage;
        const nextPage = response.data.nextPage;
        const hasPreviousPage = response.data.hasPreviousPage;
        const lastPage = response.data.lastPage;
        console.log(lastPage);
        localStorage.setItem('pageExpenses',JSON.stringify(pageExpenses));
        localStorage.setItem('currentPage',JSON.stringify(currentPage));
        localStorage.setItem('nextPage', JSON.stringify(nextPage));
        localStorage.setItem('hasPreviousPage',JSON.stringify(hasPreviousPage));
        localStorage.setItem('hasNextPage', JSON.stringify(hasNextPage));
        localStorage.setItem('lastPage', JSON.stringify(lastPage));
        const expenseList = document.getElementById('expense-table').getElementsByTagName('tbody')[0];
        expenseList.innerHTML = ''; // Clear previous entries
        pageExpenses.forEach(expense => {
            console.log(expense);
            const tr = document.createElement('tr');
            tr.innerHTML = `<td id="amount">${expense.amount}</td>
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
        const paginationContainer = document.querySelector('#pagination');
        paginationContainer.innerHTML="";
        for (let i = 1; i <= lastPage; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            //button.classList.add("btn", "btn-secondary", "mx-1");
            button.id = 'pagebutton';
            paginationContainer.appendChild(button);
            button.addEventListener("click", () => {
                axios.get(`http://localhost:3000/home/?page=${i}&selectedValue=${selectedValue}`,{
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then((response) =>{
                    console.log("Response:", response);
                    const pageExpenses = response.data.pageExpenses;
                    console.log("Pageexpeenses:", pageExpenses);
                    const currentPage = response.data.currentPage;
                    const nextPage = response.data.nextPage;
                    const hasPreviousPage = response.data.hasPreviousPage;
                    const hasNextPage = response.data.hasNextPage;
                    const lastPage = response.data.lastPage;
                    localStorage.setItem('pageExpenses',JSON.stringify(pageExpenses));
                    localStorage.setItem('currentPage',JSON.stringify(currentPage));
                    localStorage.setItem('nextPage', JSON.stringify(nextPage));
                    localStorage.setItem('hasPreviousPage',JSON.stringify(hasPreviousPage));
                    localStorage.setItem('hasNextPage', JSON.stringify(hasNextPage));
                    localStorage.setItem('lastPage', JSON.stringify(lastPage));
                    populateExpenses();
                }) 
            });
        }
    }
    else{
        console.log("Error showing entries");
    }

}