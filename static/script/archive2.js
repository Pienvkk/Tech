//filteren en sorteren
const AlphabetFilterButton = document.querySelector('.sort')
const ChronologischFilterButton = document.querySelector('.zoeken details button:last-of-type');
const Zoekbalk = document.querySelector('.zoeken label input');


/*

 // Initialize List.js
 const options = {
    valueNames: ['forename', 'surname'] // Namen passen bij HTML
}

const ArchiefList = new List ('archiveList', options)

//zoeken 
AlphabetFilterButton.addEventListener('click', function () {
    ArchiefList.sort('forename', { order: "asc" })
    console.log("Ik doe het")
});
*/
document.addEventListener('DOMContentLoaded', function () {
    const options = {
        valueNames: ['forename', 'surname'] // Strings die overeenkomen met de HTML-klassen
    } 

});
    const archiveList = new List('archiveList', options);

    sortButtons.forEach(button => {
        button.addEventListener('click', function () {
            const sortField = button.value; // Haal de waarde van de knop op
            archiveList.sort(sortField, { order: "asc" }); // Sorteer op basis van de waarde
            console.log(`Lijst gesorteerd op ${sortField}`);
        });
    });
/* 

options.sort(function (a, b) {
    if (a.valueNames < b.valueNames) {
      return -1;
    }
    if (a.valueNames > b.valueNames) {
      return 1;
    }
    return 0;
  });
  console.log(valueNames);
});


AlphabetFilterButton.addEventListener('click', function () {
let AlphabetSorteer = valueNames.sort();
console.log(valueNames);
});
*/


