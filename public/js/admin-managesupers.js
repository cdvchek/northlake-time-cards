const manageUsersBtns = document.getElementsByClassName("manageusers");
// Managing a supervisor's users
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


// IF YOU REFRESH EVERY TIME IT WORKS, GETTING IT TO WORK IN REAL TIME IS THE PROBLEM NOW GOOD LUCK FUTURE ME!!!!!


// Grabbing the two pages
const divEmployeeSelect = document.getElementById("employee-select");
const divEmployeeManage = document.getElementById("employee-manage");

// Grabbing the elements of the second page
const nameTitle = document.getElementById("employee-name");
const supervisorStatus = document.getElementById("supervisor-status-select");

// Grabbing each employee li that can be selected
const employeeList = document.getElementsByClassName("li-employee");

// Grabbing the supervisee list
const superviseeUl = document.getElementById("supervisee-list");

// Fetching all the users
let allEmployeeData;
const fetchAllUsers = async () => {
    allEmployeeData = await (await fetch('/api/users/users-all-title')).json();
}

// Helper function that finds the name of an employee based off their id
const findUser = (id) => {
    let user;
    for (let i = 0; i < allEmployeeData.length; i++) {
        const emplData = allEmployeeData[i];
        if (id === emplData.user_id) {
            user = emplData;
            break;
        }
    }
    if (user) {
        return user;
    } else {
        return 404;
    }
}

// Sorting the employees into employees who have a supervisor and those that do not
const noSuperEmployees = [];
const superEmployees = [];
const sortEmployees = () => {

    allEmployeeData.forEach(empl => {
        empl.Titles.forEach(title => {
            // Giving the employee a name
            const titleName = `${empl.name} - ${title.name}`;

            // Assigning variables for ease of reading
            const superviseeId = empl.user_id;
            const titleId = title.title_id;

            // Checking if the title has a supervisor
            if (title.supervisor_id) {

                // Finding the name of the supervisor
                const supervisor = findUser(title.supervisor_id);
                const supervisorName = supervisor.name;
                const supervisorId = supervisor.user_id;

                // Pushing to the correct array
                superEmployees.push({ name: titleName, supervisor: supervisorName, supervisorId, superviseeId, titleId });
            } else {

                // Pushing to the correct array
                noSuperEmployees.push({ name: titleName, superviseeId, titleId });
            }
        });
    });
}

// Wrapper function
const wrapper = async () => {
    await fetchAllUsers();
    sortEmployees();
}
wrapper();

// Function that is run when the supervisor status select is changed
const updateSupervisorStatus = async (e) => {

    // Find the id of the user we are updating
    const userId = e.target.getAttribute('data-id');

    // Determine if we are changing to a normal employee or to a supervisor
    let isSuper = true;
    if (e.target.value === "employee") {
        isSuper = false;
    }

    // Setup the fetch object
    const fetchObj = {
        isSuper,
        userId,
    }

    const response = await fetch("/api/supervising/add-remove-supervisor", {
        method: "PUT",
        body: JSON.stringify(fetchObj),
        headers: {
            "Content-Type": "application/json"
        },
    });
}

supervisorStatus.addEventListener("change", updateSupervisorStatus);

// Function that is run on click of a li on the second page
const processSupervisee = async (e) => {
    // Making sure the target is the li, not the span in the li
    let target = e.target;
    if (e.target.nodeName === "SPAN") {
        target = target.parentNode;
    }

    // Grabbing the supervisor, supervisee, and title ids
    const superviseeId = target.getAttribute("data-superviseeid");
    const supervisorId = target.getAttribute("data-supervisorid");
    const titleId = target.getAttribute("data-titleid");

    // Getting the supervisee type
    const targetType = target.getAttribute("class");

    switch (targetType) {
        case "supervisee":
            // This mean the user would like to remove the selected li as a supervisee
            const removeObj = {
                superviseeId,
                supervisorId,
                titleId,
            }
            
            await fetch("/api/supervising/remove-supervisee", {
                method: "PUT",
                body: JSON.stringify(removeObj),
                headers: {
                    "Content-Type": "application/json"
                },
            });
            break;

        case "nosupervisee":
            // This means the user would like to add the selected li as a supervisee
            const addObj = {
                superviseeId,
                supervisorId,
                titleId,
            }
            await fetch("/api/supervising/add-supervisee", {
                method: "PUT",
                body: JSON.stringify(addObj),
                headers: {
                    "Content-Type": "application/json"
                },
            });
            break;

        case "othersupervisee":
            // Prompt the user that adding the selected li will remove the selected li from their current supervisors list of supervisees and add it to the selected employees list of supervisees
            console.log("do a promt and other stuff");
            break;
    
        default:
            break;
    }

    // Grabbing the selectedEmployeeId
    const employeeId = target.parentNode.getAttribute("data-supervisorid");

    // Grabbing the employee data
    const employeeData = await (await fetch('/api/users/user-id/' + employeeId)).json();

    // Clear the lis
    while (superviseeUl.children.length > 0) {
        superviseeUl.children[0].remove();
    }

    // Re populate the supervisees lis with updated data
    populateSupervisees(employeeData.supervisees, Number(employeeId));
}

