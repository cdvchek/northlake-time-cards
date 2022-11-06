const timecardEls = document.getElementsByClassName("timecard");
const timecardsDiv = document.getElementById("timecards-div");
const hasTimeCard = timecardsDiv.getAttribute("data-timecard");
if (hasTimeCard === "true") {
    for (let i = 0; i < timecardEls.length; i++) {
        const timecardEl = timecardEls[i];
        const timecardId = timecardEl.getAttribute("data-timecardid");
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

        const getValues1 = (e) => {
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

        console.log(addTimeInOutResponse);
    }

    for (let i = 0; i < addTimeInOutBtns.length; i++) {
        const addBtn = addTimeInOutBtns[i];
        addBtn.addEventListener("click", addTimeInOut);
    }
}