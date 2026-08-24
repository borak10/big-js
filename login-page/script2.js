const registerForm = document.querySelector("#registerForm");
const registerName = document.querySelector("#registerName");
const registerEmail = document.querySelector("#registerEmail");
const registerPassword = document.querySelector("#registerPassword");
const registerMessage = document.querySelector("#registerMessage");
const loginForm = document.querySelector("#loginForm");
const loginPassword = document.querySelector("#loginPassword");
const loginMessage = document.querySelector("#loginMessage");

let registeredUser = null;

//---------------REGISTER------------------------------------//
registerForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value;
    if (name === "") { Swal.fire({ icon: "warning", title: "Oops...", text: "Ju lutem shkruani emrin!" }); return; }
    if (!email.includes("@")) { Swal.fire({ icon: "error", title: "Email i pavlefshem!", text: "Email-i nuk eshte valid!" }); return; }
    if (password.length < 6) { Swal.fire({ icon: "error", title: "Password duhet te kete te pakten 6 karaktere" }); return; }
    registeredUser = { name, email, password };
    Swal.fire({ icon: "success", title: "Sukses!", text: "Regjistrimi ishte i suksesshem!" });
    registerForm.reset();
});

//--------------LOGIN-----------------------------------------//
loginForm.addEventListener("submit", function (event) {

    event.preventDefault();
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    if (registeredUser === null) {
        Swal.fire({ icon: "info", title: "Kujdes", text: "Se pari duhet te regjistrohesh!" }); return;
    }
    if (email === registeredUser.email && password === registeredUser.password) {
        Swal.fire({ icon: "success", title: `Mire se erdhe ${registeredUser.name}!`, text: "Login sukses!", timer: 2000, showConfirmButton: false })
            .then(() => {
                window.location.href = "../index.html";
            });
    } else {
        Swal.fire({ icon: "error", title: "Gabim", text: "Email ose password gabim!" });
    }
});
