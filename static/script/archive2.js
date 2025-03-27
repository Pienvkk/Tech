//filteren en sorteren
const AlphabetFilterButton = document.querySelector('.sort')
const ChronologischFilterButton = document.querySelector('.zoeken details button:last-of-type');
const Zoekbalk = document.querySelector('.zoeken label input');


/*

*/
 
document.addEventListener('DOMContentLoaded', function () {

    const options = {
        valueNames: ['forename', 'surname'] 
    };

    const archiveList = new List('archiveList', options);

    
    AlphabetFilterButton.addEventListener("click", function () {
        archiveList.sort('surname', { order: "asc" });
    });
});

 


