const timecardEls = document.getElementsByClassName("timecard");
const timecardsDiv = document.getElementById("timecards-div");
const hasTimeCard = timecardsDiv.getAttribute("data-timecard");
const weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

if (hasTimeCard === "true") {
    const grabTotals = (timecardId) => {
        return {
            weekOne: {
                total: document.getElementById("weekly-total-1-" + timecardId),
                sunday: document.getElementById("total-1-sunday-" + timecardId),
                monday: document.getElementById("total-1-monday-" + timecardId),
                tuesday: document.getElementById("total-1-tuesday-" + timecardId),
                wednesday: document.getElementById("total-1-wednesday-" + timecardId),
                thursday: document.getElementById("total-1-thursday-" + timecardId),
                friday: document.getElementById("total-1-friday-" + timecardId),
                saturday: document.getElementById("total-1-saturday-" + timecardId),
                vacation: document.getElementById("weekly-vacation-1-" + timecardId),
                sick: document.getElementById("weekly-sick-1-" + timecardId),
                overtime: document.getElementById("weekly-overtime-1-" + timecardId),
                sunday_ot: document.getElementById("overtime-1-sunday-" + timecardId),
                monday_ot: document.getElementById("overtime-1-monday-" + timecardId),
                tuesday_ot: document.getElementById("overtime-1-tuesday-" + timecardId),
                wednesday_ot: document.getElementById("overtime-1-wednesday-" + timecardId),
                thursday_ot: document.getElementById("overtime-1-thursday-" + timecardId),
                friday_ot: document.getElementById("overtime-1-friday-" + timecardId),
                saturday_ot: document.getElementById("overtime-1-saturday-" + timecardId),
            },
            weekTwo: {
                total: document.getElementById("weekly-total-2-" + timecardId),
                sunday: document.getElementById("total-2-sunday-" + timecardId),
                monday: document.getElementById("total-2-monday-" + timecardId),
                tuesday: document.getElementById("total-2-tuesday-" + timecardId),
                wednesday: document.getElementById("total-2-wednesday-" + timecardId),
                thursday: document.getElementById("total-2-thursday-" + timecardId),
                friday: document.getElementById("total-2-friday-" + timecardId),
                saturday: document.getElementById("total-2-saturday-" + timecardId),
                vacation: document.getElementById("weekly-vacation-2-" + timecardId),
                sick: document.getElementById("weekly-sick-2-" + timecardId),
                overtime: document.getElementById("weekly-overtime-2-" + timecardId),
                sunday_ot: document.getElementById("overtime-2-sunday-" + timecardId),
                monday_ot: document.getElementById("overtime-2-monday-" + timecardId),
                tuesday_ot: document.getElementById("overtime-2-tuesday-" + timecardId),
                wednesday_ot: document.getElementById("overtime-2-wednesday-" + timecardId),
                thursday_ot: document.getElementById("overtime-2-thursday-" + timecardId),
                friday_ot: document.getElementById("overtime-2-friday-" + timecardId),
                saturday_ot: document.getElementById("overtime-2-saturday-" + timecardId),
            }
        }
    }

    const grabTimeCells = (timecardId) => {
        return {
            weekOne: {
                timeCells: document.getElementsByClassName("1-" + timecardId),
                vacationCells: document.getElementsByClassName("vacation-1-" + timecardId),
                sickCells: document.getElementsByClassName("sick-1-" + timecardId),
            },
            weekTwo: {
                timeCells: document.getElementsByClassName("2-" + timecardId),
                vacationCells: document.getElementsByClassName("vacation-2-" + timecardId),
                sickCells: document.getElementsByClassName("sick-2-" + timecardId),
            }
        }
    }

    const updateTotals = (timeCellEls, totalsEls, type) => { // type can be "input" or "cell"
        const weekOneTotals = processTimeCard(timeCellEls.weekOne.timeCells, timeCellEls.weekOne.vacationCells, timeCellEls.weekOne.sickCells, type);

        totalsEls.weekOne.total.textContent = weekOneTotals.weeklyTotal;
        totalsEls.weekOne.overtime.textContent = weekOneTotals.weeklyOvertime;
        for (let i = 0; i < weekDays.length; i++) {
            const weekDay = weekDays[i];
            totalsEls.weekOne[weekDay].textContent = weekOneTotals.dailyTotals[i];
            totalsEls.weekOne[`${weekDay}_ot`].textContent = weekOneTotals.dailyOvertimes[i];
        }
        totalsEls.weekOne.vacation.textContent = weekOneTotals.vacation;
        totalsEls.weekOne.sick.textContent = weekOneTotals.sick;

        const weekTwoTotals = processTimeCard(timeCellEls.weekTwo.timeCells, timeCellEls.weekTwo.vacationCells, timeCellEls.weekTwo.sickCells, type);

        totalsEls.weekTwo.total.textContent = weekTwoTotals.weeklyTotal;
        totalsEls.weekTwo.overtime.textContent = weekTwoTotals.weeklyOvertime;
        for (let i = 0; i < weekDays.length; i++) {
            const weekDay = weekDays[i];
            totalsEls.weekTwo[weekDay].textContent = weekTwoTotals.dailyTotals[i];
            totalsEls.weekTwo[`${weekDay}_ot`].textContent = weekTwoTotals.dailyOvertimes[i];
        }
        totalsEls.weekTwo.vacation.textContent = weekTwoTotals.vacation;
        totalsEls.weekTwo.sick.textContent = weekTwoTotals.sick;
    }

    const updateTimeCell = async (e, timecardId) => {
        const order = e.target.getAttribute("data-order");
        const day = e.target.getAttribute("data-day");
        const inout = e.target.getAttribute("data-inout");
        const week = e.target.getAttribute("data-week");
        const value = e.target.value;
        const updateObj = {
            order,
            key: `${day}_${inout}`,
            week,
            timecardId,
            value
        }

        const updateResponse = await fetch("/api/timecards/timecard", {
            method: "PUT",
            body: JSON.stringify(updateObj),
            headers: {
                "Content-Type": "application/json"
            },
        });

        return updateResponse;
    }

    const newUpdate = async (e) => {
        const timecardId = e.target.getAttribute("data-timecardid");
        const response = await updateTimeCell(e, timecardId);

        if (response.ok) {
            const timeCellEls = grabTimeCells(timecardId);
            const totalsEls = grabTotals(timecardId);
            updateTotals(timeCellEls, totalsEls, "input");
        } else {
            displayMessage("Something went wrong, please refresh and try again.")
        }
    }

    const updateOffDayCell = async (e, timecardId) => {
        const value = e.target.value;
        const key = e.target.id;
        const updateObj = {
            key,
            value,
            timecardId,
        }

        const updateResponse = await fetch("/api/timecards/timecard-offday", {
            method: "PUT",
            body: JSON.stringify(updateObj),
            headers: {
                "Content-Type": "application/json"
            },
        });

        return updateResponse;
    }

    const offDayUpdate = async (e) => {
        const timecardId = e.target.getAttribute("data-timecardid");
        const response = await updateOffDayCell(e, timecardId);

        if (response.ok) {
            const timeCellEls = grabTimeCells(timecardId);
            const totalsEls = grabTotals(timecardId);
            updateTotals(timeCellEls, totalsEls, "input");
        } else {
            displayMessage("Something went wrong, please refresh and try again.");
        }
    }

    const initializeTimeCards = () => {
        for (let i = 0; i < timecardEls.length; i++) {
            const id = timecardEls[i].getAttribute("data-timecardid");
            const timeCells = grabTimeCells(id);
            const totals = grabTotals(id);

            // If the timecard is not approved add the event listener to timecells
            const timecardDiv = timecardEls[i];
            if (timecardDiv.getAttribute("data-isapproved") === "false") {
                for (let j = 0; j < timeCells.weekOne.timeCells.length; j++) {
                    const timecell = timeCells.weekOne.timeCells[j];
                    timecell.addEventListener("change", newUpdate);
                }
                for (let j = 0; j < timeCells.weekTwo.timeCells.length; j++) {
                    const timecell = timeCells.weekTwo.timeCells[j];
                    timecell.addEventListener("change", newUpdate);
                }
                for (let j = 0; j < timeCells.weekOne.sickCells.length; j++) {
                    const sickCell1 = timeCells.weekOne.sickCells[j];
                    const sickCell2 = timeCells.weekTwo.sickCells[j];
                    const vacationCell1 = timeCells.weekOne.vacationCells[j];
                    const vacationCell2 = timeCells.weekTwo.vacationCells[j];
                    sickCell1.addEventListener("change", offDayUpdate);
                    sickCell2.addEventListener("change", offDayUpdate);
                    vacationCell1.addEventListener("change", offDayUpdate);
                    vacationCell2.addEventListener("change", offDayUpdate);
                }
                updateTotals(timeCells, totals, "input");
            } else {
                updateTotals(timeCells, totals);
            }
        }
    }

    initializeTimeCards();

    const titleSelector = document.getElementById("title-select");
    const periodSelector = document.getElementById("period-select");
    const readyBtn = document.getElementById("ready-btn");
    const unreadyBtn = document.getElementById("unready-btn");

    const showCorrectTimeCard = () => {
        for(let i = 0; i < timecardEls.length; i++) {
            const timecardEl = timecardEls[i];
            timecardEl.setAttribute("class", "hidden-timecard timecard");
        }

        const titleId = titleSelector.value;
        const periodId = periodSelector.value;

        const idToFind = `${periodId}-${titleId}`;
        const newShownTimecard = document.getElementById(idToFind);
        newShownTimecard.setAttribute("class", "shown-timecard timecard");
        if (newShownTimecard.getAttribute("data-isready") === "true") {
            readyBtn.setAttribute("class", "hide ready-btn");
            unreadyBtn.setAttribute("class", "show ready-btn");
        } else {
            readyBtn.setAttribute("class", "show ready-btn");
            unreadyBtn.setAttribute("class", "hide ready-btn");
        }
    }

    titleSelector.addEventListener("change", showCorrectTimeCard);
    periodSelector.addEventListener("change", showCorrectTimeCard);

    const readyTimeCard = async (e) => {
        const targetId = e.target.getAttribute("id");
        let isReadyToBeApproved = false;
        if (targetId === "ready-btn") {
            isReadyToBeApproved = true;
        }
        const shownTimecard = document.getElementsByClassName("shown-timecard")[0];
        const shownTimecardId = shownTimecard.getAttribute("data-timecardid");

        const updateTimeCardObj = {
            updateTimeCardObj: {
                isReadyToBeApproved,
            }
        }

        const updateTimeCardResponse = await fetch("/api/timecards/timecard-ready/" + shownTimecardId, {
            method: "PUT",
            body: JSON.stringify(updateTimeCardObj),
            headers: {
                "Content-Type": "application/json"
            },
        });

        if (updateTimeCardResponse.ok) {
            if (targetId === "ready-btn") {
                readyBtn.setAttribute("class", "hide ready-btn");
                unreadyBtn.setAttribute("class", "show ready-btn");
            } else {
                readyBtn.setAttribute("class", "show ready-btn");
                unreadyBtn.setAttribute("class", "hide ready-btn");
            }
        } else {
            displayMessage("Something went wrong, please refresh and try again.");
        }
    }

    readyBtn.addEventListener("click", readyTimeCard);
    unreadyBtn.addEventListener("click", readyTimeCard);

    const addTimeInOutBtns = document.getElementsByClassName("add-time-in-out-btn");

    const addTimeInOut = async (e) => {
        const timecardId = e.target.getAttribute("data-timecardid");
        const week = e.target.getAttribute("data-week");
        const shownTimecard = document.getElementsByClassName("shown-timecard")[0];
        const table = shownTimecard.children[((Number(week) * 2) - 1)];

        const addTimeInOutResponse = await fetch("/api/timeinouts/add", {
            method: "POST",
            body: JSON.stringify({
                timecard_id: timecardId,
                week,
            }),
            headers: {
                "Content-Type": "application/json"
            },
        });

        if (addTimeInOutResponse.ok) {
            const weekArr = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const newTrIn = document.createElement("tr");
            newTrIn.setAttribute("class", "tr-in");
            const newTdIn = document.createElement("td");
            newTdIn.textContent = "Time In";
            newTrIn.appendChild(newTdIn);
            const order = ((table.children[0].children.length - 5) / 2) + 1;
            for (let i = 0; i < weekArr.length; i++) {
                const newTd = document.createElement("td");
                const newInput = document.createElement("input");
                newInput.setAttribute("data-order", order);
                newInput.setAttribute("data-day", weekArr[i]);
                newInput.setAttribute("data-week", week);
                newInput.setAttribute("data-timecardid", timecardId);
                newInput.setAttribute("data-inout", "in");
                newInput.setAttribute("class", `${week}-${timecardId} inout-input`);
                newInput.setAttribute("type", "time");
                newInput.value = "";
                newInput.addEventListener('change', newUpdate);
                newTd.appendChild(newInput);
                newTrIn.appendChild(newTd);
            }
            const newTdWeeklyIn = document.createElement("td");
            newTrIn.appendChild(newTdWeeklyIn);
            const newTrOut = document.createElement("tr");
            newTrOut.setAttribute("class", "tr-out");
            const newTdOut = document.createElement("td");
            newTdOut.textContent = "Time Out";
            newTrOut.appendChild(newTdOut);
            for (let i = 0; i < weekArr.length; i++) {
                const newTd = document.createElement("td");
                const newInput = document.createElement("input");
                newInput.setAttribute("data-order", order);
                newInput.setAttribute("data-day", weekArr[i]);
                newInput.setAttribute("data-week", week);
                newInput.setAttribute("data-timecardid", timecardId);
                newInput.setAttribute("data-inout", "out");
                newInput.setAttribute("class", `${week}-${timecardId} inout-input`);
                newInput.setAttribute("type", "time");
                newInput.value = "";
                newInput.addEventListener('change', newUpdate);
                newTd.appendChild(newInput);
                newTrOut.appendChild(newTd);
            }
            const newTdWeeklyOut = document.createElement("td");
            newTrOut.appendChild(newTdWeeklyOut);

            const tbody = table.children[0];
            tbody.insertBefore(newTrIn, tbody.children[tbody.children.length - 4]);
            tbody.insertBefore(newTrOut, tbody.children[tbody.children.length - 4]);
        } else {
            displayMessage("Something went wrong, please refresh and try again.");
        }
    }

    for (let i = 0; i < addTimeInOutBtns.length; i++) {
        const addBtn = addTimeInOutBtns[i];
        addBtn.addEventListener("click", addTimeInOut);
    }

    const removeTimeInOutsBtns = document.getElementsByClassName("remove-time-in-out-btn");

    const removeTimeInOut = async (e) => {
        const week = e.target.getAttribute("data-week");
        const shownTimecard = document.getElementsByClassName("shown-timecard")[0];
        const timecardId = shownTimecard.getAttribute("data-timecardid");
        const table = shownTimecard.children[((Number(week) * 2) - 1)];
        const tbody = table.children[0];

        const deleteObj = {
            timecard_id: timecardId,
            week,
        }
        const deleteTimeInOutResponse = await fetch("/api/timeinouts/remove", {
            method: "DELETE",
            body: JSON.stringify(deleteObj),
            headers: {
                "Content-Type": "application/json"
            },
        });

        if (deleteTimeInOutResponse.ok) {
            const timeInRemove = tbody.children[tbody.children.length - 6];
            const timeOutRemove = tbody.children[tbody.children.length - 5];
            timeInRemove.remove();
            timeOutRemove.remove();
            const timeCellEls = grabTimeCells(timecardId);
            const totalsEls = grabTotals(timecardId);
            updateTotals(timeCellEls, totalsEls, "input");
        } else {
            displayMessage("Something went wrong, please refresh and try again.");
        }
    }

    for (let i = 0; i < removeTimeInOutsBtns.length; i++) {
        const removeBtn = removeTimeInOutsBtns[i];
        removeBtn.addEventListener("click", removeTimeInOut);
    }
}