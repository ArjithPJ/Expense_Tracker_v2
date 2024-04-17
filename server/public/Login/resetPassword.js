async function resetPassword(e){
    try{
        e.preventDefault();
        const password = e.target.querySelector('#password').value;
        console.log(password);
        const email =e.target.querySelector('#email').value;
        const newPasswordDetails = {
            email: email,
            password: password
        }
        const response =await axios.post('http://44.206.240.170:3000/password/resetPassword', newPasswordDetails);
        if(response.status === 200){
            console.log("Password Updated");
            //window.location.href = "D:\Sharpener\Expense Tracker App v2.0\client\Login\login.html";
        }
    }
    catch(error){
        console.error("Error updating password:", error);
    }
}