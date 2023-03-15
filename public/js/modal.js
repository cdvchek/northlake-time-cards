// Get the modal
const modal = document.getElementById("myModal");

// Get the modal Content
const modalContent = document.getElementById("modal-content");

// Get the <span> element that closes the modal
const closeModalSpan = document.getElementsByClassName("close")[0];

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

const generatePdf = (bodies, name, title, period) => {
    return {
        content: [
            {
                columns: [
                    {text: `Employee: ${name}`, fontSize: 15, bold: true, margin: [0, 0 , 0, 10]},
                    {text: `${period}`, fontSize: 15, margin: [0, 0, 0, 10], alignment: "right"}
                ]
            },
            {text: `Title: ${title}`, fontSize: 15, bold: true, margin: [0, 0 , 0, 50]},
            {
                layout: 'lightHorizontalLines', // optional
                table: {
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    headerRows: 1,
                    widths: [ 56, 40, 43, 45, 62, 50, 33, 48, 68 ],
                    body: bodies[0],
                },
            },
            {
                layout: 'lightHorizontalLines', // optional
                table: {
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    headerRows: 1,
                    widths: [ 56, 40, 43, 45, 62, 50, 33, 48, 68 ],
                    body: bodies[1],
                },
            margin: [0, 40],
            }
        ],
        pageMargins: [10, 40, 10, 40],
    };
}

const openPdf = (bodies, name, title, period) => {
    const docDefinition = generatePdf(bodies, name, title, period);

    createPdf(docDefinition).open();
}

const downloadPdf = (bodies, name, title, period) => {
    const docDefinition = generatePdf(bodies, name, title, period);

    createPdf(docDefinition).download();
}

const printPdf = (bodies, name, title, period) => {
    const docDefinition = generatePdf(bodies, name, title, period);

    createPdf(docDefinition).print();
}

