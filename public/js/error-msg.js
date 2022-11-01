const errorMsgDiv = document.getElementById("error-msg-div");
const errorMsgP = document.getElementById("error-msg-p");
const errorMsgBtn = document.getElementById("error-msg-btn");

const closeMessage = () => {
    errorMsgDiv.style.display = "none";
}

errorMsgBtn.addEventListener("click", closeMessage);

const displayMessage = (string) => {
    errorMsgDiv.style.display = "inline";
    errorMsgP.textContent = string;
}