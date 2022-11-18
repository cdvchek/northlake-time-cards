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

// Grabbing the ready span
const readySpan = document.getElementById("span-ready");

// Keeping track of the selected time card
let selectedTimeCard = -1;

// Grabbing the view selector
const viewSelector = document.getElementById("mult-title-select");

const populateTimecard = async (e) => {
    viewSelector.style.display = "none";
    setSelectedValue(viewSelector, "Seperate");
    const superviseeId = e.target.getAttribute("data-id");
    const titleId = e.target.getAttribute("data-titleid");
    let timeperiod = "current"
    if (e.target.nodeName === "LI") {
        selectTimePeriod.setAttribute("data-id", superviseeId);
        selectTimePeriod.setAttribute("data-titleid", titleId);
        setSelectedValue(selectTimePeriod, "Current Period");
    } else {
        if (superviseeId === undefined) {
            return;
        }
        timeperiod = e.target.value;
    }
    // Fetching the Data
    const timecardData = await (await fetch("/api/timecards/timecard-" + timeperiod + "/" + superviseeId + "-" + titleId)).json();
    const selectedTimecard = timecardData.selectedTimeCard;
    console.log(timecardData);
    if (selectedTimecard.isApproved) {
        approveBtnEl.setAttribute("class", "approved");
        approveBtnEl.textContent = "Unapprove";
    } else {
        approveBtnEl.setAttribute("class", "unapproved");
        approveBtnEl.textContent = "Approve";
    }
    if (selectedTimecard.isReadyToBeApproved) {
        readySpan.textContent = "Time Card Ready";
        readySpan.setAttribute("data-isready", "true");
    } else {
        readySpan.textContent = "Time Card Not Ready";
        readySpan.setAttribute("data-isready", "false");
    }
    selectedTimeCard = selectedTimecard.timecard_id;
    const weekOneTimeInOuts = selectedTimecard.TimeInOuts.filter((timeInOut) => (timeInOut.week === 1));
    const weekTwoTimeInOuts = selectedTimecard.TimeInOuts.filter((timeInOut) => (timeInOut.week === 2));
    const selectedOffDay = timecardData.selectedTimeCard.OffDay;

    // Removing the previous table data
    const weekTables = [weekOneTable, weekTwoTable];
    for (let i = 0; i < weekTables.length; i++) {
        const weekTable = weekTables[i];
        const tableLength = weekTable.rows.length;
        for (let j = 0; j < tableLength - 1; j++) {
            const row = weekTable.rows[1];
            row.remove();
        }
    }

    const weekTimeInOuts = [weekOneTimeInOuts, weekTwoTimeInOuts];
    const tables = [weekOneTable, weekTwoTable];
    for (let i = 0; i < weekTimeInOuts.length; i++) {
        const weekTimeInOut = weekTimeInOuts[i];
        
        for (let l = 0; l < weekTimeInOut.length; l++) {
            const timeInOut = weekTimeInOut[l];
            
            const tr1 = document.createElement("tr");
            const tr2 = document.createElement("tr");
            const newRowTimes = [tr1, tr2];
            const timeLabels = ["Time In", "Time Out"];
            const inout = ["in", "out"];
            
            for (let j = 0; j < newRowTimes.length; j++) {
                const newRowTime = newRowTimes[j];
                
                const timeLabelCell = document.createElement("td");
                timeLabelCell.textContent = timeLabels[j];
                newRowTime.appendChild(timeLabelCell);
                
                for (let k = 0; k < week.length; k++) {
                    const day = `${week[k]}_${inout[j]}`;
                    
                    const newCell = document.createElement("td");
                    newCell.setAttribute("class", `week-${i + 1}-time`);
                    newCell.textContent = timeInOut[day];
                    newRowTime.appendChild(newCell);
                }
                
                const newCell = document.createElement("td");
                newRowTime.appendChild(newCell);
                tables[i].appendChild(newRowTime);
            }
        }

        for (let j = 0; j < 2; j++) {
            const extraRow = ["vacation", "sick"][j];
            const newRow = document.createElement("tr");
            const labelCell = document.createElement("td");
            labelCell.textContent = extraRow.charAt(0).toUpperCase() + extraRow.slice(1);
            newRow.appendChild(labelCell);
            for (let k = 0; k < week.length; k++) {
                const day = week[k];
                const newCell = document.createElement("td");
                newCell.setAttribute("class", `${extraRow}-cell-${i + 1}`);
                newCell.textContent = selectedOffDay[`${day}_${extraRow}_${i + 1}`];
                newRow.appendChild(newCell);
            }
            const totalCell = document.createElement("td");
            totalCell.id = `${extraRow}-total-${i + 1}`;
            newRow.appendChild(totalCell);
            tables[i].appendChild(newRow);
        }

        const overtimeRow = document.createElement("tr");
        const overtimeCell = document.createElement("td");
        overtimeCell.textContent = "Overtime";
        overtimeRow.appendChild(overtimeCell);
        for (let j = 0; j < week.length; j++) {
            const day = week[j];
            const newCell = document.createElement("td");
            newCell.setAttribute("class", `overtime-cell-${i + 1}`);
            newCell.id = `${day}-overtime-${i + 1}`;
            overtimeRow.appendChild(newCell);
        }
        const overtimeTotalCell = document.createElement("td");
        overtimeTotalCell.id = `overtime-total-${i + 1}`;
        overtimeRow.appendChild(overtimeTotalCell);
        tables[i].appendChild(overtimeRow);

        const totalsRow = document.createElement("tr");
        for (let j = -1; j < week.length + 1; j++) {
            const newCell = document.createElement("td");
            if (j === -1) {
                newCell.textContent = "Daily Total";
            } else if (j === week.length) {
                newCell.setAttribute("id", `week-${i + 1}-total`);
            } else {
                const day = week[j];
                newCell.setAttribute("id", `${day}-${i + 1}-total`);
            }
            totalsRow.appendChild(newCell);
        }
        tables[i].appendChild(totalsRow);

        // checking to see if there are other timecards and if so then displaying them underneath the other tables
        if (timecardData.otherTimecards.length > 0) {
            // Turn on the view selector
            viewSelector.style.display = "inline";
        }
    }

    const timeCellsArr = [
        {
            timeCells: document.getElementsByClassName("week-1-time"),
            vacationCells: document.getElementsByClassName("vacation-cell-1"),
            sickCells: document.getElementsByClassName("sick-cell-1"),
        },
        {
            timeCells: document.getElementsByClassName("week-2-time"),
            vacationCells: document.getElementsByClassName("vacation-cell-2"),
            sickCells: document.getElementsByClassName("sick-cell-2"),
        }
    ]

    for (let i = 0; i < timeCellsArr.length; i++) {
        const timeCells = timeCellsArr[i].timeCells;
        const vacationCells = timeCellsArr[i].vacationCells;
        const sickCells = timeCellsArr[i].sickCells;
        const details = processTimeCard(timeCells, vacationCells, sickCells);
        for (let j = 0; j < week.length; j++) {
            const day = week[j];
            const overtimeCell = document.getElementById(`${day}-overtime-${i + 1}`);
            overtimeCell.textContent = details.dailyOvertimes[j];
            const dayTotal = document.getElementById(`${day}-${i + 1}-total`);
            dayTotal.textContent = details.dailyTotals[j];
        }
        const vacationTotal = document.getElementById(`vacation-total-${i + 1}`);
        vacationTotal.textContent = details.vacation;
        const sickTotal = document.getElementById(`sick-total-${i + 1}`);
        sickTotal.textContent = details.sick;
        const overtimeTotal = document.getElementById(`overtime-total-${i + 1}`);
        overtimeTotal.textContent = details.weeklyOvertime;
        const weeklyTotal = document.getElementById(`week-${i + 1}-total`);
        weeklyTotal.textContent = details.weeklyTotal;
    }
}