const setupModalTimecards = async (userId, multipleTimecards = true, timecard_id = -1) => {
    const modalContentChildren = modalContent.children;
    const modalContentChildrenLength = modalContentChildren.length;
    for (let i = 0; i < modalContentChildrenLength; i++) {
        modalContentChildren[0].remove();
    }
    const user = await (await fetch('/api/users/user-id/' + userId)).json();
    const titles = user.Titles;
    let periods = await (await fetch('/api/timeperiods/period-dates/')).json();
    let timecards = user.TimeCards;

    if (!multipleTimecards) {
        timecards = [await (await fetch('/api/timecards/' + timecard_id)).json()];
        const timeperiod_id = timecards[0].timeperiod_id;
        periods = await (await fetch('/api/timeperiods/single-period-dates/' + timeperiod_id)).json();
    }

    const tabsDiv = document.createElement("div");
    tabsDiv.setAttribute("class", "tab");
    for (let i = 0; i < timecards.length; i++) {
        const timecard = timecards[i];
        let title;
        for (let j = 0; j < titles.length; j++) {
            const titleChecking = titles[j];
            if (titleChecking.title_id === timecard.title_id) {
                title = titleChecking;
            }
        }
        const buttonTab = document.createElement("button");
        let classString = "tablinks";
        if (i === 0) {
            classString = "tablinks active"
        }
        buttonTab.setAttribute("class", classString);
        buttonTab.setAttribute("onclick", "openTimeCard(event, '" + timecard.timecard_id.toString() + "')");
        let timeperiod;
        for (let j = 0; j < periods.length; j++) {
            const period = periods[j];
            if (timecard.timeperiod_id === period.timeperiod_id) {
                timeperiod = period;
            }
        }
        buttonTab.innerHTML = `${title.name} <br> ${timeperiod.startDate} - ${timeperiod.endDate}`;
        tabsDiv.appendChild(buttonTab);
    }
    modalContent.appendChild(tabsDiv);

    
    for (let i = 0; i < timecards.length; i++) {
        const timecard = timecards[i];
        // Setup for the pdf
        const bodies = [[],[]];
        const bodyHeader1 = [ "Week 1", 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Weekly Total' ];
        const bodyHeader2 = [ "Week 2", 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Weekly Total' ];
        bodies[0].push(bodyHeader1);
        bodies[1].push(bodyHeader2);
        let titleName;
        for (let j = 0; j < titles.length; j++) {
            const title = titles[j];
            if (timecard.title_id === title.title_id) {
                titleName = title.name;
            }
        }
        let periodName;
        for (let j = 0; j < periods.length; j++) {
            const period = periods[j];
            if (timecard.timeperiod_id === period.timeperiod_id) {
                periodName = `${period.startDate} - ${period.endDate}`;
            }
        }


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
        const offDay = timeCardData.OffDay;
        for (let l = 0; l < 2; l++) { // 2 weeks
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

            const timeCells = [];
            // Creating the time in/out rows
            const weekTimeInOuts = timeCardData.TimeInOuts.filter((timeinout) => (timeinout.week === (l + 1)));
            for (let j = 0; j < weekTimeInOuts.length; j++) {
                const timeInPdfRow = ["Time In"];
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
                    timeInPdfRow.push(value);
                    timeInRow.appendChild(newCell);
                    timeCells.push(newCell);
                }
                const timeInWeeklyTotalCell = document.createElement("td");
                timeInRow.appendChild(timeInWeeklyTotalCell);

                const timeOutPdfRow = ["Time Out"];
                const timeOutRow = document.createElement("tr");
                const timeOutCell = document.createElement("td");
                timeOutCell.textContent = "Time Out";
                timeOutRow.appendChild(timeOutCell);
                for (let k = 0; k < week.length; k++) {
                    const day = week[k];
                    const value = timeInOut[day + "_out"];
                    const newCell = document.createElement("td");
                    newCell.textContent = value;
                    timeOutPdfRow.push(value);
                    timeOutRow.appendChild(newCell);
                    timeCells.push(newCell);
                }
                const timeOutWeeklyTotalCell = document.createElement("td");
                timeOutRow.appendChild(timeOutWeeklyTotalCell);
                timeInPdfRow.push("");
                timeOutPdfRow.push("");

                bodies[l].push(timeInPdfRow);
                bodies[l].push(timeOutPdfRow);

                // Appending Headers Row
                if (l == 0) {
                    timeCardTable1.appendChild(timeInRow);
                    timeCardTable1.appendChild(timeOutRow);
                } else {
                    timeCardTable2.appendChild(timeInRow);
                    timeCardTable2.appendChild(timeOutRow);
                }
            }

            const vacationCells = [];
            const sickCells = [];
            let vacationCell;
            let sickCell;
            const newPTOLabels = ["PTO Type", "PTO"];
            const ptoTypes = ["None", "Vacation", "Sick", "Holiday", "Sabbatical", "Jury Duty", "Benevolence"];
            const ptoTypesAbb = ["None", "Vactn", "Sick", "Holid", "Sabbt", "Jury", "Benev"];
            const vacationSickArr = ["vacation", "sick"];
            // Creating the vacation and sick rows
            for (let j = 0; j < vacationSickArr.length; j++) {
                const vacationSick = vacationSickArr[j];
                const vacationSickCapitalized = newPTOLabels[j].charAt(0).toUpperCase() + newPTOLabels[j].slice(1);
                const pdfRow = [vacationSickCapitalized];
                const newRow = document.createElement("tr");
                const labelCell = document.createElement("td");
                labelCell.textContent = vacationSickCapitalized;
                newRow.appendChild(labelCell);
                for (let k = 0; k < week.length; k++) {
                    const day = week[k];
                    const newCell = document.createElement("td");
                    if (j == 0) {
                        newCell.textContent = ptoTypes[offDay[`${day}_${vacationSick}_${l + 1}`]];
                    } else {
                        newCell.textContent = offDay[`${day}_${vacationSick}_${l + 1}`];
                    }
                    newRow.appendChild(newCell);
                    if (j == 0) {
                        pdfRow.push(ptoTypesAbb[offDay[`${day}_${vacationSick}_${l + 1}`]]);
                    } else {
                        pdfRow.push(offDay[`${day}_${vacationSick}_${l + 1}`]);
                    }
                    if (j === 0) {
                        vacationCells.push(newCell);
                    } else {
                        sickCells.push(newCell);
                    }
                }
                if (j === 0) {
                    vacationCell = document.createElement('td');
                    newRow.appendChild(vacationCell);
                } else {
                    sickCell = document.createElement('td');
                    newRow.appendChild(sickCell);
                }
                if (l === 0) {
                    timeCardTable1.appendChild(newRow);
                } else {
                    timeCardTable2.appendChild(newRow);
                }
                bodies[l].push(pdfRow);
            }
            console.log(bodies);

            const details = processTimeCard(timeCells, vacationCells, sickCells);

            vacationCell.textContent = details.vacation;
            sickCell.textContent = details.sick;
            bodies[l][bodies[l].length - 2][8] = details.vacation;
            bodies[l][bodies[l].length - 1][8] = details.sick;

            const overtimeTotalArr = ["overtime", "total"];
            // Creating the vacation and sick rows
            for (let j = 0; j < overtimeTotalArr.length; j++) {
                const overtimeTotal = overtimeTotalArr[j];
                const overtimeTotalCapitalized = overtimeTotal.charAt(0).toUpperCase() + overtimeTotal.slice(1);
                let overtimeTotalPhrase;
                if (j === 0) {
                    overtimeTotalPhrase = "Overtime";
                } else {
                    overtimeTotalPhrase = "Daily Total"
                }
                const pdfRow = [overtimeTotalPhrase];
                const newRow = document.createElement("tr");
                const labelCell = document.createElement("td");
                labelCell.textContent = overtimeTotalPhrase;
                newRow.appendChild(labelCell);
                for (let k = 0; k < week.length; k++) {
                    const newCell = document.createElement("td");
                    newCell.textContent = details[`daily${overtimeTotalCapitalized}s`][k];
                    pdfRow.push(details[`daily${overtimeTotalCapitalized}s`][k])
                    newRow.appendChild(newCell);
                }
                const totalCell = document.createElement("td");
                totalCell.textContent = details[`weekly${overtimeTotalCapitalized}`];
                pdfRow.push(details[`weekly${overtimeTotalCapitalized}`])
                newRow.appendChild(totalCell);
                if (l === 0) {
                    timeCardTable1.appendChild(newRow);
                } else {
                    timeCardTable2.appendChild(newRow);
                }
                bodies[l].push(pdfRow);
            }
        }
        tabcontentDiv.appendChild(timeCardTable1);
        tabcontentDiv.appendChild(timeCardTable2);
        modalContent.appendChild(tabcontentDiv);

        const openPdfButton = document.createElement("button");
        openPdfButton.textContent = "Open Pdf";
        openPdfButton.setAttribute("onclick", `openPdf(${JSON.stringify(bodies)}, "${user.name}", "${titleName}", "${periodName}")`);
        openPdfButton.setAttribute("class", "pdf-button");
        tabcontentDiv.appendChild(openPdfButton);

        const downloadPdfButton = document.createElement("button");
        downloadPdfButton.textContent = "Download Pdf";
        downloadPdfButton.setAttribute("onclick", `downloadPdf(${JSON.stringify(bodies)}, "${user.name}", "${titleName}", "${periodName}")`);
        downloadPdfButton.setAttribute("class", "pdf-button");
        tabcontentDiv.appendChild(downloadPdfButton);

        const printPdfButton = document.createElement("button");
        printPdfButton.textContent = "Print Pdf";
        printPdfButton.setAttribute("onclick", `printPdf(${JSON.stringify(bodies)}, "${user.name}", "${titleName}", "${periodName}")`);
        printPdfButton.setAttribute("class", "pdf-button");
        tabcontentDiv.appendChild(printPdfButton);
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