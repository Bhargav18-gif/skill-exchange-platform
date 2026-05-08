console.log("AUTH JS WORKING");

// ======================
// REGISTER
// ======================
function register() {

    console.log("REGISTER CLICKED");

    const name = document.getElementById("name")?.value;
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;

    fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
        alert("Registration Successful ✅");
    })
    .catch(err => {
        console.error("REGISTER ERROR:", err);
    });
}


// ======================
// LOGIN
// ======================
function login() {

    console.log("LOGIN CLICKED");

    const user_id = document.getElementById("loginId")?.value;
    const password = document.getElementById("loginPassword")?.value;

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: user_id,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {

        console.log(data);

        if (data.success) {

            localStorage.setItem("user_id", user_id);

            alert("Login Successful ✅");

            window.location.href = "/ui";

        } else {

            alert("Invalid Credentials ❌");
        }

    })
    .catch(err => {
        console.error("LOGIN ERROR:", err);
    });
}


// ======================
// MAKE FUNCTIONS GLOBAL
// ======================
window.login = login;
window.register = register;