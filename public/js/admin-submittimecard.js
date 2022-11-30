const dropdowns = document.getElementsByClassName("dropdown");

const openDropDown = (e) => {
    let target = e.target;
    if (target.nodeName === "H3") {
        target = e.target.parentNode;
    }
    for (let i = 0; i < dropdowns.length; i++) {
        const dropdown = dropdowns[i];
        dropdown.setAttribute("class", "dropdown");
        const hideEl = document.getElementById(dropdown.getAttribute("data-id"));
        hideEl.style.display = "none";
    }

    for (let i = 0; i < dropdowns.length; i++) {
        const dropdown = dropdowns[i];
        const elementId = target.getAttribute("data-id");
        const sectionToShow = document.getElementById(elementId);
        if (dropdown.getAttribute("data-id") === elementId) {
            dropdown.setAttribute("class", "dropdown active");
            sectionToShow.style.display = "inline";
        }
    }

}

for (let i = 0; i < dropdowns.length; i++) {
    const dropdown = dropdowns[i];
    dropdown.addEventListener("click", openDropDown);
}

const timecardDisplays = document.getElementsByClassName("timecard-display");

const openTimeCardModal = (e) => {
    let target = e.target;
    if (target.nodeName === "SPAN") {
        target = e.target.parentNode;
    }
    const timecardId = target.getAttribute("data-id");
    const userId = target.getAttribute("data-userid")
    setupModalTimecards(userId, false, timecardId);
}

for (let i = 0; i < timecardDisplays.length; i++) {
    const timecardDisplay = timecardDisplays[i];
    timecardDisplay.addEventListener("click", openTimeCardModal)
}