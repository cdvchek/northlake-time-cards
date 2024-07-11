// Grabbing the tables
const weekOneTable = document.getElementById("week1");
const weekTwoTable = document.getElementById("week2");
// Iterable Week
const week = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// Helper Function
function setSelectedValue(selectObj, valueToSet) {
    for (var i = 0; i < selectObj.options.length; i++) {
        if (selectObj.options[i].value == valueToSet) {
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

// Grabbing the timecard div
const timecardDiv = document.getElementById("other-timecards");

// Grabbing the periodName
const periodNameEl = document.getElementById("period-name");

// Grabbing the titleName
const titleNameEl = document.getElementById("title-name");

// Grabbing the timecard title name if there are other titles
const titleNameTimecard = document.getElementById("title-name-timecard");

const populateTimecard = async (e) => {
    viewSelector.style.display = "none";
    setSelectedValue(viewSelector, "seperate");
    const superviseeId = e.target.getAttribute("data-id");
    const titleId = e.target.getAttribute("data-titleid");
    let timeperiod = "current"
    let periodNameShort;
    if (e.target.nodeName === "LI") {
        for (let i = 0; i < superviseeLis.length; i++) {
            const superviseeLi = superviseeLis[i];
            superviseeLi.setAttribute('class', 'supervisee');
        }
        e.target.setAttribute('class', 'supervisee active');
        selectTimePeriod.setAttribute("data-id", superviseeId);
        selectTimePeriod.setAttribute("data-titleid", titleId);
        setSelectedValue(selectTimePeriod, "current");
        periodNameShort = selectTimePeriod.getAttribute(`data-current`);
    } else {
        if (superviseeId === null) {
            return;
        }
        timeperiod = e.target.value;
        periodNameShort = selectTimePeriod.getAttribute(`data-${timeperiod}`);
    }
    const periodNameArr = periodNameShort.split("-");
    const periodName = `${periodNameArr[0]} - ${periodNameArr[1]}`;
    periodNameEl.textContent = periodName;
    // Fetching the Data
    const fetchString = `/api/timecards/timecard-period/${superviseeId}-${titleId}-${timeperiod}`;
    const timecardData = await (await fetch(fetchString)).json();
    const selectedTimecard = timecardData.selectedTimeCard;
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
    titleNameEl.textContent = selectedTimecard.titleName;
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
    
    // Removing the old other timecards
    const numberOfChildren = timecardDiv.children.length;
    for (let i = 0; i < numberOfChildren; i++) {
        const oldTable = timecardDiv.children[0];
        oldTable.remove();
    }

    titleNameTimecard.textContent = "";

    // Getting the dates
    const dates = {}
    for (let i = 0; i < 2; i++) {
        dates[`week${i + 1}`] = {};
        for (let j = 0; j < week.length; j++) {
            const day = week[j];
            dates[`week${i + 1}`][day] = selectTimePeriod.getAttribute(`data-${timeperiod.toLowerCase()}${day}${i + 1}`);
        }
    }

    // Setting the dates
    const headerRow1 = document.getElementById("header-week1");
    const headerRow2 = document.getElementById("header-week2");
    for (let i = 1; i <= week.length; i++) {
        const day = week[i - 1];
        const cell1 = headerRow1.children[i];
        const cell2 = headerRow2.children[i];
        cell1.innerHTML = `${cell1.innerHTML.split(" ")[0]} <br> ${dates.week1[day]}`;
        cell2.innerHTML = `${cell2.innerHTML.split(" ")[0]} <br> ${dates.week2[day]}`;
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
            const newPTOLabels = ["PTO Type", "PTO"];
            const extraRow = ["vacation", "sick"][j];
            const ptoTypes = ["None", "Vacation", "Sick", "Holiday", "Sabbatical", "Jury Duty", "Benevolence"];
            const newRow = document.createElement("tr");
            const labelCell = document.createElement("td");
            labelCell.textContent = newPTOLabels[j].charAt(0).toUpperCase() + newPTOLabels[j].slice(1);
            newRow.appendChild(labelCell);
            for (let k = 0; k < week.length; k++) {
                const day = week[k];
                const newCell = document.createElement("td");
                newCell.setAttribute("class", `${extraRow}-cell-${i + 1}`);
                if (j === 0) {
                    newCell.textContent = ptoTypes[selectedOffDay[`${day}_${extraRow}_${i + 1}`]];
                } else {
                    newCell.textContent = selectedOffDay[`${day}_${extraRow}_${i + 1}`];
                }
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

    // checking to see if there are other timecards and if so then displaying them underneath the other tables
    if (timecardData.otherTimecards.length > 0) {
        for (let v = 0; v < timecardData.otherTimecards.length; v++) {
            titleNameTimecard.textContent = selectedTimecard.titleName;
            const otherTimeCard = timecardData.otherTimecards[v];
            
            // Turn on the view selector
            viewSelector.style.display = "inline";

            const otherTitleNameEl = document.createElement("h3");
            otherTitleNameEl.textContent = otherTimeCard.titleName;

            timecardDiv.appendChild(otherTitleNameEl);
            
            const otherTitleTable1 = document.createElement("table");
            const otherTitleTable2 = document.createElement("table");
            
            const otherTitleTables = [otherTitleTable1, otherTitleTable2];
            for (let i = 0; i < otherTitleTables.length; i++) {
                const table = otherTitleTables[i];

                // Creating the header Row
                const headerRow = document.createElement("tr");
                const weekHeaderCell = document.createElement("th");
                weekHeaderCell.textContent = `Week ${i + 1}`;
                headerRow.appendChild(weekHeaderCell);
                for (let j = 0; j < week.length; j++) {
                    const day = week[j];
                    const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
                    const headerCell = document.createElement("th");
                    headerCell.innerHTML = `${dayCapitalized} <br> ${dates[`week${i + 1}`][day]}`;
                    headerRow.appendChild(headerCell);
                }
                const totalHeaderCell = document.createElement("th");
                totalHeaderCell.textContent = "Weekly Total";
                headerRow.appendChild(totalHeaderCell);
                table.appendChild(headerRow);

                const otherTimeCells = [];
                // Creating the timeinout rows
                const timeInOuts = otherTimeCard.TimeInOuts.filter((timeinout) => (timeinout.week === (i + 1)));
                for (let j = 0; j < timeInOuts.length; j++) {
                    const timeinout = timeInOuts[j];
                    const inoutArr = ["in", "out"];
                    for (let k = 0; k < inoutArr.length; k++) {
                        const inout = inoutArr[k];
                        const inoutCapitalized = inout.charAt(0).toUpperCase() + inout.slice(1);
                        const newRow = document.createElement("tr");
                        const labelCell = document.createElement("td");
                        labelCell.textContent = `Time ${inoutCapitalized}`;
                        newRow.appendChild(labelCell);
                        for (let l = 0; l < week.length; l++) {
                            const day = week[l];
                            const newCell = document.createElement("td");
                            newCell.setAttribute("class", `othertitle-${i + 1}-time`);
                            newCell.textContent = timeinout[`${day}_${inout}`];
                            newRow.appendChild(newCell);
                            otherTimeCells.push(newCell);
                        }
                        table.appendChild(newRow);
                    }
                }
                
                const otherSickCells = [];
                const otherVacationCells = [];
                const otherVacationSickTotals = [];
                // Creating the vacation and sick rows
                const newPTOLabels = ["PTO Type", "PTO"];
                const ptoTypes = ["None", "Vacation", "Sick", "Holiday", "Sabbatical", "Jury Duty", "Benevolence"];
                const vacationSickArr = ["vacation", "sick"];
                const offDay = otherTimeCard.OffDay;
                for (let j = 0; j < vacationSickArr.length; j++) {
                    const vacationSick = vacationSickArr[j];
                    const vacationSickCapitalized = newPTOLabels[j].charAt(0).toUpperCase() + newPTOLabels[j].slice(1);
                    const newRow = document.createElement("tr");
                    const labelCell = document.createElement("td");
                    labelCell.textContent = vacationSickCapitalized;
                    newRow.appendChild(labelCell);
                    for (let k = 0; k < week.length; k++) {
                        const day = week[k];
                        const newCell = document.createElement("td");
                        newCell.setAttribute("class", `othertitle-${i + 1}-${vacationSick}`);
                        if (j == 0) {
                            newCell.textContent = ptoTypes[offDay[`${day}_${vacationSick}_${i + 1}`]];
                        } else {
                            newCell.textContent = offDay[`${day}_${vacationSick}_${i + 1}`];
                        }
                        newRow.appendChild(newCell);
                        if (j === 0) {
                            otherVacationCells.push(newCell);
                        } else {
                            otherSickCells.push(newCell);
                        }
                    }
                    const totalCell = document.createElement("td");
                    totalCell.setAttribute("id", `othertitle-${i + 1}-${vacationSick}-total`);
                    newRow.appendChild(totalCell);
                    otherVacationSickTotals.push(totalCell);
                    table.appendChild(newRow);
                }

                const details = processTimeCard(otherTimeCells, otherVacationCells, otherSickCells);
                for (let j = 0; j < otherVacationSickTotals.length; j++) {
                    const vacationSickTotal = otherVacationSickTotals[j];
                    vacationSickTotal.textContent = details[vacationSickArr[j]];
                }

                // Creating the overtime and total rows
                const overtimeTotalArr = ["overtime", "total"];
                for (let j = 0; j < overtimeTotalArr.length; j++) {
                    const overtimeTotal = overtimeTotalArr[j];
                    const overtimeTotalCapitalized = overtimeTotal.charAt(0).toUpperCase() + overtimeTotal.slice(1)
                    let overtimeTotalPhrase = "Overtime";
                    if (j === 1) {
                        overtimeTotalPhrase = "Daily Total"
                    }
                    const newRow = document.createElement("tr");
                    const labelCell = document.createElement("td");
                    labelCell.textContent = overtimeTotalPhrase;
                    newRow.appendChild(labelCell);
                    for (let k = 0; k < week.length; k++) {
                        const day = week[k];
                        const newCell = document.createElement("td");
                        newCell.setAttribute("id", `othertitle-${day}-${overtimeTotal}-${i + 1}`);
                        newCell.textContent = details[`daily${overtimeTotalCapitalized}s`][k];
                        newRow.appendChild(newCell);
                    }
                    const totalCell = document.createElement("td");
                    totalCell.setAttribute("id", `othertitle-${i + 1}-weekly-${overtimeTotal}`);
                    totalCell.textContent = details[`weekly${overtimeTotalCapitalized}`];
                    newRow.appendChild(totalCell);
                    table.appendChild(newRow);
                }
                timecardDiv.appendChild(table);
            }
        }
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

const tabsEl = document.getElementsByClassName("tab");
const ulEls = document.getElementsByClassName("ul");

const showTab = (e) => {
    for (let i = 0; i < tabsEl.length; i++) {
        const tab = tabsEl[i];
        tab.setAttribute("class", "tab");
    }
    e.target.setAttribute("class", "tab active-tab");

    for (let i = 0; i < ulEls.length; i++) {
        const ul = ulEls[i];
        ul.setAttribute("class", "ul ul-hidden");
    }
    const ulId = e.target.getAttribute("data-tab");
    const ulEl = document.getElementById(ulId);

    ulEl.setAttribute("class", "ul");
}

for (let i = 0; i < tabsEl.length; i++) {
    const tab = tabsEl[i];
    tab.addEventListener("click", showTab);
}