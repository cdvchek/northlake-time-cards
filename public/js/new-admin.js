const nameInpt = document.getElementById("inpt-name");
const emailInpt = document.getElementById("inpt-empl-id");
const passwordInpt = document.getElementById("inpt-password");
const passwordConfirmInpt = document.getElementById("inpt-password-confirm");

const sitePassphraseInpt = document.getElementById("inpt-password-site");
const signUpBtn = document.getElementById("btn-sign-up");

const signupNewAdmin = async (e) => {
    e.preventDefault();

    const password = passwordInpt.value;
    const passwordConfirm = passwordConfirmInpt.value;

    if (password === passwordConfirm) {
        const name = nameInpt.value;
        const email = emailInpt.value;
        const sitePassphrase = sitePassphraseInpt.value;

        const signupObj = {
            sitePassword: sitePassphrase,
            name: name,
            password: password,
            email: email,
        }

        const signupResponse = await fetch("/api/admin-signup", {
            method: "POST",
            body: JSON.stringify(signupObj),
            headers: {
                "Content-Type": "application/json"
            },
        });

        if (signupResponse.ok) {
            const signinObj = {
                email: email,
                password: password,
            }

            const signinResponse = await fetch("/api/signin", {
                method: "POST",
                body: JSON.stringify(signinObj),
                headers: {
                    "Content-Type": "application/json"
                },
            });

            if (signinResponse.ok) {
                location = "/user-timecard/";
            }
        }
    }
}

signUpBtn.addEventListener("click", signupNewAdmin);