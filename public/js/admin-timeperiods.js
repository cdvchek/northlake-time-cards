const timePeriodInpt = document.getElementById("inpt-init-timeperiods");
const timePeriodInitBtn = document.getElementById("btn-init-timeperiods");

const initializeTimePeriod = async () => {
    if (timePeriodInpt.value !== "") {
        if (window.confirm("Are you sure you want to initialize new time periods?")) {
            
            const initializeObj = {
                startDate: timePeriodInpt.value,
            }
            
            const initializeResponse = await fetch("/api/timeperiods/init-timeperiods", {
                method: "POST",
                body: JSON.stringify(initializeObj),
                headers: {
                    "Content-Type": "application/json"
                },
            });
            
            if (initializeResponse.ok) {
                // Show a good message
                displayMessage("Time Periods have been initialized.");
            } else {
                // Show a bad message
                displayMessage("Something went wrong.");
            }
        }
    } else {
        displayMessage("Please select a date before initializing time periods.");
    }
}

timePeriodInitBtn.addEventListener("click", initializeTimePeriod);