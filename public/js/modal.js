// Get the modal
const modal = document.getElementById("myModal");

// Get the modal Content
const modalContent = document.getElementById("modal-content");

// Get the <span> element that closes the modal
const closeModalSpan = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
// btn.onclick = function () {
//     modal.style.display = "block";
// }

// When the user clicks on <span> (x), close the modal
closeModalSpan.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

const setupModalTimecards = async (userId) => {
    const modalContentChildren = modalContent.children;
    const modalContentChildrenLength = modalContentChildren.length;
    for (let i = 0; i < modalContentChildrenLength; i++) {
        modalContentChildren[0].remove();
    }
    const user = await (await fetch('/api/users/user-id/' + userId)).json();
    const timecards = user.TimeCards;

    const tabsDiv = document.createElement("div");
    tabsDiv.setAttribute("class", "tab");
    for (let i = 0; i < timecards.length; i++) {
        const timecard = timecards[i];
        const buttonTab = document.createElement("button");
        let classString = "tablinks";
        if (i === 0) {
            classString = "tablinks active"
        }
        buttonTab.setAttribute("class", classString);
        buttonTab.setAttribute("onclick", "openTimeCard(event, '" + timecard.timecard_id.toString() + "')");
        buttonTab.textContent = timecard.timecard_id;
        tabsDiv.appendChild(buttonTab);
    }
    modalContent.appendChild(tabsDiv);

    for (let i = 0; i < timecards.length; i++) {
        const timecard = timecards[i];
        const tabcontentDiv = document.createElement("div");
        if (i === 0) {
            tabcontentDiv.style.display = "block";
        }
        tabcontentDiv.setAttribute("id", timecard.timecard_id.toString());
        tabcontentDiv.setAttribute("class", "tabcontent");
        const week = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const timeCardTable1 = document.createElement("table");
        const timeCardTable2 = document.createElement("table");
        const timeCardData = await (await fetch("/api/timecards/" + timecard.timecard_id.toString())).json();
        for (let l = 0; l < 2; l++) { // 2 weeks
            let timeCells = [];
            // Creating the Headers Row
            const headersRow = document.createElement("tr");
            const topLeftCell = document.createElement("th");
            topLeftCell.textContent = "Week " + (l + 1).toString();
            headersRow.appendChild(topLeftCell);
            for (let j = 0; j < week.length; j++) {
                const day = week[j];
                const useableDay = day.charAt(0).toUpperCase() + day.slice(1);
                const dayCell = document.createElement("th");
                dayCell.textContent = useableDay;
                headersRow.appendChild(dayCell);
            }
            const topRightCell = document.createElement("th");
            topRightCell.textContent = "Weekly Total";
            headersRow.appendChild(topRightCell);

            // Appending Headers Row
            if (l === 0) {
                timeCardTable1.appendChild(headersRow);
            } else {
                timeCardTable2.appendChild(headersRow);
            }

            // Creating the time in/out rows
            const weekTimeInOuts = timeCardData.TimeInOuts.filter((timeinout) => (timeinout.week === (l + 1)));
            for (let j = 0; j < weekTimeInOuts.length; j++) {
                const timeInOut = weekTimeInOuts[j];
                const timeInRow = document.createElement("tr");
                const timeInCell = document.createElement("td");
                timeInCell.textContent = "Time In";
                timeInRow.appendChild(timeInCell);
                for (let k = 0; k < week.length; k++) {
                    const day = week[k];
                    const value = timeInOut[day + "_in"];
                    const newCell = document.createElement("td");
                    newCell.textContent = value;
                    timeInRow.appendChild(newCell);
                    timeCells.push(newCell);
                }
                const timeInWeeklyTotalCell = document.createElement("td");
                timeInRow.appendChild(timeInWeeklyTotalCell);

                const timeOutRow = document.createElement("tr");
                const timeOutCell = document.createElement("td");
                timeOutCell.textContent = "Time Out";
                timeOutRow.appendChild(timeOutCell);
                for (let k = 0; k < week.length; k++) {
                    const day = week[k];
                    const value = timeInOut[day + "_out"];
                    const newCell = document.createElement("td");
                    newCell.textContent = value;
                    timeOutRow.appendChild(newCell);
                    timeCells.push(newCell);
                }
                const timeOutWeeklyTotalCell = document.createElement("td");
                timeOutRow.appendChild(timeOutWeeklyTotalCell);
                // Appending Headers Row
                if (l == 0) {
                    timeCardTable1.appendChild(timeInRow);
                    timeCardTable1.appendChild(timeOutRow);
                } else {
                    timeCardTable2.appendChild(timeInRow);
                    timeCardTable2.appendChild(timeOutRow);
                }
            }
            const details = processTimeCard(timeCells);

            // Creating the totals row
            const totalsRow = document.createElement("tr");
            const dailyTotalCell = document.createElement("td");
            dailyTotalCell.textContent = "Daily Total";
            totalsRow.appendChild(dailyTotalCell);
            for (let m = 0; m < week.length; m++) {
                const dayTotalCell = document.createElement("td");
                dayTotalCell.textContent = details.dailyTotals[m];
                totalsRow.appendChild(dayTotalCell);
            }
            const weeklyTotalCell = document.createElement("td");
            weeklyTotalCell.textContent = details.weeklyTotal;
            totalsRow.appendChild(weeklyTotalCell);
            if (l === 0) {
                timeCardTable1.appendChild(totalsRow);
            } else {
                timeCardTable2.appendChild(totalsRow);
            }
        }
        tabcontentDiv.appendChild(timeCardTable1);
        tabcontentDiv.appendChild(timeCardTable2);
        modalContent.appendChild(tabcontentDiv);
    }
    modal.style.display = "flex";
}

const openTimeCard = (e, value) => {
    // Get all elements with class="tabcontent" and hide them
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    const tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(value).style.display = "block";
    e.currentTarget.className += " active";
}