const signupForm = document.getElementById("form-sign-up");
const nameInpt = document.getElementById("inpt-name");
const emailInpt = document.getElementById("inpt-empl-id");
const passwordInpt = document.getElementById("inpt-password");
const passwordConfirmInpt = document.getElementById("inpt-password-confirm");

const signup = async (e) => {
    e.preventDefault();

    const titleEls = document.getElementsByClassName("inpt-title");
    const titles = [];

    for (let i = 0; i < titleEls.length; i++) {
        const titleInpt = titleEls[i];
        if (titleInpt.value !== "") {
            titles.push({ name: titleInpt.value });
        }
    }

    const password = passwordInpt.value;
    const passwordConfirm = passwordConfirmInpt.value;
    if (password == passwordConfirm) {
        const name = nameInpt.value;
        const email = emailInpt.value;
        const signupObj = {
            titles,
            name,
            email,
            password,
        }

        const response = await fetch("/api/users/user-signup", {
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
            displayMessage("Something went wrong, please refresh and try again.");
        }
    }
}

signupForm.addEventListener("submit", signup);