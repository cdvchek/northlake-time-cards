const timeCells1 = document.getElementsByClassName("edit-time-1");
const timeCells2 = document.getElementsByClassName("edit-time-2");
const timeSheet = [];
const timeSheet2 = [];
const weeklyTotal = document.getElementById("weekly-total");
const sundayTotal = document.getElementById("0-total");
const mondayTotal = document.getElementById("1-total");
const tuesdayTotal = document.getElementById("2-total");
const wednesdayTotal = document.getElementById("3-total");
const thursdayTotal = document.getElementById("4-total");
const fridayTotal = document.getElementById("5-total");
const saturdayTotal = document.getElementById("6-total");
const weeklyTotal2 = document.getElementById("weekly-total-2");
const sundayTotal2 = document.getElementById("0-total-2");
const mondayTotal2 = document.getElementById("1-total-2");
const tuesdayTotal2 = document.getElementById("2-total-2");
const wednesdayTotal2 = document.getElementById("3-total-2");
const thursdayTotal2 = document.getElementById("4-total-2");
const fridayTotal2 = document.getElementById("5-total-2");
const saturdayTotal2 = document.getElementById("6-total-2");

const getValues1 = (e) => {
    const weeklyOffset = 7 // 7 days in a week
    for (let i = 0; i < timeCells1.length; i++) {
        const row = Math.floor(i / weeklyOffset);
        const column = i % 7;
        const value = timeCells1[i].value;
        if (column == 0) {
            timeSheet.push([]);
        }
        timeSheet[row][column] = value;
    }
    const details = processTimeCard(timeSheet);
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
    cell.addEventListener('change', getValues1)
}

getValues1();

const getValues2 = (e) => {
    const weeklyOffset = 7 // 7 days in a week
    for (let i = 0; i < timeCells2.length; i++) {
        const row = Math.floor(i / weeklyOffset);
        const column = i % 7;
        const value = timeCells2[i].value;
        if (column == 0) {
            timeSheet2.push([]);
        }
        timeSheet2[row][column] = value;
    }
    const details = processTimeCard(timeSheet2);
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
    cell.addEventListener('change', getValues2)
}

getValues2();