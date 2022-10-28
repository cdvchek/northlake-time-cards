// Register New User from clicking register user
const registerUserBtn = document.getElementById("register-user");

const goToNewUser = (e) => {
    e.preventDefault();
    location = "/new-user/";
}

registerUserBtn.addEventListener("click", goToNewUser);

// Populating the Profile from clicking on a user 
const titlesUl = document.getElementById("ul-title");
const userDiv = document.getElementById("user-flex");
const nameH1 = document.getElementById("name-h1");
const emailSpan = document.getElementById("email-span");
const passwordInpt = document.getElementById("inpt-password");
const passwordConfirmInpt = document.getElementById("inpt-password-confirm");
const emailInpt = document.getElementById("inpt-email");
const emailConfirmInpt = document.getElementById("inpt-email-confirm");
const nameInpt = document.getElementById("inpt-name");
const nameConfirmInpt = document.getElementById("inpt-name-confirm");
let oldTitle = [];

const populateProfile = async (e) => {
    const userId = e.target.getAttribute('data-id');
    const user = await (await fetch('/api/user-id/' + userId)).json();
    const titleChildren = titlesUl.children;
    const titleChildrenLength = titleChildren.length
    for (let i = 0; i < titleChildrenLength; i++) {
        titleChildren[0].remove();
    }
    const titles = user.Titles;
    for (let numberOfTitles = 0; numberOfTitles < titles.length; numberOfTitles++) {
        const title = titles[numberOfTitles];
        oldTitle.push("");
        const outsideDiv = document.createElement("div");
        outsideDiv.setAttribute("class", "div-title");
        const insideDiv = document.createElement("div");
        insideDiv.setAttribute("contenteditable", "false");
        insideDiv.textContent = title.name;
        const editBtn = document.createElement("button");
        editBtn.setAttribute("data-order", numberOfTitles.toString());
        editBtn.setAttribute("class", "edit-title-btn");
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", editTitle);
        const removeBtn = document.createElement("button");
        removeBtn.setAttribute("data-order", numberOfTitles.toString());
        removeBtn.setAttribute("class", "remove-title-btn");
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", removeTitle);
        const cancelBtn = document.createElement("button");
        cancelBtn.setAttribute("data-order", numberOfTitles.toString());
        cancelBtn.setAttribute("class", "cancel-title-btn");
        cancelBtn.textContent = "Cancel";
        cancelBtn.addEventListener("click", cancelTitle);
        const saveBtn = document.createElement("button");
        saveBtn.setAttribute("class", "save-title-btn");
        saveBtn.setAttribute("data-id", user.user_id);
        saveBtn.textContent = "Save";
        saveBtn.addEventListener("click", saveTitle);

        outsideDiv.appendChild(insideDiv);
        outsideDiv.appendChild(editBtn);
        outsideDiv.appendChild(removeBtn);
        outsideDiv.appendChild(saveBtn);
        outsideDiv.appendChild(cancelBtn);

        titlesUl.appendChild(outsideDiv);
    }
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

// Editing a title
const editTitleBtns = document.getElementsByClassName("edit-title-btn");
for (let i = 0; i < editTitleBtns.length; i++) {
    oldTitle.push("");
}

const editTitle = (e) => {
    const children = e.target.parentNode.children;
    const editIndex = Number(e.target.getAttribute("data-order"));
    oldTitle[editIndex] = children[0].textContent;
    children[0].setAttribute("contenteditable", "true");
    children[1].style.display = "none";
    children[2].style.display = "none";
    children[3].style.display = "inline";
    children[4].style.display = "inline"
}

for (let i = 0; i < editTitleBtns.length; i++) {
    const editTitleBtn = editTitleBtns[i];
    editTitleBtn.addEventListener("click", editTitle);
}

// Cancelling a title
const cancelTitleBtns = document.getElementsByClassName("cancel-title-btn");

const cancelTitle = (e) => {
    const children = e.target.parentNode.children;
    const cancelIndex = Number(e.target.getAttribute("data-order"));
    children[0].setAttribute("contenteditable", "false");
    children[0].textContent = oldTitle[cancelIndex];
    children[1].style.display = "inline";
    children[2].style.display = "inline";
    children[3].style.display = "none";
    children[4].style.display = "none"
}

for (let i = 0; i < cancelTitleBtns.length; i++) {
    const cancelTitleBtn = cancelTitleBtns[i];
    cancelTitleBtn.addEventListener("click", cancelTitle);
}

// Removing a title
const removeTitleBtns = document.getElementsByClassName("remove-title-btn");

const removeTitle = (e) => {
    // Hit a route to remove the title from the database
    const removeIndex = Number(e.target.getAttribute("data-order"));
    e.target.parentNode.remove();
    oldTitle.splice(removeIndex, 1);
}

for (let i = 0; i < removeTitleBtns.length; i++) {
    const removeTitleBtn = removeTitleBtns[i];
    removeTitleBtn.addEventListener("click", removeTitle);
}

// Saving a title
const saveTitleBtns = document.getElementsByClassName("save-title-btn");

const saveTitle = (e) => {
    // Hit route to update the title
    const children = e.target.parentNode.children;
    children[0].setAttribute("contenteditable", "false");
    children[1].style.display = "inline";
    children[2].style.display = "inline";
    children[3].style.display = "none";
    children[4].style.display = "none"
}

for (let i = 0; i < saveTitleBtns.length; i++) {
    const saveTitleBtn = saveTitleBtns[i];
    saveTitleBtn.addEventListener("click", saveTitle);
}

// Adding a title
const addTitleBtn = document.getElementById("btn-add-title");
const addTitleInpt = document.getElementById("inpt-add-title");

const addTitle = async () => {
    const titleName = addTitleInpt.value;
    const userId = userDiv.getAttribute("data-id");

    const titleObj = {
        titleName,
        userId,
    }
    const addTitleResponse = await fetch("/api/title/", {
        method: 'POST',
        body: JSON.stringify(titleObj),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (addTitleResponse.ok) {
        oldTitle.push("");
        const outsideDiv = document.createElement("div");
        outsideDiv.setAttribute("class", "div-title");
        const insideDiv = document.createElement("div");
        insideDiv.setAttribute("contenteditable", "false");
        insideDiv.textContent = titleName;
        const editBtn = document.createElement("button");
        const numberOfTitles = titlesUl.children.length;
        editBtn.setAttribute("data-order", numberOfTitles.toString());
        editBtn.setAttribute("class", "edit-title-btn");
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", editTitle);
        const removeBtn = document.createElement("button");
        removeBtn.setAttribute("data-order", numberOfTitles.toString());
        removeBtn.setAttribute("class", "remove-title-btn");
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", removeTitle);
        const cancelBtn = document.createElement("button");
        cancelBtn.setAttribute("data-order", numberOfTitles.toString());
        cancelBtn.setAttribute("class", "cancel-title-btn");
        cancelBtn.textContent = "Cancel";
        cancelBtn.addEventListener("click", cancelTitle);
        const saveBtn = document.createElement("button");
        saveBtn.setAttribute("class", "save-title-btn");
        saveBtn.textContent = "Save";
        saveBtn.addEventListener("click", saveTitle);

        outsideDiv.appendChild(insideDiv);
        outsideDiv.appendChild(editBtn);
        outsideDiv.appendChild(removeBtn);
        outsideDiv.appendChild(saveBtn);
        outsideDiv.appendChild(cancelBtn);

        titlesUl.appendChild(outsideDiv);
        // Display message saying that it went ok
    } else {
        // Display message saying that something went wrong
    }
}

addTitleBtn.addEventListener("click", addTitle);