if (location.pathname != "/") {
    location = "/";
}

const signInBtn = document.getElementById("btn-sign-in");
const passwordInpt = document.getElementById("inpt-password");
const emailInpt = document.getElementById("inpt-empl-id");

const signin = async (e) => {
    e.preventDefault();
    const password = passwordInpt.value;
    const email = emailInpt.value;
    const signinObj = {
        password,
        email,
    }
    const res = await fetch("/api/signin", {
        method: "POST",
        body: JSON.stringify(signinObj),
        headers: {
            "Content-Type": "application/json"
        },
    });
    console.log(res);
    if (res.ok) {
        location = "/user-timecard";
    } else {
        // Display wrong email or password message
        console.log("wrong email or password!");
    }
}

signInBtn.addEventListener("click", signin);