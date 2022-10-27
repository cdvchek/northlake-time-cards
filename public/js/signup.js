const signupForm = document.getElementById("form-sign-up");
const nameInpt = document.getElementById("inpt-name");
const emailInpt = document.getElementById("inpt-empl-id");
const passwordInpt = document.getElementById("inpt-password");
const passwordConfirmInpt = document.getElementById("inpt-password-confirm");

const signup = async (e) => {
    e.preventDefault();
    const password = passwordInpt.value;
    const passwordConfirm = passwordConfirmInpt.value;
    if (password == passwordConfirm) {
        const name = nameInpt.value;
        const email = emailInpt.value;
        const signupObj = {
            name,
            email,
            password,
        }

        const response = await fetch("/api/signup", {
            method: "POST",
            body: JSON.stringify(signupObj),
            headers: {
                "Content-Type": "application/json"
            },
        });

        if (response.ok) {
            // Go back to manage users
            location = "/admin-manageusers"
        } else {
            // Say something went wrong
        }
    }
}

signupForm.addEventListener("submit", signup);