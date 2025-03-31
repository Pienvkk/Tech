//filteren en sorteren
const AlphabetFilterButton = document.querySelector('.sort')
const ChronologischFilterButton = document.querySelector('.zoeken details button:last-of-type');
const Zoekbalk = document.querySelector('.zoeken label input');
  
/*  probeersel  */
 
document.addEventListener('DOMContentLoaded', function () {

    const options = {
        valueNames: ['forename', 'surname']  // Geef de classes door waarop we willen sorteren
    };

    // Maak een nieuwe List.js instantie en wijs deze toe aan je lijst
    const archiveList = new List('archiveList', options);

    
    AlphabetFilterButton.addEventListener("click", function () {
        archiveList.sort('surname', { order: "asc" });
    });
});              

 


