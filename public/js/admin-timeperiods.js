const timePeriodInpt = document.getElementById("inpt-init-timeperiods");
const timePeriodInitBtn = document.getElementById("btn-init-timeperiods");

const initializeTimePeriod = async () => {
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
        console.log("yessir");
    } else {
        // Show a bad message
        console.log("nossirrrrr");
    }
}

timePeriodInitBtn.addEventListener("click", initializeTimePeriod);