// Function that populates the supervisee list
const populateSupervisees = (supervisees, selectedEmployeeId) => {
    let superviseesList = [];

    // Clean the supervisees string
    while (supervisees[0] === ",") {
        supervisees = supervisees.substring(1, supervisees.length);
    }

    if (supervisees) {
        // First, show the selected employee's supervisees and display that the selected employee is the supervisor
        const selectedSupervisees = supervisees.split(",");
        selectedSupervisees.forEach(supervisee => {
            const idCombo = supervisee.split("-");
            const superviseeId = idCombo[0];
            const titleId = idCombo[1];
            const superviseeData = findUser(Number(superviseeId));
            superviseeData.Titles.forEach(title => {
                if (titleId == title.title_id) {
                    const superviseeName = `${superviseeData.name} - ${title.name}`;
                    const supervisorName = findUser(title.supervisor_id).name;
                    superviseesList.push({ name: superviseeName, supervisor: supervisorName , supervisorId: title.supervisor_id, superviseeId: superviseeData.user_id, titleId: title.title_id });
                }
            });
        });
    }

    // Create a new array of employees with supervisors that excludes the supervisees of the selected employer
    let excludingSuperEmployees = [];

    if (superviseesList.length > 0) {
        for (let i = 0; i < superEmployees.length; i++) {
            const superEmpl = superEmployees[i];
            for (let j = 0; j < superviseesList.length; j++) {
                const selectedSupervisee = superviseesList[j];
                if (superEmpl.supervisorId !== selectedSupervisee.supervisorId) {
                    excludingSuperEmployees.push(superEmpl);
                    break;
                }
            }
        }
    } else {
        excludingSuperEmployees = [...superEmployees];
    }

    // Then show employees who don't have a supervisor and after employees who do have supervisors
    superviseesList = [...superviseesList, ...noSuperEmployees, ...excludingSuperEmployees];
    console.log(superviseesList);

    superviseesList.forEach(entry => {
        //console.log(entry);
        // Creating the Li for the entry
        const newLi = document.createElement("li");

        // Adding the onclick event
        newLi.addEventListener("click", processSupervisee);
        
        // Adding the correct class
        if ((entry.supervisorId === selectedEmployeeId) && (entry.supervisorId !== undefined)) {
            newLi.setAttribute("class", "supervisee");
        } else if (!entry.supervisorId) {
            newLi.setAttribute("class", "nosupervisee");
        } else {
            newLi.setAttribute("class", "othersupervisee");
        }

        newLi.setAttribute("data-superviseeid", entry.superviseeId);
        newLi.setAttribute("data-supervisorid", selectedEmployeeId);
        newLi.setAttribute("data-titleid", entry.titleId);

        // Adding the name
        newLi.textContent = entry.name;

        // Adding the Supervisor name
        const supervisorSpan = document.createElement("span");
        supervisorSpan.setAttribute("class", "mark-super");
        supervisorSpan.textContent = entry.supervisor;

        // Appending the span to the li
        newLi.appendChild(supervisorSpan);

        // Appending the li to the ul
        superviseeUl.appendChild(newLi);
    });
}

// Changing to the employee manage div
const selectEmployee = async (e) => {
    const employeeId = e.target.getAttribute("data-id");

    // Hiding the first page and displaying the second
    divEmployeeSelect.setAttribute("class", "hidden-div");
    divEmployeeManage.removeAttribute("class");

    // Grabbing the employee data to see if the selected employee is a supervisor
    const employeeData = await (await fetch('/api/users/user-id/' + employeeId)).json();
    
    // Changing the name on the second page to reflect the selected employee
    nameTitle.textContent = employeeData.name;

    // Creating the two options for the supervisor status select
    const supervisorOption = document.createElement("option");
    const employeeOption = document.createElement("option");

    // Giving the options a value
    supervisorOption.setAttribute("value", "supervisor");
    employeeOption.setAttribute("value", "employee");

    // Giving the options readable text
    supervisorOption.textContent = "Supervisor";
    employeeOption.textContent = "Employee";

    // If the selected user is a supervisor, display that they are a supervisor in the dropdown and vise versa
    if (employeeData.isSuper) {
        supervisorStatus.appendChild(supervisorOption);
        supervisorStatus.appendChild(employeeOption);

        // Populate the supervisee list
        populateSupervisees(employeeData.supervisees, employeeData.user_id);
    } else {
        supervisorStatus.appendChild(employeeOption);
        supervisorStatus.appendChild(supervisorOption);
    }

    // Passing data through for later use
    supervisorStatus.setAttribute("data-id", employeeId);

    superviseeUl.setAttribute("data-supervisorid", employeeData.user_id);
}

// Adding the event listener to each employee li that can be selected
for (let i = 0; i < employeeList.length; i++) {
    const employeeLi = employeeList[i];
    employeeLi.addEventListener("click", selectEmployee);
}

// Grabbing the back button from the manage div
const backBtn = document.getElementById("back-btn");

// Changing to the employee select div
const goBack = () => {
    divEmployeeManage.setAttribute("class", "hidden-div");
    divEmployeeSelect.removeAttribute("class");

    // Clearing the select of any options
    while (supervisorStatus.children.length > 0) {
        supervisorStatus.children[0].remove();
    }

    // Clearing the supervisee ul
    while (superviseeUl.children.length > 0) {
        superviseeUl.children[0].remove();
    }

    // Changing the name on the second page to nothing so it looks better when selecting an employee from the first page
    nameTitle.textContent = "";
}

// Adding the event lister to the back button
backBtn.addEventListener("click", goBack);