for (let i = 0; i < superviseeLis.length; i++) {
    const superviseeLi = superviseeLis[i];
    superviseeLi.addEventListener("click", populateTimecard);
}

selectTimePeriod.addEventListener("change", populateTimecard);

// Approving the time card
const approveTimeCard = async (e) => {
    if (selectedTimeCard !== -1) {
        const isReady = readySpan.getAttribute("data-isready");
        let approving = true;
        if (e.target.getAttribute("class") === "approved") {
            approving = false
        }
        if ((isReady === "true") || !approving) {
            const approveObj = {
                updateTimeCardObj: {
                    isApproved: approving,
                }
            }
            const approveResponse = await fetch("/api/timecards/timecard-status/" + selectedTimeCard.toString(), {
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
                displayMessage("Something went wrong!");
            }
        } else {
            if (window.confirm("The Time Card you are trying to approve has not been marked as ready. Once you approve this time card, it will lock and not be editable in the future.\nDo you wish to proceed?")) {
                let approving = true;
                if (e.target.getAttribute("class") === "approved") {
                    approving = false
                }
                const approveObj = {
                    updateTimeCardObj: {
                        isApproved: approving,
                    }
                }
                const approveResponse = await fetch("/api/timecards/timecard-status/" + selectedTimeCard.toString(), {
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
                    displayMessage("Something went wrong!");
                }
            }
        }
    } else {
        // display message to select a user before approving
    }
}

approveBtnEl.addEventListener("click", approveTimeCard);