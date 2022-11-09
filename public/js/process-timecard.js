const processTimeCard = (timeCells, type = "cell") => {
    let timesheet = [];
    const weeklyOffset = 7 // 7 days in a week
    for (let i = 0; i < timeCells.length; i++) {
        const row = Math.floor(i / weeklyOffset);
        const column = i % weeklyOffset;
        let value = timeCells[i].textContent;
        if (type === "input") {
            value = timeCells[i].value;
        }
        if (column == 0) {
            timesheet.push([]);
        }
        timesheet[row][column] = value;
    }

    const details = {
        dailyTotals: [0, 0, 0, 0, 0, 0, 0],
        weeklyTotal: 0,
    };

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
    let weeklyTotal = 0;
    for (let i = 0; i < details.dailyTotals.length; i++) {
        weeklyTotal += details.dailyTotals[i];
    }
    details.weeklyTotal = weeklyTotal;

    return details;
}