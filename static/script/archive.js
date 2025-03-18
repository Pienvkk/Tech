

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
                        summary.textContent = `${championship.season} - Winner: ${championship.winner}`;

                        // Maak een <div> met extra informatie
                        const info = document.createElement("div");
                        info.innerHTML = `
                            <p><strong>Runner-up:</strong> ${championship.runnerUp}</p>
                            <p><strong>Winning Team:</strong> ${championship.team}</p>
                            <p><strong>Wins:</strong> ${championship.wins}</p>
                            <p><strong>Podiums:</strong> ${championship.podiums}</p>
                            <p><strong>Total Points:</strong> ${championship.points}</p>
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