// Managing a supervisor's users
const manageUsersBtns = document.getElementsByClassName("manageusers");
const superviseesUl = document.getElementById("supervisees");
const notSuperviseesUl = document.getElementById("not-supervisees");
let selectedSupervisorId = "-1";

const addSupervisee = async (e) => {
    const superviseeId = e.target.getAttribute("data-id");
    const superviseeName = e.target.getAttribute("data-name").replaceAll("@", " ");

    const updateSuperviseesObj = {
        editType: "set",
        superviseeId: superviseeId,
    }

    const updateSuperviseesResponse = await fetch("/api/edit-supervisees/" + selectedSupervisorId, {
        method: 'PUT',
        body: JSON.stringify(updateSuperviseesObj),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (updateSuperviseesResponse.ok) {
        const newSupervisorLi = document.createElement("li");
        newSupervisorLi.setAttribute("data-id", superviseeId);
        newSupervisorLi.setAttribute("data-name", superviseeName.replaceAll(" ", "@"))
        newSupervisorLi.setAttribute("class", "yesSupervisee");
        newSupervisorLi.textContent = superviseeName;
        newSupervisorLi.addEventListener("click", removeSupervisee);

        superviseesUl.appendChild(newSupervisorLi);
        e.target.remove();
    } else {
        // Display a message saying something went wrong
    }
}

const removeSupervisee = async (e) => {
    const userId = e.target.getAttribute("data-id");
    const userName = e.target.getAttribute("data-name").replaceAll("@", " ");

    const updateSuperviseesObj = {
        editType: "remove",
        superviseeId: userId,
    }

    const updateSuperviseesResponse = await fetch("/api/edit-supervisees/" + selectedSupervisorId, {
        method: 'PUT',
        body: JSON.stringify(updateSuperviseesObj),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (updateSuperviseesResponse.ok) {
        const newUserLi = document.createElement("li");
        newUserLi.setAttribute("data-id", userId);
        newUserLi.setAttribute("data-name", userName.replaceAll(" ", "@"))
        newUserLi.setAttribute("class", "noSupervisee");
        newUserLi.textContent = userName;
        newUserLi.addEventListener("click", addSupervisee);


        notSuperviseesUl.appendChild(newUserLi);
        e.target.remove();
    } else {
        // Display a message saying something went wrong
    }
}

const manageUsers = async (e) => {
    const superviseesUlChildren = superviseesUl.children;
    const notSuperviseesUlChildren = notSuperviseesUl.children;
    const superviseesChildrenLength = superviseesUlChildren.length
    for (let i = 0; i < superviseesChildrenLength; i++) {
        superviseesUlChildren[0].remove();
    }
    const notSuperviseesChildrenLength = notSuperviseesUlChildren.length
    for (let i = 0; i < notSuperviseesChildrenLength; i++) {
        notSuperviseesUlChildren[0].remove();
    }


    const userId = e.target.getAttribute("data-id");
    selectedSupervisorId = userId;
    const users = await (await fetch("/api/users/")).json();
    const supervisees = (await (await fetch("/api/supervisees/" + userId)).json()).supervisees;
    const superviseesArray = supervisees.split(",");

    const readSupervisees = [];
    const readUsers = [];
    users.forEach((user) => {
        let isSupervisee = false;
        for (let i = 0; i < superviseesArray.length; i++) {
            if (user.user_id === Number(superviseesArray[i])) {
                isSupervisee = true;
                break;
            }
        };
        if (isSupervisee) {
            readSupervisees.push(user);
        } else {
            readUsers.push(user);
        }
    });

    for (let i = 0; i < readSupervisees.length; i++) {
        const supervisee = readSupervisees[i];

        const newLi = document.createElement("li");
        newLi.setAttribute("data-id", supervisee.user_id);
        newLi.setAttribute("data-name", supervisee.name.replaceAll(" ", "@"))
        newLi.setAttribute("class", "yesSupervisee");
        newLi.textContent = supervisee.name;
        newLi.addEventListener("click", removeSupervisee);

        superviseesUl.appendChild(newLi);
    }
    for (let i = 0; i < readUsers.length; i++) {
        const user = readUsers[i];

        const newLi = document.createElement("li");
        newLi.setAttribute("data-id", user.user_id);
        newLi.setAttribute("data-name", user.name.replaceAll(" ", "@"))
        newLi.setAttribute("class", "noSupervisee");
        newLi.textContent = user.name;
        newLi.addEventListener("click", addSupervisee);

        notSuperviseesUl.appendChild(newLi);
    }
}

for (let i = 0; i < manageUsersBtns.length; i++) {
    const manageUserBtn = manageUsersBtns[i];
    manageUserBtn.addEventListener("click", manageUsers);
}

// Making a user a supervisor
const addSuperBtns = document.getElementsByClassName("addsuper");

const addSuper = async (e) => {
    const userId = e.target.getAttribute("data-id");
    const updateUserObj = {
        updateUser: {
            isSuper: true,
        }
    }
    const setSuperResponse = await fetch("/api/user-id/" + userId, {
        method: 'PUT',
        body: JSON.stringify(updateUserObj),
        headers: {
            "Content-Type": "application/json"
        }
    });
    if (setSuperResponse.ok) {
        const parentLi = e.target.parentNode;
        const userName = parentLi.getAttribute("data-name").replace("@", " ");
        const userId = parentLi.getAttribute("data-id");
        parentLi.setAttribute("class", "yesSuper user");
        parentLi.innerHTML = `${userName}<button class="manageusers" data-id="${userId}">Manage Users</button><button class="setsuper removesuper" data-id="${userId}">Remove Supervisor</button>`;
        const [manageUsersBtn, removeSuperBtn] = parentLi.children;
        manageUsersBtn.addEventListener("click", manageUsers);
        removeSuperBtn.addEventListener("click", removeSuper);
    }
}

for (let i = 0; i < addSuperBtns.length; i++) {
    const addSuperBtn = addSuperBtns[i];
    addSuperBtn.addEventListener("click", addSuper);
}

// Removing a user as a supervisor
const removeSuperBtns = document.getElementsByClassName("removesuper");

const removeSuper = async (e) => {
    const userId = e.target.getAttribute("data-id");
    const updateUserObj = {
        updateUser: {
            isSuper: false,
        }
    }
    const removeSuperResponse = await fetch("/api/user-id/" + userId, {
        method: 'PUT',
        body: JSON.stringify(updateUserObj),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (removeSuperResponse.ok) {
        const parentLi = e.target.parentNode;
        const userName = parentLi.getAttribute("data-name").replace("@", " ");
        const userId = parentLi.getAttribute("data-id");
        parentLi.setAttribute("class", "noSuper user");
        parentLi.innerHTML = `${userName}<button class="setsuper addsuper" data-id="${userId}">Set Supervisor</button></li>`;
        const [addSuperBtn] = parentLi.children;
        addSuperBtn.addEventListener("click", addSuper);
    }
}

for (let i = 0; i < removeSuperBtns.length; i++) {
    const removeSuperBtn = removeSuperBtns[i];
    removeSuperBtn.addEventListener("click", removeSuper);
}