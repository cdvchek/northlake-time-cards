const addTitleBtn = document.getElementById("btn-add-title");
const titleDiv = document.getElementById("div-titles");

const removeTitle = (e) => {
    e.target.parentNode.remove();
}

const addTitle = () => {
    const newTitleDiv = document.createElement("div");
    newTitleDiv.setAttribute("class", "title");
    const newTitleP = document.createElement("p");
    newTitleP.setAttribute("class", "p-sign-up-cred");
    newTitleP.textContent = "Title";
    const newTitleInpt = document.createElement("input");
    newTitleInpt.setAttribute("class", "inpt-title inpt-sign-up");
    newTitleInpt.setAttribute("type", "text");
    newTitleInpt.setAttribute("placeholder", "Title");
    const newTitleRemoveBtn = document.createElement("button");
    newTitleRemoveBtn.setAttribute("class", "remove-title-btn");
    newTitleRemoveBtn.textContent = "X";
    newTitleRemoveBtn.addEventListener("click", removeTitle);
    newTitleDiv.appendChild(newTitleP);
    newTitleDiv.appendChild(newTitleInpt);
    newTitleDiv.appendChild(newTitleRemoveBtn);
    titleDiv.appendChild(newTitleDiv);
}

addTitleBtn.addEventListener("click", addTitle);