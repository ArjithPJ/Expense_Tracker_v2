async function forgotPassword(e){
    try{
        e.preventDefault();
        const email = e.target.querySelector('#email').value;
        const verificationDetails = {
            email: email
        }
        const reponse =await axios.post('http://localhost:3000/password/forgotpassword', verificationDetails);
        if(Response.status === 200){
            console.log("H");
        }
    }
    catch{
        console.log("Hello")
    }
}