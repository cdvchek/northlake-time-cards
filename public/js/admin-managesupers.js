// Allow the user to manage the supervisees of supervisors and to set employees as supervisors

    // Allow the user to set employees as supervisors

        // The user needs to be able to select an employee
        // After selecting an employee, the user needs to be able to toggle the supervisor status of the selected employee

    // Allow the user to manage the supervisees of supervisors

        // The user needs to be able to select an employee
        // After selecting an employee, if the employee is a supervisor, the user will be able to select from a new list of all employees, who will be supervisees under the selected employee as a supervisor


// IF YOU REFRESH EVERY TIME IT WORKS, GETTING IT TO WORK IN REAL TIME IS THE PROBLEM NOW GOOD LUCK FUTURE ME!!!!!!

let selectedEmployeeElement;
let selectedEmployeeData;

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
let noSuperEmployees = [];
let superEmployees = [];
let selectedSuperEmployees = [];
const sortEmployees = () => {

    noSuperEmployees = [];
    superEmployees = [];
    selectedSuperEmployees = [];

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
                // Assigning the correct supervisor status
                if (supervisorId === selectedEmployeeData.user_id) {
                    selectedSuperEmployees.push({ name: titleName, supervisor: supervisorName, supervisorId, superviseeId, titleId, supervisorStatus: "belongs" });
                } else {
                    superEmployees.push({ name: titleName, supervisor: supervisorName, supervisorId, superviseeId, titleId, supervisorStatus: "taken" });
                }
            } else {

                // Pushing to the correct array
                noSuperEmployees.push({ name: titleName, superviseeId, titleId, supervisorStatus: "none" });
            }
        });
    });
}

// Wrapper function
const fetchAllUsersWrapper = async () => {
    await fetchAllUsers();
}
fetchAllUsersWrapper();

// Function that is run when the supervisor status select is changed
const updateSupervisorStatus = async (e) => {

    // Find the id of the user we are updating
    const userId = selectedEmployeeData.user_id;

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

    // Based on the action and response, do certain things

    if (isSuper && response.ok) {
        // Showing that the selected employee is a supervisor on the first page where you select employees
        selectedEmployeeElement.children[0].textContent = "Supervisor";

        // Getting updated data
        fetchAllUsersWrapper();

        // Sorting the updated data
        sortEmployees();

        // Populate the supervisee list because the selected employee is now a supervisor
        populateSupervisees();
    }

    if (!isSuper && response.ok) {
        // Clearing the supervisor span from the li on the first page
        selectedEmployeeElement.children[0].textContent = "";

        // Clearing the supervisee list because the selected employee is no longer a supervisor
        while (superviseeUl.children.length > 0) {
            superviseeUl.children[0].remove();
        }
    }
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

    // Clear the lis
    while (superviseeUl.children.length > 0) {
        superviseeUl.children[0].remove();
    }

    // Update the selected employee data because it has changed
    selectedEmployeeData = await (await fetch('/api/users/user-id/' + selectedEmployeeData.user_id)).json();

    // Getting updated data
    await fetchAllUsersWrapper();

    // Re-sort the employees to reflect an updated list of supervisees
    sortEmployees();

    // Re populate the supervisees lis with updated data
    populateSupervisees();
}

// Function that populates the supervisee list
const populateSupervisees = () => {

    // First show the employees that are under the selected employee, then show employees who don't have a supervisor and after, employees who do have supervisors that are not the selected employee
    const superviseesList = [...selectedSuperEmployees, ...noSuperEmployees, ...superEmployees];

    superviseesList.forEach(entry => {
        // Creating the Li for the entry
        const newLi = document.createElement("li");

        // Adding the onclick event
        newLi.addEventListener("click", processSupervisee);
        
        // Adding the correct class
        if (entry.supervisorStatus === "belongs") {
            newLi.setAttribute("class", "supervisee");
        } else if (entry.supervisorStatus === "none") {
            newLi.setAttribute("class", "nosupervisee");
        } else {
            newLi.setAttribute("class", "othersupervisee");
        }

        newLi.setAttribute("data-superviseeid", entry.superviseeId);
        newLi.setAttribute("data-supervisorid", selectedEmployeeData.user_id);
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

    // Hiding the first page and displaying the second
    divEmployeeSelect.setAttribute("class", "hidden-div");
    divEmployeeManage.removeAttribute("class");

    // In case the user clicks on the supervisor span instead of the ul
    let target = e.target;
    if (e.target.nodeName === "SPAN") {
        target = e.target.parentNode;
    }

    // Getting the selected employee's id
    const employeeId = target.getAttribute("data-id");

    // Requesting the selected employees supervisees string to be cleaned
    await fetch("/api/supervising/clean-supervisees-string/" + employeeId, {
        method: "PUT",
        body: JSON.stringify({}),
        headers: {
            "Content-Type": "application/json"
        },
    });

    // Keeping tabs on the li that was clicked on
    selectedEmployeeElement = target;
    
    // Grabbing the employee data to see if the selected employee is a supervisor
    const employeeData = await (await fetch('/api/users/user-id/' + employeeId)).json();
    
    // Keeping tabs on the data of the selected employee
    selectedEmployeeData = employeeData;
    
    // Changing the name on the second page to reflect the selected employee
    nameTitle.textContent = employeeData.name;

    // Getting updated data
    await fetchAllUsersWrapper();

    // Sorting the employees for the supervisees list
    sortEmployees(employeeData.user_id);

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
        populateSupervisees();
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