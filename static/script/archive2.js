document.addEventListener("DOMContentLoaded", function () {
    const radioButtonsArchive = document.querySelectorAll("input[name='categorie']");
    const dataList = document.querySelector(".archiveList");
})



//filteren en sorteren
const AlphabetFilterButton = document.querySelector('.zoeken details button:first-of-type');
const ChronologischFilterButton = document.querySelector('.zoeken details button:last-of-type');
const Zoekbalk = document.querySelector('.zoeken label input');



 // Initialize List.js
 const options = {
    valueNames: ['forename', 'surname', 'name', 'season'] // Namen passen bij HTML
};
const list = new list('archiveList', options);

//zoeken 

if (AlphabetFilterButton) {
    AlphabetFilterButton.addEventListener('click', function () {
        list.sort('forename', { order: "asc" });
    });
} else {
    console.error("AlphabetFilterButton niet gevonden!");
}