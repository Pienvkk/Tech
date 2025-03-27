//filteren en sorteren
const AlphabetFilterButton = document.querySelector('.zoeken details button:nth-of-type(1)')
const ChronologischFilterButton = document.querySelector('.zoeken details button:last-of-type');
const Zoekbalk = document.querySelector('.zoeken label input');




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
