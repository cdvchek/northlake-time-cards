const processTimeCard = (timeCells, vacationTimeCells, sickTimeCells, type = "cell") => {
    const sickValues = [];
    for (let i = 0; i < sickTimeCells.length; i++) {
        const cell = sickTimeCells[i];
        let value;
        if (type === "input") {
            value = Number(cell.value);
        } else {
            value = Number(cell.innerText);
        }
        sickValues.push(value);
    }

    const vacationValues = [];
    for (let i = 0; i < vacationTimeCells.length; i++) {
        const cell = vacationTimeCells[i];
        let value;
        if (type === "input") {
            value = Number(cell.value);
        } else {
            value = Number(cell.innerText);
        }
        vacationValues.push(value);
    }

    // Declaring Variables
    let timesheet = [];
    const weeklyOffset = 7 // 7 days in a week

    // Preparing the timesheet
    for (let i = 0; i < timeCells.length; i++) {
        const row = Math.floor(i / weeklyOffset);
        const column = i % weeklyOffset;
        let value = timeCells[i].innerText;
        if (type === "input") {
            value = timeCells[i].value;
        }
        if (column == 0) {
            timesheet.push([]);
        }
        timesheet[row][column] = value;
    }

    // Declaring Variables
    const details = {
        dailyOvertimes: [0, 0, 0, 0, 0, 0, 0],
        weeklyOvertime: 0,
        dailyTotals: [0, 0, 0, 0, 0, 0, 0],
        weeklyTotal: 0,
        vacation: 0,
        sick: 0,
    };

    // Setting dailyTotals
    for (let i = 1; i < timesheet.length; i += 2) {
        for (let j = 0; j < timesheet[i].length; j++) {
            // Checking to see if both time in and out are filled out
            if (timesheet[i][j] != "" && timesheet[i - 1][j] != "") {
                const hour = Number(timesheet[i][j].substring(0, 2));
                const minute = Number(timesheet[i][j].substring(3, 5));
                const prevHour = Number(timesheet[i - 1][j].substring(0, 2));
                const prevMinute = Number(timesheet[i - 1][j].substring(3, 5));
                const hoursWorked = hour - prevHour;
                const minutesWorked = (minute - prevMinute) / 60;
                const totalTimeWorked = hoursWorked + minutesWorked;
                details.dailyTotals[j] = details.dailyTotals[j] + totalTimeWorked;
            }
        }
    }

    // Accounting for sick and vacation to offset dailyTotals
    // Setting sick and vacation
    let vacationTotal = 0;
    let sickTotal = 0;
    for (let i = 0; i < details.dailyTotals.length; i++) {
        let total = details.dailyTotals[i];
        const sickCell = sickTimeCells[i];
        const vacationCell = vacationTimeCells[i];
        let sickValue;
        let vacationValue;
        if (type === "input") {
            sickValue = sickCell.value;
            vacationValue = vacationCell.value;
        } else {
            sickValue = sickCell.textContent;
            vacationValue = vacationCell.textContent;
        }
        vacationTotal = vacationTotal + Number(vacationValue);
        sickTotal = sickTotal + Number(sickValue);
        total = total + Number(sickValue) + Number(vacationValue);
        details.dailyTotals[i] = total;
    }
    details.vacation = vacationTotal;
    details.sick = sickTotal;

    // Setting weeklyTotal
    let weeklyTotal = 0;
    for (let i = 0; i < details.dailyTotals.length; i++) {
        weeklyTotal += details.dailyTotals[i];
    }
    details.weeklyTotal = weeklyTotal;

    // Setting dailyOvertimes and weeklyOvertime
    let overtimeTotal = 0;
    let dailyTotal = 0;
    for (let i = 0; i < details.dailyTotals.length; i++) {
        const dayTotal = details.dailyTotals[i] - (sickValues[i] + vacationValues[i]);
        dailyTotal = dailyTotal + dayTotal;
        if (dailyTotal > 40) {
            details.dailyOvertimes[i] = dailyTotal - 40 - overtimeTotal;
            overtimeTotal = overtimeTotal + details.dailyOvertimes[i];
        } else {
            details.dailyOvertimes[i] = 0;
        }
    }
    details.weeklyOvertime = overtimeTotal;

    return details;
}