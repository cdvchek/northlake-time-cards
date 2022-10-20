const timeCardBtn = document.getElementById("nav-time-card");
const historyBtn = document.getElementById("nav-history");
const approveBtn = document.getElementById("nav-super-approve");
const manageSupersBtn = document.getElementById("nav-admin-supervisors");
const manageUsersBtn = document.getElementById("nav-admin-users");
const helpBtn = document.getElementById("nav-admin-help");
const logoutBtn = document.getElementById("nav-logout");

const goToTimeCard = (e) => {
    e.preventDefault();
    location = "/user-timecard/";
}

const goToHistory = (e) => {
    e.preventDefault();
    location = "/user-history/";
}

const goToApprove = (e) => {
    e.preventDefault();
    location = "/super-approve/";
}

const goToManageSupers = (e) => {
    e.preventDefault();
    location = "/admin-managesupers/";
}

const goToManageUsers = (e) => {
    e.preventDefault();
    location = "/admin-manageusers/";
}

const goToLogout = (e) => {
    e.preventDefault();
    location = "/logout";
}

timeCardBtn.addEventListener("click", goToTimeCard);
historyBtn.addEventListener("click", goToHistory);
approveBtn.addEventListener("click", goToApprove);
manageSupersBtn.addEventListener("click", goToManageSupers);
manageUsersBtn.addEventListener("click", goToManageUsers);
logoutBtn.addEventListener("click", goToLogout);