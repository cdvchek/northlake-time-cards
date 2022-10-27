// Register New User from clicking register user
const registerUserBtn = document.getElementById("register-user");

const goToNewUser = (e) => {
    e.preventDefault();
    location = "/new-user/";
}

registerUserBtn.addEventListener("click", goToNewUser);

// Populating the Profile from clicking on a user 
const userDiv = document.getElementById("user-flex");
const nameH1 = document.getElementById("name-h1");
const emailSpan = document.getElementById("email-span");
const passwordInpt = document.getElementById("inpt-password");
const passwordConfirmInpt = document.getElementById("inpt-password-confirm");
const emailInpt = document.getElementById("inpt-email");
const emailConfirmInpt = document.getElementById("inpt-email-confirm");
const nameInpt = document.getElementById("inpt-name");
const nameConfirmInpt = document.getElementById("inpt-name-confirm");

const populateProfile = async (e) => {
    const userId = e.target.getAttribute('data-id');
    const user = await (await fetch('/api/user-id/' + userId)).json();

    nameH1.textContent = user.name;
    emailSpan.textContent = user.email;
    userDiv.setAttribute("data-id", user.user_id);
    passwordInpt.value = "";
    passwordConfirmInpt.value = "";
}

const userLis = document.getElementsByClassName("user-li")

for (let i = 0; i < userLis.length; i++) {
    const userLi = userLis[i];
    userLi.addEventListener("click", populateProfile);
}

// Changing User Password from clicking change password
const changePasswordBtn = document.getElementById("btn-change-password");

const changePassword = async () => {
    const userId = userDiv.getAttribute("data-id");
    if (userId !== null) {
        const password = passwordInpt.value;
        if (password !== "") {
            const passwordConfirm = passwordConfirmInpt.value;
            if (password === passwordConfirm) {
                const updateUser = {
                    password: password,
                }
                const updateUserObj = {
                    user_id: userId,
                    updateUser: updateUser,
                }
                const changePasswordResponse = await fetch("/api/user-id/" + userId, {
                    method: 'PUT',
                    body: JSON.stringify(updateUserObj),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                if (changePasswordResponse.ok) {
                    // display password changed message
                    console.log("Password was changed");
                    passwordInpt.value = "";
                    passwordConfirmInpt.value = "";
                } else {
                    // display something went wrong
                    console.log("Something went wrong");
                }
            } else {
                // display message saying the passwords need to be the same
                console.log("Passwords do not match");
            }
        } else {
            // display message saying the password cant be set to nothing
            console.log("Passwords cannot be set to nothing");
        }
    } else {
        // display message saying you need to select a user before updating a password
        console.log("Select a user before changing a password");
    }
}

changePasswordBtn.addEventListener("click", changePassword);

// Changing User Email by clicking change email
const changeEmailBtn = document.getElementById("btn-change-email");

const changeEmail = async () => {
    const userId = userDiv.getAttribute("data-id");
    if (userId !== null) {
        const email = emailInpt.value;
        if (email !== "") {
            const emailConfirm = emailConfirmInpt.value;
            if (email === emailConfirm) {
                const updateUser = {
                    email: email,
                }
                const updateUserObj = {
                    user_id: userId,
                    updateUser: updateUser,
                }
                const changeEmailResponse = await fetch("/api/user-id/" + userId, {
                    method: 'PUT',
                    body: JSON.stringify(updateUserObj),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                if (changeEmailResponse.ok) {
                    // display password changed message
                    console.log("Email was changed");
                    emailInpt.value = "";
                    emailConfirmInpt.value = "";
                } else {
                    // display something went wrong
                    console.log("Something went wrong");
                }
            } else {
                // display message saying the passwords need to be the same
                console.log("Emails do not match");
            }
        } else {
            // display message saying the password cant be set to nothing
            console.log("Emails cannot be set to nothing");
        }
    } else {
        // display message saying you need to select a user before updating a password
        console.log("Select a user before changing an email");
    }
}

changeEmailBtn.addEventListener("click", changeEmail);

// Changing User Name by clicking change name
const changeNameBtn = document.getElementById("btn-change-name");

const changeName = async () => {
    const userId = userDiv.getAttribute("data-id");
    if (userId !== null) {
        const name = nameInpt.value;
        if (name !== "") {
            const nameConfirm = nameConfirmInpt.value;
            if (name === nameConfirm) {
                const updateUser = {
                    name: name,
                }
                const updateUserObj = {
                    user_id: userId,
                    updateUser: updateUser,
                }
                const changeNameResponse = await fetch("/api/user-id/" + userId, {
                    method: 'PUT',
                    body: JSON.stringify(updateUserObj),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                if (changeNameResponse.ok) {
                    // display password changed message
                    console.log("Name was changed");
                    nameInpt.value = "";
                    nameConfirmInpt.value = "";
                } else {
                    // display something went wrong
                    console.log("Something went wrong");
                }
            } else {
                // display message saying the passwords need to be the same
                console.log("Names do not match");
            }
        } else {
            // display message saying the password cant be set to nothing
            console.log("Names cannot be set to nothing");
        }
    } else {
        // display message saying you need to select a user before updating a password
        console.log("Select a user before changing a name");
    }
}

changeNameBtn.addEventListener("click", changeName);

// Deleting User by clicking delete user
const deleteUserBtn = document.getElementById("btn-delete-user");

const deleteUser = async () => {
    const userId = userDiv.getAttribute("data-id");
    if (userId !== null) {
        if (window.confirm("Are you sure you want to delete this User?\nIf you are logged in as this user, you will be logged out upon deletion.")) {
            const deleteUserResponse = await (await fetch("/api/user-id/" + userId, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json"
                }
            })).json();
            if (deleteUserResponse.hasDeletedSelf) {
                const logoutResponse = await fetch("/api/logout");
                if (logoutResponse.ok) {
                    location = "/"
                }
            } else {
                // display message that user has been deleted
                console.log("User has been deleted");
            }
        }
    } else {
        // display message saying you need to select a user before updating a password
        console.log("Select a user before deleting");
    }
}

deleteUserBtn.addEventListener("click", deleteUser);