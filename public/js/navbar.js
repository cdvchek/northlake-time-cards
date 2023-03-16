const navBar = document.getElementById("nav");
let isAdmin = false;
let isSuper = false;

if (navBar.getAttribute("issuper") == "true") {
    isSuper = true;
}
if (navBar.getAttribute("isadmin") == "true") {
    isAdmin = true;
}

const timeCardBtn = document.getElementById("nav-time-card");
const approveBtn = document.getElementById("nav-super-approve");
const manageSupersBtn = document.getElementById("nav-admin-supervisors");
const manageUsersBtn = document.getElementById("nav-admin-users");
const timePeriodsBtn = document.getElementById("nav-admin-timeperiods");
const submitTimeCardBtn = document.getElementById("nav-admin-submit");
// const helpBtn = document.getElementById("nav-admin-help");
const updatesBtn = document.getElementById("nav-user-updates");
const logoutBtn = document.getElementById("nav-logout");

const goToTimeCard = (e) => {
    e.preventDefault();
    location = "/user-timecard/";
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

const goToTimePeriods = (e) => {
    e.preventDefault();
    location = "/admin-timeperiods/";
}

const goToSubmitTimeCard = (e) => {
    e.preventDefault();
    location = "/admin-submittimecard/";
}

// const goToHelp = (e) => {
//     e.preventDefault();
//     location = "/help/";
// }

const goToUpdates = (e) => {
    e.preventDefault();
    location = "/user-updates/";
}

const goToLogout = async (e) => {
    e.preventDefault();
    const logout = await fetch("/api/users/logout");
    if (logout.ok) {
        location = "/";
    }
}

timeCardBtn.addEventListener("click", goToTimeCard);
if (isSuper) {
    approveBtn.addEventListener("click", goToApprove);
}
if (isAdmin) {
    manageSupersBtn.addEventListener("click", goToManageSupers);
    manageUsersBtn.addEventListener("click", goToManageUsers);
    timePeriodsBtn.addEventListener("click", goToTimePeriods);
    submitTimeCardBtn.addEventListener("click", goToSubmitTimeCard);
}
// helpBtn.addEventListener("click", goToHelp);
updatesBtn.addEventListener("click", goToUpdates);
logoutBtn.addEventListener("click", goToLogout);

const hamburgerBtn = document.getElementById("nav-hamburger");
let isMobileMenuOpen = false;

const toggleMobileMenu = () => {
    if (!isMobileMenuOpen) {
        // Opening the mobile menu
        navBar.setAttribute("class", "mobile");
    } else {
        // Closing the mobile menu
        navBar.removeAttribute("class");
    }
    isMobileMenuOpen = !isMobileMenuOpen;
}

hamburgerBtn.addEventListener("click", toggleMobileMenu);