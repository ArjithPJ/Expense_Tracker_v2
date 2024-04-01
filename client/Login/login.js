async function login(e) {
    try{
        e.preventDefault();
        console.log(e.target.email.value);

        const loginDetails = {
            name: e.target.name.value,
            email: e.target.email.value,
            password: e.target.password.value
        }
        console.log(loginDetails);
        const response = await axios.post('http://localhost:3000/login', loginDetails)
        if(response.status ===201){
            const userId = response.data.id;
            const expenses = response.data.expenses;
            const token = response.data.token;
            const premium = response.data.premium;
            console.log("Expenses", expenses)
            localStorage.setItem('token', token);
            localStorage.setItem('id', userId);
            localStorage.setItem('expenses', JSON.stringify(expenses));
            localStorage.setItem('premium', premium);
            window.location.href = "../Home/index.html";
        }
        else if(response.status === 404){
            window.location.href = "../Login/login.html";
            alert("User account doesn't exist");
            //throw new Error('Failed to Login');
        }
        else if(response.status === 401){
            alert("Incorrect Password");
        }
        else{
            alert("Something went wrong");
        }
    }
    catch(err){
        //document.body.innerHTML+= `<div style="color:red;">${err} <div>`;
        console.log(err);
    };
};