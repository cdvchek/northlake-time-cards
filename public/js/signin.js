const signInBtn = document.getElementById("btn-sign-in");

const signin = (e) => {
    e.preventDefault();
    location = "/user-timecard/"
}

signInBtn.addEventListener("click", signin);