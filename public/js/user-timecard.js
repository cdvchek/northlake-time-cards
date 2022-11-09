const timecardEls = document.getElementsByClassName("timecard");
const timecardsDiv = document.getElementById("timecards-div");
const hasTimeCard = timecardsDiv.getAttribute("data-timecard");
const weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

if (hasTimeCard === "true") {
    const grabTotals = (timecardId) => {
        return {
            weekOne: {
                total: document.getElementById("weekly-total-" + timecardId),
                sunday: document.getElementById("0-total-" + timecardId),
                monday: document.getElementById("1-total-" + timecardId),
                tuesday: document.getElementById("2-total-" + timecardId),
                wednesday: document.getElementById("3-total-" + timecardId),
                thursday: document.getElementById("4-total-" + timecardId),
                friday: document.getElementById("5-total-" + timecardId),
                saturday: document.getElementById("6-total-" + timecardId),
            },
            weekTwo: {
                total: document.getElementById("weekly-total-2-" + timecardId),
                sunday: document.getElementById("0-total-2-" + timecardId),
                monday: document.getElementById("1-total-2-" + timecardId),
                tuesday: document.getElementById("2-total-2-" + timecardId),
                wednesday: document.getElementById("3-total-2-" + timecardId),
                thursday: document.getElementById("4-total-2-" + timecardId),
                friday: document.getElementById("5-total-2-" + timecardId),
                saturday: document.getElementById("6-total-2-" + timecardId),
            }
        }
    }

    const grabTimeCells = (timecardId) => {
        return {
            weekOne: document.getElementsByClassName("edit-time-1-" + timecardId),
            weekTwo: document.getElementsByClassName("edit-time-2-" + timecardId),
        }
    }

    const updateTotals = (timeCellEls, totalsEls, type) => { // type can be "input" or "cell"
        const weekOneTotals = processTimeCard(timeCellEls.weekOne, type);

        totalsEls.weekOne.total.textContent = weekOneTotals.weeklyTotal;
        for (let i = 0; i < weekDays.length; i++) {
            const weekDay = weekDays[i];
            totalsEls.weekOne[weekDay].textContent = weekOneTotals.dailyTotals[i];
        }

        const weekTwoTotals = processTimeCard(timeCellEls.weekTwo, type);

        totalsEls.weekTwo.total.textContent = weekTwoTotals.weeklyTotal;
        for (let i = 0; i < weekDays.length; i++) {
            const weekDay = weekDays[i];
            totalsEls.weekTwo[weekDay].textContent = weekTwoTotals.dailyTotals[i];
        }
    }

    const updateTimeCell = async (e, timecardId) => {
        const target = e.target.id.split("_");
        const order = target[0];
        const day = target[1];
        const inout = target[2];
        const week = target[3];
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
        const timecardId = e.target.getAttribute("class").split("-")[3];
        const response = await updateTimeCell(e, timecardId);

        if (response.ok) {
            const timeCellEls = grabTimeCells(timecardId);
            const totalsEls = grabTotals(timecardId);
            updateTotals(timeCellEls, totalsEls, "input");
        } else {
            displayMessage("Something went wrong, please refresh and try again.")
        }
    }

    const setupTimeCard = (timecardId) => {
        const timeCells1 = document.getElementsByClassName("edit-time-1-" + timecardId);
        const timeCells2 = document.getElementsByClassName("edit-time-2-" + timecardId);
        const weeklyTotal = document.getElementById("weekly-total-" + timecardId);
        const sundayTotal = document.getElementById("0-total-" + timecardId);
        const mondayTotal = document.getElementById("1-total-" + timecardId);
        const tuesdayTotal = document.getElementById("2-total-" + timecardId);
        const wednesdayTotal = document.getElementById("3-total-" + timecardId);
        const thursdayTotal = document.getElementById("4-total-" + timecardId);
        const fridayTotal = document.getElementById("5-total-" + timecardId);
        const saturdayTotal = document.getElementById("6-total-" + timecardId);
        const weeklyTotal2 = document.getElementById("weekly-total-2-" + timecardId);
        const sundayTotal2 = document.getElementById("0-total-2-" + timecardId);
        const mondayTotal2 = document.getElementById("1-total-2-" + timecardId);
        const tuesdayTotal2 = document.getElementById("2-total-2-" + timecardId);
        const wednesdayTotal2 = document.getElementById("3-total-2-" + timecardId);
        const thursdayTotal2 = document.getElementById("4-total-2-" + timecardId);
        const fridayTotal2 = document.getElementById("5-total-2-" + timecardId);
        const saturdayTotal2 = document.getElementById("6-total-2-" + timecardId);

        const update = async (e) => {
            getValues1(e);
            getValues2(e);

            const target = e.target.id.split("_");
            const order = target[0];
            const day = target[1];
            const inout = target[2];
            const week = target[3];
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
        }

        const getValues1 = () => {
            const details = processTimeCard(timeCells1, "input");
            weeklyTotal.textContent = details.weeklyTotal;
            sundayTotal.textContent = details.dailyTotals[0];
            mondayTotal.textContent = details.dailyTotals[1];
            tuesdayTotal.textContent = details.dailyTotals[2];
            wednesdayTotal.textContent = details.dailyTotals[3];
            thursdayTotal.textContent = details.dailyTotals[4];
            fridayTotal.textContent = details.dailyTotals[5];
            saturdayTotal.textContent = details.dailyTotals[6];
        }

        for (let i = 0; i < timeCells1.length; i++) {
            const cell = timeCells1[i];
            cell.addEventListener('change', update);
        }

        getValues1();

        const getValues2 = (e) => {
            const details = processTimeCard(timeCells2, "input");
            weeklyTotal2.textContent = details.weeklyTotal;
            sundayTotal2.textContent = details.dailyTotals[0];
            mondayTotal2.textContent = details.dailyTotals[1];
            tuesdayTotal2.textContent = details.dailyTotals[2];
            wednesdayTotal2.textContent = details.dailyTotals[3];
            thursdayTotal2.textContent = details.dailyTotals[4];
            fridayTotal2.textContent = details.dailyTotals[5];
            saturdayTotal2.textContent = details.dailyTotals[6];
        }

        for (let i = 0; i < timeCells2.length; i++) {
            const cell = timeCells2[i];
            cell.addEventListener('change', update);
        }

        getValues2();
    }

    for (let i = 0; i < timecardEls.length; i++) {
        const timecardEl = timecardEls[i];
        const timecardId = timecardEl.getAttribute("data-timecardid");
        setupTimeCard(timecardId);
    }

    const timecardsDivChildren = timecardsDiv.children;
    const readyBtn = document.getElementById("ready-btn");
    const unreadyBtn = document.getElementById("unready-btn");

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

    const closeTimeCardSelector = document.getElementById("close-options-btn");
    const openTimeCardSelector = document.getElementById("open-options-btn");
    const timeCardSelectorModal = document.getElementById("time-card-modal-options-div");

    const closeOptions = () => {
        timeCardSelectorModal.style.display = "none";
    }

    closeTimeCardSelector.addEventListener("click", closeOptions);

    const openOptions = () => {
        timeCardSelectorModal.style.display = "inline";
    }

    openTimeCardSelector.addEventListener("click", openOptions);

    const miniTimeCards = document.getElementsByClassName("time-card-selector");

    const openTimeCard = (e) => {
        for (let i = 0; i < timecardsDivChildren.length; i++) {
            const timecardEl = timecardsDivChildren[i];
            timecardEl.setAttribute("class", "hidden-timecard timecard");
        }
        let timecardId = -1;
        if (e.target.nodeName === "TD" || e.target.nodeName === "TH") {
            const target = e.target.parentNode.parentNode.parentNode.parentNode;
            timecardId = target.getAttribute("data-id").split("-")[1];
        } else if (e.target.nodeName === "TR") {
            timecardId = e.target.parentNode.parentNode.getAttribute("data-id").split("-")[1];
        } else if (e.target.nodeName === "TABLE" || e.target.nodeName === "SPAN") {
            timecardId = e.target.parentNode.getAttribute("data-id").split("-")[1];
        } else {
            timecardId = e.target.getAttribute("data-id").split("-")[1];
        }
        const timeCardShowing = document.getElementById(timecardId);
        timeCardShowing.setAttribute("class", "shown-timecard timecard");
        timeCardSelectorModal.style.display = "none";
    }

    for (let i = 0; i < miniTimeCards.length; i++) {
        const miniTimeCard = miniTimeCards[i];
        miniTimeCard.addEventListener("click", openTimeCard);
    }

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
            const order = ((table.children[0].children.length - 2) / 2) + 1;
            for (let i = 0; i < weekArr.length; i++) {
                const newTd = document.createElement("td");
                const newInput = document.createElement("input");
                newInput.setAttribute("id", `${order}_${weekArr[i]}_in_${week}_${timecardId}`);
                newInput.setAttribute("class", `edit-time-${week}-${timecardId}`);
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
                newInput.setAttribute("id", `${order}_${weekArr[i]}_out_${week}_${timecardId}`);
                newInput.setAttribute("class", `edit-time-${week}-${timecardId}`);
                newInput.setAttribute("type", "time");
                newInput.value = "";
                newInput.addEventListener('change', newUpdate);
                newTd.appendChild(newInput);
                newTrOut.appendChild(newTd);
            }
            const newTdWeeklyOut = document.createElement("td");
            newTrOut.appendChild(newTdWeeklyOut);

            const tbody = table.children[0];
            tbody.insertBefore(newTrIn, tbody.children[tbody.children.length - 1]);
            tbody.insertBefore(newTrOut, tbody.children[tbody.children.length - 1]);
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
        const timecardId = shownTimecard.getAttribute("id");
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
            const timeInRemove = tbody.children[tbody.children.length - 3];
            const timeOutRemove = tbody.children[tbody.children.length - 2];
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