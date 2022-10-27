// Grabbing the tables
const weekOneTable = document.getElementById("week1");
const weekTwoTable = document.getElementById("week2");
// Iterable Week
const week = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// Helper Function
function setSelectedValue(selectObj, valueToSet) {
    for (var i = 0; i < selectObj.options.length; i++) {
        if (selectObj.options[i].text == valueToSet) {
            selectObj.options[i].selected = true;
            return;
        }
    }
}

// Grabbing the User Lis
const superviseeLis = document.getElementsByClassName("supervisee");

// Grabbing the select time period
const selectTimePeriod = document.getElementById("week-choice");

// Grabbing the approve button
const approveBtnEl = document.getElementById("approve-btn");

// Keeping track of the selected time card
let selectedTimeCard = -1;

const populateTimecard = async (e) => {
    const superviseeId = e.target.getAttribute("data-id");
    let timeperiod = "current"
    if (e.target.nodeName === "LI") {
        selectTimePeriod.setAttribute("data-id", superviseeId);
        setSelectedValue(selectTimePeriod, "Current Period");
    } else {
        if (superviseeId === undefined) {
            return;
        }
        timeperiod = e.target.value;
    }
    // Fetching the Data
    const timecardData = await (await fetch("/api/timecard-" + timeperiod + "/" + superviseeId)).json();
    if (timecardData.isApproved) {
        approveBtnEl.setAttribute("class", "approved");
        approveBtnEl.textContent = "Unapprove";
    } else {
        approveBtnEl.setAttribute("class", "unapproved");
        approveBtnEl.textContent = "Approve";
    }
    selectedTimeCard = timecardData.timecard_id;
    const weekOneTimeInOuts = timecardData.TimeInOuts.filter((timeInOut) => (timeInOut.week === 1));
    const weekTwoTimeInOuts = timecardData.TimeInOuts.filter((timeInOut) => (timeInOut.week === 2));

    // Removing the previous table data
    const table1Length = weekOneTable.rows.length;
    for (let i = 1; i < table1Length; i++) {
        const row = weekOneTable.rows[1];
        row.remove();
    }
    const table2Length = weekTwoTable.rows.length;
    for (let i = 1; i < table2Length; i++) {
        const row = weekTwoTable.rows[1];
        row.remove();
    }

    // Setting up the week one table with the data
    for (let i = 0; i < weekOneTimeInOuts.length; i++) {
        const timeInOut = weekOneTimeInOuts[i];

        const newRowTimeIn = document.createElement("tr");
        // Time Ins
        for (let i = -1; i < week.length + 1; i++) {
            if (i === -1) {
                const newCell = document.createElement("td");
                newCell.textContent = "Time In";
                newRowTimeIn.appendChild(newCell);
            } else if (i === week.length) {
                const newCell = document.createElement("td");
                newRowTimeIn.appendChild(newCell);
            } else {
                const day = week[i] + "_in";
                const dayMilitaryValue = timeInOut[day]

                const newCell = document.createElement("td");
                newCell.setAttribute("data-military", dayMilitaryValue);
                newCell.setAttribute("class", "week-one-time")
                newCell.textContent = dayMilitaryValue;
                newRowTimeIn.appendChild(newCell);
            }
        }

        const newRowTimeOut = document.createElement("tr");
        // Time Outs
        for (let i = -1; i < week.length + 1; i++) {
            if (i === -1) {
                const newCell = document.createElement("td");
                newCell.textContent = "Time Out";
                newRowTimeOut.appendChild(newCell);
            } else if (i === week.length) {
                const newCell = document.createElement("td");
                newRowTimeOut.appendChild(newCell);
            } else {
                const day = week[i] + "_out";
                const dayMilitaryValue = timeInOut[day]

                const newCell = document.createElement("td");
                newCell.setAttribute("data-military", dayMilitaryValue);
                newCell.setAttribute("class", "week-one-time")
                newCell.textContent = dayMilitaryValue;
                newRowTimeOut.appendChild(newCell);
            }
        }

        weekOneTable.appendChild(newRowTimeIn);
        weekOneTable.appendChild(newRowTimeOut);
    }

    const totalsRow = document.createElement("tr");
    for (let i = -1; i < week.length + 1; i++) {
        const newCell = document.createElement("td");
        if (i === -1) {
            newCell.textContent = "Daily Total";
        } else if (i === week.length) {
            newCell.setAttribute("id", "week-one-total");
        } else {
            const day = week[i];
            newCell.setAttribute("id", day + "-one-total");
        }
        totalsRow.appendChild(newCell);
    }
    weekOneTable.appendChild(totalsRow);

    // Setting up the week two table with the data
    for (let i = 0; i < weekTwoTimeInOuts.length; i++) {
        const timeInOut = weekTwoTimeInOuts[i];

        const newRowTimeIn = document.createElement("tr");
        // Time Ins
        for (let i = -1; i < week.length + 1; i++) {
            if (i === -1) {
                const newCell = document.createElement("td");
                newCell.textContent = "Time In";
                newRowTimeIn.appendChild(newCell);
            } else if (i === week.length) {
                const newCell = document.createElement("td");
                newRowTimeIn.appendChild(newCell);
            } else {
                const day = week[i] + "_in";
                const dayMilitaryValue = timeInOut[day]

                const newCell = document.createElement("td");
                newCell.setAttribute("data-military", dayMilitaryValue);
                newCell.setAttribute("class", "week-two-time")
                newCell.textContent = dayMilitaryValue;
                newRowTimeIn.appendChild(newCell);
            }
        }

        const newRowTimeOut = document.createElement("tr");
        // Time Outs
        for (let i = -1; i < week.length + 1; i++) {
            if (i === -1) {
                const newCell = document.createElement("td");
                newCell.textContent = "Time Out";
                newRowTimeOut.appendChild(newCell);
            } else if (i === week.length) {
                const newCell = document.createElement("td");
                newRowTimeOut.appendChild(newCell);
            } else {
                const day = week[i] + "_out";
                const dayMilitaryValue = timeInOut[day]

                const newCell = document.createElement("td");
                newCell.setAttribute("data-military", dayMilitaryValue);
                newCell.setAttribute("class", "week-two-time")
                newCell.textContent = dayMilitaryValue;
                newRowTimeOut.appendChild(newCell);
            }
        }

        weekTwoTable.appendChild(newRowTimeIn);
        weekTwoTable.appendChild(newRowTimeOut);
    }

    const totalsRowTwo = document.createElement("tr");
    for (let i = -1; i < week.length + 1; i++) {
        const newCell = document.createElement("td");
        if (i === -1) {
            newCell.textContent = "Daily Total";
        } else if (i === week.length) {
            newCell.setAttribute("id", "week-two-total");
        } else {
            const day = week[i];
            newCell.setAttribute("id", day + "-two-total");
        }
        totalsRowTwo.appendChild(newCell);
    }
    weekTwoTable.appendChild(totalsRowTwo);

    const timeCells1 = document.getElementsByClassName("week-one-time");
    const details1 = processTimeCard(timeCells1);
    for (let i = 0; i < week.length; i++) {
        const day = week[i];
        const dayTotal = document.getElementById(day + "-one-total");
        dayTotal.textContent = details1.dailyTotals[i];
    }
    const weeklyTotal = document.getElementById("week-one-total");
    weeklyTotal.textContent = details1.weeklyTotal;

    const timeCells2 = document.getElementsByClassName("week-two-time");
    const details2 = processTimeCard(timeCells2);
    for (let i = 0; i < week.length; i++) {
        const day = week[i];
        const dayTotal = document.getElementById(day + "-two-total");
        dayTotal.textContent = details2.dailyTotals[i];
    }
    const weekly2Total = document.getElementById("week-two-total");
    weekly2Total.textContent = details2.weeklyTotal;
}

for (let i = 0; i < superviseeLis.length; i++) {
    const superviseeLi = superviseeLis[i];
    superviseeLi.addEventListener("click", populateTimecard);
}

selectTimePeriod.addEventListener("change", populateTimecard);

// Approving the time card
const approveTimeCard = async (e) => {
    if (selectedTimeCard !== -1) {
        let approving = true;
        if (e.target.getAttribute("class") === "approved") {
            approving = false
        }
        const approveObj = {
            updateTimeCardObj: {
                isApproved: approving,
            }
        }
        const approveResponse = await fetch("/api/timecard-status/" + selectedTimeCard.toString(), {
            method: "PUT",
            body: JSON.stringify(approveObj),
            headers: {
                "Content-Type": "application/json"
            },
        });

        if (approveResponse.ok) {
            // display message time card is approved
            if (approving) {
                approveBtnEl.setAttribute("class", "approved");
                approveBtnEl.textContent = "Unapprove";
            } else {
                approveBtnEl.setAttribute("class", "unapproved");
                approveBtnEl.textContent = "Approve";
            }
        } else {
            // display message something went wrong
            console.log("yikes");
        }
    } else {
        // display message to select a user before approving
    }
}

approveBtnEl.addEventListener("click", approveTimeCard);