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
const viewTimeCardBtn = document.getElementById("btn-view-timecards");
const createTimeCardsBtn = document.getElementById("btn-create-timecards");
let oldTitle = [];

const populateProfile = async (e) => {
    const userId = e.target.getAttribute('data-id');
    viewTimeCardBtn.setAttribute("data-id", userId);
    createTimeCardsBtn.setAttribute("data-id", userId);
    const user = await (await fetch('/api/users/user-id/' + userId)).json();
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
        removeBtn.setAttribute("data-titleid", title.title_id.toString());
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
        saveBtn.setAttribute("data-titleid", title.title_id.toString());
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
                const changePasswordResponse = await fetch("/api/users/user-id/" + userId, {
                    method: 'PUT',
                    body: JSON.stringify(updateUserObj),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                if (changePasswordResponse.ok) {
                    // display password changed message
                    displayMessage("Password has been changed!");
                    passwordInpt.value = "";
                    passwordConfirmInpt.value = "";
                } else {
                    // display something went wrong
                    displayMessage("Something went wrong, please refresh and try again.");
                }
            } else {
                // display message saying the passwords need to be the same
                displayMessage("Passwords do not match.")
            }
        } else {
            // display message saying the password cant be set to nothing
            displayMessage("Please enter a password before changing.")
        }
    } else {
        // display message saying you need to select a user before updating a password
        displayMessage("Please select a user before changing passwords.")
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
                const changeEmailResponse = await fetch("/api/users/user-id/" + userId, {
                    method: 'PUT',
                    body: JSON.stringify(updateUserObj),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                if (changeEmailResponse.ok) {
                    // display password changed message
                    displayMessage("Email was changed!");
                    emailInpt.value = "";
                    emailConfirmInpt.value = "";
                } else {
                    // display something went wrong
                    displayMessage("Something went wrong, please refresh and try again.");
                }
            } else {
                // display message saying the passwords need to be the same
                displayMessage("Emails must match.");
            }
        } else {
            // display message saying the password cant be set to nothing
            displayMessage("Please enter an email.");
        }
    } else {
        // display message saying you need to select a user before updating a password
        displayMessage("Please select a user before changing an email.");
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
                const changeNameResponse = await fetch("/api/users/user-id/" + userId, {
                    method: 'PUT',
                    body: JSON.stringify(updateUserObj),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                if (changeNameResponse.ok) {
                    // display password changed message
                    displayMessage("Name was changed!");
                    nameInpt.value = "";
                    nameConfirmInpt.value = "";
                } else {
                    // display something went wrong
                    displayMessage("Something went wrong, please refresh and try again.");
                }
            } else {
                // display message saying the passwords need to be the same
                displayMessage("Names do not match.");
            }
        } else {
            // display message saying the password cant be set to nothing
            displayMessage("Please enter a name.");
        }
    } else {
        // display message saying you need to select a user before updating a password
        displayMessage("Please select a user before changing a name.");
    }
}

changeNameBtn.addEventListener("click", changeName);

// Deleting User by clicking delete user
const deleteUserBtn = document.getElementById("btn-delete-user");

const deleteUser = async () => {
    const userId = userDiv.getAttribute("data-id");
    if (userId !== null) {
        if (window.confirm("Are you sure you want to delete this User?\nIf you are logged in as this user, you will be logged out upon deletion.")) {
            const deleteUserResponse = await (await fetch("/api/users/user-id/" + userId, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json"
                }
            })).json();
            if (deleteUserResponse.hasDeletedSelf) {
                const logoutResponse = await fetch("/api/users/logout");
                if (logoutResponse.ok) {
                    location = "/"
                }
            } else {
                // display message that user has been deleted
                displayMessage("User has been deleted");
            }
        }
    } else {
        // display message saying you need to select a user before updating a password
        displayMessage("Please select a user before deleting");
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

const removeTitle = async (e) => {
    // Hit a route to remove the title from the database
    const titleId = e.target.getAttribute("data-titleid");
    const removeResponse = await fetch("/api/titles/title/" + titleId, {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (removeResponse.ok) {
        const removeIndex = Number(e.target.getAttribute("data-order"));
        e.target.parentNode.remove();
        oldTitle.splice(removeIndex, 1);
    } else {
        // display a message saying something went wrong
    }
}

for (let i = 0; i < removeTitleBtns.length; i++) {
    const removeTitleBtn = removeTitleBtns[i];
    removeTitleBtn.addEventListener("click", removeTitle);
}

// Saving a title
const saveTitleBtns = document.getElementsByClassName("save-title-btn");

const saveTitle = async (e) => {
    // Hit route to update the title
    const newName = e.target.parentNode.children[0].textContent;
    const updateTitleObj = {
        updateObj: {
            name: newName,
        }
    }
    const titleId = e.target.getAttribute("data-titleid");
    const saveTitleResponse = await fetch("/api/titles/title/" + titleId, {
        method: 'PUT',
        body: JSON.stringify(updateTitleObj),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (saveTitleResponse.ok) {
        const children = e.target.parentNode.children;
        children[0].setAttribute("contenteditable", "false");
        children[1].style.display = "inline";
        children[2].style.display = "inline";
        children[3].style.display = "none";
        children[4].style.display = "none";
    } else {
        // display a message saying something went wrong
    }
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
    const addTitleResponse = await fetch("/api/titles/title/", {
        method: 'POST',
        body: JSON.stringify(titleObj),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (addTitleResponse.ok) {
        const title = await addTitleResponse.json();
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
        removeBtn.setAttribute("data-titleid", title.title_id.toString());
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", removeTitle);
        const cancelBtn = document.createElement("button");
        cancelBtn.setAttribute("data-order", numberOfTitles.toString());
        cancelBtn.setAttribute("class", "cancel-title-btn");
        cancelBtn.textContent = "Cancel";
        cancelBtn.addEventListener("click", cancelTitle);
        const saveBtn = document.createElement("button");
        saveBtn.setAttribute("class", "save-title-btn");
        saveBtn.setAttribute("data-titleid", title.title_id.toString());
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

const viewTimeCards = async (e) => {
    const userId = e.target.getAttribute("data-id");

    if (userId !== null) {
        setupModalTimecards(userId);
    } else {
        displayMessage("Please select a user before viewing timecards.");
    }

}

viewTimeCardBtn.addEventListener("click", viewTimeCards);

const createTimeCards = async (e) => {
    if (window.confirm("You are trying to create timecards for a user. This will delete any timecards this user currently has and create new ones, do you wish to proceed?")) {
        const userId = e.target.getAttribute("data-id");
        console.log(userId);
        
        if (userId !== null) {
            const creationResponse = await fetch('/api/timecards/create-new/' + userId);
        } else {
            displayMessage("Please select a user before creating timecards.");
        }
    }
}

createTimeCardsBtn.addEventListener("click", createTimeCards);