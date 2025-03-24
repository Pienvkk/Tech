
// zoek functie & data laden

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

// Sorteren Alphabet
const button = document.querySelector(".zoek details summary button:nth-of-type(1)");

/*
dataList.sort
console.log(sortedNames);

users.sort(function (a, b) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });
*/

// Sorteren Gronologisch
