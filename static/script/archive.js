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
                        const li = document.createElement("li");
                        li.textContent = `${championship.season} - Winner: ${championship.winner}`;
                        dataList.appendChild(li);
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