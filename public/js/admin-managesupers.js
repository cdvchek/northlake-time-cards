// Managing a supervisor's users
const manageUsersBtns = document.getElementsByClassName("manageusers");
const superviseesUl = document.getElementById("supervisees");
const notSuperviseesUl = document.getElementById("not-supervisees");
let selectedSupervisorId = "-1";

const addSupervisee = async (e) => {
    const superviseeId = e.target.getAttribute("data-id");
    const superviseeName = e.target.getAttribute("data-name").replaceAll("@", " ");
    const titleId = e.target.getAttribute("data-titleid");

    const updateSuperviseesObj = {
        editType: "set",
        superviseeId: superviseeId,
        titleId,
    }

    const updateSuperviseesResponse = await fetch("/api/users/edit-supervisees/" + selectedSupervisorId, {
        method: 'PUT',
        body: JSON.stringify(updateSuperviseesObj),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (updateSuperviseesResponse.ok) {
        const newSupervisorLi = document.createElement("li");
        newSupervisorLi.setAttribute("data-id", superviseeId);
        newSupervisorLi.setAttribute("data-name", superviseeName.replaceAll(" ", "@"));
        newSupervisorLi.setAttribute("data-titleid", titleId);
        newSupervisorLi.setAttribute("class", "yesSupervisee");
        newSupervisorLi.textContent = e.target.textContent;
        newSupervisorLi.addEventListener("click", removeSupervisee);

        superviseesUl.appendChild(newSupervisorLi);
        e.target.remove();
    } else {
        displayMessage("Something went wrong, please refresh and try again if the issue isn't fixed.")
    }
}

const removeSupervisee = async (e) => {
    const userId = e.target.getAttribute("data-id");
    const userName = e.target.getAttribute("data-name").replaceAll("@", " ");
    const titleId = e.target.getAttribute("data-titleid");

    const updateSuperviseesObj = {
        editType: "remove",
        superviseeId: userId,
        titleId,
    }

    const updateSuperviseesResponse = await fetch("/api/users/edit-supervisees/" + selectedSupervisorId, {
        method: 'PUT',
        body: JSON.stringify(updateSuperviseesObj),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (updateSuperviseesResponse.ok) {
        const newUserLi = document.createElement("li");
        newUserLi.setAttribute("data-id", userId);
        newUserLi.setAttribute("data-name", userName.replaceAll(" ", "@"));
        newUserLi.setAttribute("data-titleid", titleId);
        newUserLi.setAttribute("class", "noSupervisee");
        newUserLi.textContent = e.target.textContent;
        newUserLi.addEventListener("click", addSupervisee);

        notSuperviseesUl.appendChild(newUserLi);
        e.target.remove();
    } else {
        displayMessage("Something went wrong, please refresh and try again if the issue isn't fixed.")
    }
}

const manageUsers = async (e) => {
    const ulChildren = e.target.parentNode.parentNode.children;
    for (let i = 0; i < ulChildren.length; i++) {
        const supervisor = ulChildren[i];
        const supervisorClass = supervisor.getAttribute("class");
        const newClass = supervisorClass.replace(" selectedSupervisor", "");
        supervisor.setAttribute("class", newClass);
    }
    const targetClass = e.target.parentNode.getAttribute("class");
    e.target.parentNode.setAttribute("class", targetClass + " selectedSupervisor");

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
    const users = await (await fetch("/api/users/users-titles/")).json();
    const supervisees = (await (await fetch("/api/users/supervisees/" + userId)).json()).supervisees;
    const superviseesArray = supervisees.split(",");

    const readSupervisees = [];
    const readUsers = [];
    users.forEach((user) => {
        // determine if the user has a supervisor already
        let hasSuper = false;
        let selectedTitle;
        for (let k = 0; k < user.Titles.length; k++) {
            const title = user.Titles[k];
            if (user.titleId === title.title_id) {
                selectedTitle = title;
            }
        }
        if (selectedTitle.supervisor_id !== null) {
            hasSuper = true;
        }

        let isSupervisee = false;
        for (let i = 0; i < superviseesArray.length; i++) {
            const superviseeId = Number(superviseesArray[i].split("-")[0]);
            if (user.user_id === superviseeId) {
                const superviseeTitleId = superviseesArray[i].split("-")[1];
                if (user.titleId === Number(superviseeTitleId)) {
                    isSupervisee = true;
                }
            }
        };   
        if (isSupervisee) {
            readSupervisees.push(user);
        } else if (!hasSuper) {
            readUsers.push(user);
        }
    });

    for (let i = 0; i < readSupervisees.length; i++) {
        const supervisee = readSupervisees[i];

        const newLi = document.createElement("li");
        newLi.setAttribute("data-id", supervisee.user_id);
        newLi.setAttribute("data-name", supervisee.name.replaceAll(" ", "@"))
        newLi.setAttribute("data-titleid", supervisee.titleId);
        newLi.setAttribute("class", "yesSupervisee");
        if (supervisee.multTitle) {
            newLi.textContent = supervisee.name + " - " + supervisee.titleName;
        } else {
            newLi.textContent = supervisee.name;
        }
        newLi.addEventListener("click", removeSupervisee);

        superviseesUl.appendChild(newLi);
    }
    for (let i = 0; i < readUsers.length; i++) {
        const user = readUsers[i];

        const newLi = document.createElement("li");
        newLi.setAttribute("data-id", user.user_id);
        newLi.setAttribute("data-name", user.name.replaceAll(" ", "@"));
        newLi.setAttribute("data-titleid", user.titleId);
        newLi.setAttribute("class", "noSupervisee");
        if (user.multTitle) {
            newLi.textContent = user.name + " - " + user.titleName;
        } else {
            newLi.textContent = user.name;
        }
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
    const setSuperResponse = await fetch("/api/users/user-id/" + userId, {
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
    } else {
        displayMessage("Something went wrong, please refresh and try again if the issue isn't fixed.")
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
    const removeSuperResponse = await fetch("/api/users/user-id/" + userId, {
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
    } else {
        displayMessage("Something went wrong, please refresh and try again if the issue isn't fixed.")
    }
}

for (let i = 0; i < removeSuperBtns.length; i++) {
    const removeSuperBtn = removeSuperBtns[i];
    removeSuperBtn.addEventListener("click", removeSuper);
}

// Allow the user to manage the supervisees of supervisors and to set employees as supervisors

    // Allow the user to set employees as supervisors

        // The user needs to be able to select an employee
        // After selecting an employee, the user needs to be able to toggle the supervisor status of the selected employee

    // Allow the user to manage the supervisees of supervisors

        // The user needs to be able to select an employee
        // After selecting an employee, if the employee is a supervisor, the user will be able to select from a new list of all employees, who will be supervisees under the selected employee as a supervisor


// Grabbing the two pages
const divEmployeeSelect = document.getElementById("employee-select");
const divEmployeeManage = document.getElementById("employee-manage");

// Grabbing the elements of the second page
const nameTitle = document.getElementById("employee-name");
const supervisorStatus = document.getElementById("supervisor-status-select");

// Grabbing each employee li that can be selected
const employeeLis = document.getElementsByClassName("li-employee");

// Changing to the employee manage div
const selectEmployee = async (e) => {
    const employeeId = e.target.getAttribute("data-id");
    console.log(employeeId);

    // Hiding the first page and displaying the second
    divEmployeeSelect.setAttribute("class", "hidden-div");
    divEmployeeManage.removeAttribute("class");

    // Changing the name on the second page to reflect the selected employee
    const employeeName = e.target.innerHTML.split("<span")[0];
    nameTitle.textContent = employeeName;

    // Creating the two options for the supervisor status select
    const supervisorOption = document.createElement("option");
    const employeeOption = document.createElement("option");

    // Giving the options a value
    supervisorOption.setAttribute("value", "supervisor");
    employeeOption.setAttribute("value", "employee");

    // Giving the options readable text
    supervisorOption.textContent = "Supervisor";
    employeeOption.textContent = "Employee";

    // Grabbing the employee data to see if the selected employee is a supervisor
    const employeeData = await (await fetch('/api/users/user-id/' + employeeId)).json();
    
    // Clearing the select of any options
    while (supervisorStatus.children.length > 0) {
        supervisorStatus.children[0].remove();
    }
    
    // If the selected user is a supervisor, display that they are a supervisor in the dropdown and vise versa
    if (employeeData.isSuper) {
        supervisorStatus.appendChild(supervisorOption);
        supervisorStatus.appendChild(employeeOption);
    } else {
        supervisorStatus.appendChild(employeeOption);
        supervisorStatus.appendChild(supervisorOption);
    }
}

// Adding the event listener to each employee li that can be selected
for (let i = 0; i < employeeLis.length; i++) {
    const employeeLi = employeeLis[i];
    employeeLi.addEventListener("click", selectEmployee);
}

// Grabbing the back button from the manage div
const backBtn = document.getElementById("back-btn");

// Changing to the employee select div
const goBack = () => {
    divEmployeeManage.setAttribute("class", "hidden-div");
    divEmployeeSelect.removeAttribute("class");
}

// Adding the event lister to the back button
backBtn.addEventListener("click", goBack);