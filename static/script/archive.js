document.addEventListener("DOMContentLoaded", function () {
    const radioButtonsArchive = document.querySelectorAll("input[name='categorie']");
    const dataList = document.querySelector(".archiveList");
    const searchInput = document.querySelector(".zoeken input");
    let currentData = [];

    function fetchData(category) {
        fetch(`/api/data/${category}`)
            .then(response => response.json())
            .then(data => {
                currentData = data; // Sla de opgehaalde data op voor filtering
                updateList(currentData); // Toon de volledige lijst
            })
            .catch(error => console.error("Fout bij ophalen van data:", error));
    }

    function filterData(query) {
        return currentData.filter(item => 
            JSON.stringify(item).toLowerCase().includes(query)
        );
    }

    function updateList(data) {
        dataList.innerHTML = ""; // Maak de lijst leeg

        data.forEach(item => {
            const li = document.createElement("li");
            
            if (item.surname) {  // Als het een driver is
                li.textContent = `${item.surname} ${item.forename} (${item.code}) - ${item.number} - ${item.nationality}`;
            } else if (item.name && item.nationality) { // Constructor
                li.textContent = `${item.name} (${item.nationality})`;
            } else if (item.season) { // Championship
                const details = document.createElement("details");
                const summary = document.createElement("summary");
                summary.textContent = `${item.season} - Winner: ${item.winner}`;
                
                const info = document.createElement("div");
                info.innerHTML = `
                    <p><strong>Runner-up:</strong> ${item.runnerUp}</p>
                    <p><strong>Winning Team:</strong> ${item.team}</p>
                    <p><strong>Wins:</strong> ${item.wins}</p>
                    <p><strong>Podiums:</strong> ${item.podiums}</p>
                    <p><strong>Total Points:</strong> ${item.points}</p>
                `;
                
                details.appendChild(summary);
                details.appendChild(info);
                dataList.appendChild(details);
                return;
            } else if (item.name && item.location) { // Circuit
                li.textContent = `${item.name} (${item.location}, ${item.country}) - ${item.length} km`;
            }

            dataList.appendChild(li);
        });
    }

    searchInput.addEventListener("input", function () {
        const query = searchInput.value.toLowerCase();
        const filteredData = filterData(query);
        updateList(filteredData);
    });

    radioButtonsArchive.forEach(radio => {
        radio.addEventListener("change", function () {
            fetchData(this.value);
        });
    });

    // Standaard: Laad de eerste optie (drivers)
    const defaultCategory = document.querySelector("input[name='categorie']:checked").value;
    fetchData(defaultCategory);
});



/*
// DATA LADEN 
document.addEventListener("DOMContentLoaded", function () {
    const radioButtonsArchive = document.querySelectorAll("input[name='categorie']");
    const dataList = document.querySelector(".archiveList");
    

    function fetchData(category) {
        fetch(`/api/data/${category}`)
            .then(response => response.json())
            .then(data => {
                dataList.innerHTML = ""; // Maak de lijst leeg

                if (category === "drivers") {
                    data.forEach(driver => {
                        const li = document.createElement("li");
                        li.textContent = `${driver.surname} ${driver.forename} (${driver.code}) - ${driver.number} - ${driver.nationality}`;
                        dataList.appendChild(li);

                        console.log('Data!')
                    });

                } else if (category === "constructors") {
                    data.forEach(constructor => {
                        const li = document.createElement("li");
                        li.textContent = `${constructor.name} (${constructor.nationality})`;
                        dataList.appendChild(li);
                    });

                } else if (category === "championships") {
                    data.forEach(championship => {
                        // Maak een <details> element
                        const details = document.createElement("details");
                        details.setAttribute("name", "championships"); // Alle details hebben dezelfde naam

                        // Maak een <summary> met het seizoen en de winnaar
                        const summary = document.createElement("summary");
                        summary.textContent = `${championship.year} - Winner: ${championship.winner}`;

                        // Maak een <div> met extra informatie
                        const info = document.createElement("div");
                        info.innerHTML = `
                            <p><strong>Team:</strong> ${championship.team}</p>
                            <p><strong>Wins:</strong> ${championship.wins}</p>
                            <p><strong>Pole positions:</strong> ${championship.poles}</p>
                            <p><strong>Podiums:</strong> ${championship.podiums}</p>
                            <p><strong>Total Points:</strong> ${championship.points}</p>
                            <p><strong>Constructor champion:</strong> ${championship.constructor-champion}</p>
                        `;

                        // Voeg alles toe aan het <details> element
                        details.appendChild(summary);
                        details.appendChild(info);

                        // Voeg het toe aan de lijst
                        dataList.appendChild(details);
                    });

                } else if (category === "circuits") {
                    data.forEach(circuit => {
                        const li = document.createElement("li");
                        li.textContent = `${circuit.name} (${circuit.location}, ${circuit.country}) - ${circuit.length} km`;
                        dataList.appendChild(li);
                    });
                }
            })
            .catch(error => console.error("Fout bij ophalen van data:", error));
    }

    // Standaard: Laad de eerste optie (drivers)
    const defaultCategory = document.querySelector("input[name='categorie']:checked").value;
    fetchData(defaultCategory);

    // Luisteren naar veranderingen in de radio buttons
    radioButtonsArchive.forEach(radio => {
        radio.addEventListener("change", function () {
            fetchData(this.value);
        });
    });
});
*/