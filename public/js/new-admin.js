const nameInpt = document.getElementById("inpt-name");
const emailInpt = document.getElementById("inpt-empl-id");
const passwordInpt = document.getElementById("inpt-password");
const passwordConfirmInpt = document.getElementById("inpt-password-confirm");

const sitePassphraseInpt = document.getElementById("inpt-password-site");
const signUpBtn = document.getElementById("btn-sign-up");

const signupNewAdmin = async (e) => {
    e.preventDefault();

    const titleEls = document.getElementsByClassName("inpt-title");
    const titles = [];

    for (let i = 0; i < titleEls.length; i++) {
        const titleInpt = titleEls[i];
        if (titleInpt.value !== "") {
            titles.push({ name: titleInpt.value });
        }
    }

    if (titles.length > 0) {
        const password = passwordInpt.value;
        const passwordConfirm = passwordConfirmInpt.value;
        if (password.length > 0) {
            if (password === passwordConfirm) {
                const name = nameInpt.value;
                if (name.length > 0) {
                    const email = emailInpt.value;
                    if (email.length > 0) {
                        const sitePassphrase = sitePassphraseInpt.value;
                        if (sitePassphrase.length > 0) {

                            const signupObj = {
                                sitePassword: sitePassphrase,
                                name: name,
                                password: password,
                                email: email,
                                titles,
                            }

                            const signupResponse = await fetch("/api/users/admin-signup", {
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

                                const signinResponse = await fetch("/api/users/signin", {
                                    method: "POST",
                                    body: JSON.stringify(signinObj),
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                });

                                if (signinResponse.ok) {
                                    location = "/user-timecard/";
                                } else {
                                    // Display a message saying that the automatic sign in didnt work, but the user is registered and to go to the normal sign in page to sign in
                                    displayMessage("The automatic sign in didn't work, however the user was registered. Please visit the sign in page to continue.");
                                }
                            } else {
                                // Display a message saying something went wrong and that you should try again
                                displayMessage("Something went wrong, please try again. If the problem continues, contact the site developer.")
                            }
                        } else {
                            displayMessage("Please enter the site passphrase.")
                        }
                    } else {
                        //display a message saying there should be an email
                        displayMessage("Please fill in the email input.")
                    }
                } else {
                    // Display a message saying there has to be a name
                    displayMessage("Please fill in the name input.")

                }
            } else {
                // Display a message saying the passwords dont match
                displayMessage("The passwords don't match.")

            }
        } else {
            // Display a message saying that there has to be a password
            displayMessage("Please fill in the password input.")
        }
    } else {
        // Display a message saying there has to be at least one title
        displayMessage("Please fill in at least one title.");
    }
}

signUpBtn.addEventListener("click", signupNewAdmin);